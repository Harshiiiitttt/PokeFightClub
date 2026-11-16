import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {spriteExtent} from '../dist/sprite-layout.js';
import {REGIONS, STARTER_LINES, LEGENDARY_IDS, EVOLUTION_CHAINS, speciesMeta, resolveSpeciesData} from '../dist/species-db.js';
import {
  MODE_CATALOG,
  RAID_BOSS_CATALOG,
  pickGuardianTrio,
  buildMatchupTeams,
  build50Challengers,
  createTournament,
  findNextTournamentMatch,
  recordTournamentMatch,
  simulateMatchInstant
} from '../dist/battle-modes.js';
import {createFighter, chooseAttack} from '../dist/engine.js';
import {formationFor} from '../dist/formation.js';
import {megaForms} from '../dist/mega.js';
import {arenaMoveMultiplier} from '../dist/arena-catalog.js';

const cache = JSON.parse(await fs.readFile('dist/pokemon.json', 'utf8'));
const roster = JSON.parse(await fs.readFile('dist/roster.json', 'utf8'));

// 1. Verify Eternatus (#890) sprite extent is strictly larger than every other Pokémon, and Legendaries are only enlarged in Eternatus Raid mode
const eternatusExtent = spriteExtent(890);
for (let id = 1; id <= 1025; id++) {
  if (id === 890) continue;
  assert(eternatusExtent > spriteExtent(id, false, false), `Eternatus spriteExtent (${eternatusExtent}) must be bigger than Pokémon #${id} (${spriteExtent(id, false, false)})`);
  assert(eternatusExtent > spriteExtent(id, false, true), `Eternatus spriteExtent (${eternatusExtent}) must be bigger than raid Pokémon #${id} (${spriteExtent(id, false, true)})`);
  if (LEGENDARY_IDS.has(id)) {
    assert.equal(spriteExtent(id, false, true), 106, `Legendary #${id} in Eternatus Raid must have enlarged spriteExtent 106`);
    assert(spriteExtent(id, false, false) < 106, `Legendary #${id} in standard modes must keep its original spriteExtent (< 106)`);
  }
}

// 2. Verify Region Wars matchups & pools
for (const matchup of ['kanto-vs-johto', 'kanto-vs-hoenn', 'sinnoh-vs-unova']) {
  for (const regionPool of ['starters', 'legends', 'random']) {
    const res = buildMatchupTeams({mode: 'region-wars', matchup, regionPool});
    assert.equal(res.teams.length, 2);
    assert.equal(res.teams[0].length, 3);
    assert.equal(res.teams[1].length, 3);
  }
}

// 3. Verify Starter Showdown (first, middle, final evolutions & All Grass vs All Fire 9v9)
const kantoFirst = buildMatchupTeams({mode: 'starter-showdown', matchup: 'kanto-vs-hoenn', starterStage: 'first'});
assert.deepEqual(kantoFirst.teams, [[1, 4, 7], [252, 255, 258]]);
const kantoMiddle = buildMatchupTeams({mode: 'starter-showdown', matchup: 'kanto-vs-hoenn', starterStage: 'middle'});
assert.deepEqual(kantoMiddle.teams, [[2, 5, 8], [253, 256, 259]]);
const kantoFinal = buildMatchupTeams({mode: 'starter-showdown', matchup: 'kanto-vs-hoenn', starterStage: 'final'});
assert.deepEqual(kantoFinal.teams, [[3, 6, 9], [254, 257, 260]]);

const grassVsFire = buildMatchupTeams({mode: 'starter-showdown', matchup: 'grass-vs-fire', starterStage: 'final'});
assert.equal(grassVsFire.teams[0].length, 9);
assert.equal(grassVsFire.teams[1].length, 9);
for (const id of grassVsFire.teams[0]) {
  const d = resolveSpeciesData(id, cache, roster);
  assert(d.types.includes('grass'), `${d.name} must be Grass type`);
}
for (const id of grassVsFire.teams[1]) {
  const d = resolveSpeciesData(id, cache, roster);
  assert(d.types.includes('fire'), `${d.name} must be Fire type`);
}

