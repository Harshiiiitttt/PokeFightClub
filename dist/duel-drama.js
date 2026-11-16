const tones={fire:'#35100b',water:'#071e32',electric:'#16152e',grass:'#0b2519',ice:'#0c2635',ghost:'#180d29',dark:'#100d1e',dragon:'#19132d',psychic:'#2b102b',ground:'#251a11',rock:'#251e18',steel:'#15202a',fairy:'#291426'};
export function startDuelDrama(view,a){
 if(!view.cinematic)return null;
 const state={actor:a.actor,target:a.target,type:a.move.type,color:a.color||'#e9d7aa',start:view.clock,phase:'charge'};view.duelDrama=state;return state;
}
export function endDuelDrama(view,state){if(state&&view.duelDrama===state){state.phase='recover';state.releaseAt=view.clock;}}
export function drawDuelDrama(c,view){
 if(!view.trainerMode||!view.cinematic)return;const s=view.duelDrama;if(!s)return;
 const fade=s.phase==='recover'?Math.max(0,1-(view.clock-s.releaseAt)/.45):Math.min(1,(view.clock-s.start)/.18);
 if(!fade){if(s.phase==='recover')view.duelDrama=null;return;}
 c.save();c.globalAlpha=fade*(s.phase==='charge'?.66:s.phase==='impact'?.58:.82);c.fillStyle=tones[s.type]||'#0c1320';c.fillRect(0,0,540,960);
 // These lights live behind the Pokémon: the attack and silhouettes remain readable.
 for(const [i,p] of [s.actor,s.target].entries()){
  const g=c.createRadialGradient(p.pos.x,p.pos.y+20,8,p.pos.x,p.pos.y+20,i?110:145);g.addColorStop(0,s.color);g.addColorStop(1,'#00000000');c.globalAlpha=fade*(i?.12:.24);c.fillStyle=g;c.fillRect(p.pos.x-150,p.pos.y-130,300,300);
 }
 c.strokeStyle=s.color;c.lineWidth=1.5;c.globalAlpha=fade*.25;
 if(s.phase==='charge'){for(let i=0;i<14;i++){const a=i*2.4+view.clock*2,r=28+(i%3)*13,q=(view.clock-s.start)%1;c.fillStyle=s.color;c.fillRect(s.actor.pos.x+Math.cos(a)*r*(1-q*.3),s.actor.pos.y+24+Math.sin(a)*r*.4-q*18,2,2);}}
 else{for(const side of [0,1])for(let i=0;i<8;i++){const x=side?525-i*2:15+i*2,y=210+i*67;c.beginPath();c.moveTo(x,y);c.lineTo(x+(side?-1:1)*(22+i%3*9),y+12);c.stroke();}}
 c.restore();
}
