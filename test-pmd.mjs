import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Image} from '@napi-rs/canvas';
import {animationFrame,directionToward} from './dist/pmd-animation.js';
assert.equal(directionToward({x:0,y:0},{x:0,y:5}),0);assert.equal(directionToward({x:0,y:0},{x:0,y:-5}),4);assert.equal(directionToward({x:0,y:0},{x:5,y:0}),6);assert.equal(directionToward({x:0,y:0},{x:-5,y:0}),2);
const manifest=JSON.parse(fs.readFileSync('dist/assets/pmd/manifest.json'));for(const id of [144,145,146,243,244,245]){const p=manifest[id];for(const state of ['Idle','Walk','Attack','Shoot','Hurt']){const a=p.anims[state];assert(a);const image=new Image();image.src=fs.readFileSync('dist/assets/'+a.path);assert(image.width>=a.width*a.durations.length);assert(image.height>=a.height*8);for(const t of [0,.01,.1,.3,1,100]){const frame=animationFrame(a,t);assert(frame>=0&&frame<a.durations.length)}assert.equal(animationFrame(a,100,false),a.durations.length-1)}assert(fs.existsSync(`dist/assets/pmd/${id}/portrait.png`))}
console.log('PASS: front/back/eight-way direction mapping, native walk/attack/hurt sheet dimensions and animation frame bounds for both reference teams.');
