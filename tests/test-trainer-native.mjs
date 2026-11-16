import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseHTML} from 'linkedom';
import {createCanvas,Image,GlobalFonts} from '@napi-rs/canvas';
import {BattleView} from '../dist/battle-view.js';
import {RecordingStudio} from '../dist/recording-studio.js';
import {createFighter,moves} from '../dist/engine.js';
import {choreograph} from '../dist/choreography.js';
import {TRAINER_PRESETS,playTrainerOutro} from '../dist/trainer-duel.js';
const {document}=parseHTML(fs.readFileSync('dist/index.html','utf8'));globalThis.document=document;
GlobalFonts.registerFromPath('dist/assets/fonts/Inter.ttf','Inter');GlobalFonts.registerFromPath('dist/assets/fonts/SpaceGrotesk.ttf','Space Grotesk');
function bindCanvas(el){const native=createCanvas(540,960),context=native.getContext('2d'),wrapped=new Proxy(context,{get:(o,k)=>typeof o[k]==='function'?(...args)=>o[k](...args.map(v=>v?.native||v?._native||v)):o[k],set:(o,k,v)=>{o[k]=v;return true}});el.native=native;el.getContext=()=>wrapped;for(const k of ['width','height'])Object.defineProperty(el,k,{get:()=>native[k],set:v=>native[k]=v});return el;}
const create=document.createElement.bind(document);document.createElement=tag=>{const e=create(tag);return tag==='canvas'?bindCanvas(e):e;};for(const e of document.querySelectorAll('canvas'))bindCanvas(e);
globalThis.Image=class extends Image{set src(path){if(!/^https?:/.test(path))super.src=fs.readFileSync('dist/'+path);}};
const cache=JSON.parse(fs.readFileSync('dist/pokemon.json')),preset=TRAINER_PRESETS[0];
function sprite(el,id,battle,back){const img=new Image();img.src=fs.readFileSync(`dist/assets/classic/${back?'back':'front'}/${id}.png`);el._native=img;el.naturalWidth=img.width;el.naturalHeight=img.height;el.dataset.facing=back?'back':'front';}
const stage=document.querySelector('#stage'),view=new BattleView(stage,sprite);view.style='pmd';view.arena='champion';view.customTeamNames=preset.names;
view.pmd={...JSON.parse(fs.readFileSync('dist/assets/pmd/manifest.json')),...JSON.parse(fs.readFileSync('dist/assets/pmd/mega-manifest.json'))};
for(const id of new Set(preset.teams.flat())){assert(cache[id]);assert(view.pmd[id]?.anims.Attack,'Native attack assets must be bundled for '+id);for(const a of Object.values(view.pmd[id].anims)){const image=new Image();image.src=fs.readFileSync('dist/assets/'+a.path);view.images['pmd-'+id+'-'+a.name]=image;}const portrait=new Image();portrait.src=fs.readFileSync('dist/assets/'+(view.pmd[id].portrait||'pmd/'+id+'/portrait.png'));view.images['intro-'+id]=portrait;}
for(const [team,name] of ['red','blue'].entries()){const img=new Image();img.src=fs.readFileSync('dist/assets/trainers/'+name+'.png');view.images['trainer-'+team]=img;}
for(const name of fs.readdirSync('dist/assets/npc').filter(n=>n.endsWith('.png'))){const img=new Image();img.src=fs.readFileSync('dist/assets/npc/'+name);view.images['npc-'+name.slice(0,-4)]=img;}
const fighters=preset.teams.flatMap((ids,team)=>ids.map((id,i)=>Object.assign(createFighter(cache[id],team,0,{reserve:i>0,uidIndex:i}),{uid:team+'-'+i,reserve:i>0,rosterIndex:i,trainerDuel:true,bundled:true})));view.mount(fighters);stage.querySelector('#intro-overlay').classList.add('hidden');stage.querySelector('#result').classList.add('hidden');
const studio=new RecordingStudio(view,stage),screens=[];const save=name=>{studio.renderCompositeFrame();const img=createCanvas(540,960);img.getContext('2d').drawImage(studio.canvas.native,0,0);screens.push(img);fs.writeFileSync('D:/pokemon-reference/trainer-'+name+'-v22.png',img.toBuffer('image/png'));};
view.matchIntro={lineups:preset.teams,names:preset.names,start:0,duration:3};for(let i=0;i<65;i++)view.draw(1/60);save('intro');view.matchIntro=null;
let actionCaptured=false,maxZoom=1;const audio={sfx(){},cry(){},duck(){},background(){}};
async function wait(ms){let left=ms;while(left>0){view.draw(1/60);left-=1000/60*(view.timeScale||1);maxZoom=Math.max(maxZoom,view._zoomNow);if(!actionCaptured&&view.effects.some(e=>e.kind==='bolt')&&view.clock-view.trainerAttack.start>.65){save('action');actionCaptured=true;}}}
const actor=fighters[0],target=fighters[6];await choreograph({actor,target,move:moves.find(m=>m.name==='thunderbolt'),damage:85,mult:2,crit:false,dodge:false,trainerDuel:true},{view,audio,wait,valid:()=>true,rng:()=>.5,log(){}});assert(actionCaptured);assert.equal(view.trainerAttack.result,'SUPER EFFECTIVE ×2');save('effectiveness');
await choreograph({actor:target,target:actor,move:moves.find(m=>m.name==='body-slam'),damage:40,mult:1,crit:false,dodge:false,trainerDuel:true},{view,audio,wait,valid:()=>true,rng:()=>.5,log(){}});assert(maxZoom>1.2);assert(Math.hypot(actor.pos.x-target.pos.x,actor.pos.y-target.pos.y)>180,'Both actors recover to separated positions');
for(const p of fighters.filter(p=>p.team===1)){p.hp=0;view.updateHP(p);if(p.el){p.el.remove();p.el=null;}}
let outroCaptured=false;const before=fighters.map(p=>p.hp);await playTrainerOutro({view,audio,winner:0,valid:()=>true,wait:async ms=>{for(let i=0;i<Math.ceil(ms/1000*60);i++){view.draw(1/60);if(!outroCaptured&&view.trainerOutro&&view.presentationTime-view.trainerOutro.start>3){save('outro');outroCaptured=true;}}}});assert(outroCaptured);assert.deepEqual(fighters.map(p=>p.hp),before,'Victory sequence must keep injuries');
const montage=createCanvas(2160,960);screens.forEach((s,i)=>montage.getContext('2d').drawImage(s,i*540,0));fs.writeFileSync('D:/pokemon-reference/trainer-preview-v22.png',montage.toBuffer('image/png'));
console.log('PASS: all 12 local native sprite packs, front/back combat, rendered trainer intro, tracked attack closeup, type/effectiveness overlay, separated recovery, recordable outro and retained injuries.');
export {view,studio};
