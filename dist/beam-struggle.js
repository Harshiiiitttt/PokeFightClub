export function beamFront(t,guardianWin){const winY=guardianWin?295:700,base=495+Math.sin(t*Math.PI*6)*46+Math.cos(t*Math.PI*3)*18;return t<.78?base:base+(winY-base)*Math.pow((t-.78)/.22,1.6)}
export function beginBeamStruggle(view,boss,guardians,guardianWin,duration=1.75){
 view.clashState={start:view.clock,duration,boss,guardians,guardianWin,origins:new Map([boss,...guardians].map(p=>[p.uid,{...p.pos}]))};
 for(const p of [boss,...guardians]){p.motion=null;p.action='Charge';p.charge=true;p.animKey=null;}
}
export function updateBeamStruggle(view){
 const s=view.clashState;if(!s)return;const t=Math.max(0,Math.min(1,(view.clock-s.start)/s.duration)),pressure=(beamFront(t,s.guardianWin)-495)/205;
 for(const p of [s.boss,...s.guardians]){const o=s.origins.get(p.uid);if(!o||p.hp<=0)continue;const brace=Math.sin(t*Math.PI*30+(p.slot||0))*(view.cinematic===false?0:1.7);p.pos.x=o.x+brace;p.pos.y=o.y+(p===s.boss?pressure*16:pressure*27);p.action='Charge';p.charge=true;}
}
export function endBeamStruggle(view){const s=view.clashState;if(!s)return;for(const p of [s.boss,...s.guardians]){p.charge=false;p.action=null;}view.clashState=null;}
