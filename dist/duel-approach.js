import {trainerVisualScale} from './trainer-scale.js?v=32';
import {attackEase} from './attack-polish.js?v=32';
export function drawDuelApproach(c,e,t,view){
 if(e.kind!=='approach-sweep')return false;if(!view.cinematic)return true;
 const dx=e.to.x-e.from.x,dy=e.to.y-e.from.y,d=Math.max(1,Math.hypot(dx,dy)),nx=dx/d,ny=dy/d,fade=Math.min(1,(1-t)*5),body=e.fighter?.el?.querySelector('canvas');
 c.save();
 if(body){const s=trainerVisualScale(e.fighter);for(const [lag,opacity] of [[.13,.14],[.26,.065]]){const q=Math.max(0,t-lag);if(q===0)continue;const p=attackEase(q,e.easing||'strike'),x=e.from.x+dx*p+Math.sin(q*Math.PI)*(e.curve||0),y=e.from.y+dy*p-Math.sin(q*Math.PI)*(e.arc||0);c.globalAlpha=opacity*fade;c.drawImage(body,x-96*s,y-112*s,192*s,224*s);}}
 const q=attackEase(t,e.easing||'strike'),x=e.from.x+dx*q,y=e.from.y+dy*q;
 c.strokeStyle=e.slash?'#e4f1ef':e.color;c.lineWidth=e.slash?2:1;
 for(let i=0;i<4;i++){const side=i%2?1:-1,off=(10+i*3)*side;c.globalAlpha=fade*(.34-i*.05);c.beginPath();c.moveTo(x-nx*(19+i*4)-ny*off,y-ny*(19+i*4)+nx*off);c.quadraticCurveTo(x-nx*9-ny*(off+side*4),y-ny*9+nx*(off+side*4),x-ny*off,y+nx*off);c.stroke();}
 c.restore();return true;
}
