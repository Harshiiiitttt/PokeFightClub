import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {parseHTML} from 'linkedom';
import {createCanvas,Image} from '@napi-rs/canvas';
import {pmdState,drawPmd,loadPmdImages} from './dist/pmd-animation.js';
import {megaForms} from './dist/mega.js';
const manifest=JSON.parse(fs.readFileSync('dist/assets/pmd/mega-manifest.json'));
const {document}=parseHTML('<html><body></body></html>');globalThis.document=document;const create=document.createElement.bind(document);document.createElement=tag=>{const e=create(tag);if(tag==='canvas'){const c=createCanvas(1,1);e.native=c;e.getContext=()=>c.getContext('2d');for(const k of ['width','height'])Object.defineProperty(e,k,{get:()=>c[k],set:v=>c[k]=v})}return e};
let variations=0;
for(const id of Object.keys(megaForms)){const key='mega-'+id,meta=manifest[key];assert(meta,'Missing '+key);const images={};for(const a of Object.values(meta.anims)){const i=new Image();i.src=fs.readFileSync('dist/assets/'+a.path);assert(i.width>=a.width*a.durations.length);assert(i.height>=a.height&&i.height%a.height===0);images['pmd-'+key+'-'+a.name]=i;}
 for(const direction of [0,4]){const e=document.createElement('div');e.append(document.createElement('img'),document.createElement('canvas'));const p={id:+id,mega:true,formKey:key,direction,hp:100,max:100,el:e},view={style:'gba',clock:0,pmd:manifest,images};for(const action of ['Idle','Walk','Attack','Shoot','Hurt']){p.action=action==='Idle'?null:action;p.hitUntil=action==='Hurt'?1000:0;p.motion=action==='Walk'?{}:null;p.animKey=null;view.clock=0;const first=pmdState(view,p);let ticks=0;const times=[0,...first.anim.durations.map(d=>{const t=(ticks+d*.5)/60;ticks+=d;return t})];const hashes=new Set();for(const t of times){view.clock=t;const s=pmdState(view,p);assert(s,'Mega form must stay animated even in classic mode');assert(s.image===images['pmd-'+key+'-'+s.anim.name],'Must use evolved form, not base sheet');drawPmd(view,p);hashes.add(createHash('sha256').update(e.querySelector('canvas').native.toBuffer('image/png')).digest('hex'));}if(['Idle','Walk','Attack'].includes(action)){assert(hashes.size>1,`${key} ${action} direction ${direction} is frozen`);variations++}}}
}
const queued=[];loadPmdImages({fighters:[{id:94}],pmd:manifest,pendingPmd:new Set(),images:{},load:(key)=>queued.push(key)});assert(queued.some(k=>k.startsWith('pmd-mega-94-')),'Mega sheets should preload before evolution');
console.log(`PASS: all supported Mega/Primal/Ultra forms change visible frames during idle, travel and attacks, front/back (${variations} animation checks); evolved sheets replace base sheets and preload before transformation.`);
