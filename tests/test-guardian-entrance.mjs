import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {playGuardianEntrance,GUARDIAN_LANDINGS} from '../dist/guardian-entrance.js';
import {drawGuardianFx} from '../dist/guardian-fx.js';
import {RAID_GUARDIAN_TRIOS,GUARDIAN_AWAKENINGS} from '../dist/battle-modes.js';
async function run(ids,{cancelAt=Infinity,cinematic=true}={}){
 let time=0,waits=0,alive=true,awakenedAt=null;const events=[],hp=[];
 const guardians=ids.map((id,i)=>({id,name:String(id),types:['fire','water','dragon'].slice(i,i+1),hp:100,willMult:1.3,entranceHidden:true,summonColor:GUARDIAN_AWAKENINGS[id].color}));
 const boss={id:890,name:'Eternatus',hp:600,max:1000,pos:{x:270,y:480}};
 const view={cinematic,clock:0,focus(){},addFx(kind,from,to,color,duration,extra={}){events.push({kind,time,from,to,color,duration,...extra})},message(){},burst(){},scar(){},move(p,pos){p.pos={...pos}},updateHP(p){hp.push({value:p.hp,time})}};
 const audio={quiet(){},sfx(){},cry(id){events.push({kind:'cry',id,time})},speak(text){events.push({kind:'speech',text,time})},duck(){}};
 const completed=await playGuardianEntrance({boss,guardians,fallen:Array.from({length:50},(_,i)=>({pos:{x:30+i*47%480,y:250+i*79%500}})),view,audio,
 wait:async ms=>{time+=ms;view.clock=time/1000;if(++waits===cancelAt)alive=false;},valid:()=>alive,
 attach(g,pos){assert(g.entranceHidden);events.push({kind:'attach',id:g.id,time});g.pos={...pos}},
 awaken(){awakenedAt=time;events.push({kind:'awaken',time});guardians.forEach(g=>g.name=GUARDIAN_AWAKENINGS[g.id].title)},log(){},willLabel:'+30% WILL OF THE 50!'});
 return {completed,events,hp,boss,guardians,view,waits,awakenedAt,time};
}
let full;
for(const trios of Object.values(RAID_GUARDIAN_TRIOS))for(const trio of trios){
 const r=await run(trio);full=r;assert(r.completed);const attaches=r.events.filter(e=>e.kind==='attach');assert.deepEqual(attaches.map(e=>e.id),trio);assert(attaches[1].time-attaches[0].time>=900);assert(attaches[2].time>attaches[1].time);
 assert.equal(r.events.find(e=>e.kind==='soul-gather').points.length,50);assert.equal(r.events.filter(e=>e.kind==='summon-rune').length,3);
 const cutin=r.events.find(e=>e.kind==='guardian-cutin');assert(cutin.time>attaches[2].time);assert(r.awakenedAt>cutin.time);assert(!r.events.some(e=>e.kind==='speech'),'AI voice must be removed');
 assert.equal(r.events.filter(e=>e.kind==='landing-dust').length,3);const reaction=r.events.find(e=>e.kind==='boss-reaction'),bossCry=r.events.find(e=>e.kind==='cry'&&e.id===890);assert(reaction&&bossCry.time>=reaction.time+650*(r.view.cinematic?.99:.3));assert(r.hp.every(e=>e.time>reaction.time),'HP refill must follow the reaction shot');assert(r.guardians.every(g=>!g.silhouette));
 assert.equal(r.events.filter(e=>e.kind==='evolution').length,3);assert.equal(r.events.filter(e=>e.kind==='awakening-helix').length,3);
 assert(r.hp.every(e=>e.time>r.awakenedAt));assert(r.hp.every((e,i)=>i===0||e.value>=r.hp[i-1].value));assert.equal(r.boss.hp,r.boss.max);assert(r.boss.guardianEntranceReady);
 assert(r.guardians.every((g,i)=>g.pos.x===GUARDIAN_LANDINGS[i].x&&g.pos.y===GUARDIAN_LANDINGS[i].y-20&&g.willMult===1.3&&g.hp===100));
 assert.equal(r.view.summoning,false);assert.equal(r.view.cameraZoom,1);assert.equal(r.view.cameraPanY,0);assert.equal(r.view.vortexSuppression,1);
}
for(let i=1;i<=full.waits;i++){const stopped=await run([383,382,384],{cancelAt:i});assert.equal(stopped.completed,false);assert.equal(stopped.waits,i,'Cancellation must stop the sequence at this wait');assert(!stopped.boss.guardianEntranceReady)}
const reduced=await run([383,382,384],{cinematic:false});assert(reduced.completed);assert.equal(reduced.view.shake,undefined);assert.equal(reduced.view.cameraZoom,1);assert(reduced.time<full.time*.4);
const previews=createCanvas(540*4,960),out=previews.getContext('2d'),arena=await loadImage('dist/assets/arenas/temporal.png');
const portraits={};for(const id of [383,382,384])portraits['guardian-portrait-'+id]=await loadImage(`dist/assets/pmd/${id}/portrait.png`);
const base={kind:'soul-gather',points:Array.from({length:50},(_,i)=>({x:30+i*97%480,y:250+i*139%500})),targets:GUARDIAN_LANDINGS,colors:['#ff7b39','#4db8ff','#69f5b3']};
for(let frame=0;frame<4;frame++){
 const canvas=createCanvas(540,960),c=canvas.getContext('2d');c.drawImage(arena,0,0);c.fillStyle='#08051caa';c.fillRect(0,0,540,960);
 for(let i=0;i<3;i++)assert(drawGuardianFx(c,{kind:'summon-rune',to:GUARDIAN_LANDINGS[i],color:base.colors[i],index:i},.35,portraits));
 if(frame===0)drawGuardianFx(c,base,.45,portraits);
 if(frame===1)drawGuardianFx(c,{kind:'sky-pillar',to:GUARDIAN_LANDINGS[2],color:'#69f5b3',leader:true,element:'dragon'},.45,portraits);
 if(frame===2)drawGuardianFx(c,{kind:'guardian-cutin',guardians:[383,382,384].map((id,i)=>({id,name:GUARDIAN_AWAKENINGS[id].title,color:base.colors[i],portraitKey:'guardian-portrait-'+id}))},.4,portraits);
 if(frame===3){drawGuardianFx(c,{kind:'guardian-dawn',color:'#ffe599'},.4,portraits);for(let i=0;i<3;i++){drawGuardianFx(c,{kind:'awakening-helix',to:GUARDIAN_LANDINGS[i],color:base.colors[i]},.4,portraits);drawGuardianFx(c,{kind:'landing-crater',to:GUARDIAN_LANDINGS[i],color:base.colors[i]},.4,portraits)}}
 out.drawImage(canvas,frame*540,0);
}
fs.writeFileSync('D:/pokemon-reference/guardian-entrance-v11.png',previews.toBuffer('image/png'));
console.log('PASS: every raid guardian trio, 50 souls/three runes, staggered L/R/apex arrivals, cut-in without speech, simultaneous helixes, post-awakening HP refill, synchronized step, cancellation at every wait, reduced motion and native FX renders.');
