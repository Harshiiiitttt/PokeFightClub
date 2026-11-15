import {REGIONS, STARTER_LINES, LEGENDARY_IDS, EVOLUTION_CHAINS, CURATED_SPECIES, resolveSpeciesData} from './species-db.js?v=21';
import {createFighter, chooseAttack, title} from './engine.js?v=21';

export const MODE_CATALOG = {
  'classic': {
    label: 'Classic (3v3)',
    badge: '3 VS 3 · CLASSIC',
    description: 'Build any 3v3 custom matchup or shuffle featured contenders.'
  },
  'region-wars': {
    label: 'Region Wars',
    badge: 'REGION WARS',
    description: 'Kanto vs Johto, Kanto vs Hoenn, Sinnoh vs Unova. Choose starters, legends, or randomized regional teams.',
    matchups: [
      {id:'kanto-vs-johto', label:'Kanto vs Johto', regionA:'kanto', regionB:'johto'},
      {id:'kanto-vs-hoenn', label:'Kanto vs Hoenn', regionA:'kanto', regionB:'hoenn'},
      {id:'sinnoh-vs-unova', label:'Sinnoh vs Unova', regionA:'sinnoh', regionB:'unova'},
      {id:'kalos-vs-alola', label:'Kalos vs Alola', regionA:'kalos', regionB:'alola'},
      {id:'galar-vs-paldea', label:'Galar vs Paldea', regionA:'galar', regionB:'paldea'},
      {id:'custom', label:'Custom Region vs Region', regionA:'kanto', regionB:'sinnoh'}
    ]
  },
  'starter-showdown': {
    label: 'Starter Showdown',
    badge: 'STARTER SHOWDOWN',
    description: 'Kanto vs Hoenn starters, all Grass vs all Fire starters, or randomized starter trios across evolution stages.',
    matchups: [
      {id:'kanto-vs-hoenn', label:'Kanto Starters vs Hoenn Starters'},
      {id:'kanto-vs-johto', label:'Kanto Starters vs Johto Starters'},
      {id:'sinnoh-vs-unova', label:'Sinnoh Starters vs Unova Starters'},
      {id:'grass-vs-fire', label:'All Grass Starters vs All Fire Starters (9v9)'},
      {id:'fire-vs-water', label:'All Fire Starters vs All Water Starters (9v9)'},
      {id:'water-vs-grass', label:'All Water Starters vs All Grass Starters (9v9)'},
      {id:'random-trios', label:'Randomized Starter Trios'}
    ]
  },
  'type-wars': {
    label: 'Type Wars',
    badge: 'TYPE WARS',
    description: 'Grass vs Water, Dragon vs Fairy, or teams built around any selected Pokémon type.',
    matchups: [
      {id:'grass-vs-water', label:'Grass vs Water', typeA:'grass', typeB:'water'},
      {id:'dragon-vs-fairy', label:'Dragon vs Fairy', typeA:'dragon', typeB:'fairy'},
      {id:'fire-vs-ice', label:'Fire vs Ice', typeA:'fire', typeB:'ice'},
      {id:'electric-vs-water', label:'Electric vs Water', typeA:'electric', typeB:'water'},
      {id:'psychic-vs-dark', label:'Psychic vs Dark', typeA:'psychic', typeB:'dark'},
      {id:'fighting-vs-steel', label:'Fighting vs Steel', typeA:'fighting', typeB:'steel'},
      {id:'custom', label:'Custom Selected Types', typeA:'dragon', typeB:'steel'}
    ]
  },
  'legendary-clash': {
    label: 'Legendary Clash',
    badge: 'LEGENDARY CLASH',
    description: 'Birds vs Beasts, Weather Trio vs Creation Trio, or custom legendary teams.',
    matchups: [
      {id:'birds-vs-beasts', label:'Birds vs Beasts', teams:[[144,145,146],[243,244,245]], names:['LEGENDARY BIRDS','LEGENDARY BEASTS']},
      {id:'weather-vs-creation', label:'Weather Trio vs Creation Trio', teams:[[382,383,384],[483,484,487]], names:['WEATHER TRIO','CREATION TRIO']},
      {id:'tao-vs-aura', label:'Tao Trio vs Kalos Legends', teams:[[643,644,646],[716,717,718]], names:['TAO TRIO','AURA TRIO']},
      {id:'light-vs-galar', label:'Light Trio vs Galar Legends', teams:[[791,792,800],[888,889,890]], names:['ALOLA LIGHT TRIO','GALAR LEGENDS']},
      {id:'mewtwo-vs-hooh', label:'Kanto Mythics vs Johto Tower Duo', teams:[[150,151,145],[249,250,251]], names:['KANTO LEGENDS','JOHTO LEGENDS']},
      {id:'custom', label:'Custom Legendary Teams', teams:[[150,384,483],[249,487,888]], names:['ALPHA LEGENDS','OMEGA LEGENDS']}
    ]
  },
  'trainer-teams': {
    label: 'Trainer Teams',
    badge: 'TRAINER TEAMS',
    description: 'Themed teams inspired by Rivals, Gym Leaders, Champions, or your own custom trainer.',
    matchups: [
      {id:'red-vs-blue', label:'Champion Red vs Rival Blue', teams:[[25,6,3],[9,149,94]], names:['CHAMPION RED','RIVAL BLUE']},
      {id:'cynthia-vs-steven', label:'Champion Cynthia vs Champion Steven', teams:[[445,448,282],[376,373,257]], names:['CHAMPION CYNTHIA','CHAMPION STEVEN']},
      {id:'lance-vs-leon', label:'Champion Lance vs Champion Leon', teams:[[149,6,373],[6,887,888]], names:['CHAMPION LANCE','CHAMPION LEON']},
      {id:'ash-vs-gary', label:'Trainer Ash vs Rival Gary', teams:[[25,6,658],[9,197,466]], names:['TRAINER ASH','RIVAL GARY']},
      {id:'gym-leaders', label:'Kanto Gym Aces vs Hoenn Gym Aces', teams:[[59,65,68],[254,350,306]], names:['KANTO GYM LEADERS','HOENN GYM LEADERS']},
      {id:'custom', label:'Custom Trainer Matchup', teams:[[6,448,658],[9,445,282]], names:['TRAINER EMERALD','TRAINER CRIMSON']}
    ]
  },
  'tournament': {
    label: 'Tournament',
    badge: 'TOURNAMENT BRACKET',
    description: 'Eight or sixteen teams compete through a bracket, with saved results and a champion reveal.'
  },
  'army-battle': {
    label: 'Army Battle',
    badge: 'ARMY BATTLE',
    description: 'Large regional or type-based armies fighting simultaneously across the battlefield.',
    matchups: [
      {id:'kanto-vs-johto', label:'Kanto Army vs Johto Army (12v12)'},
      {id:'hoenn-vs-sinnoh', label:'Hoenn Army vs Sinnoh Army (12v12)'},
      {id:'dragon-vs-fairy', label:'Dragon & Fire Army vs Fairy & Water Army (15v15)'},
      {id:'legends-vs-starters', label:'Legendary Army vs Final Starters Army (18v18)'},
      {id:'grand-coalition', label:'Grand Regional Coalition (25v25)'}
    ]
  },
  'eternatus-raid': {
    label: '50 vs Boss Raid',
    badge: '50 VS 1 BOSS RAID',
    description: 'A ten-second opening leads into a dramatic true-form awakening, an extended boss fight, and a seven-second victory scene.',
    matchups: [
      {id:'all-stars-50', label:'50 All-Star Pokémon vs Boss Eternatus', bossId: 890},
      {id:'arceus-raid', label:'50 Pokémon vs Arceus (Judgment Type-Shift Boss)', bossId: 493},
      {id:'ultra-necrozma-raid', label:'50 Pokémon vs Ultra Necrozma (Light That Burns the Sky)', bossId: 800},
      {id:'mega-rayquaza-raid', label:'50 Pokémon vs Mega Rayquaza (Delta Stream Boss)', bossId: 384},
      {id:'zygarde-raid', label:'50 Pokémon vs Complete Zygarde (Power Construct Boss)', bossId: 718},
      {id:'starters-50', label:'50 Cross-Gen Starters & Aces vs Boss Eternatus', bossId: 890},
      {id:'random-50', label:'50 Randomized Challengers vs Boss Eternatus', bossId: 890}
    ]
  }
};

