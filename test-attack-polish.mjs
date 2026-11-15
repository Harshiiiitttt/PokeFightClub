import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
import {drawAttackPolish,attackEase} from './dist/attack-polish.js';
const cases=[['Water pressure','beam','#7fd6ff'],['Electric discharge','bolt','#ffec7c'],['Fire stream','flame','#ff9c45'],['Energy projectile','orb','#ba92fa'],['Contact sweep','strike-arc','#ffc09b'],['Impact sparks','hit-shards','#a7a5ff']];
const image=createCanvas(1080,520),ctx=image.getContext('2d'),hashes=[];
for(const [i,[label,kind,color]] of cases.entries()){
 const tile=createCanvas(360,260),c=tile.getContext('2d');c.fillStyle='#141c2b';c.fillRect(0,0,360,260);c.strokeStyle='#283449';c.lineWidth=1;
 for(let x=0;x<360;x+=24){c.beginPath();c.moveTo(x,45);c.lineTo(x,260);c.stroke();}for(let y=45;y<260;y+=24){c.beginPath();c.moveTo(0,y);c.lineTo(360,y);c.stroke();}
 const e={kind,color,from:{x:65,y:185},to:{x:280,y:100}};
 const before=Buffer.from(c.getImageData(0,45,360,215).data);
 c.save();assert(drawAttackPolish(c,e,.45));c.restore();const a=Buffer.from(c.getImageData(0,45,360,215).data);assert(!a.equals(before),kind+' must produce visible animation');hashes.push(a.toString('base64'));
 c.fillStyle='#f2e6cf';c.font='bold 17px monospace';c.fillText(label,18,29);ctx.drawImage(tile,(i%3)*360,Math.floor(i/3)*260);
 const repeat=createCanvas(360,260),r=repeat.getContext('2d');drawAttackPolish(r,e,.45);const first=repeat.toBuffer('image/png');r.clearRect(0,0,360,260);drawAttackPolish(r,e,.45);assert(first.equals(repeat.toBuffer('image/png')),'Effects must replay deterministically');
}
assert.equal(new Set(hashes).size,6,'Attack families must remain visually distinct');
for(const style of ['strike','recoil','smooth']){let previous=0;for(let i=0;i<=100;i++){const p=attackEase(i/100,style);assert(p>=previous&&p<=1,'Motion must not overshoot contact spacing');previous=p;}assert.equal(attackEase(0,style),0);assert.equal(attackEase(1,style),1);}
assert(attackEase(.25,'strike')<attackEase(.25,'smooth'));assert(attackEase(.25,'recoil')>attackEase(.25,'smooth'));
assert.equal(drawAttackPolish(ctx,{kind:'beam'},-1),false);
fs.writeFileSync('D:/pokemon-reference/attack-effects-v20.png',image.toBuffer('image/png'));
console.log('PASS: six distinct native attack effects, deterministic replay, accelerating strikes, fast recoil and no movement overshoot.');
