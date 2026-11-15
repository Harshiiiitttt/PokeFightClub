// One real-time anticipation beat shared by simultaneous lethal hits.
export async function beforeFinishingHit(view,hits,{wait,valid,audio,color='#fff0c2'}){
 const fatal=hits.filter(h=>h.target.hp>0&&h.damage>=h.target.hp&&!h.protected);
 if(!fatal.length||!view.cinematic)return valid();
 if(view.finisherBeat){const beat=view.finisherBeat;for(const h of fatal)if(!beat.targets.includes(h.target))beat.targets.push(h.target);await beat.promise;return valid();}
 const beat={targets:fatal.map(h=>h.target),color,start:view.clock};
 view.finisherBeat=beat;view.timeScale=.22;audio.duck?.(700);
 beat.promise=(async()=>{try{await (view.waitForFinisher||wait)(460);}finally{if(view.finisherBeat===beat){view.finisherBeat=null;view.timeScale=1;}}})();
 await beat.promise;
 return valid();
}
export function drawFinishingHit(ctx,view){
 const beat=view.finisherBeat;if(!beat)return;
 ctx.save();ctx.strokeStyle=beat.color;ctx.lineWidth=2;ctx.globalAlpha=.65;
 for(const p of beat.targets){if(p.hp<=0)continue;const r=68+Math.sin((view.clock-beat.start)*18)*5;
  ctx.beginPath();ctx.ellipse(p.pos.x,p.pos.y+30,r,r*.38,0,0,Math.PI*2);ctx.stroke();
  for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(p.pos.x+side*82,p.pos.y-38);ctx.lineTo(p.pos.x+side*68,p.pos.y-25);ctx.stroke();}
 }
 ctx.restore();
}
