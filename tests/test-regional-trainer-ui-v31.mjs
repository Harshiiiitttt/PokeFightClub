import assert from 'node:assert/strict';
import {app,document,frames} from './test-trainer-duel.mjs';
import {TRAINERS} from '../dist/trainer-rosters.js';
const $=s=>document.querySelector(s);
function select(id,value){const el=$(id);for(const option of el.querySelectorAll('option'))option.removeAttribute('selected');const hit=[...el.querySelectorAll('option')].find(o=>o.value===value);assert(hit);hit.selected=true;hit.setAttribute('selected','');el.dispatchEvent(new document.defaultView.Event('change'));}
app.configureModeUI('trainer-duel');assert(!$('#trainer-controls').hidden);assert.equal($('#trainer-a').querySelectorAll('option').length,20);assert.equal($('#trainer-b').querySelectorAll('option').length,20);
select('#mode-matchup','ash-leon');assert.deepEqual(app.view.trainerIds,['ash-journeys','leon']);assert.deepEqual(app.teams[0],[25,149,94,448,865,882]);assert.equal(app.view.teamName(0),'ASH');assert.equal(app.view.teamName(1),'LEON');
app.teams[1][0]=94;select('#trainer-a','cynthia');assert.deepEqual(app.view.trainerIds,['cynthia','leon']);assert.equal(app.teams[1][0],94,'Changing one trainer must preserve edits on the opposing roster');assert.deepEqual(app.teams[0],TRAINERS.find(t=>t.id==='cynthia').team);
$('#preset-name').value='Regional custom';$('#save-preset').click();select('#mode-matchup','ash-alain');$('#load-preset').click();assert.deepEqual(app.view.trainerIds,['cynthia','leon'],'Saved presets restore the trainer identities');assert.equal(app.teams[1][0],94);assert.equal($('#trainer-a').value,'cynthia');assert.equal($('#trainer-b').value,'leon');
const battle=$('#start').onclick();assert($('#trainer-a').disabled&&$('#trainer-b').disabled);await frames(30);$('#stop').onclick();await frames(50);await battle;assert(!$('#trainer-a').disabled&&!$('#trainer-b').disabled);assert.deepEqual(app.view.trainerIds,['cynthia','leon']);
select('#mode-matchup','ash-leon');let finished=false;const fullBattle=$('#start').onclick().then(()=>finished=true);for(let i=0;i<600&&!finished;i++)await frames(100);assert(finished,'Ash vs Leon must play through the full six-Pokémon battle');await fullBattle;assert(app.view.fighters.some(p=>p.team===0&&p.hp>0)!==app.view.fighters.some(p=>p.team===1&&p.hp>0));
app.configureModeUI('classic');assert($('#trainer-controls').hidden);assert(!app.view.trainerMode);app.configureModeUI('trainer-duel');assert.deepEqual(app.view.trainerIds,['red','blue']);
console.log('PASS: 20 independent trainer selectors, matchup-to-region sync, editable opposing teams retained, saved identity/roster restore, running lock, Stop cleanup, classic isolation and original default.');

