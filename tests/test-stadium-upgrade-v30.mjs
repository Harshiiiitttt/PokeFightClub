import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanvas,Image} from '@napi-rs/canvas';
import {view,studio} from './test-trainer-native.mjs';
import {createFighter,moves} from '../dist/engine.js';
import {TRAINER_PRESETS,trainerSpriteRect} from '../dist/trainer-duel.js';
import {choreographTrainerExchange,duelFormation} from '../dist/trainer-combat.js';
import {trainerVisualExtent,trainerVisualScale} from '../dist/trainer-scale.js';
import {drawCompactTrainerHUD} from '../dist/trainer-overlay.js';
import {drawHUDPortrait,drawRosterBall} from '../dist/trainer-hud-art.js';
import {ensureTrainerPortrait} from '../dist/trainer-portraits.js';
import {STADIUM_SURFACES,drawStadiumSurface} from '../dist/trainer-stadium.js';
import {duelBody,duelClearanceMargin} from '../dist/duel-clearance.js';
const data=JSON.parse(fs.readFileSync('dist/pokemon.json')),shots=[];
function mount(red=25){const teams=TRAINER_PRESETS[0].teams.map(t=>[...t]);teams[0][0]=red;view.mount(teams.flatMap((ids,t)=>ids.map((id,i)=>Object.assign(createFighter(data[id],t,0,{reserve:i>0,uidIndex:i}),{uid:t+'-'+i,reserve:i>0,trainerDuel:true}))));view.customTeamNames=['RED','BLUE'];view.stage.querySelector('#intro-overlay').classList.add('hidden');view.stage.querySelector('#result').classList.add('hidden');view.draw(.016);}
function save(name){studio.renderCompositeFrame();const img=createCanvas(540,960);img.getContext('2d').drawImage(studio.canvas.native,0,0);shots.push(img);fs.writeFileSync('D:/pokemon-reference/'+name+'-v30.png',img.toBuffer('image/png'));}
mount();save('hud-stadium');
// Transparent HUD, generous roster spacing, and genuine face crops rather than squashed overworld bodies.
const canvas=createCanvas(540,960),c=canvas.getContext('2d');drawCompactTrainerHUD(c,view);assert.equal(c.getImageData(270,25,1,1).data[3],0);assert.equal(c.getImageData(270,100,1,1).data[3],0);fs.writeFileSync('D:/pokemon-reference/hud-detail-v30.png',canvas.toBuffer('image/png'));
let faceSource;drawHUDPortrait({drawImage(...args){faceSource=args;}},view.images['trainer-0'],10,76,30,true);assert(faceSource[4]<26,'Crop must show the head, not a whole trainer');
const balls=[];for(const [status,active] of [['ready',true],['ready',false],['fainted',false]]){c.clearRect(0,0,540,960);drawRosterBall(c,20,20,status,active,'#efb0a2');balls.push(canvas.toBuffer('image/png').toString('base64'));}assert.equal(new Set(balls).size,3);
// Normal Charizard keeps its established scale; Mega receives a moderate 22% increase in live and recorded frames.
mount(6);const a=view.fighters[0],b=view.fighters[6],base=trainerVisualExtent(a),width=parseFloat(a.el.style.width);save('normal-charizard');
for(const anim of Object.values(view.pmd['mega-6'].anims)){const img=new Image();img.src=fs.readFileSync('dist/assets/'+anim.path);view.images['pmd-mega-6-'+anim.name]=img;}
const megaPortrait=new Image();megaPortrait.src=fs.readFileSync('dist/assets/gen5-charizard-megax.png');view.images['hud-portrait-mega-6']=megaPortrait;
a.mega=true;a.name='Mega Charizard X';a.types=['fire','dragon'];view.draw(.016);assert(Math.abs(trainerVisualExtent(a)/base-1.22)<.001);assert(Math.abs(parseFloat(a.el.style.width)/width-1.22)<.001);assert.equal(trainerSpriteRect(a).width,192*trainerVisualScale(a));save('mega-charizard');
const requests=[],mock={images:{},pmd:view.pmd,load(k,src){requests.push(src);return {};}};ensureTrainerPortrait(mock,{id:6,mega:true});assert(requests[0].includes('charizard-megax'),'HUD should request the evolved portrait');
const contact=duelFormation(a,b,()=>.5,true,1),ranged=duelFormation(a,b,()=>.5,false,1),beam=duelFormation(a,b,()=>.5,false,1,moves.find(m=>m.name==='hyper-beam'));
const gap=p=>Math.hypot(p.actor.x-p.target.x,p.actor.y-p.target.y);assert(gap(ranged)>gap(contact)+85);assert(gap(beam)>gap(ranged)+25);
// Check actual release spacing and damage through the full continuous exchange.
a.pos={x:240,y:510};b.pos={x:294,y:575};view.draw(.016);let captured=false,minGap=Infinity;const before=b.hp;
const wait=async ms=>{for(let i=0;i<Math.ceil(ms/1000*60);i++){view.draw(1/60);const aa=duelBody(a),bb=duelBody(b);assert(Math.max(Math.abs(aa.x-bb.x)-(aa.w+bb.w)/2,Math.abs(aa.y-bb.y)-(aa.h+bb.h)/2)>=duelClearanceMargin(view)-.15);const fx=view.effects.find(e=>e.kind==='beam');if(fx){minGap=Math.min(minGap,Math.hypot(a.pos.x-b.pos.x,a.pos.y-b.pos.y));if(!captured&&(view.clock-fx.start)/fx.duration>.3){save('ranged-firing-lane');captured=true;}}}};
await choreographTrainerExchange({actor:a,target:b,move:moves.find(m=>m.name==='hyper-beam'),damage:15,mult:1,crit:false,dodge:false},{view,wait,valid:()=>true,rng:()=>.6,audio:{sfx(){},cry(){},duck(){},dash(){}},log(){}});assert(captured&&minGap>200);assert.equal(b.hp,before-15);
// Each selected battleground gets a deterministic, opaque stadium surface and keeps the playable layout.
const variants=new Set();for(const arena of Object.keys(STADIUM_SURFACES)){c.clearRect(0,0,540,960);drawStadiumSurface(c,{arena});const png=canvas.toBuffer('image/png');variants.add(png.toString('base64'));drawStadiumSurface(c,{arena});assert(png.equals(canvas.toBuffer('image/png')));for(const [x,y] of [[0,0],[539,0],[0,959],[539,959]])assert.equal(c.getImageData(x,y,1,1).data[3],255);if(['frost','volcano','coast'].includes(arena)){mount(6);view.arena=arena;view.drawArena();view.draw(.016);save(arena+'-stadium');}}assert.equal(variants.size,11);
const montage=createCanvas(shots.length*270,480);shots.forEach((img,i)=>montage.getContext('2d').drawImage(img,i*270,0,270,480));fs.writeFileSync('D:/pokemon-reference/stadium-upgrade-v30.png',montage.toBuffer('image/png'));
console.log('PASS: transparent mirrored HUD, cropped trainer faces, distinct roster states, 22% Mega Charizard scale in live/recorded geometry, evolved portrait requests, >200px actual beam spacing, correct damage/non-overlap, and 11 deterministic opaque stadium surfaces.');
