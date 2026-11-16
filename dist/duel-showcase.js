import {arenaEffectVisibility} from './presentation-polish.js?v=32';
import {trainerPortrait} from './trainer-rosters.js?v=32';
import {drawHUDPortrait} from './trainer-hud-art.js?v=32';
import {colors,title} from './engine.js?v=32';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),TAU=Math.PI*2;
const rand=s=>{const x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const easeOut=t=>1-(1-clamp(t,0,1))**3;
function strokeFill(c,text,x,y,font,fill,stroke='#0c1420',lw=4,max){
 c.font=font;c.lineJoin='round';c.strokeStyle=stroke;c.lineWidth=lw;c.strokeText(text,x,y,max);c.fillStyle=fill;c.fillText(text,x,y,max);
}
export function isClutchState(view){
 if(!view.trainerMode||view.matchIntro||view.trainerOutro)return false;
 const alive0=view.fighters.filter(p=>p.team===0&&p.hp>0),alive1=view.fighters.filter(p=>p.team===1&&p.hp>0);
 const act0=alive0.find(p=>!p.reserve&&!p.benched),act1=alive1.find(p=>!p.reserve&&!p.benched);
 const finalStand=alive0.length===1&&alive1.length===1;
 const lastLow=(alive0.length===1&&act0&&act0.hp/act0.max<=.32)||(alive1.length===1&&act1&&act1.hp/act1.max<=.32);
 return finalStand||lastLow;
}
export function triggerTrainerCutIn(view,{team=0,title:head='ACE MOMENT',subtitle='',color='#ffd966',capFlip=false,duration=1.2}={}){
 if(!view.trainerMode||!view.cinematic)return;
 view.trainerCutIn={team,title:head,subtitle,color,capFlip,start:view.presentationTime,duration};
 view.onHighlight?.(head,'cutin');
}
export function drawTrainerCutIn(c,view){
 const s=view.trainerCutIn;if(!s||view.matchIntro||view.trainerOutro)return;
 const age=view.presentationTime-s.start;if(age<0||age>s.duration){view.trainerCutIn=null;return;}
 const t=age/s.duration,enter=easeOut(t/.16),exit=t>.84?clamp((1-t)/.16,0,1):1,alpha=enter*exit;
 const dir=s.team?-1:1,slide=(1-enter)*260*dir;
 c.save();c.globalAlpha=alpha;
 const y0=386,h=112;
 c.save();c.beginPath();c.moveTo(-20,y0+14);c.lineTo(560,y0-14);c.lineTo(560,y0+h-14);c.lineTo(-20,y0+h+14);c.closePath();c.clip();
 const bg=c.createLinearGradient(0,y0,540,y0+h);bg.addColorStop(0,'#09101df2');bg.addColorStop(.5,s.team?'#3a1919f4':'#15284cf4');bg.addColorStop(1,'#09101df2');c.fillStyle=bg;c.fillRect(-20,y0-20,580,h+40);
 for(let i=0;i<14;i++){const sx=((age*1100+i*97)%640)-50,sy=y0-10+(i*19)%h;c.globalAlpha=alpha*(.15+(i%3)*.12);c.fillStyle=s.color;c.fillRect(sx,sy,70+i%4*25,2);}
 if(t>.18&&t<.75){const sw=((t-.18)/.57)*720-90;c.globalAlpha=alpha*.18;c.fillStyle='#ffffff';c.beginPath();c.moveTo(sw,y0-20);c.lineTo(sw+54,y0-20);c.lineTo(sw-10,y0+h+20);c.lineTo(sw-64,y0+h+20);c.closePath();c.fill();}
 c.globalAlpha=alpha;
 const img=trainerPortrait(view,s.team);
 if(img?.width){
  const px=s.team?392+slide:24+slide,size=h+8;
  c.save();c.imageSmoothingEnabled=false;if(s.capFlip){c.translate(px+size/2,0);c.scale(-1,1);c.translate(-(px+size/2),0);}
  drawHUDPortrait(c,img,px,y0-4,size,true);
  c.restore();
 }
 c.textAlign=s.team?'right':'left';
 const tx=s.team?360-slide*.35:176-slide*.35;
 if(s.capFlip)strokeFill(c,'CAP FLIP · PIKACHU CLUTCH',tx,y0+34,'800 11px "Space Grotesk",Inter,sans-serif','#ffe885','#090d16',3,310);
 strokeFill(c,s.title,tx,y0+66,'italic 900 28px "Space Grotesk",Inter,sans-serif',s.color,'#090d16',6,320);
 if(s.subtitle)strokeFill(c,s.subtitle,tx,y0+90,'700 12px Inter,sans-serif','#f0f6ff','#090d16',3,320);
 c.restore();
 c.strokeStyle=s.color;c.lineWidth=3;
 for(const dy of [0,h]){c.beginPath();c.moveTo(-20,y0+dy+14);c.lineTo(560,y0+dy-14);c.stroke();}
 if(t<.18){c.globalAlpha=(1-t/.18)*.45;c.fillStyle='#ffffff';c.fillRect(0,y0-20,540,h+40);}
 c.restore();
}
export function setDuelWeather(view,move){
 if(!view.trainerMode||!view.cinematic||!move||move.power<85)return;
 const map={fire:'sun',water:'rain',ice:'hail',electric:'electric',ground:'sand',rock:'sand'};
 const kind=map[move.type];if(!kind)return;
 view.duelWeather={kind,start:view.clock,until:view.clock+9.5,intensity:move.power>=110?1:.72};
}
export function drawDuelWeather(c,view){
 if(!view.trainerMode||!view.cinematic)return;const w=view.duelWeather;if(!w||view.clock>w.until){view.duelWeather=null;return;}
 const fade=Math.min(1,(view.clock-w.start)*2)*Math.min(1,(w.until-view.clock)/1.5)*w.intensity*arenaEffectVisibility(view),t=view.clock;
 if(fade<=0)return;
 c.save();c.beginPath();c.rect(48,260,444,532);c.clip();
 if(w.kind==='sun'){
  // Diagonal warm sunbeams + rising golden shimmer motes.
  const g=c.createRadialGradient(380,270,20,270,480,420);g.addColorStop(0,'rgba(255,205,110,.26)');g.addColorStop(.55,'rgba(255,140,55,.12)');g.addColorStop(1,'rgba(255,90,30,0)');
  c.globalAlpha=fade;c.fillStyle=g;c.fillRect(48,260,444,532);
  for(let i=0;i<3;i++){const sx=170+i*125+Math.sin(t*1.1+i)*12,sg=c.createLinearGradient(sx,260,sx-140,790);sg.addColorStop(0,'rgba(255,232,160,.16)');sg.addColorStop(1,'rgba(255,190,90,0)');c.fillStyle=sg;c.beginPath();c.moveTo(sx-25,260);c.lineTo(sx+35,260);c.lineTo(sx-115,792);c.lineTo(sx-210,792);c.closePath();c.fill();}
  for(let i=0;i<24;i++){const x=56+((i*73+Math.sin(t*1.5+i)*24)%428),y=784-((t*55+i*47)%520),s=1.5+(i%3)*.8;c.globalAlpha=fade*(.35+.25*Math.sin(t*4+i));c.fillStyle=i%2?'#ffe69a':'#ff9c54';c.fillRect(x,y,s,s);}
 }else if(w.kind==='rain'){
  // Overcast storm wash, multi-depth angled rain streaks, turf puddle splashes, and faint sky lightning.
  c.globalAlpha=fade*.22;c.fillStyle='#0a1e36';c.fillRect(48,260,444,532);
  const bolt=Math.sin(t*1.9)>0.96?Math.sin(t*48)*.14:0;
  if(bolt>0){c.globalAlpha=fade*bolt;c.fillStyle='#d8eeff';c.fillRect(48,260,444,532);}
  for(let layer=0;layer<3;layer++){
   const count=26,spd=460+layer*170,len=10+layer*6;c.strokeStyle=layer===2?'#d6f4ff':'#8ecbe8';c.lineWidth=.8+layer*.35;c.globalAlpha=fade*(.22+layer*.14);
   for(let i=0;i<count;i++){const h1=rand(i+layer*31+7),h2=rand(i*3+layer*17+2),x=48+((h1*444+t*(95+layer*35))%444),y=260+((t*spd+h2*532)%532);c.beginPath();c.moveTo(x,y);c.lineTo(x-len*.36,y+len);c.stroke();}
  }
  c.lineWidth=1.1;c.strokeStyle='#bfefff';
  for(let i=0;i<16;i++){const p=(t*1.8+rand(i+9))%1,seed=i+Math.floor(t*1.8+rand(i+9))*13,px=64+rand(seed)*412,py=280+rand(seed+5)*490,r=2+p*10;c.globalAlpha=fade*(1-p)*.38;c.beginPath();c.ellipse(px,py,r,r*.35,0,0,TAU);c.stroke();}
 }else if(w.kind==='hail'){
  // Frosty border haze + falling angled ice pellets + bounce glints.
  const fg=c.createRadialGradient(270,520,110,270,520,310);fg.addColorStop(0,'rgba(175,232,250,.06)');fg.addColorStop(1,'rgba(180,235,255,.26)');
  c.globalAlpha=fade;c.fillStyle=fg;c.fillRect(48,260,444,532);
  for(let i=0;i<44;i++){const spd=220+(i%3)*85,x=50+((rand(i+2)*440+t*65+Math.sin(t*2+i)*14)%440),y=260+((t*spd+rand(i+8)*532)%532),sz=1.5+(i%3);c.globalAlpha=fade*(.4+.3*(i%2));c.fillStyle=i%3?'#e8fbff':'#a8e5f8';c.beginPath();c.arc(x,y,sz,0,TAU);c.fill();}
  c.strokeStyle='#ffffff';c.lineWidth=1;
  for(let i=0;i<10;i++){const p=(t*2.4+rand(i+3))%1,px=68+rand(i+15)*404,py=290+rand(i+21)*470;if(p>.25)continue;c.globalAlpha=fade*(1-p*4)*.65;c.beginPath();c.moveTo(px-3,py);c.lineTo(px+3,py);c.moveTo(px,py-3);c.lineTo(px,py+3);c.stroke();}
 }else if(w.kind==='electric'){
  // Golden-cyan turf circuit lines along field boundaries + ground-skimming static arcs and rising sparks.
  const pulse=.45+.25*Math.sin(t*7);c.globalAlpha=fade*.09;c.fillStyle='#ffe87a';c.fillRect(48,260,444,532);
  c.globalAlpha=fade*pulse*.55;c.strokeStyle='#ffe268';c.lineWidth=1.4;
  for(const x of [58,482]){c.beginPath();c.moveTo(x,272);c.lineTo(x,780);c.stroke();}
  for(const y of [332,526,720]){c.beginPath();c.moveTo(58,y);c.lineTo(482,y);c.stroke();}
  c.strokeStyle='#b8f7ff';c.lineWidth=1.3;
  for(let i=0;i<5;i++){const phase=Math.floor(t*9+i*3),on=((t*9+i*3)%1)<.45;if(!on)continue;const sx=78+rand(phase+i*7)*340,sy=295+rand(phase+i*13+3)*455;c.globalAlpha=fade*.75;c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+14,sy-4);c.lineTo(sx+22,sy+5);c.lineTo(sx+36,sy-2);c.stroke();}
  for(let i=0;i<18;i++){const x=64+((rand(i+11)*412+Math.sin(t*4+i)*12+412)%412),y=775-((t*80+rand(i+19)*505)%505);c.globalAlpha=fade*(.45+.3*Math.sin(t*12+i));c.fillStyle=i%2?'#fff294':'#96f2ff';c.fillRect(x,y,2,2);}
 }else if(w.kind==='sand'){
  // Desert dust haze + sweeping wind-blown gust ribbons + multi-speed sand particles.
  c.globalAlpha=fade*.2;c.fillStyle='#9f7844';c.fillRect(48,260,444,532);
  for(let b=0;b<4;b++){const by=310+b*120+Math.sin(t*2.4+b)*16,bx=48+((t*(180+b*35)+b*140)%560)-140;const rg=c.createLinearGradient(bx,by,bx+200,by+24);rg.addColorStop(0,'rgba(225,186,125,0)');rg.addColorStop(.5,'rgba(225,186,125,.14)');rg.addColorStop(1,'rgba(225,186,125,0)');c.globalAlpha=fade;c.fillStyle=rg;c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(bx+100,by+18,bx+200,by+6);c.lineTo(bx+200,by+34);c.quadraticCurveTo(bx+100,by+44,bx,by+26);c.closePath();c.fill();}
  for(let i=0;i<60;i++){const spd=210+(i%3)*95,x=48+((t*spd+rand(i+4)*444)%444),y=266+((rand(i+14)*520+Math.sin(t*4.5+i)*14+520)%520),sz=1.5+(i%3)*.9;c.globalAlpha=fade*(.28+.24*(i%2));c.fillStyle=i%2?'#ebd2a4':'#c99c62';c.fillRect(x,y,sz*2.2,sz);}
 }
 c.restore();
}
export function drawClutchVignette(c,view){
 if(!view.cinematic||!isClutchState(view))return;
 const pulse=.5+.5*Math.sin(view.presentationTime*5.2);
 c.save();
 const g=c.createRadialGradient(270,518,135,270,518,460);
 g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.72,`rgba(35,8,14,${(.16+pulse*.09).toFixed(3)})`);g.addColorStop(1,`rgba(140,18,28,${(.22+pulse*.14).toFixed(3)})`);
 c.fillStyle=g;c.fillRect(0,0,540,960);c.restore();
}
export function drawDuelBeamClash(c,view){
 const s=view.duelBeamClash;if(!s)return;
 const t=clamp((view.clock-s.start)/s.duration,0,1);if(t>=1)return;
 const mA=s.actor&&s.target&&view.mouth?view.mouth(s.actor,s.target):s.fromA;
 const mB=s.actor&&s.target&&view.mouth?view.mouth(s.target,s.actor):s.fromB;
 const ax=mA.x,ay=mA.y,bx=mB.x,by=mB.y;
 const osc=.5+Math.sin(t*Math.PI*7)*.14+Math.cos(t*Math.PI*3)*.06;
 const push=t<.66?osc:osc+(1-osc)*Math.pow((t-.66)/.34,1.5);
 const mx=ax+(bx-ax)*push,my=ay+(by-ay)*push;
 c.save();
 const drawHalf=(x0,y0,x1,y1,col,w)=>{
  c.lineCap='round';
  for(const [lw,st,al] of [[w*2.2,col,.3],[w,col,.92],[w*.44,'#ffffff',1]]){
   c.globalAlpha=al;c.strokeStyle=st;c.lineWidth=lw;c.beginPath();c.moveTo(x0,y0);
   for(let i=1;i<=10;i++){const q=i/10,j=i===10?0:Math.sin(q*14-view.clock*32)*3.2;c.lineTo(x0+(x1-x0)*q+j,y0+(y1-y0)*q);}
   c.stroke();
  }
 };
 drawHalf(ax,ay,mx,my,s.colorA,14+push*6);
 drawHalf(bx,by,mx,my,s.colorB,14+(1-push)*3);
 const r=22+Math.sin(view.clock*40)*5+t*9;
 const orb=c.createRadialGradient(mx,my,2,mx,my,r*1.9);
 orb.addColorStop(0,'#ffffff');orb.addColorStop(.45,s.colorA);orb.addColorStop(.75,s.colorB);orb.addColorStop(1,'rgba(255,255,255,0)');
 c.globalAlpha=.96;c.fillStyle=orb;c.beginPath();c.arc(mx,my,r*1.9,0,TAU);c.fill();
 c.strokeStyle='#fffbe2';c.lineWidth=2;
 for(let i=0;i<8;i++){const ang=i*TAU/8+view.clock*14,len=r+12+(i%2)*12;c.beginPath();c.moveTo(mx+Math.cos(ang)*6,my+Math.sin(ang)*6);c.lineTo(mx+Math.cos(ang+.2)*len*.6,my+Math.sin(ang+.2)*len*.6);c.lineTo(mx+Math.cos(ang)*len,my+Math.sin(ang)*len);c.stroke();}
 c.restore();
}
export function drawDuelWorldExtras(c,view){if(!view.trainerMode)return;
 // Draw KO Streak glow rings and G-Max Wildfire perimeter flames during active battle.
 if(view.duelBeat>0&&!view.matchIntro&&!view.trainerOutro){
  if(view.fighters.some(p=>!p.reserve&&p.hp>0&&p.wildfireActive)){
   const t=view.cinematic?view.presentationTime:0,pulse=.5+.5*Math.sin(t*7);c.save();
   c.strokeStyle=`rgba(255,105,35,${(.32+.22*pulse).toFixed(2)})`;c.lineWidth=3;c.strokeRect(52,264,436,524);
   for(let i=0;i<18;i++){const x=64+(i*24),h=6+Math.sin(t*11+i)*4;c.fillStyle=i%2?'#ff7028':'#ffd166';c.globalAlpha=.45;c.fillRect(x,264,4,h);c.fillRect(x,788-h,4,h);}
   c.restore();
  }
  for(const p of view.fighters){
   if(p.reserve||p.benched||p.hp<=0||(p.koCount||0)<2)continue;
   const pulse=view.cinematic?.6+.4*Math.sin(view.presentationTime*5):.6;c.save();c.globalAlpha=.35*pulse;c.strokeStyle='#ffd45a';c.lineWidth=2;
   c.beginPath();c.ellipse(p.pos.x,p.pos.y+22,24+pulse*4,8+pulse*1.5,0,0,TAU);c.stroke();c.restore();
  }
 }
}
export function drawBroadcastExtras(c,view){
 if(!view.trainerMode)return;
 if(view.matchIntro||view.trainerOutro)return;
 const hasAction=view.duelBeat>0||!!view.cupState?.active;
 if(!hasAction)return;
 // Top-right broadcast panel (clear of Team 0 HUD on top-left and Team 1 HUD on bottom-right).
 c.save();
 let y=12;
 if(view.duelBeat>0){
  const m=clamp(view.duelMomentum||0,-1,1),bx=356,bw=174;
  c.fillStyle='#081320d4';c.fillRect(bx-4,y,bw+8,34);c.strokeStyle='#435a70';c.lineWidth=1;c.strokeRect(bx-4,y,bw+8,34);
  c.textAlign='left';c.font='800 8px "Space Grotesk",Inter,sans-serif';c.fillStyle='#efb0a2';c.fillText(view.teamName(0),bx,y+9,70);
  c.textAlign='right';c.fillStyle='#9acbe9';c.fillText(view.teamName(1),bx+bw,y+9,70);
  c.textAlign='center';c.fillStyle='#d4dde8';c.fillText('MOMENTUM',bx+bw/2,y+21);
  const split=bw*(.5-m*.45);
  c.fillStyle='#efb0a2';c.fillRect(bx,y+25,split,5);
  c.fillStyle='#9acbe9';c.fillRect(bx+split,y+25,bw-split,5);
  c.fillStyle='#ffffff';c.fillRect(bx+split-1,y+24,2,7);
  y+=38;
 }
 if(view.cupState?.active){
  const cup=view.cupState,bx=356,bw=174;
  c.fillStyle='#0b1524d8';c.fillRect(bx-4,y,bw+8,18);c.strokeStyle='#edc758';c.lineWidth=1;c.strokeRect(bx-4,y,bw+8,18);
  c.textAlign='left';c.font='800 9px "Space Grotesk",Inter,sans-serif';c.fillStyle='#ffe28a';c.fillText('CUP',bx+2,y+12);
  ['QF','SF','FINAL'].forEach((lbl,idx)=>{
   const r=idx+1,rx=bx+34+idx*46,done=r<cup.round,cur=r===cup.round;
   c.fillStyle=done?'#7bd69c':cur?'#ffe28a':'#55687a';
   c.textAlign='center';c.fillText(done?`${lbl}✓`:lbl,rx+20,y+12);
  });
  y+=22;
 }
 if(view.duelWeather&&view.clock<=view.duelWeather.until){
  const label=DUEL_WEATHER_LABEL[view.duelWeather.kind];
  if(label){c.fillStyle='#091522d6';c.fillRect(392,y,142,16);c.strokeStyle='#7ca4c4';c.lineWidth=1;c.strokeRect(392,y,142,16);c.textAlign='center';c.font='800 8px "Space Grotesk",Inter,sans-serif';c.fillStyle='#d8eeff';c.fillText(label,463,y+11);y+=20;}
 }
 if(isClutchState(view)){
  const pulse=view.cinematic?.55+.45*Math.sin(view.presentationTime*6):.55;c.fillStyle=`rgba(125,22,32,${(.75+.2*pulse).toFixed(2)})`;
  c.fillRect(410,y,124,16);c.strokeStyle='#ff9a8a';c.lineWidth=1;c.strokeRect(410,y,124,16);
  c.textAlign='center';c.font='800 9px "Space Grotesk",Inter,sans-serif';c.fillStyle='#fff2de';c.fillText('CLUTCH · FINAL STAND',472,y+11);
 }
 c.restore();
}
export function noteKoStreakAndMomentum(view,actor,target,mult,damage,ko){
 if(!view.trainerMode)return;
 if(ko){actor.koCount=(actor.koCount||0)+1;}
 const sign=actor.team===0?1:-1;
 const delta=(ko?.42:mult>1?.22:damage>0?.08:0)*sign;
 view.duelMomentum=clamp((view.duelMomentum||0)*.75+delta,-1,1);
}
export const DUEL_WEATHER_LABEL={sun:'HARSH SUNLIGHT',rain:'RAINSTORM',hail:'HAILSTORM',electric:'ELECTRIC TERRAIN',sand:'SANDSTORM'};
