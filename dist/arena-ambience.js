export function drawArenaAmbience(c,mood,time,enabled=true,vortex=null,suppression=0){if(!enabled)return;c.save();const mod=(n,d)=>(n%d+d)%d;
 if(vortex){
  const vColor=/^#[0-9a-f]{6}$/i.test(vortex)?vortex:vortex==='eternamax'?'#ff2968':vortex==='arceus'?'#ffe373':vortex==='necrozma'?'#fff294':vortex==='rayquaza'?'#52f2a8':'#6ef596';
  c.save();
  c.translate(0,-suppression*170);
  c.globalAlpha=(.18+.06*Math.sin(time*3))*(1-suppression*.85);
  const g=c.createRadialGradient(270,480,30,270,480,460);
  g.addColorStop(0,vColor);
  g.addColorStop(.55,'#1a071bcc');
  g.addColorStop(1,'#09030eff');
  c.fillStyle=g;
  c.fillRect(0,0,540,960);
  c.strokeStyle=vColor;
  c.lineWidth=2;
  for(let r=0;r<4;r++){
   c.globalAlpha=(.24-r*.04)*(1-suppression*.85);
   c.beginPath();
   const rad=85+r*55+Math.sin(time*2.5+r)*8;
   c.ellipse(270,480,rad,rad*.75,time*(r%2?-.7:.9),0,Math.PI*2);
   c.stroke();
  }
  c.restore();
 }
 if(mood==='tide'){c.strokeStyle='#a5f1e0';c.lineWidth=2;c.globalAlpha=.25;for(const x of [50,490])for(let i=0;i<18;i++){const y=mod(i*63+time*20,960);c.beginPath();c.ellipse(x,y,7+Math.sin(time*2+i)*3,18,0,0,Math.PI*2);c.stroke()}}
 if(mood==='eclipse'){c.fillStyle='#dddbff';for(let i=0;i<30;i++){c.globalAlpha=.1+Math.max(0,Math.sin(time+i*3))*.25;c.fillRect(40+i*127%460,180+i*89%600,2,2)}c.globalAlpha=.09;c.strokeStyle='#d4c295';c.lineWidth=2;c.beginPath();c.arc(270,480,150+Math.sin(time)*6,0,Math.PI*2);c.stroke()}
 if(mood==='crowd'){for(const x of [21,512])for(let i=0;i<18;i++){c.globalAlpha=.2+Math.max(0,Math.sin(time*3+i))*.2;c.fillStyle=i%2?'#ffe3a0':'#c0dfff';c.fillRect(x,120+i*42,3,3)}}
 if(mood==='storm'||mood==='aether'||mood==='fireflies'||mood==='crystal'){
  const tColor=mood==='storm'?'#ffec78':mood==='aether'?'#df94ff':mood==='fireflies'?'#8bf093':'#ffb8ec';
  c.save();
  c.strokeStyle=tColor;
  c.lineWidth=1.5;
  c.globalAlpha=.14+.05*Math.sin(time*2.2);
  c.beginPath();
  c.ellipse(270,515,195,125,0,0,Math.PI*2);
  c.stroke();
  c.beginPath();
  c.ellipse(270,515,135,85,0,0,Math.PI*2);
  c.stroke();
  c.restore();
 }
 if(mood==='snow'||mood==='storm'){const rain=mood==='storm';c.strokeStyle='#b5d2ef';for(let i=0;i<(rain?55:42);i++){const x=mod(i*137.7-time*(rain?42:14),540),y=mod(i*223.1+time*(rain?320:34),960);c.globalAlpha=rain?.16:.25+(i%3)*.1;if(rain){c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x-4,y+17);c.stroke()}else{c.fillStyle='#defaff';c.fillRect(x+Math.sin(time+i)*5,y,1+i%3,1+i%3)}}if(rain){const phase=time%11,flash=Math.max(0,1-Math.abs(phase-6.4)*9);if(flash>0){c.globalAlpha=flash*.065;c.fillStyle='#e7ecff';c.fillRect(0,0,540,960);c.globalAlpha=flash*.35;c.strokeStyle='#c6d5ff';c.beginPath();c.moveTo(485,145);c.lineTo(474,183);c.lineTo(490,179);c.lineTo(478,219);c.stroke()}}}
 else if(mood==='aether'){c.strokeStyle='#99f9ef';c.lineWidth=1;c.globalAlpha=.07+.025*Math.sin(time*1.6);c.beginPath();c.arc(270,480,123,0,Math.PI*2);c.stroke();for(let i=0;i<22;i++){const a=time*.18+i*2.4,r=50+(i*29)%130;c.globalAlpha=.15+.15*Math.sin(time*2+i);c.fillStyle=i%2?'#addbff':'#a0e8e4';c.fillRect(270+Math.cos(a)*r,480+Math.sin(a)*r,2,2)}}
 else if(mood==='crystal'){for(const x of [52,488])for(const y of [195,390,595,780]){const light=Math.max(0,Math.sin(time*1.3+y*.01+x));c.globalAlpha=light*.35;c.fillStyle='#e4d8ff';c.fillRect(x-6,y-2,13,2);c.fillRect(x,y-8,2,13)}}
 else if(mood==='embers'){c.save();c.globalAlpha=.07+.03*Math.sin(time*1.8);c.fillStyle='#ff933b';c.fillRect(0,0,540,960);c.restore();for(let i=0;i<25;i++){const x=45+(i*83)%450+Math.sin(time+i)*12,y=mod(940+i*101-time*(18+i%4*5),960);c.globalAlpha=.15+(i%3)*.12;c.fillStyle=i%2?'#ffbd66':'#f4874b';c.fillRect(x,y,2,2)}}
 else if(mood==='fireflies'){for(let i=0;i<17;i++){const x=50+(i*139)%440+Math.sin(time*.5+i)*18,y=180+(i*107)%620+Math.cos(time*.7+i)*10;c.globalAlpha=.12+.18*Math.sin(time*1.8+i);c.fillRect(x,y,2,2)}}
 else{c.fillStyle='#e8cf9c';c.globalAlpha=.22;for(let i=0;i<26;i++)c.fillRect(mod(i*139+time*42,540),mod(i*207-time*12,960),2,2)}c.restore();}
