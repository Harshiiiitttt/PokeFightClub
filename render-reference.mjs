import fs from 'node:fs';
import {parseHTML} from 'linkedom';
import {createCanvas,Image} from '@napi-rs/canvas';
import {BattleView} from './dist/battle-view.js';
import {createFighter} from './dist/engine.js';
import {pmdState} from './dist/pmd-animation.js';
const {document}=parseHTML(fs.readFileSync('dist/index.html','utf8'));globalThis.document=document;
globalThis.Image=class extends Image{set src(value){super.src=fs.readFileSync('dist/'+value)}};
const original=document.createElement.bind(document);document.createElement=tag=>{const el=original(tag);if(tag==='canvas'){const canvas=createCanvas(128,128);el.native=canvas;el.getContext=()=>canvas.getContext('2d');for(const dim of ['width','height'])Object.defineProperty(el,dim,{get:()=>canvas[dim],set:v=>{canvas[dim]=v}})}return el};
const layers={};for(const c of document.querySelectorAll('canvas')){const canvas=createCanvas(540,960);layers[c.id]=canvas;c.getContext=()=>canvas.getContext('2d')}
const data=JSON.parse(fs.readFileSync('dist/pokemon.json')),view=new BattleView(document.querySelector('#stage'),()=>{});view.pmd=JSON.parse(fs.readFileSync('dist/assets/pmd/manifest.json'));view.loadPmd();
for(let i=0;i<30&&!view.images['pmd-144-'+view.pmd[144].anims.Idle.name];i++)await new Promise(r=>setImmediate(r));
const fighters=[144,145,146,243,244,245].map((id,i)=>createFighter(data[id],i<3?0:1,i%3));view.mount(fighters);for(let i=0;i<50&&!fighters.every(p=>view.images['pmd-'+p.id+'-'+view.pmd[p.id].anims.Idle.name]);i++)await new Promise(r=>setImmediate(r));view.draw(.06);
const out=createCanvas(540,960),c=out.getContext('2d');c.imageSmoothingEnabled=false;
function composite(){c.clearRect(0,0,540,960);c.drawImage(layers.scenery,0,0);for(const p of fighters){const s=pmdState(view,p);if(!s)continue;const {anim,image,row,frame}=s;c.fillStyle='#19182355';c.beginPath();c.ellipse(p.pos.x,p.pos.y+31,25,7,0,0,7);c.fill();c.drawImage(image,frame*anim.width,row*anim.height,anim.width,anim.height,p.pos.x-anim.width*1.65/2,p.pos.y-anim.height*1.65/2,anim.width*1.65,anim.height*1.65)}c.drawImage(layers.effects,0,0);for(const t of [0,1]){const y=t?800:92;c.fillStyle='#1b1c26ef';c.strokeStyle=t?'#e6b737':'#e35946';c.lineWidth=2;c.beginPath();c.roundRect(27,y,486,66,6);c.fill();c.stroke();c.fillStyle=t?'#a47b16':'#ab3429';c.fillRect(37,y-19,190,19);c.fillStyle='#fff';c.font='bold 14px monospace';c.fillText(view.teamName(t),44,y-5);for(const p of fighters.filter(p=>p.team===t)){const x=32+p.slot*160,img=new Image();img.src=fs.readFileSync(`dist/assets/pmd/${p.id}/portrait.png`);c.drawImage(img,x,y+10,42,42);c.fillStyle='#fff';c.font='bold 13px monospace';c.fillText(p.name[0].toUpperCase()+p.name.slice(1),x+47,y+24);c.fillStyle='#131722';c.fillRect(x+47,y+31,103,10);c.fillStyle='#5fd477';c.fillRect(x+48,y+32,101,8);c.fillStyle='#dddce4';c.font='10px monospace';c.fillText('100/100',x+47,y+54)}}return out.toBuffer('image/png')}
view.message('FIGHT!',1000,true);view.draw(.02);fs.writeFileSync('D:/pokemon-reference/reference-v4.png',composite());
fighters[0].action='Attack';view.draw(.08);fs.writeFileSync('D:/pokemon-reference/reference-v4-attack.png',composite());console.log('Rendered source arena, directional bird/beast frames, portrait HUDs and fight title.');
