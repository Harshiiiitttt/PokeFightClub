import fs from 'node:fs';
import {createCanvas,Image} from '@napi-rs/canvas';
for(const [name,tiles] of [['spear','temporal'],['coast','storm'],['eclipse','crystal'],['champion','rocky']]){
 const canvas=createCanvas(540,960),c=canvas.getContext('2d'),atlas=new Image();atlas.src=fs.readFileSync(`dist/assets/arenas/${tiles}-tiles.png`);c.imageSmoothingEnabled=false;
 for(let y=0;y<960;y+=36)for(let x=0;x<540;x+=36)c.drawImage(atlas,251,26,24,24,x,y,36,36);
 if(name==='spear'){
  c.fillStyle='#0f254433';c.fillRect(0,0,540,960);c.fillStyle='#a0a4a6';for(const y of [165,380,600,805])for(const x of [26,486]){c.fillStyle='#313e54';c.fillRect(x-5,y+8,38,52);c.fillStyle='#a5b9c0';c.fillRect(x,y-27,28,62);c.fillStyle='#617c8a';for(let i=0;i<3;i++)c.fillRect(x+4+i*7,y-23,2,54);c.fillStyle='#c3ccd0';c.fillRect(x-5,y-33,38,9);c.fillRect(x-5,y+30,38,9)}
  c.strokeStyle='#92d9e355';c.lineWidth=2;for(const r of [100,170]){c.beginPath();c.ellipse(270,480,r,r*1.35,0,0,Math.PI*2);c.stroke()}for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(270+Math.cos(a)*95,480+Math.sin(a)*128);c.lineTo(270+Math.cos(a)*175,480+Math.sin(a)*232);c.stroke()}
 }else if(name==='coast'){
  c.fillStyle='#deb86b44';c.fillRect(0,0,540,960);for(const side of [0,1]){const x=side?484:0;c.fillStyle='#153f5e';c.fillRect(x,0,56,960);for(let y=0;y<960;y+=22){c.fillStyle=y%44?'#3c8aa3':'#256781';c.fillRect(x+4+(y%3)*4,y,43,3);c.fillStyle='#8dded0';c.fillRect(side?479:54,y+6,7,12)}}
  for(const x of [65,461])for(const y of [200,400,620,815]){c.fillStyle='#364b59';c.fillRect(x-8,y-9,24,20);c.fillStyle='#82969b';c.fillRect(x-5,y-12,18,11)}c.strokeStyle='#f8e5b02b';c.lineWidth=2;for(let y=180;y<900;y+=110){c.beginPath();c.ellipse(270,y,130,15,0,0,Math.PI);c.stroke()}
 }else if(name==='eclipse'){
  c.fillStyle='#100d3855';c.fillRect(0,0,540,960);for(const x of [24,493])for(let y=100;y<900;y+=128){c.fillStyle='#352851';c.fillRect(x-4,y-8,27,70);c.fillStyle='#8e72b0';c.fillRect(x,y-12,18,64);c.fillStyle='#d4c596';c.fillRect(x-4,y-18,27,9)}
  c.strokeStyle='#d7c39366';c.lineWidth=2;c.beginPath();c.arc(270,480,122,0,Math.PI*2);c.stroke();c.beginPath();c.arc(270,480,70,-Math.PI/2,Math.PI/2);c.stroke();c.beginPath();c.arc(290,480,70,Math.PI/2,Math.PI*1.5);c.stroke();for(let i=0;i<16;i++){const a=i*Math.PI/8;c.fillStyle='#d7c39377';c.fillRect(268+Math.cos(a)*150,478+Math.sin(a)*150,4,4)}
 }else{
  c.fillStyle='#d7bb8633';c.fillRect(0,0,540,960);for(const side of [0,1]){const x=side?497:8;for(let y=115;y<880;y+=20){c.fillStyle=y<480?'#a64c54':'#416c96';c.fillRect(x,y,35,14);c.fillStyle='#d9d4bb';c.fillRect(x+4,y+2,4,4);c.fillRect(x+16,y+3,4,4);c.fillRect(x+26,y+1,4,4)}}
  c.strokeStyle='#e8ddc5aa';c.lineWidth=3;c.strokeRect(70,180,400,600);c.beginPath();c.moveTo(70,480);c.lineTo(470,480);c.stroke();c.beginPath();c.arc(270,480,100,0,Math.PI*2);c.stroke();c.fillStyle='#566475';c.beginPath();c.arc(270,480,23,0,Math.PI*2);c.fill();c.stroke();for(const x of [58,473])for(const y of [205,740]){c.fillStyle='#f4e6a9';c.fillRect(x,y,9,25)}
 }
 const shade=c.createRadialGradient(270,480,160,270,480,630);shade.addColorStop(0,'#10152000');shade.addColorStop(1,'#07102566');c.fillStyle=shade;c.fillRect(0,0,540,960);fs.writeFileSync(`dist/assets/arenas/${name}.png`,canvas.toBuffer('image/png'));console.log('Built',name);
}
