import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanvas,Image} from '@napi-rs/canvas';
import {drawEnvironmentLife,queueArenaReaction} from '../dist/environment-life.js';
import {drawArenaAmbience} from '../dist/arena-ambience.js';
import {arenaCatalog} from '../dist/arena-catalog.js';
const montage=createCanvas(540*4,960*3),m=montage.getContext('2d');
for(const [index,[key,arena]] of Object.entries(arenaCatalog).entries()){
 const canvas=createCanvas(540,960),c=canvas.getContext('2d');
 const native=()=>canvas.toBuffer('image/png');
 drawEnvironmentLife(c,arena.mood,1,false,[{x:270,y:510,start:0,power:1,color:'#ffae70'}]);assert(c.getImageData(0,0,540,960).data.every(v=>v===0),'Reduced motion must suppress added surroundings');
 drawEnvironmentLife(c,arena.mood,1,true,[]);const first=native();c.clearRect(0,0,540,960);drawEnvironmentLife(c,arena.mood,2,true,[]);assert(!first.equals(native()),key+' must animate over time');
 const second=native();c.clearRect(0,0,540,960);drawEnvironmentLife(c,arena.mood,2,true,[]);assert(second.equals(native()),'Environment must replay deterministically');
 c.clearRect(0,0,540,960);drawEnvironmentLife(c,arena.mood,2,true,[{x:270,y:510,start:1.5,power:1,color:'#ffae70'}]);assert(!second.equals(native()),'Heavy hit must disturb '+key);
 const bg=new Image();bg.src=fs.readFileSync('dist/assets/arenas/'+arena.image+'.png');c.clearRect(0,0,540,960);c.drawImage(bg,0,0,540,960);
 drawArenaAmbience(c,arena.mood,2);drawEnvironmentLife(c,arena.mood,2,true,[{x:270,y:510,start:1.5,power:1,color:'#ffae70'}]);
 c.fillStyle='#111927ee';c.fillRect(20,20,500,40);c.fillStyle='#f2e6cf';c.font='bold 18px monospace';c.fillText(arena.name,36,47);
 m.drawImage(canvas,index%4*540,Math.floor(index/4)*960);
}
const view={cinematic:true,clock:0};queueArenaReaction(view,{x:270,y:480},'#fff',.27);assert.equal(view.arenaReactions,undefined);
queueArenaReaction(view,{x:270,y:480},'#fff',1);queueArenaReaction(view,{x:280,y:480},'#fff',1);assert.equal(view.arenaReactions.length,1,'Nearby swarm hits must coalesce');
for(let i=0;i<30;i++){view.clock+=.2;queueArenaReaction(view,{x:i,y:480},'#fff',1);}assert.equal(view.arenaReactions.length,12,'Reaction memory must stay bounded');
view.cinematic=false;queueArenaReaction(view,{x:0,y:0},'#fff',1);assert.equal(view.arenaReactions.length,12);
fs.writeFileSync('D:/pokemon-reference/environment-life-v21.png',montage.toBuffer('image/png'));
console.log('PASS: all 11 arenas animate distinctly over time, replay deterministically, react to heavy impacts, respect reduced motion, coalesce swarm hits and cap reaction memory.');
