import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {pathToFileURL} from 'node:url';
import {chooseAttack,moves} from '../dist/engine.js';
import {updateTrainerCamera,trainerAttackStart,trainerAttackResult} from '../dist/trainer-duel.js';
const {document}=parseHTML(await fs.readFile('dist/index.html','utf8'));globalThis.document=document;let now=0,queue=[];
globalThis.performance={now:()=>now};globalThis.requestAnimationFrame=f=>queue.push(f);globalThis.matchMedia=()=>({matches:false});globalThis.localStorage={getItem:()=>null,setItem(){}};
globalThis.Image=class{set src(v){this._src=v}};globalThis.Audio=class{play(){return Promise.resolve()}pause(){}};globalThis.fetch=async url=>new Response(await fs.readFile('dist/'+url));
const gradient={addColorStop(){}};const ctx=new Proxy({measureText:s=>({width:s.length*7}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>{o[k]=v;return true}});for(const c of document.querySelectorAll('canvas'))c.getContext=()=>ctx;
const root=pathToFileURL(process.cwd().replaceAll('\\','/')+'/dist/').href;
let source=await fs.readFile('dist/app.js','utf8');source=source.replace(/from '\.\/([^']+)'/g,(_,p)=>`from '${root+p}'`);source+='\nexport {configureModeUI,view,teams};';
source+='\n//# sourceURL=trainer-app-test.js';
const app=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));for(let i=0;i<30&&!document.querySelector('.overhead-fighter');i++)await new Promise(r=>setImmediate(r));
app.configureModeUI('trainer-duel');assert(app.view.trainerMode);assert.equal(app.view.fighters.length,12);assert.equal(new Set(app.view.fighters.map(p=>p.uid)).size,12);assert.equal(app.view.fighters.filter(p=>!p.reserve).length,2);assert.equal(document.querySelectorAll('.team-slot').length,12);assert.equal(document.querySelectorAll('.ready-lineups img').length,12);assert.equal(app.view.teamName(0),'RED');assert.equal(app.view.teamName(1),'BLUE');
let zoomMax=1,panMax=0,outroSeen=false,recallState=null;const actors=new Set(),recallWindows=[];
async function frames(n){for(let i=0;i<n;i++){now+=16;const callbacks=queue;queue=[];for(const f of callbacks)f(now);await Promise.resolve();const v=app.view;zoomMax=Math.max(zoomMax,v._zoomNow);panMax=Math.max(panMax,Math.abs(v._panNow));outroSeen||=!!v.trainerOutro;if(recallState!==v.trainerRecall){if(recallState)recallWindows.push(v.noticeTime-recallState.start);recallState=v.trainerRecall;}if(v.trainerRecall&&!v.trainerRecall.next.benched){assert(v.trainerRecall.next.reserve);assert.equal(v.trainerRecall.next.hp,v.trainerRecall.next.max);}
 for(const t of [0,1])assert(v.fighters.filter(p=>p.team===t&&!p.reserve&&!p.benched&&p.hp>0).length<=1,'Only one living active fighter per trainer');for(const p of v.fighters){if(p.reserve)assert.equal(p.hp,p.max,'Reserves must not take damage');else actors.add(p.uid);}}}
let done=false;const battle=document.querySelector('#start').onclick().then(()=>done=true);await frames(400);document.querySelector('#pause').onclick();const clock=app.view.clock;await frames(80);assert.equal(app.view.clock,clock);document.querySelector('#pause').onclick();
for(let i=0;i<600&&!done;i++)await frames(100);assert(done,'Full six-Pokémon battle must finish');await battle;
assert(outroSeen);assert(zoomMax>1.15,'Camera must move into action closeups');assert(panMax>20,'Camera must track fighting');assert(actors.size>=7,'Full opposing six must enter, plus winner');assert(app.view.fighters.some(p=>p.team===0&&p.hp>0)!==app.view.fighters.some(p=>p.team===1&&p.hp>0),'Battle must end by eliminating a full roster');assert(!document.querySelector('#result').classList.contains('hidden'));
assert(recallWindows.length>=5&&recallWindows.every(t=>t>=1.49&&t<1.65),'Trainer recall should hold for 1.5 unpaused real seconds');
const log=document.querySelector('#log').textContent;document.querySelector('[data-speed="2"]').onclick();done=false;const replay=document.querySelector('#replay').onclick().then(()=>done=true);for(let i=0;i<600&&!done;i++)await frames(100);await replay;assert.equal(document.querySelector('#log').textContent,log,'Replay must keep battle decisions');assert(recallWindows.every(t=>t>=1.49&&t<1.65),'2× playback must preserve the 1.5 second trainer pause');document.querySelector('[data-speed="1"]').onclick();
const stopped=document.querySelector('#start').onclick();for(let i=0;i<4000&&!app.view.trainerRecall;i++)await frames(1);assert(app.view.trainerRecall,'Must be able to stop during trainer selection');document.querySelector('#stop').onclick();await frames(100);await stopped;assert.equal(app.view.fighters.filter(p=>!p.reserve).length,2);assert.equal(app.view.trainerOutro,null);assert.equal(app.view.trainerRecall,null);
app.configureModeUI('classic');assert(!app.view.trainerMode);assert.equal(document.querySelectorAll('.overhead-fighter').length,6);
const dummy=(team,types)=>({team,types,hp:100,max:100,stats:[100,100,100,100,100,100],options:[moves.find(m=>m.name==='tackle')],pos:{x:100,y:300}});const attack=chooseAttack([dummy(0,['ghost']),dummy(1,['ghost'])],()=>.1,{trainer:true});assert.equal(attack.move.name,'struggle');assert.equal(attack.mult,1,'Typeless Struggle must break otherwise immune stalemates');
const v={trainerMode:true,clock:0},a={actor:{},move:{type:'fire'},mult:2};trainerAttackStart(v,a);trainerAttackResult(v,a);assert.equal(v.trainerAttack.result,'SUPER EFFECTIVE ×2');trainerAttackResult(v,{...a,mult:.5});assert.equal(v.trainerAttack.result,'NOT VERY EFFECTIVE ×0.5');
const still={trainerMode:false,cameraZoom:1.07};updateTrainerCamera(still);assert.equal(still.cameraZoom,1.07);
console.log(`PASS: full editable Red/Blue six-roster relay, unique fighters, pristine reserves, all replacements, no timed cutoff, cinematic camera (${zoomMax.toFixed(2)}×), effectiveness, staged outro, pause, replay, Stop, immunity escape and classic-mode isolation.`);

export {app,document,frames};
