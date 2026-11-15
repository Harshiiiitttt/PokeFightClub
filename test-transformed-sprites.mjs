import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {parseHTML} from 'linkedom';
import {createCanvas,Image} from '@napi-rs/canvas';
import {EVOLVED_FORM_KEYS,applyFormArt} from './dist/form-art.js';
import {drawPmd,pmdState,loadPmdImages} from './dist/pmd-animation.js';
import {megaForms} from './dist/mega.js';
const {document}=parseHTML('<html><body></body></html>');globalThis.document=document;const create=document.createElement.bind(document);document.createElement=tag=>{const el=create(tag);if(tag==='canvas'){const c=createCanvas(1,1);el.native=c;el.getContext=()=>c.getContext('2d');for(const k of ['width','height'])Object.defineProperty(el,k,{get:()=>c[k],set:v=>c[k]=v})}return el};
const manifest=JSON.parse(fs.readFileSync('dist/assets/pmd/mega-manifest.json')),keys=Object.values(EVOLVED_FORM_KEYS),images={},preview=createCanvas(1200,Math.ceil(keys.length/4)*240),out=preview.getContext('2d');out.imageSmoothingEnabled=false;
for(const key of keys){assert(manifest[key],key+' must have its own form art');for(const a of Object.values(manifest[key].anims)){const image=new Image();image.src=fs.readFileSync('dist/assets/'+a.path);images['pmd-'+key+'-'+a.name]=image}}
let variations=0;
for(const [index,key] of keys.entries()){
 const id=manifest[key].baseId,x=index%4*300,y=Math.floor(index/4)*240;
 out.fillStyle='#162435';out.fillRect(x,y,300,240);out.strokeStyle='#526577';out.strokeRect(x+4,y+4,292,232);out.fillStyle='#ffe8a5';out.textAlign='center';out.font='bold 12px monospace';out.fillText(megaForms[id]?.[3]||key.toUpperCase(),x+150,y+28,280);
 for(const [side,direction] of [0,4].entries()){
  const el=document.createElement('div');el.append(document.createElement('img'),document.createElement('canvas'));
  const fighter={id,uid:key+'-'+side,team:side,hp:100,max:100,pos:{x:150,y:300},el,direction,name:key},view={pmd:manifest,images,clock:0,style:'gba',fighters:[fighter],loadPmd(){}};
  assert(applyFormArt(view,fighter,key));assert.equal(fighter.formKey,key);const face=side&&!manifest[key].frontOnly?'back':'front';if(manifest[key][face])assert.equal(fighter.el.querySelector('img').src,'assets/'+manifest[key][face]);
  for(const state of ['Idle','Walk','Attack']){
   fighter.animKey=null;fighter.action=state==='Idle'?null:state;view.clock=0;const initial=pmdState(view,fighter);assert.equal(initial.form,key,'Explicit forms must never draw a base species sheet');
   let tick=0;const hashes=new Set();for(const duration of initial.anim.durations){view.clock=(tick+duration/2)/60;tick+=duration;drawPmd(view,fighter);hashes.add(createHash('sha256').update(el.querySelector('canvas').native.toBuffer('image/png')).digest('hex'))}assert(hashes.size>1,key+' '+state+' must animate');variations++;
  }
  fighter.action=null;view.clock+=.1;drawPmd(view,fighter);out.drawImage(el.querySelector('canvas').native,x+5+side*145,y+35,170,198);
 }
}
for(const id of [382,383,483,484,487,718,800,888,889,890]){
 const queued=[];loadPmdImages({fighters:[{id}],pmd:manifest,images:{},pendingPmd:new Set(),load:(key)=>queued.push(key)});assert(queued.some(k=>k.startsWith('pmd-'+EVOLVED_FORM_KEYS[id]+'-')),'Preload transformed art before activation');
}
fs.writeFileSync('D:/pokemon-reference/all-forms-v12.png',preview.toBuffer('image/png'));
console.log(`PASS: ${keys.length} distinct transformed form packs, ${variations} front/back animation checks, explicit form selection in GBA mode, matching fallback art and all special forms preloaded.`);
