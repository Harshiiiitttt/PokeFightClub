import assert from 'node:assert/strict';
import fs from 'node:fs';
import {effectiveness,createFighter,chooseAttack,movesFor} from './dist/engine.js';
const cache=JSON.parse(fs.readFileSync('dist/pokemon.json'));
assert.equal(effectiveness('electric',['ground']),0);
assert.equal(effectiveness('normal',['ghost']),0);
assert.equal(effectiveness('fire',['grass','steel']),4);
assert.equal(effectiveness('water',['water','dragon']),.25);
for(const p of Object.values(cache))for(const m of movesFor(p))assert(p.moves.includes(m.name)||m.name==='struggle',`${p.name} cannot learn ${m.name}`);
function seeded(s){return ()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
function battle(ids,seed){const rng=seeded(seed),f=ids.map((id,i)=>createFighter(cache[id],Math.floor(i/3),i%3)),events=[],lastMoves=new Map();for(let turn=0;turn<180;turn++){if(!f.some(p=>p.team===0&&p.hp>0)||!f.some(p=>p.team===1&&p.hp>0))break;const a=chooseAttack(f,rng);assert(a.actor.hp>0&&a.target.hp>0);assert(a.actor.team!==a.target.team);assert(Number.isFinite(a.damage)&&a.damage>=0);if(a.actor.options.length>1)assert.notEqual(a.move.name,lastMoves.get(a.actor.uid),'Repeated the same move consecutively');lastMoves.set(a.actor.uid,a.move.name);if(events.length)assert.notEqual(a.actor.uid,events.at(-1)[0],'Same actor took consecutive actions');if(a.dodge||a.mult===0)assert.equal(a.damage,0);a.target.hp=Math.max(0,a.target.hp-a.damage);events.push([a.actor.uid,a.target.uid,a.move.name,a.damage]);}return {events,remaining:f.map(p=>p.hp)}}
const legends=[382,384,383,483,487,484];assert.deepEqual(battle(legends,45),battle(legends,45));assert.notDeepEqual(battle(legends,45),battle(legends,46));
let draws=0;const ids=Object.keys(cache).map(Number);for(let i=1;i<=500;i++){const rng=seeded(i),team=Array.from({length:6},()=>ids[Math.floor(rng()*ids.length)]),r=battle(team,i);if(r.events.length===180)draws++;assert(r.remaining.every(h=>h>=0));}
console.log(`PASS: type immunities, dual types, learned moves, deterministic replay and 500 random battles (${draws} turn-limit draws).`);
