import {sampleTrainerHealth,trainerHudVisibility} from './presentation-polish.js?v=32';
import {trainerPortrait} from './trainer-rosters.js?v=32';
import {drawHUDPortrait,drawRosterBall} from './trainer-hud-art.js?v=32';
import {ensureTrainerPortrait} from './trainer-portraits.js?v=32';
import {colors,title} from './engine.js?v=32';
import {trainerVisualScale} from './trainer-scale.js?v=32';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// The opposing (right) HUD sits in the bottom-right corner beside its trainer pad; same size as the top-left HUD.
export const RIGHT_HUD_Y=784;
export function noteTrainerResult(view,a){
 const text=a.dodge?'DODGED':a.mult===0?'NO EFFECT':a.mult>1?'SUPER EFFECTIVE!':a.mult<1?'NOT VERY EFFECTIVE…':a.crit?'CRITICAL HIT!':null;
 if(!text||!a.target?.pos)return;view.trainerResults??=[];view.trainerResults.push({p:a.target,bodyTop:Number(a.target.el?.querySelector('canvas')?.dataset?.bodyTop)||-65,text,color:a.dodge?'#d9eeff':a.mult>1?'#ffebad':a.mult<1?'#b8d9ff':a.crit?'#ffb39e':'#ced1e4',until:(view.noticeTime||0)+1.05});view.trainerResults=view.trainerResults.slice(-3);
}
export function trainerResultAnchor(view,p,fixedTop){
 const scale=trainerVisualScale(p),bodyTop=fixedTop??(Number(p.el?.querySelector('canvas')?.dataset?.bodyTop)||-65),z=view._zoomNow||1;
 return{x:clamp(270+(p.pos.x-270)*z+(view._panXNow||0)+(view.cameraShakeX||0),123,417),y:clamp(480+(p.pos.y+bodyTop*scale-480)*z+(view._panNow||0)+(view.cameraShakeY||0)-20,135,776)};
}
export function drawCompactTrainerHUD(c,view){
 if(!view.trainerMode)return;const visibility=trainerHudVisibility(view);if(visibility<=0)return;c.save();c.globalAlpha=visibility;c.imageSmoothingEnabled=false;
 // Mirrored transparent broadcast HUD. Each label, portrait and roster slot has its own space.
 for(const team of [0,1]){
  const roster=view.fighters.filter(p=>p.team===team),p=roster.find(p=>!p.reserve&&!p.benched&&p.hp>0)||roster.filter(p=>!p.reserve&&!p.benched).at(-1);if(!p)continue;
  const right=team===1,accent=right?'#9acbe9':'#efb0a2',faceX=right?478:8,textX=right?466:74,barX=right?278:74,w=188;
  c.save();if(right)c.translate(0,RIGHT_HUD_Y);if(right){const back=c.createLinearGradient(246,0,540,0);back.addColorStop(0,'rgba(6,12,22,0)');back.addColorStop(.16,'rgba(6,12,22,.72)');back.addColorStop(1,'rgba(6,12,22,.84)');c.fillStyle=back;c.fillRect(246,2,294,126);c.fillStyle=accent;c.globalAlpha=visibility*.55;c.fillRect(300,2,240,1.5);c.globalAlpha=visibility;}const image=ensureTrainerPortrait(view,p);drawHUDPortrait(c,image,faceX,8,54);
  c.strokeStyle=accent;c.lineWidth=1.5;c.beginPath();c.moveTo(faceX,68);c.lineTo(faceX+54,68);c.stroke();
  c.textAlign=right?'right':'left';c.fillStyle='#fff8ec';c.font='700 19px "Space Grotesk",Inter,sans-serif';c.strokeStyle='#0b1421';c.lineWidth=4;c.lineJoin='round';
  const name=title(p.name).toUpperCase();c.strokeText(name,textX,23,w);c.fillText(name,textX,23,w);
  let offset=0;c.font='700 9px Inter,sans-serif';
  for(const type of p.types){const text=type.toUpperCase(),width=Math.max(40,c.measureText(text).width+10),x=right?textX-offset-width:textX+offset;
   c.fillStyle=colors[type]||colors.normal;c.fillRect(x,30,width,14);c.fillStyle='#111c27';c.textAlign='center';c.fillText(text,x+width/2,40);offset+=width+4;
  }
  const health=sampleTrainerHealth(view,p),ratio=health.value;c.fillStyle='#0a1420';c.fillRect(barX-2,49,w+4,16);c.strokeStyle='#a3b4ae';c.lineWidth=1;c.strokeRect(barX-1.5,49.5,w+3,15);
  c.fillStyle='#283e3e';c.fillRect(barX,51,w,12);c.fillStyle=ratio>.5?'#7bd69c':ratio>.25?'#edc36b':'#f07e81';
  const trail=w*health.trail;c.fillStyle='#cfad70';c.fillRect(right?barX+w-trail:barX,51,trail,12);c.fillStyle=p.hp/p.max>.5?'#7bd69c':p.hp/p.max>.25?'#edc36b':'#f07e81';
  const filled=w*ratio;c.fillRect(right?barX+w-filled:barX,51,filled,12);c.globalAlpha=visibility*.4;c.fillStyle='#f1ffe3';c.fillRect(right?barX+w-filled:barX,51,filled,2);c.globalAlpha=visibility;
  c.font='700 12px Inter,sans-serif';c.textAlign=right?'left':'right';c.fillStyle='#eef4e7';c.strokeStyle='#101c29';c.lineWidth=3;
  const hp=Math.max(0,p.hp)+' / '+p.max;c.strokeText(hp,right?barX:barX+w,80);c.fillText(hp,right?barX:barX+w,80);
  c.font='700 8px Inter,sans-serif';c.textAlign=right?'right':'left';c.fillStyle='#a4b6ba';c.fillText('HP',right?barX+w:barX,78);
  if((p.koCount||0)>=2){const sx=right?barX+w-78:barX+22;c.fillStyle='#b86c16';c.fillRect(sx,70,56,12);c.strokeStyle='#ffe282';c.lineWidth=1;c.strokeRect(sx,70,56,12);c.textAlign='center';c.font='800 8px "Space Grotesk",Inter,sans-serif';c.fillStyle='#fff6d2';c.fillText(`${p.koCount}× STREAK`,sx+28,79);}
  const trainer=trainerPortrait(view,team),tx=faceX+10,ty=72;c.fillStyle='#0b1623d9';c.fillRect(tx-1,ty-1,36,36);c.strokeStyle=accent;c.lineWidth=1.25;c.strokeRect(tx-1,ty-1,36,36);drawHUDPortrait(c,trainer,tx,ty,34,true);
  c.textAlign='center';c.fillStyle=accent;c.font='700 11px "Space Grotesk",Inter,sans-serif';c.strokeStyle='#0b1421';c.lineWidth=3;c.strokeText(view.teamName(team),faceX+27,121,56);c.fillText(view.teamName(team),faceX+27,121,56);
  for(const [i,mon] of roster.entries()){const x=right?450-i*27:90+i*27;drawRosterBall(c,x,100,mon.hp<=0?'fainted':'ready',mon===p,accent);}
  c.restore();
 }
 view.trainerResults=(view.trainerResults||[]).filter(s=>(view.noticeTime||0)<s.until);
 if(!view.matchIntro&&!view.trainerOutro){for(const result of view.trainerResults){const pos=trainerResultAnchor(view,result.p,result.bodyTop);c.textAlign='center';c.font='italic 700 15px "Space Grotesk",Inter,sans-serif';c.lineJoin='round';c.lineWidth=4;c.strokeStyle='#172131';c.strokeText(result.text,pos.x,pos.y,238);c.fillStyle=result.color;c.fillText(result.text,pos.x,pos.y,238);}}
 c.restore();
}
