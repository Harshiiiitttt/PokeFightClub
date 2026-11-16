const mod=(n,d)=>(n%d+d)%d;
export function stadiumPulse(view){
 if(!view.cinematic)return 0;
 return Math.min(1,Math.max(0,...(view.arenaReactions||[]).map(e=>Math.max(0,1-(view.clock-e.start)/1.25)*e.power)));
}
export function drawStadiumLife(c,view){
 if(!view.trainerMode||!view.cinematic)return;const t=view.clock,pulse=stadiumPulse(view),arena=view.arena;
 c.save();
 // Light chases stay on the rails, leaving the fighting lane clean.
 for(const side of [0,1])for(let i=0;i<15;i++){
  const y=276+i*35,glow=Math.max(0,Math.sin(t*2.4-i*.55+side*1.4))**8;
  c.globalAlpha=.18+glow*.4+pulse*.3;c.fillStyle=side?'#8dbfe1':'#e9b59b';c.fillRect(side?519:19,y,2,12);
 }
 for(const [x,y] of [[62,270],[478,270],[62,799],[478,799]]){
  const glow=c.createRadialGradient(x,y,0,x,y,32+pulse*12);glow.addColorStop(0,'#eadfb7');glow.addColorStop(1,'#eadfb700');c.globalAlpha=.08+pulse*.13;c.fillStyle=glow;c.fillRect(x-45,y-45,90,90);
 }
 c.save();c.beginPath();c.rect(48,260,444,532);c.clip();
 // Moving cloud/rig shadows give the ground depth without moving or scaling its texture.
 c.globalAlpha=.035;c.fillStyle='#030e1b';for(let i=0;i<2;i++){const x=mod(t*12+i*285,850)-150;c.beginPath();c.ellipse(x,390+i*246,145,24,-.24,0,Math.PI*2);c.fill();}
 if(['coast','storm'].includes(arena)){
  for(let i=0;i<13;i++){const q=mod(t*(arena==='storm'?.85:.35)+i*.173,1),x=62+mod(i*79,416),y=280+mod(i*137,490);c.globalAlpha=(1-q)*.17;c.strokeStyle='#c1e4e9';c.lineWidth=1;c.beginPath();c.ellipse(x,y,2+q*15,1+q*4,0,0,Math.PI*2);c.stroke();}
  for(const p of view.fighters.filter(p=>!p.reserve&&p.hp>0&&p.motion)){for(let i=0;i<3;i++){const q=mod(t*2+i*.3,1);c.globalAlpha=(1-q)*.12;c.strokeStyle='#cce9e7';c.beginPath();c.ellipse(p.pos.x-i*4,p.pos.y+25,9+q*15,2+q*4,0,0,Math.PI*2);c.stroke();}}
 }else if(arena==='frost'){
  for(let i=0;i<14;i++){const a=Math.max(0,Math.sin(t*1.1+i*2.4))**12,x=65+mod(i*89,414),y=280+mod(i*131,490);c.globalAlpha=a*.45;c.strokeStyle='#e0faff';c.lineWidth=1;c.beginPath();c.moveTo(x-3,y);c.lineTo(x+3,y);c.moveTo(x,y-3);c.lineTo(x,y+3);c.stroke();}
 }else if(arena==='forest'||arena==='champion'){
  for(const x of [53,485])for(let i=0;i<16;i++){const y=331+i*25,bend=Math.sin(t*1.9+i*.7)*3;c.globalAlpha=.3;c.strokeStyle=arena==='forest'?'#9db87b':'#8eb091';c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x+bend-2,y-5);c.moveTo(x+3,y);c.lineTo(x+bend+4,y-4);c.stroke();}
 }else if(arena==='volcano'){
  for(const x of [51,489])for(let i=0;i<6;i++){const y=320+i*78;c.globalAlpha=.05+.04*Math.sin(t*1.8+i)+pulse*.1;c.fillStyle='#ff986d';c.fillRect(x-2,y,4,31);}
 }else if(['spear','temporal','eclipse','crystal'].includes(arena)){
  for(const x of [57,483])for(let i=0;i<7;i++){const y=342+i*57;c.globalAlpha=.04+Math.max(0,Math.sin(t*.7-i*.6))*.11+pulse*.15;c.strokeStyle=arena==='eclipse'?'#dab9e9':'#b9dae8';c.lineWidth=1;c.beginPath();c.moveTo(x-3,y);c.lineTo(x,y-5);c.lineTo(x+3,y);c.lineTo(x,y+5);c.closePath();c.stroke();}
 }
 // A large impact kicks a delayed dust echo off the nearest curb.
 for(const e of view.arenaReactions||[]){const age=t-e.start;if(e.power<.7||age<.12||age>.85)continue;const q=(age-.12)/.73,x=e.x<270?52:488;c.globalAlpha=(1-q)*.2;c.fillStyle=['coast','storm','frost'].includes(arena)?'#b9d9dd':'#c2b89b';for(let i=0;i<7;i++)c.fillRect(x+Math.sin(i*2.4)*q*14,e.y+(i-3)*6-q*12,2+q*3,2);}
 c.restore();c.restore();
}
