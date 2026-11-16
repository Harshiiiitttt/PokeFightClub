import {TRAINERS,REGIONAL_TRAINER_PRESETS,trainerPortrait,trainerFor} from './trainer-rosters.js?v=32';
import {drawStadiumSurface} from './trainer-stadium.js?v=32';
import {drawDramaticTrainerIntro} from './trainer-intro.js?v=32';
import {TRAINER_STANCES} from './arena-layout.js?v=32';
import {drawCompactTrainerHUD,noteTrainerResult} from './trainer-overlay.js?v=32';
import {drawOverworldArena} from './overworld-arena.js?v=32';
import {trainerVisualScale} from './trainer-scale.js?v=32';
import {title,colors} from './engine.js?v=32';
import {isContactMove} from './combat-feel.js?v=32';
import {triggerTrainerCutIn} from './duel-showcase.js?v=32';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const TRAINER_PRESETS=[...REGIONAL_TRAINER_PRESETS,{id:'custom',label:'Choose any two trainers',names:['RED','BLUE'],teams:[TRAINERS[0].team,TRAINERS[1].team],trainers:['red','blue']}];
export const TRAINER_BUNDLED_IDS=new Set([...TRAINERS.flatMap(p=>p.team),815]);
export const trainerActive=(view,t)=>view.fighters.find(p=>p.team===t&&!p.reserve&&!p.benched&&p.hp>0);
export function trainerSpriteRect(p){const s=trainerVisualScale(p);return{x:p.pos.x-96*s,y:p.pos.y-112*s,width:192*s,height:224*s};}
export async function sendTrainerPokemon(view,p,wait,valid){
 p.reserve=false;p.benched=false;p.entranceHidden=true;p.motion=null;p.action=null;p.charge=false;p.retiredAt=undefined;p.pos={...view.home(p)};p.baseHome={...p.pos};p.direction=p.team===0?0:4;
 if(!p.el)view.stage.querySelector('#fighters').append(view.createFighterEl(p));
 p.el.style.opacity='0';view.drawHUD();view.loadPmd();
 view.addFx('trainer-sendout',TRAINER_STANCES[p.team].hand,p.pos,p.team?'#9fcaff':'#ffb1a4',430,{behindFighters:true});
 await wait(430);if(!valid())return false;
 p.entranceHidden=false;p.el.style.opacity='1';view.addFx('trainer-release',p.pos,p.pos,p.team?'#9fcaff':'#ffb1a4',340,{behindFighters:false});view.addFx('gather',p.pos,p.pos,'#f7f1dc',300,{behindFighters:true});view.addFx('shockwave',p.pos,p.pos,p.team?'#9fcaff':'#ffb1a4',340,{behindFighters:true});view.onTrainerSendout?.(p);
 const finalAce=view.duelBeat>0&&view.fighters.filter(f=>f.team===p.team&&f.hp>0).length===1;
 if(finalAce)triggerTrainerCutIn(view,{team:p.team,title:'FINAL ACE!',subtitle:`${view.teamName(p.team)} SENDS OUT ${title(p.name).toUpperCase()}`,color:p.team?'#9acbe9':'#efb0a2',duration:1.15});
 await wait(finalAce&&view.cinematic?780:200);if(!valid())return false;await view.onReinforce?.(p,wait,valid);return valid();
}
export function drawTrainerEffect(c,e,t){
 if(e.kind==='trainer-release'){const r=10+t*44;c.save();c.globalAlpha=(1-t)*.85;c.fillStyle='#fffbe6';c.beginPath();c.arc(e.to.x,e.to.y,Math.max(2,28*(1-t)),0,Math.PI*2);c.fill();c.strokeStyle=e.color||'#fff';c.lineWidth=2.5;c.beginPath();c.ellipse(e.to.x,e.to.y+18,r,r*.35,0,0,Math.PI*2);c.stroke();c.restore();return true;}
 if(e.kind!=='trainer-sendout')return false;
 const q=Math.min(1,t),x=e.from.x+(e.to.x-e.from.x)*q,y=e.from.y+(e.to.y-e.from.y)*q-Math.sin(q*Math.PI)*38;
 c.save();for(let i=3;i>=1;i--){const tq=Math.max(0,q-i*.06),tx=e.from.x+(e.to.x-e.from.x)*tq,ty=e.from.y+(e.to.y-e.from.y)*tq-Math.sin(tq*Math.PI)*38;c.globalAlpha=(1-i*.25)*.45;c.fillStyle=e.color||'#fff4cc';c.beginPath();c.arc(tx,ty,4.5-i,0,Math.PI*2);c.fill();}
 c.globalAlpha=1;c.translate(x,y);c.rotate(q*Math.PI*3);c.fillStyle='#fff8e5';c.beginPath();c.arc(0,0,6,0,Math.PI*2);c.fill();c.fillStyle='#eb625f';c.beginPath();c.arc(0,0,6,Math.PI,Math.PI*2);c.fill();c.strokeStyle='#18202b';c.lineWidth=1.5;c.beginPath();c.moveTo(-6,0);c.lineTo(6,0);c.stroke();c.fillStyle='#18202b';c.fillRect(-2,-2,4,4);c.fillStyle='#fff';c.fillRect(-1,-1,2,2);c.restore();return true;
}
export function trainerAttackStart(view,a){if(!view.trainerMode)return;view.moveLabels?.clear();view.trainerResults=[];view.trainerAttack={...a,start:view.clock,until:view.clock+5,result:null};}
export function trainerAttackResult(view,a){if(!view.trainerMode)return;const s=view.trainerAttack;if(!s||s.actor!==a.actor)return;s.until=view.clock+1.6;s.impactAt=view.clock;noteTrainerResult(view,a);s.result=a.dodge?'DODGED':a.mult===0?'NO EFFECT':a.mult>1?'SUPER EFFECTIVE ×'+a.mult:a.mult<1?'NOT VERY EFFECTIVE ×'+a.mult:'DIRECT HIT';}
function trainer(c,x,y,team,scale=1,pose=false,image){
 if(image?.width){c.save();c.imageSmoothingEnabled=false;c.drawImage(image,x-30*scale,y-33*scale,60*scale,60*scale);c.restore();return;}
 c.save();c.translate(x,y);c.scale(scale,scale);const shirt=team?'#607dd8':'#df4c49';
 c.fillStyle='#171f30';c.fillRect(-10,-15,20,16);c.fillRect(-12,10,9,15);c.fillRect(3,10,9,15);
 c.fillStyle='#f1c292';c.fillRect(-7,-13,14,14);c.fillStyle=shirt;c.fillRect(-10,1,20,14);
 if(!team){c.fillRect(-11,-19,21,7);c.fillStyle='#f3eee0';c.fillRect(-2,-18,7,4);c.fillRect(-12,-12,12,3);}else{c.fillStyle='#a17742';for(let i=0;i<4;i++)c.fillRect(-11+i*5,-20-i%2*3,7,9);}
 c.fillStyle='#111724';c.fillRect(-5,-7,2,2);c.fillRect(4,-7,2,2);c.fillStyle='#e6e8ec';c.fillRect(-13,23,11,4);c.fillRect(3,23,11,4);
 c.fillStyle='#f1c292';c.fillRect(-14,pose?-3:4,5,11);c.fillRect(10,4,5,11);
 if(pose){c.fillStyle='#fff1d9';c.fillRect(-15,-7,6,6);c.fillStyle='#ee5c59';c.fillRect(-15,-7,6,3);}
 c.restore();
}
export function drawTrainerArena(c,view){drawStadiumSurface(c,view);}
export function drawTrainerSurroundings(c,view){drawOverworldArena(c,view);}
export function updateTrainerCamera(view){
 if(!view.trainerMode)return;
 if(view.introSweep&&view.cinematic){const raw=clamp((view.presentationTime-view.introSweep.start)/view.introSweep.dur,0,1),q=raw*raw*(3-2*raw);view.cameraZoom=1.18-q*.13;view.cameraPanY=(1-q)*115;view.cameraPanX=0;return;}
 if(!view.cinematic||view.matchIntro||view.trainerOutro||view.trainerRecall){view.cameraZoom=1;view.cameraPanX=0;view.cameraPanY=0;return;}
 const s=view.trainerAttack,active=s&&view.clock<s.until&&s.actor.hp>0&&s.target.el;
 if(!active){view.cameraZoom=1.015;view.cameraPanX=0;view.cameraPanY=0;return;}
 const a=s.actor.pos,b=s.target.pos,contact=s.actor.action==='Attack'||(isContactMove(s.move)&&((view.trainerExchange&&!s.actor.charge)||(s.result&&view.clock-s.impactAt<.32))),charge=s.actor.charge;
 const special=['bolt','meteor'].includes(s.move.fx)||(['water','ice','grass'].includes(s.move.type)&&s.move.power>=90),impact=s.result&&view.clock-s.impactAt<.34;
 const zoom=Math.min(contact?(s.move.power>=100?1.44:1.32):special?(impact?1.44:charge?1.08:1.26):charge?1.08:1.18,460/(Math.abs(a.x-b.x)+215),640/(Math.abs(a.y-b.y)+215));
 const flight=!isContactMove(s.move)?view.effects?.findLast(e=>e.start>=s.start&&['beam','bolt','flame','orb','wave','slash-wave','meteor','anime-electric','anime-meteors','element-water','element-ice','element-grass'].includes(e.kind)):null;
 const lead=contact ? .55 : flight ? .35+.3*clamp((view.clock-flight.start)/flight.duration*1.6,0,1) : s.result ? .65 : .4;
 const x=a.x*(1-lead)+b.x*lead,y=a.y*(1-lead)+b.y*lead;
 view.cameraZoom=clamp(zoom,1,1.46);view.cameraPanX=clamp((270-x)*zoom,-60,60);view.cameraPanY=clamp((485-y)*zoom,-110,110);
}
export function drawTrainerHUD(c,view){drawCompactTrainerHUD(c,view);}
export function drawTrainerIntro(c,view){drawDramaticTrainerIntro(c,view);}
export async function playTrainerOutro({view,audio,winner,wait,valid}){
 const state={winner,start:view.presentationTime};view.trainerOutro=state;view.ending=true;view.phaseTransition=true;view.trainerAttack=null;view.moveLabels.clear();
 for(const p of view.fighters){p.motion=null;p.charge=false;p.action=null;}
 audio.background(false);audio.duck?.(800);
 const loser=view.duelFinalDefeat||view.fighters.filter(p=>p.team!==winner).at(-1);
 try{audio.synth?.('thud',.8);audio.synth?.('defeat',.75);if(loser)audio.cry?.(loser.id,!!loser.bundled);await wait(900);if(!valid())return false;if(view.duelFinalDefeat?.el)view.retireFainted(view.duelFinalDefeat);const hero=trainerActive(view,winner);if(hero){hero.direction=0;hero.presentationFacing='front';hero.animKey=null;hero.gbaAnimKey=null;view.move(hero,{x:270,y:565},600);if(!hero.mega&&!hero.transformed)view.sprite(hero.el.querySelector('img'),hero.id,true,false);}audio.synth?.('whoosh',.6);audio.synth?.('drumroll',.7,.05);await wait(1700);if(!valid())return false;audio.sfx('normal','victory');audio.synth?.('fanfare',.9);audio.synth?.('win_chime',.75,.35);audio.synth?.('sparkle',.6,.9);if(hero)audio.cry?.(hero.id,!!hero.bundled);await wait(3400);if(!valid())return false;audio.synth?.('sparkle',.4);await wait(2000);return valid();}
 finally{if(view.trainerOutro===state){view.trainerOutro=null;view.phaseTransition=false;}}
}
const OUTRO_CONFETTI=['#f6d365','#ff7a7a','#7fd6ff','#b4ee77','#ff9be5','#ffffff','#ffb347'];
const ease=t=>1-(1-Math.max(0,Math.min(1,t)))**3;
function outroRand(seed){const x=Math.sin(seed*91.7+17.3)*24634.6345;return x-Math.floor(x);}
function outroBall(c,x,y,r,on){c.save();c.lineWidth=1.4;c.strokeStyle='#10141e';c.fillStyle=on?'#e8473f':'#4a4f5c';c.beginPath();c.arc(x,y,r,Math.PI,0);c.fill();c.fillStyle=on?'#f6f1e6':'#777c88';c.beginPath();c.arc(x,y,r,0,Math.PI);c.fill();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(x-r,y);c.lineTo(x+r,y);c.stroke();c.fillStyle='#f6f1e6';c.beginPath();c.arc(x,y,r*.34,0,Math.PI*2);c.fill();c.stroke();c.restore();}
function outroText(c,text,x,y,font,fill,stroke='#0d1420',width=5,max){c.font=font;c.lineJoin='round';c.strokeStyle=stroke;c.lineWidth=width;c.strokeText(text,x,y,max);c.fillStyle=fill;c.fillText(text,x,y,max);}
export function drawTrainerOutro(c,view){
 const s=view.trainerOutro;if(!s)return;const time=view.presentationTime-s.start,motion=view.cinematic!==false,hero=trainerActive(view,s.winner),spot={x:270,y:540};
 c.save();c.textAlign='center';c.textBaseline='alphabetic';
 // Phase 1: the stadium dims. Phase 2: a spotlight narrows onto the winning Pokémon.
 const dim=Math.min(1,time/.9)*.45+(time>.9?ease((time-.9)/.9)*.25:0),radius=time<.9?520:520-ease((time-.9)/1.2)*330;
 const g=c.createRadialGradient(spot.x,spot.y,Math.max(1,radius*.35),spot.x,spot.y,radius);g.addColorStop(0,'rgba(5,8,15,0)');g.addColorStop(1,`rgba(5,8,15,${dim.toFixed(3)})`);c.fillStyle=g;c.fillRect(0,0,540,960);
 if(time>.9){const beam=ease((time-.9)/.6)*.22,bg=c.createLinearGradient(0,100,0,620);bg.addColorStop(0,`rgba(255,240,200,${(beam*.2).toFixed(3)})`);bg.addColorStop(1,`rgba(255,240,200,${beam.toFixed(3)})`);c.fillStyle=bg;c.beginPath();c.moveTo(232,100);c.lineTo(308,100);c.lineTo(spot.x+120,spot.y+70);c.lineTo(spot.x-120,spot.y+70);c.closePath();c.fill();c.globalAlpha=Math.min(1,beam*2.2);c.strokeStyle='#ffeec2';c.lineWidth=2;c.beginPath();c.ellipse(spot.x,spot.y+62,96,20,0,0,Math.PI*2);c.stroke();c.globalAlpha=1;}
 if(time<2.6){const a=time<.9?Math.min(1,time/.3):Math.min(1,(time-.9)/.3),slide=(1-ease(a))*60;c.globalAlpha=a;c.fillStyle='#0b1422d0';c.fillRect(110+slide,754,320,32);c.fillStyle=time<.9?'#9aa9b8':'#edc758';c.fillRect(110+slide,754,4,32);c.fillRect(426+slide,754,4,32);
  outroText(c,time<.9?'THE DUST SETTLES…':view.teamName(s.winner)+' · VICTORIOUS',270+slide,776,'800 15px "Space Grotesk",Inter,sans-serif',time<.9?'#e9dbb2':'#ffe7a3','#15212b',3,300);c.restore();return;}
 const t=time-2.6,a=Math.min(1,t*2.5),person=trainerFor(view,s.winner),region=String(person?.region||'Indigo').toUpperCase();
 // Confetti rain, 4-corner floodlight confetti cannons, and sparkles around the champion Pokémon.
 if(motion&&t<1.6){
  const q=t/1.6,fadeC=1-Math.max(0,(q-.65)/.35);
  for(const [cx,cy,dx,dy] of [[62,269,1,1],[478,269,-1,1],[62,799,1,-1],[478,799,-1,-1]]){
   for(let i=0;i<10;i++){
    const spd=150+outroRand(i+cx)*180,ang=Math.atan2(dy,dx)+(outroRand(i*3+cy)-.5)*.65;
    const px=cx+Math.cos(ang)*spd*q,py=cy+Math.sin(ang)*spd*q+q*q*95;
    c.save();c.globalAlpha=fadeC*.95;c.translate(px,py);c.rotate(q*8+i);c.fillStyle=OUTRO_CONFETTI[(i+cx)%OUTRO_CONFETTI.length];c.fillRect(-3,-2,6,4);c.restore();
   }
  }
 }
 for(let i=0;i<(motion?48:0);i++){const speed=110+outroRand(i)*130,x=(outroRand(i+1)*560+Math.sin(t*1.7+i)*18+560)%560-10,y=-30+((t*speed+outroRand(i+2)*960)%990)-(t<.6?(1-t/.6)*200:0),rot=t*(2+outroRand(i+3)*5)+i,w=4+outroRand(i+4)*5;c.save();c.globalAlpha=Math.min(1,t*3)*.7;c.translate(x,y);c.rotate(rot);c.scale(1,Math.abs(Math.cos(t*4+i))*.8+.2);c.fillStyle=OUTRO_CONFETTI[i%OUTRO_CONFETTI.length];c.fillRect(-w/2,-2,w,4);c.restore();}
 for(let i=0;i<(motion?8:0);i++){const p=(t*.9+outroRand(i+40))%1,angle=i*2.399,x=spot.x+Math.cos(angle)*(78+outroRand(i+50)*30),y=(hero?.pos.y||565)-30+Math.sin(angle)*65,size=(1-Math.abs(p*2-1))*3.5;if(size<=.4)continue;c.save();c.translate(x,y);c.rotate(Math.PI/4);c.globalAlpha=a*.9;c.fillStyle='#fff6d4';c.fillRect(-size/2,-size*1.6,size,size*3.2);c.fillRect(-size*1.6,-size/2,size*3.2,size);c.restore();}
 c.globalAlpha=a;
 // Winner card: ribbon, trainer portrait with a victory hop, name, region title and surviving team.
 const cardY=motion?(1-ease(t/.45))*-260:0;c.save();c.translate(0,cardY);
 c.fillStyle='#08131bdd';c.fillRect(24,212,492,196);c.strokeStyle='#d5bc74';c.lineWidth=2;c.strokeRect(32,220,476,180);
 const pop=motion?(t<.5?1+(1-ease(t/.5))*.35:1):1;c.save();c.translate(270,196);c.scale(pop,pop);c.rotate(-.03);c.fillStyle='#b8392f';c.beginPath();c.moveTo(-170,-24);c.lineTo(170,-24);c.lineTo(190,0);c.lineTo(170,24);c.lineTo(-170,24);c.lineTo(-190,0);c.closePath();c.fill();c.strokeStyle='#2a0d0b';c.lineWidth=4;c.stroke();c.fillStyle='#e8584c';c.fillRect(-168,-20,336,8);
 c.textBaseline='middle';c.shadowColor='#ffcf5a';c.shadowBlur=14;const winTag=view.cupState?.active&&view.cupState.round===3&&s.winner===0?'WORLD MONARCH!':view.cupState?.active?`${view.cupState.stageLabel} WINNER!`:'WINNER!';outroText(c,winTag,0,2,'italic 900 34px "Space Grotesk",Inter,sans-serif','#ffe48a','#2a0d0b',6,320);c.shadowBlur=0;
 c.save();c.beginPath();c.rect(-190,-24,380,48);c.clip();const sweep=((t*.6)%1.6)*420-210;c.globalAlpha=motion?.2:0;c.fillStyle='#ffffff';c.beginPath();c.moveTo(sweep,-24);c.lineTo(sweep+22,-24);c.lineTo(sweep+6,24);c.lineTo(sweep-16,24);c.closePath();c.fill();c.restore();c.restore();
 c.globalAlpha=a;const hop=motion?(t<1.4?Math.abs(Math.sin(t*Math.PI*2.2))*8*(1-t/1.4):0):0;c.fillStyle='#16283a';c.fillRect(48,236,128,152);c.strokeStyle='#edc758';c.lineWidth=2;c.strokeRect(48,236,128,152);c.save();c.beginPath();c.rect(48,236,128,152);c.clip();c.globalAlpha=a*.35;c.fillStyle='#edc758';c.beginPath();c.ellipse(112,384,50,10,0,0,Math.PI*2);c.fill();c.globalAlpha=a;trainer(c,112,330-hop,s.winner,2.05,true,trainerPortrait(view,s.winner));c.restore();
 c.textAlign='left';c.textBaseline='alphabetic';outroText(c,region+' · VICTORY',196,262,'800 12px "Space Grotesk",Inter,sans-serif','#efcf82','#0d1420',3,300);
 outroText(c,view.teamName(s.winner),196,306,'italic 900 36px "Space Grotesk",Inter,sans-serif','#fff3d8','#0d1420',6,300);
 const roster=view.fighters.filter(p=>p.team===s.winner),left=roster.filter(p=>p.hp>0).length,total=roster.length||6;outroText(c,left+' OF '+total+' POKÉMON REMAIN',196,334,'700 12px Inter,sans-serif','#bed0d6','#0d1420',3,300);
 for(let i=0;i<total;i++){const k=Math.max(0,Math.min(1,(t-.4-i*.08)/.2));if(k>0)outroBall(c,206+i*30,366,Math.max(.5,10*ease(k)),roster[i]?roster[i].hp>0:i<left);}
 c.restore();
 // MVP plate under the spotlit Pokémon.
 if(hero&&t>.5){const k=ease((t-.5)/.4),dy=(1-k)*20;c.globalAlpha=k;c.textAlign='center';c.fillStyle='#0b1422d8';c.fillRect(150,660+dy,240,40);c.fillStyle='#edc758';c.fillRect(150,660+dy,240,2);c.fillRect(150,698+dy,240,2);outroText(c,'VICTORY · '+title(hero.name).toUpperCase(),270,687+dy,'italic 900 20px "Space Grotesk",Inter,sans-serif','#ffe7a3','#0d1420',4,220);}
 c.restore();
}
