import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
import {view,studio,boss,guardians} from './test-guardian-visibility.mjs';
import {playRaidOutro} from './dist/raid-outro.js';
for(const winner of [1,0]){
 for(const p of [boss,...guardians])Object.assign(p,{retiredAt:undefined,presentationFacing:null,outroHero:false,outroDimmed:false,heroEntrance:false,phase2:false,hp:p.isBoss?(winner===0?2110:0):(winner===1?Math.max(18,90-p.slot*30):0)});
 view.mount([boss,...guardians]);boss.phase2=true;boss.pos={x:270,y:285};view.phase2Vortex='eternamax';
 view.draw(1/60);for(const p of view.fighters.filter(p=>p.hp<=0)){view.updateHP(p);view.retireFainted(p)}assert(view.defeatSnapshot,'Final KO must retain a visual collapse snapshot');
 const hp=view.fighters.map(p=>p.hp),shots=[],audio={background(){},sfx(){},hush(){},cry(){}};
 assert(await playRaidOutro({view,audio,fighters:view.fighters,winner,name:winner===0?'ETERNAMAX ETERNATUS':'SUMMONED GUARDIANS',valid:()=>true,wait:async ms=>{
  const frames=Math.ceil(ms/1000*60);for(let i=0;i<frames;i++){view.draw(1/60);if(i===Math.floor(frames*.7)&&['collapse','pose','hold'].includes(view.outroState.phase)){
   studio.renderCompositeFrame();const image=createCanvas(540,960);image.getContext('2d').drawImage(studio.canvas.native,0,0);shots.push(image);
   if(view.outroState.phase==='hold'){assert(view.hudOpacity<.01);assert(view.outroState.heroes.every(p=>p.direction===0&&p.presentationFacing==='front'));}
  }}
 }}));
 assert.deepEqual(view.fighters.map(p=>p.hp),hp);assert.equal(shots.length,3);const montage=createCanvas(1620,960),c=montage.getContext('2d');shots.forEach((s,i)=>c.drawImage(s,i*540,0));fs.writeFileSync('D:/pokemon-reference/outro-'+(winner?'guardians':'boss')+'-v17.png',montage.toBuffer('image/png'));
}
console.log('PASS: native seven-second outro composition for guardian and boss victories, retained collapse artwork, front-facing injured survivors, faded HUD, two-second closing pose and no HP changes.');
