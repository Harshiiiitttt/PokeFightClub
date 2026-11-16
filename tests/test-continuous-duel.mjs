import assert from 'node:assert/strict';
import fs from 'node:fs';
import {view,studio} from './test-trainer-native.mjs';
import {choreographTrainerExchange,duelFormation,duelReach} from '../dist/trainer-combat.js';
import {duelBody,duelClearanceMargin} from '../dist/duel-clearance.js';
import {createFighter,moves} from '../dist/engine.js';
import {directionToward} from '../dist/pmd-animation.js';
import {TRAINER_PRESETS} from '../dist/trainer-duel.js';
const cache=JSON.parse(fs.readFileSync('dist/pokemon.json'));
const fighters=TRAINER_PRESETS[0].teams.flatMap((ids,t)=>ids.map((id,i)=>Object.assign(createFighter(cache[id],t,0,{reserve:i>0,uidIndex:i}),{uid:t+'-'+i,trainerDuel:true,reserve:i>0})));
view.mount(fighters);view.customTeamNames=['RED','BLUE'];view.stage.querySelector('#intro-overlay').classList.add('hidden');view.stage.querySelector('#result').classList.add('hidden');
const a=fighters[0],b=fighters[6],audio={sfx(){},cry(){},duck(){}};let frames=0,written=0,minDistance=Infinity,maxZoom=1,elapsed=0;const paths=[[],[]];
const dir='D:/pokemon-reference/continuous-v23-frames';fs.mkdirSync(dir,{recursive:true});
async function wait(ms){for(let i=0;i<Math.ceil(ms/1000*60);i++){
 view.draw(1/60);elapsed+=1/60;frames++;maxZoom=Math.max(maxZoom,view._zoomNow);
 minDistance=Math.min(minDistance,Math.hypot(a.pos.x-b.pos.x,a.pos.y-b.pos.y));const ab=duelBody(a),bb=duelBody(b);assert(Math.max(Math.abs(ab.x-bb.x)-(ab.w+bb.w)/2,Math.abs(ab.y-bb.y)-(ab.h+bb.h)/2)>=duelClearanceMargin(view)-.1,'Sprites must not overlap during close attacks');
 for(const [j,p] of [a,b].entries()){
  const other=j?a:b,expected=directionToward(p.pos,other.pos),difference=Math.min((p.direction-expected+8)%8,(expected-p.direction+8)%8);
  assert(difference<=1,'Native facing must track the opponent while walking/attacking');assert(p.pos.x>=81&&p.pos.x<=459&&p.pos.y>=319&&p.pos.y<=751,'Fighters must stay inside arena');paths[j].push({...p.pos});
 }
 if(frames%4===0){studio.renderCompositeFrame();fs.writeFileSync(dir+'/'+String(written++).padStart(4,'0')+'.png',studio.canvas.native.toBuffer('image/png'));}
}}
const start=[{...a.pos},{...b.pos}],sequence=[['quick-attack',a,b],['air-slash',b,a],['body-slam',a,b],['hyper-beam',b,a],['thunderbolt',a,b],['body-slam',b,a]];
for(const [name,actor,target] of sequence){await choreographTrainerExchange({actor,target,move:moves.find(m=>m.name===name),damage:15,mult:1,crit:false,dodge:false},{view,audio,wait,valid:()=>true,rng:()=>.64,log(){}});}
assert(minDistance>0);assert(maxZoom>1.2);
for(const [i,p] of [a,b].entries()){assert(Math.hypot(p.pos.x-start[i].x,p.pos.y-start[i].y)>15,'No return to fixed starting slots');const x=paths[i].map(p=>p.x);assert(Math.max(...x)-Math.min(...x)>45,'Both fighters must circle/strafe');}
assert(elapsed/sequence.length<1.6,'Exchanges should be quick and continuous');
const hp=b.hp,pos={...b.pos};await choreographTrainerExchange({actor:a,target:b,move:moves.find(m=>m.name==='quick-attack'),damage:0,mult:1,crit:false,dodge:true},{view,audio,wait,valid:()=>true,rng:()=>.64,log(){}});assert.equal(b.hp,hp,'Visible evasion must preserve the real dodge outcome');assert(Math.hypot(b.pos.x-pos.x,b.pos.y-pos.y)>45);assert.equal(view.trainerAttack.result,'DODGED');
// Planner remains safe at extreme arena positions and for either attacking side.
for(let i=0;i<100;i++){const actor={...a,pos:{x:i%2?82:458,y:i%3?320:750}},target={...b,pos:{x:i%2?458:82,y:i%3?750:320}},p=duelFormation(actor,target,()=>i/100,i%2===0,i);assert(Math.hypot(p.actor.x-p.target.x,p.actor.y-p.target.y)>=p.reach+(i%2===0?12:28)-.001);for(const q of [p.actor,p.target])assert(q.x>=82&&q.x<=458&&q.y>=320&&q.y<=750);}
fs.writeFileSync('D:/pokemon-reference/continuous-v23-frame-count.txt',String(written));studio.renderCompositeFrame();fs.writeFileSync('D:/pokemon-reference/continuous-duel-v23.png',studio.canvas.native.toBuffer('image/png'));
let preKO=0;b.hp=10;view.waitForFinisher=async ms=>{assert.equal(ms,460);assert.equal(b.hp,10,'Continuous duel must slow before the finishing hit removes HP');preKO++;for(let i=0;i<28;i++)view.draw(1/60);};
await choreographTrainerExchange({actor:a,target:b,move:moves.find(m=>m.name==='quick-attack'),damage:15,mult:1,crit:false,dodge:false},{view,audio,wait:async ms=>{for(let i=0;i<Math.ceil(ms/1000*60);i++)view.draw(1/60);},valid:()=>true,rng:()=>.64,log(){}});assert.equal(preKO,1);assert.equal(b.hp,0);assert.equal(view.fighters.filter(p=>p.team===1&&!p.reserve&&p.hp>0).length,1,'Replacement must enter after the actual faint');
console.log(`PASS: eight-direction opponent tracking, both fighters circling/approaching, real dodges, safe ${minDistance.toFixed(1)}px minimum clearance, ${(elapsed/7).toFixed(2)}s average exchanges, no formation resets, bounded arena, camera and native recorded frames.`);
