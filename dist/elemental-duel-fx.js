const segment=(c,a,b)=>{c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();};
function leaf(c,x,y,size,angle,color){c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=color;c.beginPath();c.moveTo(-size,0);c.quadraticCurveTo(0,-size*.7,size,0);c.quadraticCurveTo(0,size*.7,-size,0);c.fill();c.strokeStyle='#eefab8';c.lineWidth=1;segment(c,{x:-size*.6,y:0},{x:size*.6,y:0});c.restore();}
function shard(c,x,y,size,angle){c.save();c.translate(x,y);c.rotate(angle);c.fillStyle='#86d5f0';c.beginPath();c.moveTo(0,-size);c.lineTo(size*.4,0);c.lineTo(0,size);c.lineTo(-size*.4,0);c.closePath();c.fill();c.fillStyle='#efffff';c.beginPath();c.moveTo(0,-size);c.lineTo(size*.4,0);c.lineTo(0,size*.4);c.closePath();c.fill();c.restore();}
export function drawElementalDuelFX(c,e,t){
 if(e.kind==='ground-decal'){
  const a=Math.min(1,t*8)*(1-Math.max(0,(t-.25)/.75)),el=e.element||'normal',x=e.to.x,y=e.to.y+24;if(a<=0)return true;
  c.save();c.globalAlpha=a*.62;
  if(el==='fire'){for(let i=0;i<7;i++){const ang=i*.9+t*1.2,r=6+(i%3)*7;c.fillStyle=i%2?'#ffae4a':'#ff5a24';c.fillRect(x+Math.cos(ang)*r,y+Math.sin(ang)*r*.4-t*10,2,2);}}
  else if(el==='ice'){for(let i=0;i<6;i++){const ang=i*1.05,px=x+Math.cos(ang)*16,py=y+Math.sin(ang)*6.5;c.strokeStyle='#e8ffff';c.lineWidth=1.2;c.beginPath();c.moveTo(px-2.5,py);c.lineTo(px+2.5,py);c.moveTo(px,py-2.5);c.lineTo(px,py+2.5);c.stroke();}}
  else if(el==='electric'){c.strokeStyle='#ffe76a';c.lineWidth=1.3;for(let i=0;i<4;i++){const ang=i*1.57+Math.floor(t*12)*.7,r1=6,r2=18;c.beginPath();c.moveTo(x+Math.cos(ang)*r1,y+Math.sin(ang)*r1*.4);c.lineTo(x+Math.cos(ang+.25)*12,y+Math.sin(ang+.25)*5);c.lineTo(x+Math.cos(ang)*r2,y+Math.sin(ang)*r2*.4);c.stroke();}}
  else if(el==='water'){const r=10+t*18;c.strokeStyle='#a8f0ff';c.lineWidth=1.2;c.beginPath();c.ellipse(x,y,r,r*.38,0,0,Math.PI*2);c.stroke();}
  else if(el==='ground'||el==='rock'){for(let i=0;i<7;i++){const ang=i*.92,d=10+t*18;c.fillStyle=i%2?'#cbb68f':'#8c7a5c';c.fillRect(x+Math.cos(ang)*d,y+Math.sin(ang)*d*.4-Math.sin(Math.min(1,t*2)*Math.PI)*5,2.5,2);}}
  else if(el==='grass'){c.fillStyle='#9be372';for(let i=0;i<5;i++){const ang=i*1.26+t*2;c.beginPath();c.ellipse(x+Math.cos(ang)*15,y+Math.sin(ang)*6,3.5,1.5,ang,0,Math.PI*2);c.fill();}}
  else{c.strokeStyle=e.color||'#d7dff0';c.lineWidth=1.2;c.beginPath();c.ellipse(x,y,14+t*10,5+t*4,0,0,Math.PI*2);c.stroke();}
  c.restore();return true;
 }
 if(!['element-water','element-ice','element-grass','element-impact'].includes(e.kind))return false;
 c.save();const fade=Math.min(1,(1-t)*5),dx=e.to.x-e.from.x,dy=e.to.y-e.from.y,d=Math.max(1,Math.hypot(dx,dy)),nx=dx/d,ny=dy/d,head=Math.min(1,t*2.1),x=e.from.x+dx*head,y=e.from.y+dy*head,angle=Math.atan2(dy,dx);
 c.globalAlpha=fade;
 if(e.kind==='element-water'){
  if(e.variant==='orb'||e.variant==='water-pulse'){
   for(let i=5;i>=0;i--){c.globalAlpha=fade*(1-i*.13);c.fillStyle=i?'#55badd':'#c4f8ff';c.beginPath();c.arc(x-nx*i*8,y-ny*i*8,Math.max(3,16-i*2),0,Math.PI*2);c.fill();}c.strokeStyle='#e4ffff';c.lineWidth=2;for(let i=0;i<2;i++){c.beginPath();c.ellipse(x,y,23,10,angle+t*9+i*Math.PI/2,0,Math.PI*2);c.stroke();}
  }else if(e.variant==='wave'){
   c.save();c.translate(x,y);c.rotate(angle);for(let i=0;i<4;i++){c.globalAlpha=fade*(1-i*.2);c.strokeStyle=i%2?'#d6ffff':'#5dc3e6';c.lineWidth=6-i;c.beginPath();c.ellipse(-i*13,0,16+i*5,37+i*9,0,-1.35,1.35);c.stroke();}c.restore();
  }else{
   const jets=e.variant==='hydro-pump'?[-9,9]:[0];
   c.lineJoin='round';c.lineCap='round';for(const offset of jets){const points=[];for(let i=0;i<=32;i++){const q=i/32;if(q>head)break;const wobble=Math.sin(q*Math.PI*4-t*18)*(2+q*3)+offset;points.push({x:e.from.x+dx*q-ny*wobble,y:e.from.y+dy*q+nx*wobble});}
    for(const [width,color,alpha] of [[15,'#358bc9',.3],[9,'#6dd5f4',.9],[3,'#ecffff',1]]){c.strokeStyle=color;c.lineWidth=width;c.globalAlpha=fade*alpha;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();}
   }
  }
  for(let i=0;i<12;i++){const q=((i/12+t*.9)%1)*head,side=i%2?1:-1,off=side*(8+Math.sin(i+t*15)*4);c.globalAlpha=fade*.7;c.fillStyle='#cdf9ff';c.fillRect(e.from.x+dx*q-ny*off,e.from.y+dy*q+nx*off,2,4);}
  if(t>.42){c.strokeStyle='#c1f7ff';c.lineWidth=2;c.globalAlpha=fade*.65;c.beginPath();c.ellipse(e.to.x,e.to.y+24,14+(t-.42)*80,4+(t-.42)*26,0,0,Math.PI*2);c.stroke();}
 }else if(e.kind==='element-ice'){
  if(e.variant==='wave'){
   for(let i=0;i<17;i++){const q=Math.min(1,Math.max(0,t*2.4-i*.025)),spread=Math.sin(i*2.4+t*2)*(15+q*28),px=e.from.x+dx*q-ny*spread,py=e.from.y+dy*q+nx*spread;shard(c,px,py,4+i%4*2,angle+t*3+i);}
  }else{c.strokeStyle='#8dcef0';c.lineWidth=13;c.globalAlpha=fade*.28;segment(c,e.from,{x,y});c.strokeStyle='#e8ffff';c.lineWidth=3;c.globalAlpha=fade;segment(c,e.from,{x,y});for(let i=0;i<10;i++){const q=((i/10+t*.8)%1)*head;shard(c,e.from.x+dx*q-ny*Math.sin(i*2)*9,e.from.y+dy*q+nx*Math.sin(i*2)*9,6+i%3*3,angle+Math.PI/2);}}
  if(t>.45){const q=Math.min(1,(t-.45)*5);for(let i=0;i<6;i++)shard(c,e.to.x+Math.cos(i*2.4)*q*26,e.to.y+14+Math.sin(i*2.4)*q*12,7+q*9,i*.5);}
 }else if(e.kind==='element-grass'){
  if(e.variant==='beam'){
   for(const [width,color,alpha] of [[23,'#6bca65',.25],[12,'#a8ed77',.8],[4,'#fff8b4',1]]){c.globalAlpha=fade*alpha;c.strokeStyle=color;c.lineWidth=width;segment(c,e.from,{x,y});}
   for(let i=0;i<10;i++){const q=((i/10+t*.9)%1)*head,off=Math.sin(i*2.4+t*14)*15;leaf(c,e.from.x+dx*q-ny*off,e.from.y+dy*q+nx*off,4,angle+t*5+i,i%2?'#b7ec78':'#69ba69');}
  }else{for(let i=0;i<9;i++){const a=i*Math.PI/4.5+t*8,r=16+i%2*6;leaf(c,x+Math.cos(a)*r,y+Math.sin(a)*r*.65,5+i%2,angle+a,'#8ed76c');}c.fillStyle='#e9f8ad';c.globalAlpha=fade*.9;c.beginPath();c.arc(x,y,10,0,Math.PI*2);c.fill();}
 }else{
  // Each type leaves its own short impact signature, while damage stays in the engine.
  const type=e.element||'normal',r=12+t*48;
  for(let i=0;i<10;i++){const a=i*2.4,px=e.to.x+Math.cos(a)*r,py=e.to.y+Math.sin(a)*r*.55-Math.sin(t*Math.PI)*12;c.globalAlpha=fade*(1-t);
   if(type==='grass')leaf(c,px,py,4+i%3,a+t*4,'#9eda70');
   else if(type==='ice')shard(c,px,py,5+i%3,a+t*3);
   else if(type==='water'){c.fillStyle='#b9f5ff';c.beginPath();c.ellipse(px,py,2,4,a,0,Math.PI*2);c.fill();}
   else if(['fairy','steel'].includes(type)){c.strokeStyle=i%2?'#fff8d2':e.color;c.lineWidth=2;segment(c,{x:px-4,y:py},{x:px+4,y:py});segment(c,{x:px,y:py-4},{x:px,y:py+4});}
   else if(['ghost','dark','psychic','poison'].includes(type)){c.strokeStyle=e.color;c.lineWidth=2;c.beginPath();c.ellipse(px,py,3+t*5,4+t*6,a,0,Math.PI*(type==='poison'?2:1.5));c.stroke();}
   else if(['flying','bug'].includes(type)){c.strokeStyle=e.color;c.lineWidth=2;c.beginPath();c.arc(px,py,5+t*8,a,a+1.5);c.stroke();}
   else if(type==='electric'){c.strokeStyle=e.color;c.lineWidth=1.8;c.beginPath();c.moveTo(px-5,py-4);c.lineTo(px+1,py);c.lineTo(px-2,py+3);c.lineTo(px+5,py+6);c.stroke();}
   else{c.fillStyle=i%2?e.color:'#fff1cc';c.fillRect(px,py,type==='rock'||type==='ground'?4:2,type==='fire'?5:3);}
  }
 }
 c.restore();return true;
}