export const RAID_BOSS_CATALOG = {
  890: {id: 890, title: 'BOSS ETERNATUS', phase2Title: 'ETERNAMAX ETERNATUS', phase2Move: 'eternabeam', phase2Color: '#ff3b78', phase2Vortex: 'eternamax', threshold: 0.4},
  493: {id: 493, title: 'BOSS ARCEUS', phase2Title: 'OMNIPOTENT ARCEUS', phase2Move: 'judgment', phase2Color: '#ffe787', phase2Vortex: 'arceus', threshold: 0.4},
  800: {id: 800, title: 'BOSS NECROZMA', phase2Title: 'BLINDING ULTRA NECROZMA', phase2Move: 'light-that-burns-the-sky', phase2Color: '#fff29c', phase2Vortex: 'necrozma', threshold: 0.4},
  384: {id: 384, title: 'BOSS RAYQUAZA', phase2Title: 'DELTA STREAM RAYQUAZA', phase2Move: 'dragon-ascent', phase2Color: '#69f5b3', phase2Vortex: 'rayquaza', threshold: 0.4},
  718: {id: 718, title: 'BOSS ZYGARDE', phase2Title: 'COMPLETE ZYGARDE (100%)', phase2Move: 'core-enforcer', phase2Color: '#7af7a2', phase2Vortex: 'zygarde', threshold: 0.5}
};

