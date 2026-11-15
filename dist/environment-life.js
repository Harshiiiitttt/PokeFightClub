const mod=(n,d)=>(n%d+d)%d;
const stroke=(c,points)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
export function queueArenaReaction(view,pos,color,strength){
 if(!view.cinematic)return;
 const power=typeof strength==='boolean'?(strength?1:.3):strength;
 if(power<.5)return;
 const list=view.arenaReactions||(view.arenaReactions=[]),now=view.clock||0;
 // Swarm hits within the same patch share a ground response.
 if(list.some(e=>now-e.start<.15&&Math.hypot(e.x-pos.x,e.y-pos.y)<65))return;
 list.push({x:pos.x,y:pos.y+26,color,power,start:now});
 if(list.length>12)list.shift();
}
export function drawEnvironmentLife(c,mood,time,enabled=true,reactions=[]){
 if(!enabled)return;
 c.save();
 const forest=mood==='fireflies',water=mood==='tide',cold=mood==='snow',hot=mood==='embers',magic=['aether','eclipse','crystal'].includes(mood);
 // Low ground haze at the margins; the centre and HUD remain readable.
 for(const side of [0,1])for(let i=0;i<4;i++){
  const x=side?505:35,y=230+i*158+Math.sin(time*.35+i)*17;
  c.globalAlpha=.055+.018*Math.sin(time*.7+i);c.fillStyle=cold?'#d3f2ff':hot?'#dc845c':forest?'#a4c8ae':'#c3ccda';
  c.beginPath();c.ellipse(x+Math.sin(time*.4+i)*19,y,55+Math.sin(time*.5+i)*14,14,0,0,Math.PI*2);c.fill();
 }
 if(forest){
  for(let i=0;i<14;i++){
   const x=mod(i*137+time*(16+i%3*4)+Math.sin(time+i)*14,540),y=160+mod(i*91+time*(12+i%4),650);
   c.save();c.translate(x,y);c.rotate(Math.sin(time+i)*.8+i);c.globalAlpha=.42;c.fillStyle=i%3?'#93b35a':'#ceb866';
   c.beginPath();c.moveTo(-5,0);c.quadraticCurveTo(0,-5,6,0);c.quadraticCurveTo(0,4,-5,0);c.fill();c.restore();
  }
  c.strokeStyle='#659064';c.lineWidth=2;c.globalAlpha=.38;
  for(const x of [31,509])for(let i=0;i<8;i++){const y=195+i*79,bend=Math.sin(time*1.6+i)*4;stroke(c,[[x-4,y],[x+bend-2,y-11],[x,y],[x+bend+5,y-9]]);}
 }else if(water){
  c.strokeStyle='#c0f9f0';c.lineWidth=2;
  for(const side of [0,1])for(let i=0;i<5;i++){const phase=mod(time*.23+i*.21,1),x=side?508-phase*20:32+phase*20,y=200+i*143;
   c.globalAlpha=Math.sin(phase*Math.PI)*.28;c.beginPath();for(let j=0;j<8;j++){const yy=y+j*9,xx=x+Math.sin(j*.8+time*2+i)*4;j?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();}
 }else if(hot){
  c.strokeStyle='#ffb86d';c.lineWidth=1;
  for(const x of [38,502])for(let i=0;i<5;i++){c.globalAlpha=.1;c.beginPath();for(let j=0;j<9;j++){const y=220+i*125-j*5,xx=x+Math.sin(time*3+j*.9+i)*5;j?c.lineTo(xx,y):c.moveTo(xx,y);}c.stroke();}
 }else if(magic){
  c.strokeStyle=mood==='eclipse'?'#e8b8ff':'#b8e7ff';c.lineWidth=1;
  for(const x of [48,492])for(let i=0;i<6;i++){const y=200+i*109+Math.sin(time*.8+i)*8,pulse=Math.max(0,Math.sin(time*1.2+i));c.globalAlpha=pulse*.3;
   stroke(c,[[x-4,y],[x,y-6],[x+4,y],[x,y+6],[x-4,y]]);}
 }else if(mood==='crowd'){
  for(const side of [0,1]){c.globalAlpha=.035;c.fillStyle='#d3e9ff';const x=side?520:20,sweep=Math.sin(time*.4+(side?2:0))*65;
   c.beginPath();c.moveTo(x,160);c.lineTo(x-38+sweep,800);c.lineTo(x+38+sweep,800);c.closePath();c.fill();}
 }else{
  c.strokeStyle=cold?'#e4f8ff':'#d8c8a5';c.lineWidth=1;
  for(let i=0;i<10;i++){const x=mod(i*113+time*(cold?28:45),640)-50,y=210+i*63;
   c.globalAlpha=.15;stroke(c,[[x,y],[x+20,y-2],[x+37,y]]);}
 }
 for(const e of reactions){
  const age=time-e.start;if(age<0||age>4.5)continue;
  const t=Math.min(1,age/1.15),fade=1-t,heavy=e.power>=.75;
  if(t<1){const light=c.createRadialGradient(e.x,e.y,8,e.x,e.y,heavy?145:85);light.addColorStop(0,e.color);light.addColorStop(1,'#00000000');c.fillStyle=light;c.globalAlpha=fade*.13;c.fillRect(e.x-145,e.y-145,290,290);}
  if(heavy&&!water){
   c.globalAlpha=Math.max(0,1-age/4.5)*.26;c.strokeStyle=cold?'#def7ff':'#211d29';c.lineWidth=1.5;
   for(let i=0;i<5;i++){const a=i*2.4+.3,r=18+Math.min(1,age*5)*27;
    stroke(c,[[e.x,e.y],[e.x+Math.cos(a)*r*.5,e.y+Math.sin(a)*r*.25],[e.x+Math.cos(a+.16)*r,e.y+Math.sin(a+.16)*r*.5]]);}
  }
  if(t>=1)continue;
  c.strokeStyle=water?'#c8ffff':cold?'#e3fbff':e.color;c.lineWidth=1.5;c.globalAlpha=fade*.32;
  c.beginPath();c.ellipse(e.x,e.y,18+t*(heavy?126:70),5+t*(heavy?38:23),0,0,Math.PI*2);c.stroke();
  for(let i=0;i<(heavy?14:7);i++){const a=i*2.4,r=12+t*(25+(i%5)*12),x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r*.4-Math.sin(t*Math.PI)*(12+i%4*5);
   c.globalAlpha=fade*.5;c.fillStyle=water?'#b6f2ff':cold?'#e6ffff':forest?'#91a55b':hot?'#ffac60':'#b7a58c';
   c.fillRect(Math.round(x),Math.round(y),i%3+2,water?5:3);
  }
 }
 c.restore();
}
