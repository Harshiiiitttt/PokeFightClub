import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseHTML} from 'linkedom';
import {createCanvas,Image} from '@napi-rs/canvas';
import {BattleView} from './dist/battle-view.js';
import {RecordingStudio} from './dist/recording-studio.js';
import {playGuardianEntrance} from './dist/guardian-entrance.js';
import {guardianSpriteRect} from './dist/guardian-presentation.js';
import {bossSpriteRect} from './dist/guardian-presentation.js';
import {choreographAct2Wave} from './dist/choreography.js';
import {applyFormArt} from './dist/form-art.js';
import {createFighter} from './dist/engine.js';
import {GUARDIAN_AWAKENINGS} from './dist/battle-modes.js';
const {document}=parseHTML(fs.readFileSync('dist/index.html','utf8'));globalThis.document=document;
function bindCanvas(el){const native=createCanvas(540,960),context=native.getContext('2d'),wrapped=new Proxy(context,{get:(o,k)=>typeof o[k]==='function'?(...a)=>o[k](...a.map(v=>v?.native||v?._native||v)):o[k],set:(o,k,v)=>{o[k]=v;return true}});el.native=native;el.getContext=()=>wrapped;for(const k of ['width','height'])Object.defineProperty(el,k,{get:()=>native[k],set:v=>native[k]=v});return el}
const create=document.createElement.bind(document);document.createElement=tag=>{const e=create(tag);return tag==='canvas'?bindCanvas(e):e};for(const e of document.querySelectorAll('canvas'))bindCanvas(e);
globalThis.Image=class extends Image{set src(path){if(!/^https?:/.test(path))super.src=fs.readFileSync('dist/'+path)}};
const cache=JSON.parse(fs.readFileSync('dist/pokemon.json'));
function sprite(el,id,battle,back){const image=new Image();image.src=fs.readFileSync(`dist/assets/classic/${back?'back':'front'}/${id}.png`);el._native=image;el.naturalWidth=image.width;el.naturalHeight=image.height;el.dataset.facing=back?'back':'front';}
const stage=document.querySelector('#stage'),view=new BattleView(stage,sprite);view.style='pmd';
view.pmd={...JSON.parse(fs.readFileSync('dist/assets/pmd/manifest.json')),...JSON.parse(fs.readFileSync('dist/assets/pmd/mega-manifest.json'))};
for(const id of [890,888,889,384,'eternamax-890','crowned-888','crowned-889','mega-384'])for(const a of Object.values(view.pmd[id].anims)){const image=new Image();image.src=fs.readFileSync('dist/assets/'+a.path);view.images['pmd-'+id+'-'+a.name]=image;}
const arena=new Image();arena.src=fs.readFileSync('dist/assets/arenas/temporal.png');view.images['arena-temporal']=arena;view.arena='temporal';
const boss=createFighter(cache[890],0,0,{bossRaid:true,challengerCount:50});boss.hp=2000;view.mount([boss]);boss.phase2=true;applyFormArt(view,boss,'eternamax-890');
assert(view.pmd['eternamax-890'].anims.Idle.path.startsWith('pmd/eternamax-890-native/'),'Eternamax must use the replacement native artwork');
const guardians=[888,889,384].map((id,i)=>Object.assign(createFighter(cache[id],1,[0,2,1][i]),{isGuardian:true,raidEngaged:true,entranceHidden:true,summonColor:GUARDIAN_AWAKENINGS[id].color,awakenedName:GUARDIAN_AWAKENINGS[id].title,bundled:true}));view.fighters.push(...guardians);
for(const g of guardians){const image=new Image();image.src=fs.readFileSync(`dist/assets/pmd/${g.id}/portrait.png`);view.images['guardian-portrait-'+g.id]=image}
const studio=new RecordingStudio(view,stage),snapshots=[],audio={quiet(){},sfx(){},cry(){},duck(){}};let shot='';
const originalFx=view.addFx.bind(view);view.addFx=(kind,...args)=>{if(kind==='guardian-cutin')shot='cutin';if(kind==='guardian-dawn')shot='awakening';if(kind==='guardian-rollcall')shot='hero-hold';if(kind==='boss-reaction')shot='reaction';if(kind==='beam-clash')shot='clash';return originalFx(kind,...args)};
let silhouetteSeen=false;const move=view.move.bind(view);view.move=(p,...args)=>{if(p.silhouette&&!silhouetteSeen){silhouetteSeen=true;shot='silhouette'}return move(p,...args)};
async function wait(ms){const frames=Math.ceil(ms/1000*60);for(let i=0;i<frames;i++){view.draw(1/60);if(i===Math.floor(frames*.55)&&shot){
 const tag=shot;shot='';
 if(['awakening','hero-hold'].includes(tag)){
  assert(guardians.every(g=>g.heroEntrance&&g.direction===0&&g.presentationFacing==='front'),'All three must face the viewer during the reveal');
  const front=view.canvas.native.getContext('2d').getImageData(0,0,540,960).data;
  for(const g of guardians){const r=guardianSpriteRect(g),mask=createCanvas(540,960),c=mask.getContext('2d');c.drawImage(g.el.querySelector('canvas').native,r.x,r.y,r.width,r.height);const data=c.getImageData(0,0,540,960).data;let body=0,clear=0;for(let k=3;k<data.length;k+=4)if(data[k]>200){body++;if(front[k]<90)clear++}assert(body>2000,'Hero must have a readable on-screen body');assert(clear/body>.92,`${g.name}: foreground FX must not cover its body`);assert(r.x>=0&&r.x+r.width<=540,'All heroes must remain inside the portrait frame');}
 }
 studio.renderCompositeFrame();const image=createCanvas(540,960);image.getContext('2d').drawImage(studio.canvas.native,0,0);
 if(tag==='silhouette'){const g=guardians.find(g=>g.silhouette);assert(g);const r=guardianSpriteRect(g),mask=createCanvas(540,960);mask.getContext('2d').drawImage(g.el.querySelector('canvas').native,r.x,r.y,r.width,r.height);const body=mask.getContext('2d').getImageData(0,0,540,960).data,frame=image.getContext('2d').getImageData(0,0,540,960).data;let opaque=0,black=0;for(let k=0;k<body.length;k+=4)if(body[k+3]>240){opaque++;if(frame[k]<16&&frame[k+1]<16&&frame[k+2]<16)black++}assert(black/opaque>.9,'Recorded pillar silhouette must actually be black, not merely flagged');}
 if(tag==='reaction'){const r=bossSpriteRect(boss),d=boss.el.querySelector('canvas').dataset;const top=r.y+(112+Number(d.bodyTop))*r.height/224;assert(top>140,'Full Eternamax artwork must fit below the HUD');}
 if(tag==='clash'){assert(view.clashState);assert(guardians.every(g=>g.charge&&g.action==='Charge'));assert(guardians.some(g=>Math.abs(g.pos.y-(g.slot===1?722:690))>3),'Native clash must show physical displacement');}
 snapshots.push({tag,image});
 }}}