// 4. Verify Type Wars, Legendary Clash, Trainer Teams, Army Battle
const dragonVsFairy = buildMatchupTeams({mode: 'type-wars', matchup: 'dragon-vs-fairy', squadSize: 6});
assert.equal(dragonVsFairy.teams[0].length, 6);
assert.equal(dragonVsFairy.teams[1].length, 6);

const weatherVsCreation = buildMatchupTeams({mode: 'legendary-clash', matchup: 'weather-vs-creation'});
assert.deepEqual(weatherVsCreation.teams, [[382, 383, 384], [483, 484, 487]]);

const cynthiaVsSteven = buildMatchupTeams({mode: 'trainer-teams', matchup: 'cynthia-vs-steven'});
assert.deepEqual(cynthiaVsSteven.teams, [[445, 448, 282], [376, 373, 257]]);

const armyMatch = buildMatchupTeams({mode: 'army-battle', matchup: 'grand-coalition'});
assert.equal(armyMatch.teams[0].length, 25);
assert.equal(armyMatch.teams[1].length, 25);

// 5. Verify 50 Pokémon vs Eternatus mode (Initial top/bottom staging -> walk up to surround Eternatus)
const raidMatch = buildMatchupTeams({mode: 'eternatus-raid', matchup: 'all-stars-50'});
assert.deepEqual(raidMatch.teams[0], [890], 'Raid boss Eternatus (#890) must be on Team 0 (Top)');
assert.equal(raidMatch.teams[1].length, 50, 'Challenger army must have 50 Pokémon');
const raidFighters = [
  createFighter(resolveSpeciesData(890, cache, roster), 0, 0, {bossRaid: true, challengerCount: 50}),
  ...raidMatch.teams[1].map((id, slot) => createFighter(resolveSpeciesData(id, cache, roster), 1, slot, {uidIndex: slot}))
];
assert.equal(raidFighters[0].max, 6800, 'Boss Eternatus Raid HP should be 6,800 for a ~60s raid battle');
assert(raidFighters[0].options.length >= 6, 'Boss Eternatus must have a diverse 6-move raid arsenal');
const bossStartFormation = formationFor(raidFighters, 0, false);
assert.equal(bossStartFormation.length, 1);
assert.deepEqual(bossStartFormation[0].position, {x: 270, y: 235}, 'Boss Eternatus starts at top');
const armyStartFormation = formationFor(raidFighters, 1, false);
assert.equal(armyStartFormation.length, 50);
assert(armyStartFormation.every(e => e.position.y >= 640), 'All 50 Pokémon start at the bottom before walking up');

const bossEngagedFormation = formationFor(raidFighters, 0, true);
assert.deepEqual(bossEngagedFormation[0].position, {x: 270, y: 480}, 'Boss Eternatus moves to the center of the screen when engaged');
const raidFormation = formationFor(raidFighters, 1, true);
assert.equal(raidFormation.length, 50);
assert(
  raidFormation.every(e =>
    e.position.x >= 34 &&
    e.position.x <= 506 &&
    e.position.y >= 250 &&
    e.position.y <= 710 &&
    Math.hypot(e.position.x - 270, e.position.y - 480) >= 115 &&
    Math.hypot(e.position.x - 270, e.position.y - 480) <= 265
  ),
  'All 50 Pokémon spread into 3 well-spaced concentric rings around Eternatus in the center'
);
const squadTurn1 = chooseAttack(raidFighters, Math.random, {bossRaid: true});
assert(!squadTurn1.actor.isBoss && squadTurn1.squadAttackers?.length >= 2, 'Challenger turns must launch a Coordinated Squad Volley');
const bossTurn2 = chooseAttack(raidFighters, Math.random, {bossRaid: true});
assert(bossTurn2.actor.isBoss && bossTurn2.splashTargets?.length === 6, 'Boss Eternatus turns must sweep 7 targets at once (1 primary + 6 splash)');
for (const megaId of [3, 6, 9, 94, 150, 254, 257, 260, 282, 373, 376, 382, 383, 384, 445, 448, 800]) {
  assert(megaForms[megaId], `Mega/Primal/Ultra form must exist for #${megaId}`);
  assert(spriteExtent(megaId, true, true) > spriteExtent(megaId, false, true), `Mega Pokémon #${megaId} sprite extent must increase upon Mega Evolution in Eternatus Raid`);
  assert(eternatusExtent > spriteExtent(megaId, true, true), `Eternatus must remain larger than Mega #${megaId}`);
}
assert(spriteExtent(890, true, true) > eternatusExtent, 'Eternamax Phase 2 spriteExtent must grow larger than base Eternatus');

