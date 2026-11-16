import fs from 'node:fs';
const p='dist/trainer-overlay.js';let s=fs.readFileSync(p,'utf8');s="import {drawHUDPortrait,drawRosterBall} from './trainer-hud-art.js?v=29';\n"+s;
const start=s.indexOf(' // The HUD'),end=s.indexOf(' view.trainerResults=',start);
s=s.slice(0,start)+` // Mirrored transparent broadcast HUD. Each label, portrait and roster slot has its own space.
 for(const team of [0,1]){
  const roster=view.fighters.filter(p=>p.team===team),p=roster.find(p=>!p.reserve&&p.hp>0)||roster.filter(p=>!p.reserve).at(-1);if(!p)continue;
  const right=team===1,accent=right?'#9acbe9':'#efb0a2',faceX=right?478:8,textX=right?466:74,barX=right?278:74,w=188;
  const image=ensureTrainerPortrait(view,p);drawHUDPortrait(c,image,faceX,8,54);
  c.strokeStyle=accent;c.lineWidth=1.5;c.beginPath();c.moveTo(faceX,68);c.lineTo(faceX+54,68);c.stroke();
  c.textAlign=right?'right':'left';c.fillStyle='#fff8ec';c.font='700 18px "Space Grotesk",Inter,sans-serif';c.strokeStyle='#0b1421';c.lineWidth=4;c.lineJoin='round';
  const name=title(p.name).toUpperCase();c.strokeText(name,textX,23,w);c.fillText(name,textX,23,w);
  let offset=0;c.font='700 8px Inter,sans-serif';
  for(const type of p.types){const text=type.toUpperCase(),width=Math.max(40,c.measureText(text).width+10),x=right?textX-offset-width:textX+offset;
   c.fillStyle=colors[type]||colors.normal;c.fillRect(x,31,width,12);c.fillStyle='#111c27';c.textAlign='center';c.fillText(text,x+width/2,40);offset+=width+4;
  }
  const ratio=clamp(p.hp/p.max,0,1);c.fillStyle='#0a1420';c.fillRect(barX-2,49,w+4,16);c.strokeStyle='#a3b4ae';c.lineWidth=1;c.strokeRect(barX-1.5,49.5,w+3,15);
  c.fillStyle='#283e3e';c.fillRect(barX,51,w,12);c.fillStyle=ratio>.5?'#7bd69c':ratio>.25?'#edc36b':'#f07e81';
  const filled=w*ratio;c.fillRect(right?barX+w-filled:barX,51,filled,12);c.globalAlpha=.4;c.fillStyle='#f1ffe3';c.fillRect(right?barX+w-filled:barX,51,filled,2);c.globalAlpha=1;
  c.font='700 11px Inter,sans-serif';c.textAlign=right?'left':'right';c.fillStyle='#eef4e7';c.strokeStyle='#101c29';c.lineWidth=3;
  const hp=Math.max(0,p.hp)+' / '+p.max;c.strokeText(hp,right?barX:barX+w,80);c.fillText(hp,right?barX:barX+w,80);
  c.font='700 8px Inter,sans-serif';c.textAlign=right?'right':'left';c.fillStyle='#a4b6ba';c.fillText('HP',right?barX+w:barX,78);
  const trainer=view.images['trainer-'+team];drawHUDPortrait(c,trainer,right?500:10,76,30,true);
  c.textAlign=right?'right':'left';c.fillStyle=accent;c.font='700 10px "Space Grotesk",Inter,sans-serif';c.strokeStyle='#0b1421';c.lineWidth=3;c.strokeText(view.teamName(team),right?530:10,120,57);c.fillText(view.teamName(team),right?530:10,120,57);
  for(const [i,mon] of roster.entries()){const x=right?450-i*27:90+i*27;drawRosterBall(c,x,100,mon.hp<=0?'fainted':'ready',mon===p,accent);}
 }
`+s.slice(end);fs.writeFileSync(p,s);
