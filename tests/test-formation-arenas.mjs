import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {formationFor} from '../dist/formation.js';
import {BattleView} from '../dist/battle-view.js';
import {arenaCatalog} from '../dist/arena-catalog.js';
import {drawArenaAmbience} from '../dist/arena-ambience.js';
import {drawAttackDetail} from '../dist/attack-details.js';
for(const team of [0,1])for(let mask=0;mask<8;mask++){
 const fighters=[2,0,1].map(slot=>({uid:`${team}-${slot}`,team,slot,hp:mask&(1<<slot)?100:0}));
 const entries=formationFor(fighters,team),slots=entries.map(e=>e.fighter.slot);
 assert.deepEqual(slots,[...slots].sort());
 if(entries.length)assert.equal(entries.reduce((s,e)=>s+e.position.x,0)/entries.length,270);
 assert(entries.every(e=>team===0?e.position.y<360:e.position.y>640));
}
const fighters=Array.from({length:6},(_,i)=>({uid:String(i),team:i<3?0:1,slot:i%3,hp:100,direction:i<3?0:4}));
for(const p of fighters)p.pos={...formationFor(fighters,p.team).find(e=>e.fighter===p).position};
const fake={fighters,clock:0,move:BattleView.prototype.move};
for(const team of [0,1]){
 const members=fighters.filter(p=>p.team===team);
 for(const dead of [members[1],members[0]]){
  dead.hp=0;const expected=formationFor(fighters,team),before=expected.map(e=>({...e.fighter.pos}));let waits=0;
  await BattleView.prototype.regroup.call(fake,team,async ms=>{waits++;assert.equal(ms,460);expected.forEach((e,i)=>{assert.deepEqual(e.fighter.pos,before[i],'No teleport before travel');assert.equal(e.fighter.motion.duration,.43);e.fighter.pos={...e.fighter.motion.to};e.fighter.motion=null})});
  assert.equal(waits,1);expected.forEach(e=>{assert.deepEqual(e.fighter.pos,e.position);assert.equal(e.fighter.direction,team===0?0:4);assert.equal(e.fighter.hp,100)});
 }
 members[2].hp=0;await BattleView.prototype.regroup.call(fake,team,()=>assert.fail('Empty teams must not wait'));
}
const sheet=createCanvas(540*4,960),ctx=sheet.getContext('2d');let index=0;
for(const id of ['frost','storm','temporal','crystal']){
 const arena=arenaCatalog[id],image=await loadImage('dist/assets/arenas/'+arena.image+'.png');assert.equal(image.width,540);assert.equal(image.height,960);
 const canvas=createCanvas(540,960),c=canvas.getContext('2d');c.drawImage(image,0,0);for(const time of [0,6.4,20])drawArenaAmbience(c,arena.mood,time);ctx.drawImage(canvas,index++*540,0);
 const rgba=c.getImageData(250,450,40,40).data;assert(rgba.some((value,i)=>i%4!==3&&value>20),'Arena floor must be visible');
}
assert(drawAttackDetail(ctx,{kind:'recall',to:{x:20,y:30},color:'#fff'},.5));
fs.writeFileSync('D:/pokemon-reference/dramatic-arenas-v9.png',sheet.toBuffer('image/png'));
console.log('PASS: all survivor subsets/order/centering, smooth 3→2→1 transitions on both sides, unchanged HP, empty teams, four native arena renders and ambience.');
