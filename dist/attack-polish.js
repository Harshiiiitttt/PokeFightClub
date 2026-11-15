// Bounded, deterministic pixel effects: no random particles or camera transforms.
export function attackEase(t,style='smooth'){
 t=Math.max(0,Math.min(1,t));
 return style==='strike'?t*t:style==='recoil'?1-(1-t)**3:t*t*(3-2*t);
}
const line=(c,x1,y1,x2,y2)=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();};
export function drawAttackPolish(c,e,t){
 if(t<0||t>1)return false;
 const dx=e.to.x-e.from.x,dy=e.to.y-e.from.y,d=Math.max(1,Math.hypot(dx,dy)),nx=dx/d,ny=dy/d;
 const fade=Math.min(1,(1-t)*5),phase=t*28,head=Math.min(1,t*1.6);
 if(e.kind==='attack-dust'){
  for(let i=0;i<9;i++){const side=i%2?1:-1,q=i/9;
   c.globalAlpha=(1-t)*.4;c.fillStyle=i%3?'#c7bb9f':'#eee0bb';
   const size=3+t*9,x=e.to.x+side*(8+t*(18+q*25)),y=e.to.y+29-t*13+Math.sin(i*3)*6;
   c.fillRect(Math.round(x),Math.round(y),size,size*.6);
  }return true;
 }
 if(e.kind==='strike-arc'){
  c.save();c.translate(e.to.x,e.to.y);c.rotate(Math.atan2(dy,dx));
  const swing=e.flip?1.4-t*2.4:-1.4+t*2.4;
  for(let i=0;i<3;i++){c.globalAlpha=fade*(1-i*.25);c.strokeStyle=i?'#fff4d8':e.color;c.lineWidth=5-i;
   c.beginPath();c.ellipse(0,0,23+i*9,33+i*6,0,swing-.9,swing+.5);c.stroke();}
  c.restore();return true;
 }
 if(e.kind==='hit-shards'){
  for(let i=0;i<10;i++){const a=i*Math.PI/5+.27,r=10+t*(32+(i%3)*10);
   c.globalAlpha=fade*(1-t);c.strokeStyle=i%2?e.color:'#fff5d9';c.lineWidth=i%3?2:3;
   line(c,e.to.x+Math.cos(a)*r,e.to.y+Math.sin(a)*r*.75,e.to.x+Math.cos(a)*(r+8),e.to.y+Math.sin(a)*(r+8)*.75);
  }return true;
 }
 if(e.kind==='muzzle'){
  const r=5+Math.sin(t*Math.PI)*14;c.globalAlpha=fade*.8;c.lineWidth=2;c.strokeStyle=e.color;
  c.beginPath();c.ellipse(e.from.x,e.from.y,r,r*.65,Math.atan2(dy,dx),0,Math.PI*2);c.stroke();
  c.fillStyle='#fff8db';c.fillRect(e.from.x-3,e.from.y-3,6,6);return true;
 }
 if(!['beam','bolt','flame','orb','burst','wave'].includes(e.kind))return false;
 const x=e.from.x+dx*head,y=e.from.y+dy*head;
 c.globalAlpha=fade;c.lineCap='butt';
 if(e.kind==='beam'){
  const water=e.color==='#7fd6ff',ice=e.color==='#a8f7ff',width=e.wide?22:12;
  // Pulsing outer sheath, bright core, and moving cross bands convey pressure.
  c.strokeStyle=e.color;c.lineWidth=width+5;c.globalAlpha=fade*.3;line(c,e.from.x,e.from.y,x,y);
  c.globalAlpha=fade*.85;c.lineWidth=width*(.85+Math.sin(phase)*.09);line(c,e.from.x,e.from.y,x,y);
  c.strokeStyle=ice?'#d5ffff':'#f5ffff';c.lineWidth=water?5:3;line(c,e.from.x,e.from.y,x,y);
  c.strokeStyle=water?'#d5faff':e.color;c.lineWidth=2;
  for(let i=0;i<12;i++){const q=((i/12+t*1.8)%1)*head,px=e.from.x+dx*q,py=e.from.y+dy*q,spread=width*.65;
   line(c,px-ny*spread-nx*4,py+nx*spread-ny*4,px+ny*spread+nx*4,py-nx*spread+ny*4);}
  c.fillStyle='#edffff';c.beginPath();c.ellipse(x,y,width*.7,width*.45,Math.atan2(dy,dx),0,Math.PI*2);c.fill();
 }else if(e.kind==='bolt'){
  c.strokeStyle=e.color;c.lineWidth=7;c.globalAlpha=fade*.35;line(c,e.from.x,e.from.y,x,y);
  for(let pass=0;pass<2;pass++){c.globalAlpha=fade;c.lineWidth=pass?2:4;c.strokeStyle=pass?'#ffffff':e.color;
   c.beginPath();c.moveTo(e.from.x,e.from.y);
   for(let i=1;i<=14;i++){const q=i/14,j=i===14?0:Math.sin(i*2.37+Math.floor(t*18)*2.3)*18;c.lineTo(e.from.x+dx*q*head-ny*j,e.from.y+dy*q*head+nx*j);}c.stroke();}
 }else if(e.kind==='flame'){
  for(let i=0;i<20;i++){const q=i/20;if(q>head)break;const wobble=Math.sin(i*2.4-phase)*(3+q*10),r=5+q*14;
   const px=e.from.x+dx*q-ny*wobble,py=e.from.y+dy*q+nx*wobble;
   c.fillStyle=i%3?'#ff7836':'#e94424';c.globalAlpha=fade*.8;c.fillRect(px-r,py-r,r*2,r*2);
   c.fillStyle='#ffda69';c.fillRect(px-r*.45,py-r*.45,r*.9,r*.9);
  }
 }else if(e.kind==='wave'){
  c.save();c.translate(x,y);c.rotate(Math.atan2(dy,dx));c.lineWidth=3;c.strokeStyle=e.color;
  for(let i=0;i<3;i++){c.globalAlpha=fade*(1-i*.23);c.beginPath();c.ellipse(-i*16,0,12+i*3,22+i*8,0,-1.3,1.3);c.stroke();}c.restore();
 }else{
  // Compact projectile with a tapered, segmented tail rather than a floating ball.
  for(let i=5;i>=0;i--){const r=Math.max(2,14-i*2),back=i*10;
   c.globalAlpha=fade*(1-i*.14);c.fillStyle=i?e.color:'#fff5ed';
   c.beginPath();c.arc(Math.round(x-nx*back),Math.round(y-ny*back),r,0,Math.PI*2);c.fill();
  }
  c.strokeStyle=e.color;c.lineWidth=2;c.globalAlpha=fade;c.beginPath();c.ellipse(x,y,19,14,phase*.25,0,Math.PI*2);c.stroke();
 }
 return true;
}
