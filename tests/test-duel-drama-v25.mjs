import assert from 'node:assert/strict';
import fs from 'node:fs';
import {view,studio} from './test-trainer-native.mjs';
import {createFighter,moves} from '../dist/engine.js';
import {TRAINER_PRESETS,playTrainerOutro} from '../dist/trainer-duel.js';
import {choreographTrainerExchange,duelReach,duelFormation} from '../dist/trainer-combat.js';
import {duelBody,keepDuelSeparation,duelClearanceMargin} from '../dist/duel-clearance.js';
import {startDuelDrama} from '../dist/duel-drama.js';
const cache=JSON.parse(fs.readFileSync('dist/pokemon.json'));
const fresh=()=>TRAINER_PRESETS[0].teams.flatMap((ids,t)=>ids.map((id,i)=>Object.assign(createFighter(cache[id],t,0,{reserve:i>0,uidIndex:i}),{uid:t+'-'+i,reserve:i>0,trainerDuel:true})));
view.mount(fresh());view.customTeamNames=['RED','BLUE'];view.stage.querySelector('#intro-overlay').classList.add('hidden');view.stage.querySelector('#result').classList.add('hidden');
const a=view.fighters[0],b=view.fighters[6],audio={sfx(){},cry(){},duck(){},background(){}};let charge=false,dark=false,shortest=Infinity;
function save(name){studio.renderCompositeFrame();fs.writeFileSync('D:/pokemon-reference/'+name+'-v25.png',studio.canvas.native.toBuffer('image/png'));}
async function tick(ms,realtime=false){let left=ms;while(left>0){view.draw(1/60);left-=1000/60*(realtime?1:(view.timeScale||1));if(a.hp>0&&b.hp>0){const aa=duelBody(a),bb=duelBody(b),gap=Math.max(Math.abs(aa.x-bb.x)-(aa.w+bb.w)/2,Math.abs(aa.y-bb.y)-(aa.h+bb.h)/2);shortest=Math.min(shortest,gap);assert(gap>=duelClearanceMargin(view)-.1,'Animated body bounds must not overlap');}
 if(!charge&&view.duelDrama?.phase==='charge'&&view.clock-view.duelDrama.start>.22){assert.equal(b.hp,b.max,'Heavy windup must precede damage');const rgba=view.entranceCanvas.native.getContext('2d').getImageData(270,515,1,1).data;assert(rgba[3]>125,'Heavy moves must visibly dim the arena layer');charge=true;save('serious-move-charge');}
 if(!dark&&view.duelDrama?.phase==='release'){dark=true;save('serious-move-release');}
}}
view.waitForFinisher=ms=>tick(ms,true);
const plan=duelFormation(a,b,()=>.5,true,1);assert(Math.hypot(plan.actor.x-plan.target.x,plan.actor.y-plan.target.y)<=duelReach(a,b)+31,'Contact setup should be tighter');
await choreographTrainerExchange({actor:a,target:b,move:moves.find(m=>m.name==='thunder'),damage:35,mult:2,crit:false,dodge:false},{view,audio,wait:tick,valid:()=>true,rng:()=>.5,log(){}});assert(charge&&dark);assert.equal(b.hp,b.max-35);
await tick(500);assert.equal(view.duelDrama,null,'The arena must return to normal lighting after the move');
const reduced={cinematic:false};assert.equal(startDuelDrama(reduced,{actor:a,target:b,move:{type:'fire'}}),null);
// Large attack poses near a boundary must separate without corrupting their trajectories.
const fake=(id,x,y,w,h)=>({id,hp:100,reserve:false,pos:{x,y},el:{querySelector:()=>({dataset:{bodyTop:-h,bodyWidth:w,bodyHeight:h}}),style:{}},motion:{from:{x,y},to:{x:x+5,y:y+5}}});
for(const [x,y] of [[85,325],[440,725],[245,510]]){const p=fake(890,x,y,160,160),q=fake(143,x+8,y+8,130,150),state={trainerMode:true,fighters:[p,q]};keepDuelSeparation(state);const pp=duelBody(p),qq=duelBody(q);assert(Math.max(Math.abs(pp.x-qq.x)-(pp.w+qq.w)/2,Math.abs(pp.y-qq.y)-(pp.h+qq.h)/2)>=6.9);assert.equal(Number.parseFloat(p.el.style.left),p.pos.x/540*100);}
for(const p of view.fighters.filter(p=>p.team===1&&p.reserve))p.hp=0;b.hp=10;const before=view.presentationTime;
await choreographTrainerExchange({actor:a,target:b,move:moves.find(m=>m.name==='quick-attack'),damage:15,mult:1,crit:false,dodge:false},{view,audio,wait:tick,valid:()=>true,rng:()=>.5,log(){}});assert.equal(b.hp,0);assert.equal(view.duelFinalDefeat,b);assert(b.el,'Final loser must remain for the aftermath');assert(view.presentationTime-before>2,'A final knockout must not cut straight to the winner');save('final-ko-aftermath');
const hp=a.hp,start=view.presentationTime,steps=[];await playTrainerOutro({view,audio,winner:0,valid:()=>true,wait:async ms=>{steps.push(ms);await tick(ms,true);if(ms===1700)save('victory-pose');}});assert.deepEqual(steps,[900,1700,3400,2000]);assert(view.presentationTime-start>=8);assert.equal(a.hp,hp);assert(!b.el,'Loser recalls before the victory pose');
let ok=true;const cancelled=await playTrainerOutro({view,audio,winner:0,valid:()=>ok,wait:async()=>{ok=false;}});assert.equal(cancelled,false);assert.equal(view.trainerOutro,null);assert.equal(view.phaseTransition,false);
console.log(`PASS: close contact with ≥${shortest.toFixed(1)}px animated-body clearance, large-pose boundary safety, type-colored heavy-move darkness behind readable sprites, restored/reduced lighting, lingering final KO, 8s staged outro, retained injuries and cancellation.`);