export const REGIONAL_POOLS = {
  kanto: {
    starters: [3,6,9],
    legends: [144,145,146,150,151],
    all: [3,6,9,25,94,144,145,146,149,150,151,18,34,38,59,65,68,103,130,131,134,135,136,143]
  },
  johto: {
    starters: [154,157,160],
    legends: [243,244,245,249,250,251],
    all: [154,157,160,243,244,245,249,250,251,181,196,197,212,214,230,248]
  },
  hoenn: {
    starters: [254,257,260],
    legends: [382,383,384,380,381,385,386],
    all: [254,257,260,282,373,376,382,383,384,306,330,350,359,380,381,385]
  },
  sinnoh: {
    starters: [389,392,395],
    legends: [483,484,487,491,493],
    all: [389,392,395,445,448,483,484,487,398,405,407,461,466,467,468,491,493]
  },
  unova: {
    starters: [497,500,503],
    legends: [643,644,646],
    all: [497,500,503,643,644,646,530,571,609,612,635,637]
  },
  kalos: {
    starters: [652,655,658],
    legends: [716,717,718],
    all: [652,655,658,716,717,718,663,681,700,706,715]
  },
  alola: {
    starters: [724,727,730],
    legends: [791,792,800,785],
    all: [724,727,730,791,792,800,745,778,784,785]
  },
  galar: {
    starters: [812,815,818],
    legends: [888,889,890],
    all: [812,815,818,888,889,890,823,849,887]
  },
  paldea: {
    starters: [908,911,914],
    legends: [1007,1008,1024],
    all: [908,911,914,1007,1008,1024,936,937,959,998]
  }
};

export const TYPE_POOLS = {
  grass: [3,254,154,389,497,652,724,812,908,103,407],
  fire: [6,257,146,244,250,643,157,392,500,655,727,815,911,59,637],
  water: [9,260,245,382,484,658,160,395,503,730,818,914,130,131,350],
  electric: [25,145,243,644,135,181,405,466,785,849,1008],
  psychic: [150,151,249,282,376,791,792,800,65,196,380,381],
  ice: [144,646,131,461,998,7],
  dragon: [149,373,384,445,483,484,487,643,644,646,890,330,612,635,887],
  dark: [658,717,197,248,359,461,491,571,635,727,908],
  fairy: [282,716,888,468,700,730,778,785,959],
  fighting: [257,448,889,68,214,392,500,652,784,914,1007],
  flying: [6,144,145,146,149,249,250,373,384,717,18,130,398,468,663,823],
  poison: [3,94,890,34,407,849,1,2],
  ground: [260,383,445,34,330,389,530,718],
  rock: [248,306,745,383,483,376],
  bug: [212,214,637,151,254,3],
  ghost: [94,487,792,609,681,724,778,887,911,937],
  steel: [376,448,483,791,888,889,212,306,395,530,681,823,959],
  normal: [143,18,398,493,1024,25,151]
};