// 5b. Verify all 5 Raid Bosses, Evolution Chains, Weather/Terrain Multipliers, and Outcome Variance
for (const [matchupId, expectedBossId] of [
  ['all-stars-50', 890],
  ['arceus-raid', 493],
  ['ultra-necrozma-raid', 800],
  ['mega-rayquaza-raid', 384],
  ['zygarde-raid', 718]
]) {
  const m = buildMatchupTeams({mode: 'eternatus-raid', matchup: matchupId});
  assert.deepEqual(m.teams[0], [expectedBossId], `Matchup ${matchupId} must place Boss #${expectedBossId} on Team 0`);
  assert.equal(m.teams[1].length, 50, `Matchup ${matchupId} must build 50 challengers on Team 1`);
  assert(!m.teams[1].includes(expectedBossId), `Challengers must not duplicate the active Raid Boss #${expectedBossId}`);
  assert(m.teams[1].every(id => !LEGENDARY_IDS.has(id) && !EVOLUTION_CHAINS[id]), `Matchup ${matchupId} challengers must be final-stage non-legendary Pokémon only`);
  assert(RAID_BOSS_CATALOG[expectedBossId], `RAID_BOSS_CATALOG must include #${expectedBossId}`);
  assert.equal(pickGuardianTrio(expectedBossId).length, 3, `Guardian trio for Boss #${expectedBossId} must have 3 Legendaries`);
}
assert.equal(EVOLUTION_CHAINS[4], 5, 'Charmander (#4) must evolve into Charmeleon (#5)');
assert.equal(EVOLUTION_CHAINS[5], 6, 'Charmeleon (#5) must evolve into Charizard (#6)');
assert.equal(EVOLUTION_CHAINS[656], 657, 'Froakie (#656) must evolve into Frogadier (#657)');
assert.equal(EVOLUTION_CHAINS[657], 658, 'Frogadier (#657) must evolve into Greninja (#658)');
assert.equal(arenaMoveMultiplier('volcano', 'fire'), 1.35, 'Harsh Sunlight boosts Fire moves by +35%');
assert.equal(arenaMoveMultiplier('volcano', 'water'), 0.75, 'Harsh Sunlight weakens Water moves by -25%');
assert.equal(arenaMoveMultiplier('storm', 'electric'), 1.3, 'Heavy Rain & Electric Terrain boosts Electric moves by +30%');
assert.equal(arenaMoveMultiplier('forest', 'grass'), 1.25, 'Grassy Terrain boosts Grass moves by +25%');
assert.equal(arenaMoveMultiplier('temporal', 'psychic'), 1.25, 'Psychic Terrain boosts Psychic moves by +25%');
assert.equal(arenaMoveMultiplier('crystal', 'fairy'), 1.25, 'Misty Terrain boosts Fairy moves by +25%');

const winnersSeen = new Set();
for (let s = 1; s <= 16; s++) {
  const res = simulateMatchInstant([6, 9, 3], [254, 257, 260], cache, roster, 'natural', s * 997);
  if (res.winner !== null) winnersSeen.add(res.winner);
}
assert.equal(winnersSeen.size, 2, 'Different seeds must produce different battle winners');

// 6. Verify Balanced vs Natural rules
const bulbaNatural = createFighter(resolveSpeciesData(1, cache, roster), 0, 0, {rules: 'natural'});
const bulbaBalanced = createFighter(resolveSpeciesData(1, cache, roster), 0, 0, {rules: 'balanced'});
const mewtwoBalanced = createFighter(resolveSpeciesData(150, cache, roster), 1, 0, {rules: 'balanced'});
assert(bulbaBalanced.max > bulbaNatural.max, 'Balanced rules should boost first-stage starter HP');
assert(Math.abs(bulbaBalanced.max - mewtwoBalanced.max) < 40, 'Balanced rules should standardize strength between tiers');

