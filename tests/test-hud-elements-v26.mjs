import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
import {view,studio} from './test-trainer-native.mjs';
import {createFighter,moves,colors} from '../dist/engine.js';
import {TRAINER_PRESETS} from '../dist/trainer-duel.js';
import {drawCompactTrainerHUD} from '../dist/trainer-overlay.js';
import {ensureTrainerPortrait} from '../dist/trainer-portraits.js';
import {trainerRecallPause} from '../dist/trainer-recall.js';
import {drawElementalDuelFX} from '../dist/elemental-duel-fx.js';
import {choreographTrainerExchange} from '../dist/trainer-combat.js';
const loaded=[],mock={images:{},pmd:{18:{portrait:'pmd/18/portrait.png'}},load(key,src){const image={onload:()=>{this.images[key]=image;}};loaded.push({key,src,image});return image;}};
ensureTrainerPortrait(mock,{id:18,name:'pidgeot'});assert.equal(loaded[0].src,'assets/pmd/18/portrait.png');loaded[0].image.onerror();assert.equal(loaded[1].src,'assets/classic/front/18.png');loaded[1].image.onload();assert.equal(ensureTrainerPortrait(mock,{id:18}),loaded[1].image);assert.equal(mock.images['intro-18'],loaded[1].image,'Successful fallback must supply the intro too');
const cache=JSON.parse(fs.readFileSync('dist/pokemon.json')),audio={sfx(){},cry(){},duck(){}},shots=[];
function mount(red=25,blue=18){const teams=TRAINER_PRESETS[0].teams.map(t=>[...t]);teams[0][0]=red;teams[1][0]=blue;view.mount(teams.flatMap((ids,t)=>ids.map((id,i)=>Object.assign(createFighter(cache[id],t,0,{reserve:i>0,uidIndex:i}),{uid:t+'-'+i,reserve:i>0,trainerDuel:true}))));view.customTeamNames=['RED','BLUE'];view.stage.querySelector('#intro-overlay').classList.add('hidden');view.stage.querySelector('#result').classList.add('hidden');}
function save(name){studio.renderCompositeFrame();const img=createCanvas(540,960);img.getContext('2d').drawImage(studio.canvas.native,0,0);shots.push(img);fs.writeFileSync('D:/pokemon-reference/'+name+'-v26.png',img.toBuffer('image/png'));}
mount();view.draw(.016);save('transparent-hud-arena');
const overlay=createCanvas(540,960),ctx=overlay.getContext('2d');drawCompactTrainerHUD(ctx,view);assert.equal(ctx.getImageData(270,25,1,1).data[3],0,'The HUD background must be transparent');assert.equal(ctx.getImageData(4,57,1,1).data[3],0,'The gray portrait matte must be gone');
for(const [type,red,blue,name] of [['water',9,6,'hydro-pump'],['ice',131,3,'ice-beam'],['grass',3,9,'solar-beam']]){
 mount(red,blue);let captured=false;
 const wait=async ms=>{for(let i=0;i<Math.ceil(ms/1000*60);i++){view.draw(1/60);const fx=view.effects.find(e=>e.kind==='element-'+type);if(!captured&&fx&&(view.clock-fx.start)/fx.duration>.59&&view.trainerResults.length){save(type+'-attack');captured=true;}}};
 const actor=view.fighters[0],target=view.fighters[6],hp=target.hp;await choreographTrainerExchange({actor,target,move:moves.find(m=>m.name===name),damage:25,mult:2,crit:false,dodge:false},{view,audio,wait,valid:()=>true,rng:()=>.59,log(){}});assert(captured,type+' must use its new native sequence');assert.equal(target.hp,hp-25);
}
const hashes=new Set(),fxCanvas=createCanvas(540,960),fxCtx=fxCanvas.getContext('2d');for(const type of Object.keys(colors)){fxCtx.clearRect(0,0,540,960);const e={kind:'element-impact',element:type,color:colors[type],from:{x:270,y:500},to:{x:270,y:500}};assert(drawElementalDuelFX(fxCtx,e,.4));const png=fxCanvas.toBuffer('image/png');hashes.add(png.toString('base64'));fxCtx.clearRect(0,0,540,960);drawElementalDuelFX(fxCtx,e,.4);assert(png.equals(fxCanvas.toBuffer('image/png')),'Impact replay must be deterministic');}assert.equal(hashes.size,18,'Each type must have its own impact appearance');
const next={reserve:true,hp:100},pauseView={noticeTime:2,waitForTrainer:async ms=>{assert.equal(ms,1500);assert(pauseView.trainerRecall);assert(next.reserve);}};assert(await trainerRecallPause(pauseView,1,next,async()=>{throw Error('Must use real-time trainer wait');},()=>true));assert.equal(pauseView.trainerRecall,null);
let valid=true;pauseView.waitForTrainer=async()=>{valid=false;};assert.equal(await trainerRecallPause(pauseView,1,next,async()=>{},()=>valid),false);assert.equal(pauseView.trainerRecall,null);assert(next.reserve,'Cancelled recall must not deploy a replacement');
const montage=createCanvas(2160,960);shots.forEach((img,i)=>montage.getContext('2d').drawImage(img,i*540,0));fs.writeFileSync('D:/pokemon-reference/hud-arena-elements-v26.png',montage.toBuffer('image/png'));
console.log('PASS: fixed portrait asset paths + fallback, transparent HUD/no gray matte, rendered barricaded arena, separate water/ice/grass sequences with real HP, 18 deterministic impact styles, 1.5-second real-time trainer wait and cancelled send-out safety.');
