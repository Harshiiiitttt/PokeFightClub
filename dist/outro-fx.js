const clamp=v=>Math.max(0,Math.min(1,v)),TAU=Math.PI*2;
export function drawRaidOutro(c,back,view){
 const s=view.outroState;if(!s)return;const elapsed=Math.max(0,view.outroTime-s.phaseStarted),collapse=clamp(elapsed/1.2);
 if(s.snapshot&&['impact','collapse'].includes(s.phase)){
  const d=s.snapshot,t=s.phase==='impact'?0:collapse,r=d.rect;c.save();c.globalAlpha=1-clamp((t-.6)/.4);c.translate(r.x+r.width/2,r.y+r.height/2+t*26);c.rotate(t*.85);c.scale(1-t*.12,1-t*.12);c.drawImage(d.canvas.native||d.canvas,-r.width/2,-r.height/2,r.width,r.height);c.restore();
 }
 if(s.phase==='collapse'){
  if(!s.bossWin)view.vortexSuppression=collapse;
  back.save();const pos=s.snapshot?.pos||{x:270,y:320};if(!s.bossWin){back.strokeStyle='#dc7fa6';back.lineWidth=3;for(let i=0;i<4;i++){back.globalAlpha=(1-collapse)*.6;back.beginPath();back.ellipse(pos.x,pos.y,Math.max(1,(180-i*28)*(1-collapse)),Math.max(1,(95-i*14)*(1-collapse)),collapse*3,0,TAU);back.stroke()}}
  for(let i=0;i<24;i++){back.globalAlpha=(1-collapse)*.25;back.fillStyle='#cbbdaf';back.fillRect(pos.x+Math.sin(i*2.4)*collapse*110,pos.y+25+Math.cos(i*2.4)*collapse*35,4+collapse*7,3)}back.restore();
 }
 if(['pose','title','hold'].includes(s.phase)){
  back.save();const glow=back.createRadialGradient(270,490,25,270,490,340);glow.addColorStop(0,s.bossWin?'#ab1c5533':'#ffdf9330');glow.addColorStop(1,'#121b3000');back.fillStyle=glow;back.fillRect(0,170,540,620);
  if(!s.bossWin)for(let i=0;i<50;i++){const a=i*TAU/50+view.outroTime*.055,x=270+Math.cos(a)*205,y=475+Math.sin(a)*160;back.globalAlpha=.2+.15*Math.sin(i+view.outroTime);back.fillStyle=i%3?'#ffe6a4':'#a4e3ff';back.fillRect(x,y,2,2)}
  else{back.globalAlpha=.2;back.strokeStyle='#d74d86';back.lineWidth=2;for(const x of [145,270,395]){back.beginPath();back.ellipse(x,700,35,12,0,0,TAU);back.stroke()}}back.restore();
 }
 if(['title','hold'].includes(s.phase)){
  const fade=s.phase==='title'?clamp(elapsed/.5):1;c.save();c.globalAlpha=fade;c.fillStyle='#101726ed';c.fillRect(34,635,472,88);c.strokeStyle=s.bossWin?'#f08caf':'#f0d28a';c.lineWidth=2;c.strokeRect(34,635,472,88);c.textAlign='center';c.fillStyle='#eee0b9';c.font='bold 11px monospace';c.fillText(s.bossWin?'THE BOSS STILL STANDS':'THE WILL OF THE 50 ENDURES',270,658,440);c.fillStyle='#fff5dc';c.font='bold 21px monospace';c.fillText(s.name+' WINS',270,695,440);c.restore();
 }
}
