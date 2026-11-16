import {trainerPortrait,trainerFor} from './trainer-rosters.js?v=32';
import {visibleBounds} from './sprite-layout.js?v=32';
const clamp=n=>Math.max(0,Math.min(1,n)),TAU=Math.PI*2;
const easeOut=t=>1-(1-clamp(t))**3;
const TEAM=[{fill:'#59468c',dark:'#2c2150',glow:'#b9a4ff',accent:'#efb0a2'},{fill:'#a54d2e',dark:'#4e2112',glow:'#ffbf8a',accent:'#9acbe9'}];
const PANELS=[[[-20,174],[334,174],[260,450],[-20,450]],[[316,529],[560,529],[560,805],[242,805]]];
function portrait(c,image,box){if(!image)return;const b=visibleBounds(image,{x:0,y:0,width:image.width,height:image.height}),s=Math.min(box.w/b.width,box.h/b.height),w=b.width*s,h=b.height*s;c.imageSmoothingEnabled=false;c.drawImage(image,b.x,b.y,b.width,b.height,box.x+(box.w-w)/2,box.y+box.h-h,w,h);}
function panelPath(c,team){const pts=PANELS[team];c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.closePath();}
function rand(seed){const x=Math.sin(seed*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function ball(c,x,y,r,on){c.save();c.lineWidth=1.5;c.strokeStyle='#121621';c.fillStyle=on?'#e8473f':'#5b6070';c.beginPath();c.arc(x,y,r,Math.PI,0);c.fill();c.fillStyle=on?'#f6f1e6':'#8a8f9c';c.beginPath();c.arc(x,y,r,0,Math.PI);c.fill();c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();c.beginPath();c.moveTo(x-r,y);c.lineTo(x+r,y);c.stroke();c.fillStyle='#f6f1e6';c.beginPath();c.arc(x,y,r*.34,0,TAU);c.fill();c.stroke();c.restore();}
// Jagged lightning seam along the diagonal that separates the two trainer panels.
function lightning(c,age,alpha){const seed=Math.floor(age*22),from={x:352,y:104},to={x:206,y:900},n=18;c.save();c.globalAlpha=alpha;c.lineJoin='round';c.lineCap='round';
 for(const [width,color,blur] of [[10,'#ffe9a0',14],[4,'#fff7d6',6],[2,'#ffffff',0]]){c.strokeStyle=color;c.lineWidth=width;c.shadowColor='#ffd76a';c.shadowBlur=blur;c.beginPath();for(let i=0;i<=n;i++){const t=i/n,j=i===0||i===n?0:(rand(seed*31+i)-.5)*46;const x=from.x+(to.x-from.x)*t+j,y=from.y+(to.y-from.y)*t;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
 c.shadowBlur=0;c.strokeStyle='#fff3c4';c.lineWidth=1.5;for(let k=0;k<5;k++){const t=.12+rand(seed+k*7)*.76,x=from.x+(to.x-from.x)*t,y=from.y+(to.y-from.y)*t,dir=rand(seed+k)>.5?1:-1;c.beginPath();c.moveTo(x,y);let px=x,py=y;for(let s=0;s<4;s++){px+=dir*(10+rand(seed+k*3+s)*16);py+=(rand(seed+s*5+k)-.3)*22;c.lineTo(px,py);}c.stroke();}
 c.restore();}
export function drawDramaticTrainerIntro(c,view){
 const s=view.matchIntro;if(!s)return;const age=view.presentationTime-s.start,moving=view.cinematic;
 const slideA=moving?(1-easeOut(age/.5))*380:0,slideB=moving?(1-easeOut((age-.12)/.5))*380:0,stamp=moving?clamp((age-.8)/.22):1,fade=moving?clamp((s.duration-age)/.3):1;
 const shake=moving&&age>.8&&age<1.15?(1-(age-.8)/.35)*7:0,sx=shake*Math.sin(age*93),sy=shake*Math.cos(age*71);
 c.save();c.globalAlpha=fade;c.translate(sx,sy);
 // Backdrop: split team-coloured halves with racing speed lines.
 const bg=c.createLinearGradient(0,100,0,960);bg.addColorStop(0,'#120d24f2');bg.addColorStop(.5,'#07101cf0');bg.addColorStop(1,'#1f0c08f2');c.fillStyle=bg;c.fillRect(-10,0,560,960);
 const time=moving?age:1.4;
 for(let i=0;i<20;i++){const team=i%2,y=team?520+rand(i)*300:150+rand(i)*320,len=60+rand(i+9)*140,speed=700+rand(i+3)*600,span=540+len*2,x=team?540+len-((time*speed+rand(i+5)*span)%span):-len+((time*speed+rand(i+5)*span)%span);c.globalAlpha=fade*(.08+rand(i+2)*.14);c.fillStyle=TEAM[team].glow;c.fillRect(x,y,len,1+rand(i+4)*2.2);}
 c.globalAlpha=fade;
 c.textAlign='center';c.fillStyle='#d8cda9';c.font='700 13px "Space Grotesk",Inter,sans-serif';const topTag=view.cupState?.active?`CHAMPION CUP · ${view.cupState.stageLabel}`:'PokeFightClub · FULL TRAINER BATTLE';c.fillText(topTag,270,137);
 c.fillStyle='#d8cda955';c.fillRect(150,145,240,1);
 for(const team of [0,1]){
  const shift=team?slideB:-slideA,col=TEAM[team],box=team?{x:370,y:550,w:138,h:182}:{x:31,y:194,w:138,h:182};c.save();c.translate(shift,0);
  const grad=c.createLinearGradient(team?560:-20,0,team?242:334,0);grad.addColorStop(0,col.dark);grad.addColorStop(1,col.fill);c.fillStyle=grad;panelPath(c,team);c.fill();
  c.save();panelPath(c,team);c.clip();c.globalAlpha=.1;c.strokeStyle='#ffffff';c.lineWidth=1;for(let k=-10;k<30;k++){const y0=team?529:174;c.beginPath();c.moveTo(-40+k*22,y0+290);c.lineTo(40+k*22,y0-10);c.stroke();}
  const shine=moving?clamp((age-.45)/.5):1;if(shine>0&&shine<1){c.globalAlpha=.35*(1-shine);const sx0=-120+shine*720;const sg=c.createLinearGradient(sx0,0,sx0+90,0);sg.addColorStop(0,'#ffffff00');sg.addColorStop(.5,'#ffffff');sg.addColorStop(1,'#ffffff00');c.fillStyle=sg;c.fillRect(sx0,0,90,960);}c.restore();
  c.strokeStyle='#151323';c.lineWidth=5;panelPath(c,team);c.stroke();c.strokeStyle=col.glow;c.lineWidth=1.5;c.globalAlpha=.6;panelPath(c,team);c.stroke();c.globalAlpha=1;
  c.fillStyle=team?'#b5d6e0':'#91b4d0';c.fillRect(box.x-4,box.y-4,box.w+8,box.h+8);const inner=c.createLinearGradient(0,box.y,0,box.y+box.h);inner.addColorStop(0,team?'#d7eef4':'#b9d2e6');inner.addColorStop(1,team?'#7fa9bb':'#6283a8');c.fillStyle=inner;c.fillRect(box.x,box.y,box.w,box.h);
  c.strokeStyle='#131c2c';c.lineWidth=5;c.strokeRect(box.x-4,box.y-4,box.w+8,box.h+8);portrait(c,trainerPortrait(view,team),box);
  c.fillStyle=col.accent;c.font='800 10px "Space Grotesk",Inter,sans-serif';c.textAlign='center';c.fillText(team?'CHALLENGER':'TRAINER',box.x+box.w/2,box.y-10);
  const count=s.lineups?.[team]?.length||6,bx=team?322:204,by=team?612:236;for(let k=0;k<count;k++){const pop=moving?easeOut((age-.55-k*.06)/.18):1;if(pop<=0)continue;const r=9*pop,x=bx+(k%2)*28,y=by+Math.floor(k/2)*26;ball(c,x,y,r,true);}
  c.textAlign='center';c.font='italic 700 27px "Space Grotesk",Inter,sans-serif';c.strokeStyle='#201b29';c.lineWidth=5;c.lineJoin='round';c.fillStyle='#fff3df';const x=team?435:102,y=team?778:422;c.strokeText(s.names[team],x,y,team?190:200);c.fillText(s.names[team],x,y,team?190:200);c.font='700 11px Inter,sans-serif';c.fillStyle='#e8ddce';c.fillText(trainerFor(view,team).region.toUpperCase(),x,y+18,180);c.restore();
 }
 if(moving&&age>.74&&age<1.55){const a=age<.82?clamp((age-.74)/.08):clamp(1-(age-1.0)/.55);lightning(c,age,a*fade);}
 if(stamp>0){
  if(moving&&age<1.6){const r=40+(age-.8)*420;c.save();c.globalAlpha=fade*clamp(1-(age-.8)/.8)*.55;const g=c.createRadialGradient(273,490,0,273,490,Math.max(1,r));g.addColorStop(0,'#fff2b8');g.addColorStop(.6,'#ffcf5a44');g.addColorStop(1,'#ffcf5a00');c.fillStyle=g;c.fillRect(0,100,540,860);c.restore();}
  c.save();c.translate(273,490);c.rotate(-.08);const scale=moving?1+(1-stamp)*.6-(age>1.02&&age<1.2?Math.sin((age-1.02)/.18*Math.PI)*.06:0):1;c.scale(scale,scale);c.globalAlpha=fade*stamp;c.textAlign='center';c.textBaseline='middle';c.font='italic 900 130px "Space Grotesk",Inter,sans-serif';
  c.shadowColor='#ffcb4a';c.shadowBlur=moving?18+10*Math.sin(age*6):18;c.strokeStyle='#151119';c.lineWidth=17;c.lineJoin='round';c.strokeText('VS',0,0);c.shadowBlur=0;
  const vg=c.createLinearGradient(0,-55,0,55);vg.addColorStop(0,'#fff4b8');vg.addColorStop(.45,'#edc758');vg.addColorStop(1,'#c97b1f');c.fillStyle=vg;c.fillText('VS',0,0);c.strokeStyle='#fff8dc';c.lineWidth=1.5;c.globalAlpha=fade*stamp*.7;c.strokeText('VS',0,-2);c.restore();
  if(moving&&age<1.4){c.save();c.lineCap='round';c.globalAlpha=fade*Math.max(0,1-(age-.8)/.6);for(let i=0;i<16;i++){const a=i*TAU/16+.1,r=70+(age-.8)*260;c.strokeStyle=i%2?'#ead797':'#ffffff';c.lineWidth=i%2?2:3;c.beginPath();c.moveTo(273+Math.cos(a)*r,490+Math.sin(a)*r*.7);c.lineTo(273+Math.cos(a)*(r+26+i%3*10),490+Math.sin(a)*(r+26+i%3*10)*.7);c.stroke();}
   for(let i=0;i<22;i++){const a=rand(i)*TAU,d=(age-.8)*(160+rand(i+1)*260),size=2+rand(i+2)*4;c.fillStyle=i%3?'#ffe08a':'#ffffff';c.fillRect(273+Math.cos(a)*d-size/2,490+Math.sin(a)*d*.8-size/2+((age-.8)**2)*120,size,size);}c.restore();}
 }
 if(moving&&age>.8&&age<1.05){c.save();c.globalAlpha=fade*.32*(1-(age-.8)/.25);c.fillStyle='#fffbe8';c.fillRect(-10,100,560,860);c.restore();}
 c.globalAlpha=fade;const tick=moving?clamp((age-1.1)/.4):1;c.fillStyle='#0b1220cc';c.fillRect(0,842,540,30);c.fillStyle='#edc75888';c.fillRect(0,842,540*tick,1.5);c.fillRect(540*(1-tick),870.5,540*tick,1.5);
 c.globalAlpha=fade*tick;c.fillStyle='#e6e1d4';c.font='800 12px "Space Grotesk",Inter,sans-serif';c.textAlign='center';c.fillText('SIX POKÉMON · ONE WINNER',270,861);c.restore();
}
