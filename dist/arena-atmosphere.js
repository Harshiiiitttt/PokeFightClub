import {drawStadiumLife} from './trainer-arena-life.js?v=32';
import {trainerFor} from './trainer-rosters.js?v=32';
const REGION_LIGHT={kanto:'#ffedc0',johto:'#ffd7a8',hoenn:'#c6ffd8',sinnoh:'#cbe6ff',unova:'#ffe6aa',kalos:'#e8c8ff',alola:'#ffc896',galar:'#e4d4ff',paldea:'#ffd6b8'};
export function drawArenaAtmosphere(c,view){
 if(!view.trainerMode)return;c.save();const time=view.cinematic?view.clock:0;
 const region=String(trainerFor(view,0)?.region||'kanto').toLowerCase(),beamColor=REGION_LIGHT[region]||'#ffedc0';
 for(const [x,y,sign,color] of [[62,269,1,'#c98c83'],[478,269,-1,'#91afc8'],[62,799,1,'#c98c83'],[478,799,-1,'#91afc8']]){
  c.fillStyle='#263a45';c.fillRect(x-2,y-19,4,27);c.fillStyle='#91a5a8';c.fillRect(x-4,y-23,8,5);c.fillStyle='#e1dfb9';c.fillRect(x-3,y-22,6,2);
  c.strokeStyle='#b9c4b5';c.lineWidth=1;c.beginPath();c.moveTo(x+sign*5,y-5);c.lineTo(x+sign*5,y-30);c.stroke();c.fillStyle=color;c.beginPath();c.moveTo(x+sign*5,y-29);c.lineTo(x+sign*(19+Math.sin(time*2+x)*2),y-25);c.lineTo(x+sign*5,y-20);c.closePath();c.fill();
  if(view.cinematic){c.globalAlpha=.032;c.fillStyle=beamColor;c.beginPath();c.moveTo(x,y-20);c.lineTo(255+Math.sin(time*.35+x)*26,490);c.lineTo(305+Math.sin(time*.35+x)*26,560);c.closePath();c.fill();c.globalAlpha=1;}
 }
 c.globalAlpha=.11;c.fillStyle='#b7c9a0';for(let i=0;i<16;i++){const x=i%2?482:58,y=322+i*23;c.fillRect(x,y,4,1);c.fillRect(x+2,y+4,2,1);}c.restore();drawStadiumLife(c,view);
}
