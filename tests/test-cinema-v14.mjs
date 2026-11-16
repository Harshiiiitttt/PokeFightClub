import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {beamFront,beginBeamStruggle,updateBeamStruggle,endBeamStruggle} from '../dist/beam-struggle.js';
import {pmdState} from '../dist/pmd-animation.js';
import {arenaCatalog} from '../dist/arena-catalog.js';
import {drawArenaAmbience} from '../dist/arena-ambience.js';
import {drawGuardianFx} from '../dist/guardian-fx.js';
const meta=JSON.parse(fs.readFileSync('dist/assets/pmd/mega-manifest.json'))['eternamax-890'];assert(meta.frontOnly);
const images={};for(const a of Object.values(meta.anims))images['pmd-eternamax-890-'+a.name]=await loadImage('dist/assets/'+a.path);
for(const direction of [0,1,2,3,4,5,6,7])for(const action of [null,'Walk','Attack','Charge']){
 const p={id:890,formKey:'eternamax-890',transformed:true,hp:100,direction,action};const state=pmdState({clock:0,style:'gba',pmd:{'eternamax-890':meta},images},p);assert.equal(state.row,0,'Eternamax must never display the cropped back art while roaming or attacking');
}
for(const guardianWin of [false,true]){
 const boss={uid:'boss',hp:100,slot:0,pos:{x:270,y:295}},guardians=[152,270,388].map((x,i)=>({uid:'g'+i,slot:i,hp:100,pos:{x,y:690}})),view={clock:0,cinematic:true};
 beginBeamStruggle(view,boss,guardians,guardianWin);const trace=[];
 for(let frame=0;frame<=105;frame++){view.clock=frame/60;updateBeamStruggle(view);trace.push({front:beamFront(frame/105,guardianWin),y:guardians[0].pos.y,x:guardians[0].pos.x});assert(guardians.every(g=>g.action==='Charge'&&g.charge&&g.hp===100));}
 assert(Math.max(...trace.map(p=>Math.abs(p.x-152)))>1);assert(Math.max(...trace.map(p=>p.y))-Math.min(...trace.map(p=>p.y))>20,'Fighters must physically slide as the clash turns');
 assert(guardianWin?boss.pos.y<285:guardians[0].pos.y>710);endBeamStruggle(view);assert.equal(view.clashState,null);assert(guardians.every(g=>!g.charge));
}
const sheet=createCanvas(2160,960),out=sheet.getContext('2d'),hashes=new Set();let index=0;
for(const key of ['spear','coast','eclipse','champion']){
 const info=arenaCatalog[key],image=await loadImage('dist/assets/arenas/'+info.image+'.png');assert.equal(image.width,540);assert.equal(image.height,960);const canvas=createCanvas(540,960),c=canvas.getContext('2d');c.drawImage(image,0,0);drawArenaAmbience(c,info.mood,7);hashes.add(createHash('sha256').update(canvas.toBuffer('image/png')).digest('hex'));out.drawImage(canvas,index++*540,0);
}
assert.equal(hashes.size,4);fs.writeFileSync('D:/pokemon-reference/new-arenas-v14.png',sheet.toBuffer('image/png'));
const canvas=createCanvas(540,960),c=canvas.getContext('2d');assert(drawGuardianFx(c,{kind:'landing-dust',to:{x:270,y:650},color:'#afa'},.4));assert(drawGuardianFx(c,{kind:'boss-reaction',color:'#ff8ccc',name:'Eternamax Eternatus'},.4));assert(drawGuardianFx(c,{kind:'clash-ground',boss:{pos:{x:270,y:285}},guardians:[{pos:{x:145,y:650}}]},.4));
const html=fs.readFileSync('dist/index.html','utf8');for(const key of ['spear','coast','eclipse','champion'])assert(html.includes(`data-arena="${key}"`));
const css=fs.readFileSync('dist/workspace.css','utf8');assert(css.includes('.guardian-silhouette .pmd-sprite'));assert(css.includes('.boss-eternatus.eternamax-form{width:28%'));assert(!css.includes('`n.'));
console.log('PASS: Eternamax front form across all 8 directions/4 actions, pressure-synchronized bracing and sliding for both clash outcomes, unchanged HP, four distinct rendered arenas, all new FX and silhouette/full-body CSS.');
