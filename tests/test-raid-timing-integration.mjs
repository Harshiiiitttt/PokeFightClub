import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {parseHTML} from 'linkedom';
const {document,window}=parseHTML(await fs.readFile('dist/index.html','utf8'));globalThis.document=document;globalThis.window=window;let now=0,queue=[];
globalThis.performance={now:()=>now};globalThis.requestAnimationFrame=f=>queue.push(f);globalThis.matchMedia=()=>({matches:false});globalThis.localStorage={getItem:()=>null,setItem(){}};
globalThis.Image=class{set src(v){this._src=v}};globalThis.Audio=class{play(){return Promise.resolve()}pause(){}};globalThis.fetch=async url=>new Response(await fs.readFile('dist/'+url));
Object.defineProperty(globalThis,'crypto',{value:{getRandomValues:a=>{a[0]=881930;a[1]=319;return a}},configurable:true});
const gradient={addColorStop(){}};const ctx=new Proxy({measureText:s=>({width:s.length*7}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:()=>{}});for(const c of document.querySelectorAll('canvas'))c.getContext=()=>ctx;
let source=await fs.readFile('dist/app.js','utf8');const root=pathToFileURL(process.cwd().replaceAll('\\','/')+'/dist/').href;source=source.replace(/from '\.\/([^']+)'/g,(_,p)=>`from '${root+p}'`);source+='\nexport {view};';const app=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
for(let i=0;i<40&&!document.querySelector('.overhead-fighter');i++)await new Promise(r=>setImmediate(r));
const select=document.querySelector('#battle-mode');for(const o of select.querySelectorAll('option')){o.removeAttribute('selected');if(o.value==='eternatus-raid'){o.setAttribute('selected','');o.selected=true}}select.dispatchEvent(new window.Event('change'));
document.querySelector('[data-speed="2"]').onclick();let done=false;const battle=document.querySelector('#start').onclick().then(()=>done=true);
let started=null,phase2=null,phase2Ready=null,outroStart=null,finishedAt=null,titleStart=null,holdStart=null;const phases=[];
for(let frame=0;frame<18000&&!done;frame++){
 now+=16;const work=queue;queue=[];for(const cb of work)cb(now);await new Promise(r=>setImmediate(r));
 const v=app.view,boss=v.fighters.find(p=>p.isBoss);if(started===null&&v.raidPhase1Active)started=now;if(phase2===null&&boss?.phase2)phase2=now;if(phase2!==null&&phase2Ready===null&&!v.phaseTransition)phase2Ready=now;
 if(v.outroState){if(outroStart===null)outroStart=now;if(phases.at(-1)!==v.outroState.phase)phases.push(v.outroState.phase);if(v.outroState.phase==='title'&&titleStart===null)titleStart=now;if(v.outroState.phase==='hold'&&holdStart===null)holdStart=now;assert(document.querySelector('#result').classList.contains('hidden'),'Stats must stay hidden until the outro ends');}
 if(outroStart!==null&&!document.querySelector('#result').classList.contains('hidden')&&finishedAt===null)finishedAt=now;
}
assert(done);await battle;assert(started!==null&&phase2!==null);assert((phase2-started)/1000<=10.1,'Phase 1 must transition by ten real seconds');assert(app.view.raidPhase1Elapsed<=10);assert(outroStart!==null&&finishedAt!==null);assert((finishedAt-outroStart)/1000>=7);assert((finishedAt-outroStart)/1000<7.2);assert((finishedAt-holdStart)/1000>=2);assert.deepEqual(phases,['impact','collapse','silence','pose','title','hold']);
assert((phase2Ready-phase2)/1000>=5.5,'True-form awakening must retain its dramatic hold at fast playback');
console.log(`PASS: real 2× raid reaches phase 2 in ${((phase2-started)/1000).toFixed(2)}s; all outro stages run for ${((finishedAt-outroStart)/1000).toFixed(2)} real seconds, including a two-second hold, before stats.`);
