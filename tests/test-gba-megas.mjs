import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanvas,Image} from '@napi-rs/canvas';
const manifest=JSON.parse(fs.readFileSync('dist/assets/pmd/mega-manifest.json'));
for(const entry of Object.values(manifest))assert(!entry.source.includes('Derived pixel-pose'),'No static-art-derived Mega fallbacks remain');
for(const id of [3,9]){
 const entry=manifest['mega-'+id];assert.equal(entry.directions,4);assert(entry.source.includes('native GBA'));
 for(const state of ['Idle','Walk','Attack','Shoot','Hurt','Sleep','Charge','SpAttack']){
  const anim=entry.anims[state],image=new Image();image.src=fs.readFileSync('dist/assets/'+anim.path);
  const c=createCanvas(image.width,image.height),ctx=c.getContext('2d');ctx.drawImage(image,0,0);const data=ctx.getImageData(0,0,c.width,c.height).data,palette=new Set();
  for(let i=0;i<data.length;i+=4){assert(data[i+3]===0||data[i+3]===255,'No blurred or translucent sprite pixels');if(data[i+3])palette.add(data.slice(i,i+3).join(','))}assert(palette.size<=15,'GBA palette must remain bounded');assert.equal(data[3],0,'Palette-zero background must be transparent');
  const front=ctx.getImageData(0,0,64,64).data,back=ctx.getImageData(0,256,64,64).data;assert.notDeepEqual(front,back,'Bottom team requires a genuine back view');
 }
 const first=new Image(),back=new Image();first.src=fs.readFileSync('dist/assets/'+entry.front);back.src=fs.readFileSync('dist/assets/'+entry.back);assert.equal(first.width,32);assert.equal(back.width,32);
}
const app=fs.readFileSync('dist/app.js','utf8');assert(app.includes("formArt?.portrait"));assert(app.includes("formArt[p.team===1?'back':'front']"));
console.log('PASS: both GBA Mega sets have opaque pixel art on transparent backgrounds, <=15 sprite colours, true front/back poses, eight animated states, matching HUD/fallback art; no derived static Mega sets remain.');
