import {trainerVisualScale} from './trainer-scale.js?v=32';
import {title,colors} from './engine.js?v=32';
export function announceMove(view,p,move,duration=1800){
 view.moveLabels??=new Map();
 const label={p,text:title(move.name),type:move.type,color:colors[move.type]||colors.normal,until:view.clock+duration/1000};
 view.moveLabels.set(p.uid,label);return label;
}
export function drawMoveLabels(c,view){
 if(!view.moveLabels)return;
 const occupied=[];c.save();c.font=view.trainerMode?'italic 700 12px "Space Grotesk",Inter,sans-serif':'bold 10px monospace';c.textAlign='center';c.textBaseline='middle';
 for(const [uid,l] of view.moveLabels){
  const p=l.p;if(view.clock>=l.until||p.hp<=0||p.retiredAt!==undefined||!p.pos){view.moveLabels.delete(uid);continue;}
  const bodyTop=(Number(p.el?.querySelector('canvas')?.dataset?.bodyTop)||-55)*(p.trainerDuel?trainerVisualScale(p):1),width=Math.min(190,c.measureText(l.text).width+20),anchor={x:p.pos.x,y:p.pos.y+bodyTop-17};
  let x=Math.max(width/2+8,Math.min(532-width/2,anchor.x)),y=Math.max(143,Math.min(820,anchor.y)),found=false;
  for(const offset of [0,22,44,66,88,110]){for(const shift of [0,-85,85]){const cx=Math.max(width/2+8,Math.min(532-width/2,anchor.x+shift)),cy=Math.max(143,Math.min(820,anchor.y-offset));if(!occupied.some(r=>Math.abs(r.x-cx)<(r.width+width)/2+4&&Math.abs(r.y-cy)<22)){x=cx;y=cy;found=true;break}}if(found)break}
  occupied.push({x,y,width});
  if(Math.abs(x-anchor.x)>8||Math.abs(y-anchor.y)>8){c.globalAlpha=.7;c.strokeStyle=l.color;c.lineWidth=1;c.beginPath();c.moveTo(x,y+10);c.lineTo(anchor.x,anchor.y+10);c.stroke();c.globalAlpha=1;}
  c.fillStyle='#101523f0';c.strokeStyle=l.color;c.lineWidth=1.5;c.beginPath();c.roundRect(x-width/2,y-10,width,20,4);c.fill();c.stroke();c.fillStyle=l.color;c.fillText(l.text,x,y+.5,width-12);
 }
 c.restore();
}
