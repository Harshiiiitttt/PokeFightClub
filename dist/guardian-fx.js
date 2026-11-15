const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v));
export function drawGuardianFx(c,e,t,images={}){
 if(!['soul-gather','summon-rune','sky-pillar','landing-crater','guardian-cutin','guardian-dawn','awakening-helix','guardian-pulse','guardian-rollcall','landing-dust','boss-reaction','clash-ground'].includes(e.kind))return false;
 c.save();const fade=clamp((1-t)*5);c.globalAlpha=fade;
 if(e.kind==='landing-dust'){
  for(let i=0;i<12;i++){const a=i*TAU/12,r=12+t*(45+i%3*9);c.globalAlpha=fade*(1-t)*.4;c.fillStyle=i%2?'#d5cbb8':'#a69c8b';const size=4+t*7;c.fillRect(e.to.x+Math.cos(a)*r-size/2,e.to.y+30+Math.sin(a)*r*.28-Math.sin(t*Math.PI)*8,size,size*.65)}
 }else if(e.kind==='clash-ground'){
  for(const p of [e.boss,...e.guardians]){const pos=p.pos,dir=p===e.boss?-1:1;c.globalAlpha=fade*.65;c.strokeStyle='#121521';c.lineWidth=2;for(const side of [-1,1]){c.beginPath();c.moveTo(pos.x+side*18,pos.y+27);c.lineTo(pos.x+side*24,pos.y+27+dir*(10+t*25));c.lineTo(pos.x+side*30,pos.y+27+dir*(18+t*45));c.stroke()}for(let i=0;i<4;i++){c.globalAlpha=.28*fade;c.fillStyle='#d4c8b3';c.fillRect(pos.x-24+i*14,pos.y+26+Math.sin(t*30+i)*4,4,3)}}
 }else if(e.kind==='boss-reaction'){
  const pop=clamp(t*9)*clamp((1-t)*7);c.globalAlpha=pop;c.fillStyle='#090f21f2';c.fillRect(26,195,488,180);c.strokeStyle=e.color;c.lineWidth=2;c.strokeRect(26,195,488,180);
  c.save();c.beginPath();c.rect(28,197,484,176);c.clip();c.strokeStyle=e.color;c.globalAlpha=pop*.3;for(let i=0;i<16;i++){c.beginPath();c.moveTo(25,200+i*12);c.lineTo(515,190+i*12);c.stroke()}c.globalAlpha=pop;
  const portrait=e.portrait?.native||e.portrait;if(portrait){const d=e.portrait.dataset||{},w=+d.bodyWidth||96,h=+d.bodyHeight||100,x=(portrait.width-w)/2,y=portrait.height/2+(+d.bodyTop||-60),scale=Math.min(270/w,138/h);c.imageSmoothingEnabled=false;c.drawImage(portrait,x,y,w,h,270-w*scale/2,210,w*scale,h*scale)}
  c.fillStyle='#ffe9ad';c.textAlign='center';c.font='bold 12px monospace';c.fillText(e.name||'THE BOSS REACTS',270,363,450);c.font='bold 33px monospace';c.fillText('!',440,245);c.restore();
 }else if(e.kind==='guardian-pulse'){
  c.globalAlpha=fade*(1-t)*.55;c.strokeStyle=e.color;c.shadowColor=e.color;c.shadowBlur=7;c.lineWidth=2;for(let i=0;i<2;i++){const r=20+t*(80+i*15);c.beginPath();c.ellipse(e.to.x,e.to.y+29,r,r*.27,0,0,TAU);c.stroke()}
 }else if(e.kind==='guardian-rollcall'){
  for(const g of e.guardians){const x=g.pos.x,y=g.pos.y+45;c.globalAlpha=fade;c.fillStyle='#0d1628e8';c.fillRect(x-92,y-10,184,22);c.strokeStyle=g.color||'#ffe599';c.lineWidth=1;c.strokeRect(x-92,y-10,184,22);c.fillStyle='#fff2c5';c.font='bold 11px monospace';c.textAlign='center';c.fillText(g.name,x,y+5,174)}
 }else if(e.kind==='soul-gather'){
  for(let i=0;i<50;i++){const q=clamp((t-(i%10)*.018)/.8),source=e.points[i],dest=e.targets[i%3],a=q*TAU*2+i,r=(1-q)*42,x=source.x+(dest.x-source.x)*q+Math.sin(a)*r,y=source.y+(dest.y-source.y)*q-Math.sin(q*Math.PI)*190+Math.cos(a)*r*.4;
   c.globalAlpha=clamp(q*12)*clamp((1-q)*12);c.fillStyle=e.colors[i%3];c.shadowColor=c.fillStyle;c.shadowBlur=14;c.beginPath();c.arc(x,y,3+(i%3),0,TAU);c.fill();c.fillStyle='#fff8da';c.fillRect(x-1,y-1,2,2);
  }
 }else if(e.kind==='summon-rune'){
  c.translate(e.to.x,e.to.y+18);c.scale(1,.42);c.strokeStyle=e.color;c.shadowColor=e.color;c.shadowBlur=16;c.lineWidth=2;c.globalAlpha=fade*(.5+clamp(t*12)*.5);
  for(const radius of [42,55]){c.beginPath();c.arc(0,0,radius,0,TAU);c.stroke()}
  c.rotate(t*TAU*.45);for(let i=0;i<8;i++){c.rotate(TAU/8);c.strokeRect(-3,-50,6,9)}c.beginPath();for(let i=0;i<6;i++){const a=i*TAU/5-Math.PI/2;i?c.lineTo(Math.cos(a)*31,Math.sin(a)*31):c.moveTo(Math.cos(a)*31,Math.sin(a)*31)}c.stroke();c.fillStyle=e.color;c.font='bold 22px monospace';c.textAlign='center';c.fillText(e.index===2?'✦':e.index===0?'△':'◊',0,7);
 }else if(e.kind==='awakening-helix'){
  c.translate(e.to.x,e.to.y);c.shadowColor=e.color;c.shadowBlur=12;for(let side=0;side<2;side++){c.strokeStyle=side?'#ffe6a3':e.color;c.lineWidth=3;c.beginPath();for(let j=0;j<=45;j++){const y=-j*3,x=Math.sin(j*.25+t*TAU*2+side*Math.PI)*(32*(1-t)+10);j?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}
 }else if(e.kind==='sky-pillar'){
  const progress=clamp(t*4),width=e.leader?95:65,y=-170+(e.to.y+170)*progress;
  const gradient=c.createLinearGradient(e.to.x-width,0,e.to.x+width,0);gradient.addColorStop(0,'#ffffff00');gradient.addColorStop(.25,e.color+'99');gradient.addColorStop(.5,'#fffceeff');gradient.addColorStop(.75,e.color+'99');gradient.addColorStop(1,'#ffffff00');c.fillStyle=gradient;c.fillRect(e.to.x-width,-170,width*2,y+170);
  c.strokeStyle=e.leader?'#ffe7a0':e.color;c.lineWidth=e.leader?4:2;for(let i=0;i<9;i++){const x=e.to.x+(i-4)*width/5,z=(t*1300+i*87)%(e.to.y+170)-170;c.beginPath();c.moveTo(x,z);c.lineTo(x,z+65);c.stroke()}
  c.translate(e.to.x,e.to.y);c.strokeStyle=e.color;c.lineWidth=3;
  if(['water','ghost','psychic'].includes(e.element)){for(let i=0;i<3;i++){c.beginPath();c.ellipse(0,-i*100,35+t*65,9+t*12,t*3,0,TAU);c.stroke()}}
  else{for(let i=0;i<7;i++){const a=i*TAU/7;c.beginPath();c.moveTo(Math.cos(a)*30,10);c.lineTo(Math.cos(a+.2)*75,-30-i%3*12);c.lineTo(Math.cos(a)*48,4);c.stroke()}}
 }else if(e.kind==='landing-crater'){
  c.translate(e.to.x,e.to.y+20);c.strokeStyle='#120e20';c.lineWidth=4;for(let i=0;i<9;i++){const a=i*TAU/9,r=35+t*65;c.beginPath();c.moveTo(Math.cos(a)*15,Math.sin(a)*8);c.lineTo(Math.cos(a+.1)*r*.6,Math.sin(a+.1)*r*.3);c.lineTo(Math.cos(a)*r,Math.sin(a)*r*.5);c.stroke()}c.strokeStyle=e.color;c.lineWidth=3;c.beginPath();c.ellipse(0,0,20+t*130,6+t*45,0,0,TAU);c.stroke();
 }else if(e.kind==='guardian-dawn'){
  const r=60+t*800;c.strokeStyle=e.color;c.shadowColor=e.color;c.shadowBlur=22;c.lineWidth=15*(1-t)+2;c.beginPath();c.ellipse(270,730,r,r*.8,0,0,TAU);c.stroke();const glow=c.createLinearGradient(0,400,0,960);glow.addColorStop(0,'#ffe59900');glow.addColorStop(1,'#ffe59955');c.fillStyle=glow;c.fillRect(0,400,540,560);for(let i=0;i<50;i++){c.fillStyle=i%2?'#fff4bb':'#efb955';c.fillRect(30+i*97%480,900-(i*51+t*260)%440,2,5)}
 }else if(e.kind==='guardian-cutin'){
  const slide=t<.14?(1-t/.14)*650:t>.85?-(t-.85)/.15*650:0;c.translate(slide,0);c.fillStyle='#080a17';c.fillRect(-30,378,600,192);
  for(let i=0;i<3;i++){const g=e.guardians[i],left=i*180;c.save();c.beginPath();c.moveTo(left+14,386);c.lineTo(left+194,386);c.lineTo(left+166,562);c.lineTo(left-14,562);c.closePath();c.clip();c.fillStyle=g.color||'#aaf';c.fillRect(left-20,386,220,176);c.globalAlpha=.8;c.fillStyle='#10162c';c.fillRect(left-20,386,220,176);c.globalAlpha=1;c.strokeStyle=g.color;for(let j=0;j<12;j++){c.beginPath();c.moveTo(left-20,390+j*15);c.lineTo(left+210,370+j*15);c.stroke()}const portrait=images[g.portraitKey];if(portrait){c.imageSmoothingEnabled=false;c.drawImage(portrait,left+25,398,130,130)}else{c.fillStyle=g.color;c.font='bold 45px monospace';c.textAlign='center';c.fillText('✦',left+90,466)}c.fillStyle='#fff6ce';c.font='bold 11px monospace';c.textAlign='center';c.fillText(g.name,left+88,548,160);c.restore();}
  c.strokeStyle='#ffe9a1';c.lineWidth=3;c.beginPath();c.moveTo(0,385);c.lineTo(540,385);c.moveTo(0,564);c.lineTo(540,564);c.stroke();
 }
 c.restore();return true;
}
