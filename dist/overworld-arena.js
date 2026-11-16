import {stadiumPulse} from './trainer-arena-life.js?v=32';
import {trainerFor,trainerPortrait} from './trainer-rosters.js?v=32';
import {visibleBounds} from './sprite-layout.js?v=32';
import {drawArenaAtmosphere} from './arena-atmosphere.js?v=32';
import {TRAINER_STANCES} from './arena-layout.js?v=32';
import {drawChannelBoards} from './channel-boards.js?v=32';
import {drawArenaBarricades} from './arena-barricades.js?v=32';
// Arena trainers render at 1.5x their 16x32 GBA overworld sheets (about 48px tall).
export const TRAINER_SPRITE_SCALE=1.5;
export const NPC_NAMES=['red_normal','blue','boy','lass','cooltrainer_m','cooltrainer_f','gentleman','sitting_boy','cameraman','gym_guy','ash','ash-johto','ash-hoenn','ash-sinnoh','ash-unova','ash-kalos','ash-alola','ash-capbackward','misty-gen3','brock-gen3','lance','steven-gen6','cynthia','iris-gen5bw2','diantha','alain','kukui','leon'];
function npc(c,image,x,feet,frame=0,scale=1,mirror=false){if(!image)return;c.save();c.imageSmoothingEnabled=false;c.translate(x,feet);if(mirror)c.scale(-1,1);c.drawImage(image,Math.min(frame,Math.floor(image.width/16)-1)*16,0,16,32,-8*scale,-32*scale,16*scale,32*scale);c.restore();}
export function drawOverworldArena(c,view){
 if(!view.trainerMode)return;c.save();const time=view.cinematic?view.clock:0,pulse=stadiumPulse(view),names=NPC_NAMES.slice(2,8);
 c.save();c.beginPath();c.rect(0,125,540,96);c.clip();
 for(let row=0;row<4;row++)for(let i=0;i<25;i++){const x=12+i*21.5,y=146+row*24,j=(i*7+row*3)%names.length,image=view.images['npc-'+names[j]],wave=view.trainerOutro?Math.sin(time*5.2-i*.4-row)>.35:pulse>.35&&Math.sin(time*6-i*.45+row)>0,cheer=wave||Math.sin(time*2.1-i*.3-row)>.76;
  if(![4,12,20].includes(i))npc(c,image,x,y-(cheer?1.5+pulse*2.5+(view.trainerOutro?2:0):0),0,.94);}
 if(view.cinematic){const flashes=view.trainerOutro||pulse>.35?10:6;for(let i=0;i<flashes;i++){const q=Math.max(0,Math.sin(time*(view.trainerOutro?2.4:1.6)+i*2.1))**24;c.globalAlpha=q*.65;c.fillStyle='#eef8ff';c.fillRect(28+i*51,148+(i*7)%62,3,3);}c.globalAlpha=1;}
 c.restore();
 for(let i=0;i<20;i++)npc(c,view.images['npc-'+names[(i*5+2)%names.length]],22+i*26,948+Math.sin(time+i)*.4,1,1.05);
 // Audience falls into shadow while the trainer boxes remain visible and separate from the field.
 c.fillStyle='#050b18';c.globalAlpha=.62;c.fillRect(0,125,540,96);c.fillRect(0,910,540,50);c.globalAlpha=1;
 c.fillStyle='#1d303a';c.fillRect(0,221,540,23);
 drawArenaBarricades(c,view);
 drawChannelBoards(c,view);drawArenaAtmosphere(c,view);
 for(const [team,box] of TRAINER_STANCES.entries()){c.fillStyle='#263c46';c.fillRect(box.x,box.y,box.w,box.h);c.fillStyle='#38505a';c.fillRect(box.x+3,box.y+3,box.w-6,3);c.fillStyle='#142733';c.fillRect(box.x+3,box.y+box.h-5,box.w-6,3);c.strokeStyle=team?'#83aed0':'#ce9184';c.lineWidth=2;c.strokeRect(box.x+1,box.y+1,box.w-2,box.h-2);c.globalAlpha=.45;c.strokeStyle='#c7d4c7';c.lineWidth=1;c.beginPath();c.ellipse(box.feet.x,box.feet.y-2,15,5,0,0,Math.PI*2);c.stroke();c.globalAlpha=1;const person=trainerFor(view,team),art=trainerPortrait(view,team),sheet=person.npc&&view.images['npc-'+person.npc],acting=view.cinematic&&(view.trainerRecall?.team===team||view.effects?.some(e=>e.kind==='trainer-sendout'&&Math.abs((e.from?.y??0)-box.hand.y)<12)||(view.trainerAttack?.actor?.team===team&&!view.trainerAttack.result));const outro=view.trainerOutro,cheer=view.cinematic&&outro&&outro.winner===team&&view.presentationTime-outro.start>2.6,atk=view.trainerAttack,hitAge=atk?.impactAt!=null?view.clock-atk.impactAt:99,flinch=view.cinematic&&hitAge>=0&&hitAge<.42&&atk.target?.team===team?(1-hitAge/.42)*(team?3:-3):0,atkHop=view.cinematic&&hitAge>=0&&hitAge<.35&&atk.actor?.team===team?Math.sin(hitAge/.35*Math.PI)*3.5:0,hop=(cheer?Math.abs(Math.sin((view.presentationTime-outro.start)*5.5))*6:0)+atkHop;if(sheet)npc(c,sheet,box.feet.x,box.feet.y-hop+flinch,acting||cheer?(team?5:3):(team?1:0),TRAINER_SPRITE_SCALE);else if(art){const b=visibleBounds(art,{x:0,y:0,width:art.width,height:art.height}),scale=48/b.height;c.drawImage(art,b.x,b.y,b.width,b.height,box.feet.x-b.width*scale/2,box.feet.y-48,b.width*scale,48);}}
 npc(c,view.images['npc-cameraman'],38,510,2,1.25,true);npc(c,view.images['npc-gym_guy'],502,510,2,1.25);
 if(view.trainerRecall){const state=view.trainerRecall,box=TRAINER_STANCES[state.team],y=box.y-8,t=(view.noticeTime??view.presentationTime)-state.start;
  if(view.cinematic&&t<.75&&state.from){const q=t/.75,alpha=Math.sin(q*Math.PI),hx=box.hand.x,hy=box.hand.y,fx=state.from.x,fy=state.from.y;c.save();c.globalAlpha=alpha*.75;c.strokeStyle='#ff6b7a';c.lineWidth=8*(1-q*.5);c.lineCap='round';c.beginPath();c.moveTo(hx,hy);c.lineTo(fx,fy);c.stroke();c.strokeStyle='#ffe4ea';c.lineWidth=3*(1-q*.5);c.beginPath();c.moveTo(hx,hy);c.lineTo(fx,fy);c.stroke();c.fillStyle='#ff94a1';c.beginPath();c.arc(fx+(hx-fx)*q,fy+(hy-fy)*q,6*(1-q*.4),0,Math.PI*2);c.fill();c.restore();}
  for(let i=0;i<3;i++){c.globalAlpha=t*2.5>i?1:.25;c.fillStyle=state.team?'#bad7f1':'#efb0a3';c.beginPath();c.arc(260+i*10,y,2.5,0,Math.PI*2);c.fill();}c.globalAlpha=1;}
 c.restore();
}