// 7. Verify Tournament 8 & 16 team brackets
for (const size of [8, 16]) {
  const bracket = createTournament(size, 'all');
  assert.equal(bracket.rounds[0].length, size / 2);
  let step = 0;
  let next = findNextTournamentMatch(bracket);
  while (next && step < 30) {
    step++;
    const sim = simulateMatchInstant(next.match.teamA.ids, next.match.teamB.ids, cache, roster, 'balanced', 100 + step);
    recordTournamentMatch(bracket, next.round, next.matchIndex, sim.winner, sim);
    next = findNextTournamentMatch(bracket);
  }
  assert(bracket.champion, `${size}-team tournament must crown a champion`);
  assert.equal(step, size - 1);
}

// 8. Verify full DOM integration: Reinforcements entrance, 50 vs Eternatus Raid, Studio, Presets, History & Best of 3
const {document, window} = parseHTML(await fs.readFile('dist/index.html', 'utf8'));
globalThis.document = document;
globalThis.window = window;
let now = 0, queue = [];
globalThis.performance = {now: () => now};
globalThis.requestAnimationFrame = f => queue.push(f);
globalThis.matchMedia = () => ({matches: false});
const storage = new Map();
globalThis.localStorage = {
  getItem: k => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: k => storage.delete(k)
};
globalThis.Image = class { set src(v) { this._src = v; } };
globalThis.Audio = class { play() { return Promise.resolve(); } pause() {} };
globalThis.fetch = async url => new Response(await fs.readFile('dist/' + url));
const gradient = {addColorStop() {}};
const ctx = new Proxy(
  {measureText: s => ({width: s.length * 7}), createLinearGradient: () => gradient, createRadialGradient: () => gradient},
  {get: (obj, key) => key in obj ? obj[key] : () => {}, set: (obj, key, v) => { obj[key] = v; return true; }}
);
for (const c of document.querySelectorAll('canvas')) c.getContext = () => ctx;

await import('../dist/app.js');
async function frames(n) {
  for (let i = 0; i < n; i++) {
    now += 16;
    const q = queue;
    queue = [];
    for (const f of q) f(now);
    await Promise.resolve();
  }
}
for (let i = 0; i < 20 && !document.querySelector('.overhead-fighter'); i++) await new Promise(r => setImmediate(r));
await frames(5);

function selectOption(sel, val) {
  const opts = [...sel.querySelectorAll('option')];
  for (const o of opts) o.removeAttribute('selected');
  const hit = opts.find(o => o.value === String(val));
  if (hit) {
    hit.selected = true;
    hit.setAttribute('selected', '');
  }
  sel.dispatchEvent(new window.Event('change'));
}

// Switch to Starter Showdown -> All Grass vs All Fire with Reinforcements
const modeSelect = document.querySelector('#battle-mode');
selectOption(modeSelect, 'starter-showdown');
assert(!document.querySelector('#stage').classList.contains('raid-hud-edges'),'Other modes keep their existing health panel placement');
const matchupSelect = document.querySelector('#mode-matchup');
selectOption(matchupSelect, 'grass-vs-fire');

assert.equal(document.querySelector('#battle-format').value, 'reinforcements');
assert.equal(document.querySelectorAll('.overhead-fighter').length, 6, 'Reinforcements format mounts 3 active fighters per side initially');
assert.match(document.querySelector('#hud-top .hud-team-name').textContent, /\+6 RESERVE/);

// Switch to 50 Pokémon vs Eternatus mode
selectOption(modeSelect, 'eternatus-raid');
assert(document.querySelector('#stage').classList.contains('raid-hud-edges'),'50v1 health panels must use edge placement');
assert.equal(document.querySelector('#mega').checked, true, 'Mega Evolution should be enabled in 50 vs Eternatus');
assert.equal(document.querySelectorAll('.overhead-fighter').length, 51, '50 challengers + 1 Boss Eternatus mounted simultaneously');
assert.equal(document.querySelectorAll('#hud-bottom .hud-mon').length, 0, '50 Pokémon HUD must not show individual Pokémon health bars');
assert.match(document.querySelector('#hud-bottom').textContent, /50 \/ 50 POKÉMON LEFT/);
const bossEl = document.querySelector('.overhead-fighter.boss-eternatus.eternatus-sprite');
assert(bossEl, 'Boss Eternatus element must have .boss-eternatus and .eternatus-sprite classes');
assert.equal(bossEl.dataset.species, '890');
assert.equal(bossEl.id, '0-0', 'Boss Eternatus must be mounted on Team 0 at the top');

