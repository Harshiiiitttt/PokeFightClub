import assert from 'node:assert/strict';
import {playRaidOutro,OUTRO_STEPS} from './dist/raid-outro.js';
import {advanceRaidOpening,openingExpired,raidWaitDuration} from './dist/raid-pacing.js';
assert.equal(OUTRO_STEPS.reduce((n,[,ms])=>n+ms,0),7000);assert.deepEqual(OUTRO_STEPS.at(-1),['hold',2000]);
for(const speed of [.5,1,2,4]){const view={playbackSpeed:speed,raidPhase1Active:true,raidPhase1Elapsed:0};for(let i=0;i<600;i++)advanceRaidOpening(view,speed/60);assert(Math.abs(view.raidPhase1Elapsed-10)<1e-8);assert(openingExpired(view,{phase2:false}));assert.equal(raidWaitDuration(view,{phase2:false},1000),0);assert.equal(raidWaitDuration(view,{phase2:true},1000),1250);}
async function outro(winner,cancelAt=Infinity){
 let waits=0,elapsed=0,valid=true;const events=[],boss={uid:'b',isBoss:true,id:890,team:0,slot:0,hp:winner===0?213:0,max:1000,pos:{x:270,y:285}},guardians=[0,1,2].map(slot=>({uid:'g'+slot,id:384,team:1,slot,hp:winner===1?10+slot*20:0,max:200,pos:{x:145+slot*125,y:690}})),fighters=[boss,...guardians],before=fighters.map(p=>p.hp);
 const view={fighters,clock:0,cinematic:true,stage:{classList:{add(){}},style:{setProperty(){}}},move(p,to){p.pos={...to}},focus(){}};
 const audio={background(){},sfx(t,phase){events.push(phase)},hush(){events.push('silence')},cry(){events.push('roar')}};
 const result=await playRaidOutro({view,audio,fighters,winner,name:winner===0?'ETERNAMAX ETERNATUS':'SUMMONED GUARDIANS',wait:async ms=>{assert.equal(ms,OUTRO_STEPS[waits][1]);events.push(view.outroState.phase);elapsed+=ms;view.outroTime+=ms/1000;if(++waits===cancelAt)valid=false;},valid:()=>valid});
 assert.deepEqual(fighters.map(p=>p.hp),before,'Victory poses must never heal the survivors');if(result){assert.equal(elapsed,7000);assert.equal(view.hudTarget,0);assert(events.includes('silence'));assert(events.includes('victory'));assert(winner===0?events.includes('roar'):view.vortexSuppression===1);assert.equal(view.outroState,null);assert(fighters.filter(p=>p.hp>0).every(p=>p.presentationFacing==='front'));}return{result,waits};
}
for(const winner of [0,1]){assert((await outro(winner)).result);for(let stop=1;stop<=6;stop++){const r=await outro(winner,stop);assert(!r.result);assert.equal(r.waits,stop)}}
console.log('PASS: exact 7-second outro with 2-second closing hold, both winner branches, no healing, health fade, music silence, cancellation at every stage, and a 10-second real-time opening budget at .5/1/2/4× playback.');