export const FUTURE_FORMS = {
  483: {title:'Origin Dialga', stats:[100,100,120,150,120,90], types:['steel','dragon'], color:'#78ddff'},
  484: {title:'Origin Palkia', stats:[90,100,100,150,120,120], types:['water','dragon'], color:'#e4a6ff'},
  487: {title:'Origin Giratina', stats:[150,120,100,120,100,90], types:['ghost','dragon'], color:'#ff6996'},
  382: {title:'Primal Kyogre', stats:[100,150,90,180,160,90], types:['water'], color:'#4db8ff'},
  383: {title:'Primal Groudon', stats:[100,180,160,150,90,90], types:['ground','fire'], color:'#ff7b39'},
  718: {title:'Complete Zygarde', stats:[216,100,121,91,95,85], types:['dragon','ground'], color:'#7af7a2'},
  800: {title:'Ultra Necrozma', stats:[97,167,97,167,97,129], types:['psychic','dragon'], color:'#ffe97d'},
  888: {title:'Crowned Zacian', stats:[92,170,115,80,115,148], types:['fairy','steel'], color:'#7fd4ff'},
  889: {title:'Crowned Zamazenta', stats:[92,130,145,80,145,128], types:['fighting','steel'], color:'#ff6b7b'},
  890: {title:'Eternamax Eternatus', stats:[255,115,250,125,250,130], types:['poison','dragon'], color:'#ff427f'}
};

export const DEFAULT_SAVED_PRESETS = [
  {
    name: 'Kanto vs Hoenn — Final Starters',
    mode: 'starter-showdown',
    matchup: 'kanto-vs-hoenn',
    starterStage: 'final',
    format: 'simultaneous',
    rules: 'natural',
    teams: [[3,6,9],[254,257,260]],
    titles: ['KANTO STARTERS','HOENN STARTERS']
  },
  {
    name: 'All Grass vs All Fire — Reinforcements',
    mode: 'starter-showdown',
    matchup: 'grass-vs-fire',
    starterStage: 'final',
    format: 'reinforcements',
    rules: 'balanced',
    teams: [[3,154,254,389,497,652,724,812,908],[6,157,257,392,500,655,727,815,911]],
    titles: ['ALL GRASS STARTERS','ALL FIRE STARTERS']
  },
  {
    name: 'Weather Trio vs Creation Trio',
    mode: 'legendary-clash',
    matchup: 'weather-vs-creation',
    format: 'simultaneous',
    rules: 'natural',
    teams: [[382,383,384],[483,484,487]],
    titles: ['WEATHER TRIO','CREATION TRIO']
  },
  {
    name: 'Cynthia vs Steven — Champions',
    mode: 'trainer-teams',
    matchup: 'cynthia-vs-steven',
    format: 'simultaneous',
    rules: 'natural',
    teams: [[445,448,282],[376,373,257]],
    titles: ['CHAMPION CYNTHIA','CHAMPION STEVEN']
  },
  {
    name: '50 Pokémon vs Boss Eternatus',
    mode: 'eternatus-raid',
    matchup: 'all-stars-50',
    format: 'simultaneous',
    rules: 'natural',
    teams: [[890], build50Challengers('all-stars-50')],
    titles: ['BOSS ETERNATUS','50 CHALLENGERS']
  }
];