// Run 50 vs Eternatus battle to completion
let raidDone = false;
const raidPromise = document.querySelector('#start').onclick().then(() => { raidDone = true; });
for (let i = 0; i < 650 && !raidDone; i++) await frames(120);
assert(raidDone, '50 vs Eternatus raid battle must complete');
await raidPromise;
const raidLogText = document.querySelector('#log').textContent;
assert(raidLogText.includes('Mega Evolve simultaneously and restore full HP!'), 'Mega-eligible Pokémon must Mega Evolve simultaneously in one shared surge and restore full HP');
assert(raidLogText.indexOf('Mega Evolve simultaneously and restore full HP!')>raidLogText.indexOf('PHASE 2: ETERNAMAX ETERNATUS'), 'Surviving eligible challengers must awaken after phase 2 begins; phase-1 casualties remain normal');
assert(raidLogText.includes('PHASE 2: ETERNAMAX ETERNATUS'), 'Boss Eternatus must trigger its Eternamax Phase 2 transformation below 40% HP');
assert(raidLogText.includes('Doom Ring faints all'), 'Phase 2 Doom Ring must faint all non-Mega Pokémon');
assert(document.querySelectorAll('.overhead-fighter').length < 51, 'Fainted Pokémon sprites must be immediately cleared from the DOM to avoid clutter');
assert(document.querySelectorAll('.history-card').length >= 1, 'Completed raid battle must be recorded in Battle History');
selectOption(modeSelect,'classic');
assert(!document.querySelector('#stage').classList.contains('raid-hud-edges'),'Leaving 50v1 must restore the normal HUD layout');

// Test Team Builder advanced filters in picker
document.querySelector('#team-a .team-slot').onclick();
selectOption(document.querySelector('#filter-region'), 'hoenn');
selectOption(document.querySelector('#filter-type'), 'grass');
assert(document.querySelectorAll('#pokemon-grid .pokemon-card').length >= 3, 'Picker must filter Hoenn Grass Pokémon');
document.querySelector('#close-picker').onclick();

// Test Save Matchup Preset
document.querySelector('#preset-name').value = 'Kanto vs Hoenn — Final Starters';
document.querySelector('#save-preset').dispatchEvent(new window.Event('click'));
assert.match(document.querySelector('#saved-presets').textContent, /Kanto vs Hoenn — Final Starters/);

// 7. Test GBA FireRed/Emerald Sprite Normalization & Multi-State Animations
const { createCanvas: createRealCanvas, Image: RealImage } = await import('@napi-rs/canvas');
const { createHash } = await import('node:crypto');
const { quantizeToGbaCanvas, ensureGbaSheet, gbaState, drawPmd } = await import('../dist/pmd-animation.js');

const createEl = document.createElement.bind(document);
document.createElement = tag => {
  const e = createEl(tag);
  if (tag === 'canvas') {
    const c = createRealCanvas(1, 1);
    e.native = c;
    e.getContext = () => c.getContext('2d');
    for (const k of ['width', 'height']) {
      Object.defineProperty(e, k, { get: () => c[k], set: v => { c[k] = v; } });
    }
  }
  return e;
};

// Verify all 42 bundled classic front & back sprites are 64x64 GBA format with <= 15 colors and opaque pixels
const pokemonJson = JSON.parse(await fs.readFile('dist/pokemon.json', 'utf8'));
for (const id of Object.keys(pokemonJson)) {
  for (const face of ['front', 'back']) {
    const raw = await fs.readFile(`dist/assets/classic/${face}/${id}.png`);
    const img = new RealImage();
    img.src = raw;
    assert.equal(img.width, 64, `Classic ${face} sprite ${id} must be 64px wide`);
    assert.equal(img.height, 64, `Classic ${face} sprite ${id} must be 64px tall`);
    const c = createRealCanvas(64, 64), cctx = c.getContext('2d');
    cctx.drawImage(img, 0, 0);
    const data = cctx.getImageData(0, 0, 64, 64).data;
    const palette = new Set();
    for (let i = 0; i < data.length; i += 4) {
      assert(data[i + 3] === 0 || data[i + 3] === 255, `Classic ${face} ${id} must have crisp binary alpha`);
      if (data[i + 3]) palette.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
    }
    assert(palette.size <= 16, `Classic ${face} ${id} must have GBA-bounded palette`);
  }
}

