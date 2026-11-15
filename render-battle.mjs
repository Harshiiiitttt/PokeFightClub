import fs from 'node:fs';
import {parseHTML} from 'linkedom';
import {createCanvas,Image} from '@napi-rs/canvas';
import {BattleView} from './dist/battle-view.js';
import {createFighter} from './dist/engine.js';
import {choreograph} from './dist/choreography.js';
const {document}=parseHTML(fs.readFileSync('dist/index.html','utf8'));globalThis.document=document;
globalThis.Image=class extends Image{set src(value){super.src=fs.readFileSync('dist/'+value)}};
const native=new Map();for(const c of document.querySelectorAll('canvas')){const canvas=createCanvas(540,960);native.set(c.id,canvas);c.getContext=()=>canvas.getContext('2d')}
const data=JSON.parse(fs.readFileSync('dist/pokemon.json')),asset=new Map();
for(const id of [382,384,383,483,487,484])for(const face of ['front','back']){const img=new Image();img.src=fs.readFileSync(`dist/assets/classic/${face}/${id}.png`);asset.set(face+id,img)}
const view=new BattleView(document.querySelector('#stage'),(img,id,battle,back)=>{img.dataset.facing=back?'back':'front';});
const fighters=[382,384,383,483,487,484].map((id,i)=>createFighter(data[id],i<3?0:1,i%3));view.mount(fighters);view.drawArena();view.draw(.016);
const out=createCanvas(540,960),c=out.getContext('2d');c.imageSmoothingEnabled=false;
function compose(){c.clearRect(0,0,540,960);c.drawImage(native.get('scenery'),0,0);if(view.focused){c.fillStyle='#090b1c44';c.fillRect(0,0,540,960)}for(const p of [...fighters].sort((a,b)=>a.pos.y-b.pos.y)){const img=asset.get((p.team?'back':'front')+p.id);c.save();c.globalAlpha=p.hp<=0?.4:view.focused&&p!==view.focusActor&&p!==view.focusTarget?.6:1;c.translate(p.pos.x,p.pos.y);c.rotate((p.lean||0)*Math.PI/180);c.fillStyle='#19182555';c.beginPath();c.ellipse(0,31,32,8,0,0,Math.PI*2);c.fill();c.drawImage(img,-65,-65,130,130);c.restore()}c.drawImage(native.get('effects'),0,0);for(const t of [0,1]){const y=t?855:55;c.fillStyle=t?'#292447ef':'#142d2cef';c.strokeStyle=t?'#a6a2e4':'#91d4b9';c.fillRect(22,y,496,65);c.strokeRect(22,y,496,65);c.fillStyle='#e7ead6';c.font='bold 10px monospace';c.fillText(view.teamName(t),34,y-5);for(const p of fighters.filter(p=>p.team===t)){const x=28+p.slot*163;c.drawImage(asset.get('front'+p.id),x,y+15,35,35);c.fillStyle='#eee8de';c.font='bold 10px monospace';c.fillText(p.name[0].toUpperCase()+p.name.slice(1),x+38,y+23);c.fillStyle='#111d22';c.fillRect(x+38,y+31,111,5);c.fillStyle='#78cb83';c.fillRect(x+38,y+31,111*p.hp/p.max,5);c.font='8px monospace';c.fillStyle='#d2e3ce';c.fillText(p.hp+'/'+p.max,x+95,y+48)}}return out.toBuffer('image/png')}
fs.mkdirSync('D:/pokemon-reference/v3-frames',{recursive:true});
fs.writeFileSync('D:/pokemon-reference/v3-formation.png',compose());let frame=0;
const audio={sfx(){},cry(){}};
await choreograph({actor:fighters[0],target:fighters[3],move:{name:'hydro-pump',type:'water',fx:'beam',category:'special'},damage:82,mult:1,crit:false,dodge:false},{view,audio,log(){},rng:()=>.5,valid:()=>true,wait:async ms=>{for(let i=0;i<Math.ceil(ms/1000*30);i++){view.draw(1/30);fs.writeFileSync(`D:/pokemon-reference/v3-frames/frame-${String(frame++).padStart(4,'0')}.png`,compose())}}});
console.log('Rendered classic sprite formation and',frame,'attack frames.');
