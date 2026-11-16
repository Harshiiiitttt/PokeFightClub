import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanvas,Image} from '@napi-rs/canvas';
import {view,studio} from './test-trainer-native.mjs';
import {createFighter,moves} from '../dist/engine.js';
import {TRAINER_PRESETS} from '../dist/trainer-duel.js';
import {trainerVisualExtent,trainerVisualScale} from '../dist/trainer-scale.js';
import {safeCameraPose,constrainTrainerCamera} from '../dist/trainer-camera.js';
import {choreographTrainerExchange,duelFormation} from '../dist/trainer-combat.js';
import {duelBody,duelClearanceMargin} from '../dist/duel-clearance.js';
const cache=JSON.parse(fs.readFileSync('dist/pokemon.json'));
for(const anim of Object.values(view.pmd[815].anims)){const image=new Image();image.src=fs.readFileSync('dist/assets/'+anim.path);view.images['pmd-815-'+anim.name]=image;}const portrait=new Image();portrait.src=fs.readFileSync('dist/assets/'+view.pmd[815].portrait);view.images['intro-815']=portrait;
for(let id=1;id<=1025;id++)assert(trainerVisualExtent({id})>=40&&trainerVisualExtent({id})<=88);
assert(trainerVisualExtent({id:815})<56,'Cinderace should be proportionate to the overworld trainer');assert(trainerVisualExtent({id:25})<trainerVisualExtent({id:815}));
for(const zoom of [.7,1,1.002,1.01,1.08,1.3,1.46])for(const x of [-130,-60,0,60,130])for(const y of [-190,-110,0,110,190])for(const shake of [-30,0,30]){const p=safeCameraPose(zoom,x,y,shake,-shake),tx=p.panX+p.shakeX,ty=p.panY+p.shakeY;assert(270-270*p.zoom+tx<=.00001&&270+270*p.zoom+tx>=539.99999,'Horizontal camera edges must stay inside the game');assert(480-480*p.zoom+ty<=.00001&&480+480*p.zoom+ty>=959.99999,'Vertical camera edges must stay inside the game');}
const shots=[],save=name=>{studio.renderCompositeFrame();const image=createCanvas(540,960);image.getContext('2d').drawImage(studio.canvas.native,0,0);shots.push(image);fs.writeFileSync('D:/pokemon-reference/'+name+'-v28.png',image.toBuffer('image/png'));};
function mount(red=25){const teams=TRAINER_PRESETS[0].teams.map(t=>[...t]);teams[0][0]=red;teams[1][0]=815;view.mount(teams.flatMap((team,t)=>team.map((id,i)=>Object.assign(createFighter(cache[id],t,0,{reserve:i>0,uidIndex:i}),{uid:t+'-'+i,reserve:i>0,trainerDuel:true}))));view.customTeamNames=['RED','BLUE'];view.stage.querySelector('#intro-overlay').classList.add('hidden');view.stage.querySelector('#result').classList.add('hidden');view.draw(.016);}
mount();const cinder=view.fighters[6],extent=Number(cinder.el.querySelector('canvas').dataset.visibleExtent)*trainerVisualScale(cinder);assert(extent<57);assert(extent/(32*1.15)<1.6,'Cinderace should no longer tower over its trainer');save('cinderace-size');
const a=view.fighters[0],b=view.fighters[6],plan=duelFormation(a,b,()=>.5,false,1);assert(Math.hypot(plan.actor.x-plan.target.x,plan.actor.y-plan.target.y)>=188,'Ranged preparation should preserve a readable firing lane');
let approach=false,slash=false,contact=false;const audio={sfx(){},cry(){},duck(){}};
async function wait(ms){for(let i=0;i<Math.ceil(ms/1000*60);i++){view.draw(1/60);const actors=view.fighters.filter(p=>!p.reserve&&p.hp>0);if(actors.length===2){const aa=duelBody(actors[0]),bb=duelBody(actors[1]);assert(Math.max(Math.abs(aa.x-bb.x)-(aa.w+bb.w)/2,Math.abs(aa.y-bb.y)-(aa.h+bb.h)/2)>=duelClearanceMargin(view)-.1);}
 const sweep=view.effects.find(e=>e.kind==='approach-sweep');if(!approach&&sweep&&view.clock-sweep.start>.12){save('step-in-dash');approach=true;}if(!slash&&sweep?.slash&&view.clock-sweep.start>.12){save('slash-approach');slash=true;}if(!contact&&view.duelContact&&view.effects.some(e=>e.kind==='strike-arc')){save('small-sprite-contact');contact=true;}
 const z=view._zoomNow,tx=view._panXNow+view.cameraShakeX,ty=view._panNow+view.cameraShakeY;assert(270-270*z+tx<=.00001&&270+270*z+tx>=539.99999);assert(480-480*z+ty<=.00001&&480+480*z+ty>=959.99999);
}}
await choreographTrainerExchange({actor:a,target:b,move:moves.find(m=>m.name==='quick-attack'),damage:15,mult:1,crit:false,dodge:false},{view,audio,wait,valid:()=>true,rng:()=>.58,log(){}});assert(approach&&contact);
mount(6);await choreographTrainerExchange({actor:view.fighters[0],target:view.fighters[6],move:moves.find(m=>m.name==='scratch'),damage:15,mult:1,crit:false,dodge:false},{view,audio,wait,valid:()=>true,rng:()=>.58,log(){}});assert(slash);
for(const [x,y] of [[82,320],[458,750]]){view.fighters[0].pos={x,y};view.fighters[0].motion=null;view._zoomNow=1.002;view._panXNow=60;view._panNow=-110;view.cameraShakeX=20;view.cameraShakeY=-20;constrainTrainerCamera(view);studio.renderCompositeFrame();for(const [px,py] of [[0,0],[539,0],[0,959],[539,959]])assert.equal(studio.canvas.native.getContext('2d').getImageData(px,py,1,1).data[3],255,'Recording corners must never expose transparent/mesh space');}
const montage=createCanvas(shots.length*540,960);shots.forEach((image,i)=>montage.getContext('2d').drawImage(image,i*540,0));fs.writeFileSync('D:/pokemon-reference/size-framing-motion-v28.png',montage.toBuffer('image/png'));
console.log(`PASS: native Cinderace is ${extent.toFixed(1)}px tall relative to its trainer; all-species scale limits; ranged firing lanes and close contact movement; animated dash/slash approaches; non-overlap; camera edges remain inside game across 525 zoom/pan/shake combinations and recorded corners stay opaque.`);