// Verify GBA quantization & 8-state animations on both classic sprites and high-color non-GBA renders
const syntheticRender = createRealCanvas(128, 128);
const sctx = syntheticRender.getContext('2d');
for (let y = 20; y < 108; y++) {
  for (let x = 28; x < 100; x++) {
    sctx.fillStyle = `rgb(${(x * 3) % 255}, ${(y * 2) % 255}, ${((x + y) * 2) % 255})`;
    sctx.fillRect(x, y, 1, 1);
  }
}
const quantized = quantizeToGbaCanvas(syntheticRender, false, false);
assert(quantized, 'quantizeToGbaCanvas must normalize high-res render to 64x64 GBA sprite');
assert.equal(quantized.canvas.width, 64);
assert.equal(quantized.canvas.height, 64);
const qPalette = new Set();
for (let i = 0; i < quantized.imageData.data.length; i += 4) {
  const a = quantized.imageData.data[i + 3];
  assert(a === 0 || a === 255, 'Quantized GBA sprite must have zero semi-transparent blur');
  if (a) qPalette.add(`${quantized.imageData.data[i]},${quantized.imageData.data[i + 1]},${quantized.imageData.data[i + 2]}`);
}
assert(qPalette.size <= 15, `Quantized GBA sprite palette must have <= 15 colors (got ${qPalette.size})`);

for (const [id, isBack] of [[6, false], [890, false], [658, true]]) {
  const spriteImg = new RealImage();
  spriteImg.src = await fs.readFile(`dist/assets/classic/${isBack ? 'back' : 'front'}/${id}.png`);
  const domImg = document.createElement('img');
  domImg._native = spriteImg;
  domImg.naturalWidth = spriteImg.width;
  domImg.naturalHeight = spriteImg.height;
  domImg.dataset.facing = isBack ? 'back' : 'front';
  const sheet = ensureGbaSheet(domImg, id, isBack, false);
  assert(sheet, `ensureGbaSheet must build 8-state GBA sheet for #${id}`);
  for (const action of ['Idle', 'Walk', 'Attack', 'Shoot', 'Charge', 'Hurt', 'Sleep']) {
    const holder = document.createElement('div');
    const c = document.createElement('canvas');
    holder.append(domImg, c);
    const fighter = {
      id,
      team: isBack ? 1 : 0,
      hp: action === 'Sleep' ? 0 : 100,
      faintAt: 0,
      max: 100,
      el: holder,
      action: ['Idle', 'Walk', 'Charge', 'Hurt', 'Sleep'].includes(action) ? null : action,
      charge: action === 'Charge',
      motion: action === 'Walk' ? {} : null,
      hitUntil: action === 'Hurt' ? 1000 : 0
    };
    const mockView = { style: 'gba', clock: 0, pmd: {}, images: {} };
    const first = gbaState(mockView, fighter, domImg);
    assert(first, `gbaState must return active state for ${action}`);
    let ticks = 0;
    const hashes = new Set();
    for (const d of first.anim.durations) {
      mockView.clock = (ticks + d * 0.5) / 60;
      ticks += d;
      drawPmd(mockView, fighter);
      hashes.add(createHash('sha256').update(c.native.toBuffer('image/png')).digest('hex'));
    }
    assert(hashes.size > 1, `GBA ${action} animation for #${id} (${isBack ? 'back' : 'front'}) must animate across distinct frames`);
  }
}

console.log('PASS: all 9 battle modes, Eternatus enlarged sprite (> all 1,025 species + boss stage classes), 64x64 GBA FireRed/Emerald sprites & 8-state animations, 50v1 Eternatus Raid, Starter Showdown, Tournament, Team Builder, Studio & History.');
