export function duelDashSound(audio,gain=.7){if(typeof audio.dash==='function')audio.dash(gain);else if(typeof audio.cue==='function')audio.cue('whoosh',gain);else audio.sfx?.('flying','dash');}
export function playDuelAction(view,p,action,desired){
 p.action=action;p.animKey=null;p.gbaAnimKey=null;
 const anims=view.pmd?.[p.formKey||p.id]?.anims,anim=anims?.[action]||(action==='Shoot'?anims?.SpAttack:null);
 const native=Math.max(50,view.style!=='gba'&&anim?anim.durations.slice(0,anim.hit||1).reduce((a,b)=>a+b,0)/60*1000:view.attackDelay(p,action)||120);p.duelAnimRate=Math.max(1,native/desired);
 return native/p.duelAnimRate;
}
export function drawDuelReaction(c,e,t,view){
 if(!['brace-ground','skid-ground','claw-followthrough'].includes(e.kind))return false;
 if(!view.cinematic&&e.kind!=='claw-followthrough')return true;
 c.save();const fade=Math.min(1,(1-t)*4),dx=e.to.x-e.from.x,dy=e.to.y-e.from.y,d=Math.max(1,Math.hypot(dx,dy)),nx=dx/d,ny=dy/d;
 if(e.kind==='claw-followthrough'){
  c.translate(e.to.x,e.to.y-9);c.rotate(Math.atan2(dy,dx));
  for(let i=0;i<3;i++){c.globalAlpha=fade*(1-i*.14);c.strokeStyle=i===1?'#fff7dd':e.color;c.lineWidth=i===1?3:2;c.beginPath();c.ellipse(-5+i*5,0,20+i*4,27+i*5,-.32,-1.5+t*1.1,.3+t*1.1);c.stroke();}
 }else if(e.kind==='brace-ground'){
  c.strokeStyle='#b7bbab';c.globalAlpha=fade*.5;c.lineWidth=2;
  for(const side of [-1,1]){c.beginPath();c.moveTo(e.to.x+side*10,e.to.y+23);c.lineTo(e.to.x+side*16,e.to.y+29);c.stroke();}
  for(let i=0;i<5;i++){c.fillStyle='#c4b799';c.globalAlpha=fade*.3;c.fillRect(e.to.x+(i-2)*9,e.to.y+24-Math.sin(t*Math.PI)*8,3+t*3,2+t*2);}
 }else{
  const q=1-(1-t)**3,x=e.from.x+dx*q,y=e.from.y+dy*q+22;
  c.strokeStyle='#8c947e';c.globalAlpha=fade*.35;c.lineWidth=1.5;
  for(const side of [-1,1]){c.beginPath();c.moveTo(e.from.x-ny*side*8,e.from.y+22+nx*side*8);c.lineTo(x-ny*side*8,y+nx*side*8);c.stroke();}
  for(let i=0;i<8;i++){const r=i*2.4;c.globalAlpha=fade*.3;c.fillStyle=i%2?'#bcb69a':'#ded0a8';c.fillRect(x-nx*i*3+Math.sin(r)*12,y-ny*i*3+Math.cos(r)*4-t*8,3+t*5,2+t*3);}
 }
 c.restore();return true;
}
