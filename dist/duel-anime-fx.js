const line=(c,points)=>{c.beginPath();for(const [i,p] of points.entries())i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);c.stroke();};
export function drawDuelAnimeFX(c,e,t,images={}){
 if(!['anime-electric','anime-meteors'].includes(e.kind))return false;
 c.save();const fade=Math.min(1,(1-t)*5),dx=e.to.x-e.from.x,dy=e.to.y-e.from.y,d=Math.max(1,Math.hypot(dx,dy)),nx=dx/d,ny=dy/d;
 if(e.kind==='anime-electric'){
  const progress=Math.min(1,t*2.25),tick=Math.floor(t*22),points=[{...e.from}];
  for(let i=1;i<=18;i++){const q=i/18*progress,j=i===18?0:Math.sin(i*3.71+tick*1.7)*(8+Math.sin(q*Math.PI)*11);points.push({x:e.from.x+dx*q-ny*j,y:e.from.y+dy*q+nx*j});}
  c.globalAlpha=fade*.18;c.strokeStyle='#ffcb3c';c.lineWidth=18;line(c,points);c.globalAlpha=fade;c.strokeStyle='#ffdf63';c.lineWidth=6;line(c,points);c.strokeStyle='#fffde1';c.lineWidth=2;line(c,points);
  for(let i=3;i<16;i+=4){const p=points[i],side=i%2?1:-1;c.strokeStyle='#f9e997';c.lineWidth=1.8;line(c,[p,{x:p.x-ny*side*19+nx*7,y:p.y+nx*side*19+ny*7},{x:p.x-ny*side*36-nx*4,y:p.y+nx*side*36-ny*4}]);}
  if(t>.36){const f=Math.min(1,(t-.36)*8),cx=e.to.x,cy=e.to.y-12;
   c.globalAlpha=fade*.8;c.strokeStyle='#fff3a8';c.lineWidth=2;
   for(let i=0;i<3;i++){const a=i*2.1+t*9,r=32+i*7;line(c,[{x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r},{x:cx+Math.cos(a+.4)*(r+12)*f,y:cy+Math.sin(a+.4)*(r+12)*f},{x:cx+Math.cos(a+.8)*r,y:cy+Math.sin(a+.8)*r}]);}
   if(t>.48&&t<.76){const top={x:cx-35,y:Math.max(106,cy-190)};c.strokeStyle='#ffdf68';c.lineWidth=3;line(c,[top,{x:cx+5,y:cy-118},{x:cx-18,y:cy-99},{x:cx+2,y:cy}]);}
   c.globalAlpha=fade*.25;c.beginPath();c.ellipse(cx,cy+37,18+f*43,5+f*14,0,0,Math.PI*2);c.stroke();
  }
 }else{
  for(let i=0;i<7;i++){
   const delay=[0,.08,.035,.12,.045,.16,.09][i],q=Math.max(0,Math.min(1,(t-delay)*2.1)),end={x:e.to.x+[-52,36,-24,0,61,-42,18][i],y:e.to.y+[8,-22,33,0,18,-13,30][i]},start={x:end.x+[-105,-45,40,-75,50,-20,-50][i],y:Math.max(110,end.y-290-(i%3)*33)},px=start.x+(end.x-start.x)*q,py=start.y+(end.y-start.y)*q,size=i===3?36:19+i%3*4;
   if(t<delay)continue;
   if(q<1){const angle=Math.atan2(end.y-start.y,end.x-start.x);c.save();c.translate(px,py);c.rotate(angle);c.globalAlpha=fade*.55;c.fillStyle=e.color;c.beginPath();c.moveTo(-88,0);c.lineTo(-4,-size*.61);c.lineTo(size*.3,0);c.lineTo(-4,size*.61);c.closePath();c.fill();c.globalAlpha=fade*.85;c.fillStyle='#ffda87';c.beginPath();c.moveTo(-55,0);c.lineTo(-3,-size*.3);c.lineTo(size*.3,0);c.lineTo(-3,size*.3);c.closePath();c.fill();c.restore();
    c.globalAlpha=fade;c.strokeStyle='#ffc37d';c.lineWidth=2;c.beginPath();c.arc(px,py,size*.53,0,Math.PI*2);c.stroke();
    if(images.rock2)c.drawImage(images.rock2,px-size/2,py-size/2,size,size);else{c.fillStyle='#a28f8f';c.beginPath();for(let j=0;j<7;j++){const a=j*Math.PI/3.5,r=size*(j%2?.44:.53);j?c.lineTo(px+Math.cos(a)*r,py+Math.sin(a)*r):c.moveTo(px+Math.cos(a)*r,py+Math.sin(a)*r);}c.closePath();c.fill();}
    c.fillStyle='#ffe7ab';c.globalAlpha=fade*.75;c.fillRect(px-size*.25,py-size*.28,size*.2,size*.17);
   }else{const hit=Math.min(1,(t-delay-.476)*4);if(hit<0)continue;c.globalAlpha=(1-hit)*fade*.5;c.strokeStyle=e.color;c.lineWidth=2;c.beginPath();c.ellipse(end.x,end.y+21,10+hit*36,3+hit*12,0,0,Math.PI*2);c.stroke();for(let j=0;j<5;j++){const a=j*2.4;c.fillStyle=j%2?'#cfb897':e.color;c.fillRect(end.x+Math.cos(a)*hit*37,end.y+18+Math.sin(a)*hit*13-Math.sin(hit*Math.PI)*17,3,3);}}
  }
 }
 c.restore();return true;
}
