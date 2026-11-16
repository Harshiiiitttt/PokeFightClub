import {DUEL_FIELD} from './arena-layout.js?v=32';
import {trainerVisualScale} from './trainer-scale.js?v=32';
export function duelBody(p){const d=p.el?.querySelector('canvas')?.dataset,s=trainerVisualScale(p);return{x:p.pos.x,y:p.pos.y+(Number(d?.bodyTop)||-60)*s+(Number(d?.bodyHeight)||65)*s/2,w:(Number(d?.bodyWidth)||65)*s,h:(Number(d?.bodyHeight)||65)*s};}
export const duelClearanceMargin=view=>view.duelContact?3:7;
export function duelContactPoint(actor,target){
 const a=duelBody(actor),b=duelBody(target),dx=target.pos.x-actor.pos.x,dy=target.pos.y-actor.pos.y,d=Math.max(1,Math.hypot(dx,dy)),nx=dx/d,ny=dy/d;
 let lo=0,hi=d;
 // Approach along the actual body bounds, rather than stopping at a generic sprite radius.
 for(let i=0;i<24;i++){const t=(lo+hi)/2,overlap=Math.abs(a.x+nx*t-b.x)<(a.w+b.w)/2+3&&Math.abs(a.y+ny*t-b.y)<(a.h+b.h)/2+3;if(overlap)hi=t;else lo=t;}
 return{x:actor.pos.x+nx*lo,y:actor.pos.y+ny*lo};
}
function shift(p,axis,amount){const min=axis==='x'?DUEL_FIELD.left:DUEL_FIELD.top,max=axis==='x'?DUEL_FIELD.right:DUEL_FIELD.bottom,delta=Math.max(min,Math.min(max,p.pos[axis]+amount))-p.pos[axis];p.pos[axis]+=delta;if(p.motion){p.motion.from[axis]+=delta;p.motion.to[axis]+=delta;}return delta;}
export function keepDuelSeparation(view){
 if(!view.trainerMode||view.matchIntro||view.ending||view.phaseTransition)return;
 const fighters=view.fighters.filter(p=>!p.reserve&&p.hp>0&&p.el);if(fighters.length!==2)return;
 const [a,b]=fighters,aa=duelBody(a),bb=duelBody(b),dx=bb.x-aa.x,dy=bb.y-aa.y;
 const margin=duelClearanceMargin(view),needX=(aa.w+bb.w)/2+margin-Math.abs(dx),needY=(aa.h+bb.h)/2+margin-Math.abs(dy);if(needX<=0||needY<=0)return;
 // Use the smallest separating axis; shift the trajectory too so it cannot snap back.
 const axis=needX<needY?'x':'y',amount=axis==='x'?needX:needY,sign=(axis==='x'?dx:dy)>=0?1:-1;
 const movedA=Math.abs(shift(a,axis,-sign*amount/2)),movedB=Math.abs(shift(b,axis,sign*(amount-movedA)));if(movedA+movedB<amount)shift(a,axis,-sign*(amount-movedA-movedB));
 for(const p of fighters){p.el.style.left=p.pos.x/540*100+'%';p.el.style.top=p.pos.y/960*100+'%';}
}