assert(await playGuardianEntrance({boss,guardians,fallen:Array.from({length:50},(_,i)=>({pos:{x:40+i*47%460,y:250+i*79%480}})),view,audio,wait,valid:()=>true,
 attach(g,pos){g.pos={...pos};g.direction=4;document.querySelector('#fighters').append(view.createFighterEl(g))},
 awaken(){for(const g of guardians){g.name=GUARDIAN_AWAKENINGS[g.id].title;g.mega=true;applyFormArt(view,g)}view.drawHUD()},log(){},willLabel:'+30% WILL OF THE 50!'}));
assert(guardians.every(g=>!g.heroEntrance&&g.direction===4&&!g.presentationFacing),'Combat must restore back-facing sprites');
await choreographAct2Wave(view.fighters,{view,audio,wait,valid:()=>true,rng:()=>.1,log(){},onDamage(){}});
assert.equal(snapshots.length,6);const montage=createCanvas(1620,1920),c=montage.getContext('2d');for(const [i,s] of snapshots.entries()){c.drawImage(s.image,(i%3)*540,Math.floor(i/3)*960);fs.writeFileSync('D:/pokemon-reference/cinema-'+s.tag+'-v14.png',s.image.toBuffer('image/png'))}fs.writeFileSync('D:/pokemon-reference/guardian-visibility-v14.png',montage.toBuffer('image/png'));
const closeup=createCanvas(260,220);closeup.getContext('2d').drawImage(snapshots[0].image,140,140,260,220,0,0,260,220);fs.writeFileSync('D:/pokemon-reference/eternamax-new-art-v16.png',closeup.toBuffer('image/png'));
const css=fs.readFileSync('dist/workspace.css','utf8');assert(css.includes('#entrance-effects{z-index:2;'));assert(stage.querySelector('#entrance-effects'));
console.log('PASS: full native cutscene renders: black pillar silhouette, >92% unobscured awakened heroes, front-pose hold, framed full Eternamax, boss reaction and physically displaced/bracing beam clash.');
export {view,studio,boss,guardians};