function pickDistinct(pool, count, rng = Math.random) {
  const copy = [...new Set(pool)];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export function startersForRegion(region, stage = 'final') {
  const line = STARTER_LINES[region] || STARTER_LINES.kanto;
  const idx = stage === 'first' ? 0 : stage === 'middle' ? 1 : 2;
  return [line.grass[idx], line.fire[idx], line.water[idx]];
}

export function startersForType(type, stage = 'final') {
  const idx = stage === 'first' ? 0 : stage === 'middle' ? 1 : 2;
  return Object.values(STARTER_LINES).map(r => r[type][idx]);
}

export const RAID_GUARDIAN_TRIOS = {
  890: [[383, 382, 384], [888, 889, 384]],
  493: [[483, 484, 487]],
  800: [[791, 792, 150]],
  384: [[383, 382, 150]],
  718: [[716, 717, 384]]
};

export const GUARDIAN_AWAKENINGS = {
  150: {title:'Mega Mewtwo Y', stats:[106,150,70,194,120,140], types:['psychic'], color:'#df9bff'},
  382: {title:'Primal Kyogre', stats:[100,150,90,180,160,90], types:['water'], color:'#4db8ff'},
  383: {title:'Primal Groudon', stats:[100,180,160,150,90,90], types:['ground','fire'], color:'#ff7b39'},
  384: {title:'Mega Rayquaza', stats:[105,180,100,180,100,115], types:['dragon','flying'], color:'#69f5b3'},
  483: {title:'Origin Dialga', stats:[100,120,120,150,120,90], types:['steel','dragon'], color:'#78ddff'},
  484: {title:'Origin Palkia', stats:[90,120,100,150,120,120], types:['water','dragon'], color:'#e4a6ff'},
  487: {title:'Origin Giratina', stats:[150,120,100,120,100,90], types:['ghost','dragon'], color:'#ff6996'},
  716: {title:'Awakened Xerneas', stats:[126,131,95,131,98,99], types:['fairy'], color:'#89e8ff'},
  717: {title:'Awakened Yveltal', stats:[126,131,95,131,98,99], types:['dark','flying'], color:'#ff5b6e'},
  791: {title:'Radiant Solgaleo', stats:[137,137,107,113,89,97], types:['psychic','steel'], color:'#ffd76e'},
  792: {title:'Full Moon Lunala', stats:[137,113,89,137,107,97], types:['psychic','ghost'], color:'#c49cff'},
  888: {title:'Crowned Zacian', stats:[92,170,115,80,115,148], types:['fairy','steel'], color:'#7fd4ff'},
  889: {title:'Crowned Zamazenta', stats:[92,130,145,80,145,128], types:['fighting','steel'], color:'#ff6b7b'}
};

export function pickGuardianTrio(bossId, rng = Math.random) {
  const options = RAID_GUARDIAN_TRIOS[bossId] || RAID_GUARDIAN_TRIOS[890];
  return [...options[Math.floor(rng() * options.length)]];
}

export function build50Challengers(variant = 'all-stars-50', rng = Math.random, excludeBossId = 890) {
  const isFinalNormal = id => id !== excludeBossId && !LEGENDARY_IDS.has(id) && !EVOLUTION_CHAINS[id];
  const megaNormal = [6, 9, 3, 94, 448, 254, 257, 260, 282, 373, 376, 445].filter(isFinalNormal);
  const allFinalStarters = Object.values(STARTER_LINES)
    .flatMap(r => [r.grass[2], r.fire[2], r.water[2]])
    .filter(isFinalNormal);
  const finalIcons = [
    59,65,68,130,131,143,149,181,196,197,212,214,248,306,330,350,359,
    398,405,407,461,466,468,530,571,609,612,635,637,663,681,700,706,715,
    745,778,784,823,849,887,936,937,959,998
  ].filter(isFinalNormal);
  if (variant === 'starters-50') {
    return [...new Set([...megaNormal, ...allFinalStarters, ...finalIcons])].slice(0, 50);
  }
  if (variant === 'random-50') {
    const restPool = [...allFinalStarters, ...finalIcons].filter(id => !megaNormal.includes(id));
    const rest = pickDistinct(restPool, 50 - megaNormal.length, rng);
    return [...megaNormal, ...rest].slice(0, 50);
  }
  return [...new Set([...megaNormal, ...allFinalStarters, ...finalIcons])].slice(0, 50);
}

export function buildMatchupTeams(config, rng = Math.random) {
  const {
    mode = 'classic',
    matchup = '',
    regionA = 'kanto',
    regionB = 'johto',
    regionPool = 'starters',
    starterStage = 'final',
    typeA = 'grass',
    typeB = 'water',
    squadSize = 3
  } = config;

  if (mode === 'region-wars') {
    const preset = MODE_CATALOG['region-wars'].matchups.find(m => m.id === matchup);
    const rA = matchup === 'custom' ? regionA : (preset?.regionA || regionA);
    const rB = matchup === 'custom' ? regionB : (preset?.regionB || regionB);
    const makeRegionTeam = r => {
      const p = REGIONAL_POOLS[r] || REGIONAL_POOLS.kanto;
      if (regionPool === 'starters') return [...p.starters];
      if (regionPool === 'legends') return p.legends.slice(0, 3);
      return pickDistinct(p.all, 3, rng);
    };
    const tag = regionPool === 'starters' ? 'STARTERS' : regionPool === 'legends' ? 'LEGENDS' : 'TEAM';
    return {
      teams: [makeRegionTeam(rA), makeRegionTeam(rB)],
      titles: [`${rA.toUpperCase()} ${tag}`, `${rB.toUpperCase()} ${tag}`]
    };
  }

  if (mode === 'starter-showdown') {
    const stageLabel = starterStage === 'first' ? '1ST STAGE' : starterStage === 'middle' ? 'MID STAGE' : 'FINAL';
    if (matchup === 'kanto-vs-hoenn') {
      return {teams: [startersForRegion('kanto', starterStage), startersForRegion('hoenn', starterStage)], titles: [`KANTO (${stageLabel})`, `HOENN (${stageLabel})`]};
    }
    if (matchup === 'kanto-vs-johto') {
      return {teams: [startersForRegion('kanto', starterStage), startersForRegion('johto', starterStage)], titles: [`KANTO (${stageLabel})`, `JOHTO (${stageLabel})`]};
    }
    if (matchup === 'sinnoh-vs-unova') {
      return {teams: [startersForRegion('sinnoh', starterStage), startersForRegion('unova', starterStage)], titles: [`SINNOH (${stageLabel})`, `UNOVA (${stageLabel})`]};
    }
    if (matchup === 'grass-vs-fire') {
      return {teams: [startersForType('grass', starterStage), startersForType('fire', starterStage)], titles: ['ALL GRASS STARTERS', 'ALL FIRE STARTERS']};
    }
    if (matchup === 'fire-vs-water') {
      return {teams: [startersForType('fire', starterStage), startersForType('water', starterStage)], titles: ['ALL FIRE STARTERS', 'ALL WATER STARTERS']};
    }
    if (matchup === 'water-vs-grass') {
      return {teams: [startersForType('water', starterStage), startersForType('grass', starterStage)], titles: ['ALL WATER STARTERS', 'ALL GRASS STARTERS']};
    }
    const idx = starterStage === 'first' ? 0 : starterStage === 'middle' ? 1 : 2;
    const regions = Object.keys(STARTER_LINES);
    const randomTrio = () => ['grass','fire','water'].map(t => {
      const r = regions[Math.floor(rng() * regions.length)];
      return STARTER_LINES[r][t][idx];
    });
    return {teams: [randomTrio(), randomTrio()], titles: ['STARTER TRIO ALPHA', 'STARTER TRIO OMEGA']};
  }

  if (mode === 'type-wars') {
    const preset = MODE_CATALOG['type-wars'].matchups.find(m => m.id === matchup);
    const tA = matchup === 'custom' ? typeA : (preset?.typeA || typeA);
    const tB = matchup === 'custom' ? typeB : (preset?.typeB || typeB);
    const count = Math.max(3, Math.min(9, squadSize || 3));
    const poolA = TYPE_POOLS[tA] || TYPE_POOLS.grass;
    const poolB = TYPE_POOLS[tB] || TYPE_POOLS.water;
    return {
      teams: [poolA.slice(0, count), poolB.slice(0, count)],
      titles: [`TEAM ${tA.toUpperCase()}`, `TEAM ${tB.toUpperCase()}`]
    };
  }

  if (mode === 'legendary-clash') {
    const preset = MODE_CATALOG['legendary-clash'].matchups.find(m => m.id === matchup) || MODE_CATALOG['legendary-clash'].matchups[0];
    if (matchup === 'custom') {
      const legends = [...LEGENDARY_IDS].filter(id => id <= 900);
      return {teams: [pickDistinct(legends, 3, rng), pickDistinct(legends, 3, rng)], titles: ['ALPHA LEGENDS', 'OMEGA LEGENDS']};
    }
    return {teams: preset.teams.map(t => [...t]), titles: [...preset.names]};
  }

  if (mode === 'trainer-teams') {
    const preset = MODE_CATALOG['trainer-teams'].matchups.find(m => m.id === matchup) || MODE_CATALOG['trainer-teams'].matchups[0];
    return {teams: preset.teams.map(t => [...t]), titles: [...preset.names]};
  }

  if (mode === 'army-battle') {
    if (matchup === 'hoenn-vs-sinnoh') {
      return {teams: [REGIONAL_POOLS.hoenn.all.slice(0, 12), REGIONAL_POOLS.sinnoh.all.slice(0, 12)], titles: ['HOENN ARMY', 'SINNOH ARMY']};
    }
    if (matchup === 'dragon-vs-fairy') {
      const a = [...new Set([...TYPE_POOLS.dragon, ...TYPE_POOLS.fire])].slice(0, 15);
      const b = [...new Set([...TYPE_POOLS.fairy, ...TYPE_POOLS.water])].slice(0, 15);
      return {teams: [a, b], titles: ['DRAGON & FIRE ARMY', 'FAIRY & WATER ARMY']};
    }
    if (matchup === 'legends-vs-starters') {
      const legends = [144,145,146,150,151,243,244,245,249,250,382,383,384,483,484,487,643,644];
      const starters = Object.values(STARTER_LINES).flatMap(r => [r.grass[2], r.fire[2]]).slice(0, 18);
      return {teams: [legends, starters], titles: ['LEGENDARY ARMY', 'STARTERS ARMY']};
    }
    if (matchup === 'grand-coalition') {
      const a = [...REGIONAL_POOLS.kanto.all, ...REGIONAL_POOLS.hoenn.all].slice(0, 25);
      const b = [...REGIONAL_POOLS.johto.all, ...REGIONAL_POOLS.sinnoh.all, ...REGIONAL_POOLS.unova.all].slice(0, 25);
      return {teams: [a, b], titles: ['EASTERN COALITION (25)', 'WESTERN COALITION (25)']};
    }
    return {
      teams: [REGIONAL_POOLS.kanto.all.slice(0, 12), REGIONAL_POOLS.johto.all.slice(0, 12)],
      titles: ['KANTO ARMY', 'JOHTO ARMY']
    };
  }

  if (mode === 'eternatus-raid') {
    const preset = MODE_CATALOG['eternatus-raid'].matchups.find(m => m.id === matchup);
    const bossId = preset?.bossId || 890;
    const bossInfo = RAID_BOSS_CATALOG[bossId] || RAID_BOSS_CATALOG[890];
    return {
      teams: [[bossId], build50Challengers(matchup || 'all-stars-50', rng, bossId)],
      titles: [bossInfo.title, '50 POKÉMON ARMY']
    };
  }

  return {teams: [[144,145,146],[243,244,245]], titles: ['LEGENDARY BIRDS','LEGENDARY BEASTS']};
}

const TOURNAMENT_ENTRANTS = [
  {name:'KANTO CHAMPIONS', ids:[3,6,9]},
  {name:'JOHTO BEASTS', ids:[243,244,245]},
  {name:'HOENN STARTERS', ids:[254,257,260]},
  {name:'SINNOH ELITE', ids:[445,448,282]},
  {name:'WEATHER TRIO', ids:[382,383,384]},
  {name:'CREATION TRIO', ids:[483,484,487]},
  {name:'UNOVA DRAGONS', ids:[643,644,646]},
  {name:'GALAR CROWNED', ids:[888,889,890]},
  {name:'KANTO BIRDS', ids:[144,145,146]},
  {name:'KALOS ACES', ids:[658,716,717]},
  {name:'ALOLA LIGHT', ids:[791,792,800]},
  {name:'PALDEA VANGUARD', ids:[908,911,914]},
  {name:'CHAMPION RED', ids:[25,149,150]},
  {name:'CHAMPION STEVEN', ids:[376,373,306]},
  {name:'DRAGON MASTERS', ids:[149,373,445]},
  {name:'SHADOW SYNDICATE', ids:[94,197,491]}
];

export function createTournament(size = 8, theme = 'all', rng = Math.random) {
  const count = size === 16 ? 16 : 8;
  let pool = [...TOURNAMENT_ENTRANTS];
  if (theme === 'starters') {
    pool = [
      ...Object.entries(STARTER_LINES).map(([r, l]) => ({name:`${r.toUpperCase()} STARTERS`, ids:[l.grass[2], l.fire[2], l.water[2]]})),
      ...Object.entries(STARTER_LINES).map(([r, l]) => ({name:`${r.toUpperCase()} FIRSTS`, ids:[l.grass[0], l.fire[0], l.water[0]]}))
    ];
  } else if (theme === 'types') {
    pool = Object.entries(TYPE_POOLS).slice(0, 16).map(([t, ids]) => ({name:`TEAM ${t.toUpperCase()}`, ids:ids.slice(0, 3)}));
  }
  const entrants = pool.slice(0, count).map((e, idx) => ({seed: idx + 1, name: e.name, ids: [...e.ids]}));
  const rounds = [];
  const firstRound = [];
  for (let i = 0; i < count; i += 2) {
    firstRound.push({
      id: `R1-M${i/2 + 1}`,
      round: 0,
      matchIndex: i / 2,
      teamA: entrants[i],
      teamB: entrants[i + 1],
      winner: null,
      score: null,
      seed: null
    });
  }
  rounds.push(firstRound);
  let prevCount = firstRound.length;
  let r = 1;
  while (prevCount > 1) {
    const nextRound = [];
    for (let i = 0; i < prevCount / 2; i++) {
      nextRound.push({
        id: `R${r+1}-M${i+1}`,
        round: r,
        matchIndex: i,
        teamA: null,
        teamB: null,
        winner: null,
        score: null,
        seed: null
      });
    }
    rounds.push(nextRound);
    prevCount /= 2;
    r++;
  }
  return {size: count, theme, rounds, currentRound: 0, currentMatch: 0, champion: null};
}

export function findNextTournamentMatch(bracket) {
  if (!bracket?.rounds) return null;
  for (let r = 0; r < bracket.rounds.length; r++) {
    for (let m = 0; m < bracket.rounds[r].length; m++) {
      const match = bracket.rounds[r][m];
      if (!match.winner && match.teamA && match.teamB) {
        return {round: r, matchIndex: m, match};
      }
    }
  }
  return null;
}

export function recordTournamentMatch(bracket, roundIndex, matchIndex, winnerSide, meta = {}) {
  const match = bracket.rounds?.[roundIndex]?.[matchIndex];
  if (!match || !match.teamA || !match.teamB) return bracket;
  const winner = winnerSide === 0 ? match.teamA : match.teamB;
  match.winner = winner;
  match.winnerSide = winnerSide;
  match.turns = meta.turns || 0;
  match.seed = meta.seed || 1;
  const nextRound = bracket.rounds[roundIndex + 1];
  if (nextRound) {
    const targetMatch = nextRound[Math.floor(matchIndex / 2)];
    if (matchIndex % 2 === 0) targetMatch.teamA = winner;
    else targetMatch.teamB = winner;
  } else {
    bracket.champion = winner;
  }
  const next = findNextTournamentMatch(bracket);
  if (next) {
    bracket.currentRound = next.round;
    bracket.currentMatch = next.matchIndex;
  }
  return bracket;
}

export function simulateMatchInstant(teamAIds, teamBIds, cache, roster, rules = 'natural', seed = 101) {
  let s = seed | 0;
  const rng = () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const fighters = [
    ...teamAIds.map((id, i) => createFighter(resolveSpeciesData(id, cache, roster), 0, i, {rules})),
    ...teamBIds.map((id, i) => createFighter(resolveSpeciesData(id, cache, roster), 1, i, {rules}))
  ];
  let turns = 0;
  let totalDamage = 0;
  while (turns < 180 && fighters.some(p => p.team === 0 && p.hp > 0) && fighters.some(p => p.team === 1 && p.hp > 0)) {
    turns++;
    const a = chooseAttack(fighters, rng, {rules});
    if (!a) break;
    a.target.hp = Math.max(0, a.target.hp - a.damage);
    totalDamage += a.damage;
  }
  const hpA = fighters.filter(p => p.team === 0).reduce((sum, p) => sum + p.hp, 0);
  const hpB = fighters.filter(p => p.team === 1).reduce((sum, p) => sum + p.hp, 0);
  const winner = hpA >= hpB ? 0 : 1;
  return {winner, turns, totalDamage, seed};
}
