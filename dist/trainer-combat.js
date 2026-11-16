import {DUEL_FIELD} from './arena-layout.js?v=32';
import {duelDashSound,playDuelAction} from './duel-actions.js?v=32';
import {duelContactPoint} from './duel-clearance.js?v=32';
import {trainerRecallPause} from './trainer-recall.js?v=32';
import {startDuelDrama,endDuelDrama} from './duel-drama.js?v=32';
import {trainerVisualScale} from './trainer-scale.js?v=32';
import {title,colors,moves,movesFor,effectiveness} from './engine.js?v=32';
import {isContactMove,hitStrength} from './combat-feel.js?v=32';
import {directionToward} from './pmd-animation.js?v=32';
import {spriteExtent} from './sprite-layout.js?v=32';
import {beforeFinishingHit} from './finishing-hit.js?v=32';
import {trainerAttackStart,trainerAttackResult} from './trainer-duel.js?v=32';
import {trainerFor} from './trainer-rosters.js?v=32';
import {triggerTrainerCutIn,setDuelWeather,noteKoStreakAndMomentum,isClutchState} from './duel-showcase.js?v=32';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const field=p=>({x:clamp(p.x,DUEL_FIELD.left,DUEL_FIELD.right),y:clamp(p.y,DUEL_FIELD.top,DUEL_FIELD.bottom)});
export const duelReach=(a,b)=>Math.max(56,(spriteExtent(a.id)*trainerVisualScale(a)+spriteExtent(b.id)*trainerVisualScale(b))*.5+10);
export function faceDuelOpponent(view,p){
 if(!view.trainerMode||view.ending||view.matchIntro||view.phaseTransition||p.reserve||p.hp<=0||p.presentationFacing)return;
 const other=view.fighters.find(q=>q.team!==p.team&&!q.reserve&&q.hp>0);if(!other)return;
 p.direction=directionToward(p.pos,other.pos);
 // Classic fallback sheets have front/back views; native sheets use all eight directions.
 if((view.style==='gba'&&!p.mega&&!p.transformed)||!view.pmd?.[p.formKey||p.id]?.anims?.Idle){const img=p.el?.querySelector('img'),back=other.pos.y<p.pos.y-8;if(img&&img.dataset.facing!==(back?'back':'front'))view.sprite(img,p.id,true,back);}
}
export function duelFormation(actor,target,rng,contact,beat=0,move){
 const dx=target.pos.x-actor.pos.x,dy=target.pos.y-actor.pos.y,angle=Math.atan2(dy,dx)+(rng()-.5)*.62;
 const reach=duelReach(actor,target),longRange=move&&(move.power>=100||['beam','bolt','meteor'].includes(move.fx)),gap=contact?reach+12+rng()*12:Math.min(266,Math.max(188,reach+110)+(longRange?32:0)+rng()*14),half=gap/2;
 const ex=Math.abs(Math.cos(angle)*half),ey=Math.abs(Math.sin(angle)*half);
 const cx=clamp((actor.pos.x+target.pos.x)/2+(rng()-.5)*86+Math.sin(beat*1.7)*19,90+ex,450-ex);
 const cy=clamp((actor.pos.y+target.pos.y)/2+(rng()-.5)*76,DUEL_FIELD.top+ey,DUEL_FIELD.bottom-ey);
 return{actor:{x:cx-Math.cos(angle)*half,y:cy-Math.sin(angle)*half},target:{x:cx+Math.cos(angle)*half,y:cy+Math.sin(angle)*half},reach};
}
function step(view,p,to,ms,style='smooth',arc=0,curve=0){p.action=null;p.charge=false;view.move(p,field(to),ms,arc,curve,style);}
function resetPose(p){p.animKey=null;p.gbaAnimKey=null;}
function live(p){return p.hp>0&&!p.reserve&&!p.benched;}
const MULTI_HITS={'dual-wingbeat':2,'double-kick':2,'rock-blast':3,'pin-missile':3,'water-shuriken':3,'scale-shot':3,'close-combat':3};
const RECOIL_MOVES=new Set(['volt-tackle','flare-blitz','brave-bird','double-edge','wild-charge','wood-hammer','take-down']);
async function activateAshGreninja(view,p,audio,w,valid,log){
 if(!p||p.id!==658||p.ashGreninja||!live(p))return;
 p.ashGreninja=true;p.name='Ash-Greninja';p.stats=[72,145,67,153,71,132];p.options=movesFor(p);
 if(!p.options.some(m=>m.name==='water-shuriken')){const ws=moves.find(m=>m.name==='water-shuriken');if(ws)p.options[0]=ws;}
 audio.sfx('water','charge');audio.synth?.('mega',.85);audio.cry?.(658,!!p.bundled);
 view.addFx('gather',p.pos,p.pos,'#4cd6ff',550);view.addFx('shockwave',p.pos,p.pos,'#ff5a6e',450);
 view.burst?.(p.pos,'#57d4ff',26);view.message('Ash-Greninja! Battle Bond!',1100,true);view.drawHUD();
 view.onHighlight?.('Ash-Greninja','perk');
 log?.('Ash and Greninja sync through the Bond Phenomenon — Ash-Greninja emerges!');
 await w(650);
}
export async function choreographTrainerExchange(a,{view,audio,wait:w,valid,rng,log,onDamage}){
 const {actor,target,move,damage,mult,crit,dodge}=a;if(!live(actor)||!live(target)||!valid())return;
 const contact=isContactMove(move),heavy=move.power>=100||crit,finisher=!dodge&&mult>0&&damage>=target.hp,c=colors[move.type]||colors.normal;
 let drama=null,contactState=null;const serious=heavy||finisher||move.fx==='bolt'||move.fx==='meteor';
 view.trainerExchange=true;view.duelBeat=(view.duelBeat||0)+1;view.focus(null,null);
 try{
  // Both fighters move into range and change their angle before the move is committed.
  const plan=duelFormation(actor,target,rng,contact,view.duelBeat,move),approach=Math.hypot(actor.pos.x-plan.actor.x,actor.pos.y-plan.actor.y)>80?290:160;
  const retreating=!contact&&Math.hypot(plan.actor.x-plan.target.x,plan.actor.y-plan.target.y)>Math.hypot(actor.pos.x-target.pos.x,actor.pos.y-target.pos.y)+24;
  const closing=contact&&(Math.hypot(actor.pos.x-target.pos.x,actor.pos.y-target.pos.y)-Math.hypot(plan.actor.x-plan.target.x,plan.actor.y-plan.target.y)>24||Math.hypot(actor.pos.x-plan.actor.x,actor.pos.y-plan.actor.y)>28),curve=contact&&move.fx==='slash'?(view.duelBeat%2?10:-10):0;
  if(retreating){view.addFx('approach-sweep',actor.pos,plan.actor,c,approach,{fighter:actor,easing:'recoil',behindFighters:true});duelDashSound(audio,.32);}
  if(closing)duelDashSound(audio,.38);
  if(closing)view.addFx('approach-sweep',actor.pos,plan.actor,c,approach,{fighter:actor,slash:move.fx==='slash',easing:'strike',curve,arc:curve?5:0,behindFighters:true});
  step(view,actor,plan.actor,approach,retreating?'recoil':closing?'strike':'smooth',curve?5:0,curve);step(view,target,plan.target,approach);
  await w(approach);if(!valid()||!live(actor)||!live(target))return;
  trainerAttackStart(view,a);view.announce(actor,move,1800);log(`${title(actor.name)} uses ${title(move.name)} on ${title(target.name)}!`);
  let dx=target.pos.x-actor.pos.x,dy=target.pos.y-actor.pos.y,dist=Math.max(1,Math.hypot(dx,dy)),nx=dx/dist,ny=dy/dist;
  const side=view.duelBeat%2?1:-1,source={...actor.pos};
  const sidestep=field({x:target.pos.x-ny*side*24,y:target.pos.y+nx*side*24});
  step(view,target,sidestep,heavy?180:110);
  step(view,actor,{x:source.x-nx*(heavy?15:8),y:source.y-ny*(heavy?15:8)},heavy?160:100);
  actor.charge=serious;actor.aura=c;
  let windup=finisher?560:heavy?440:serious?330:120;
  const ashCapFlip=actor.id===25&&!view.pikachuCapFlipUsed&&actor.hp<=actor.max*.58&&trainerFor(view,actor.team)?.id?.startsWith('ash');
  const finalFoe=finisher&&view.fighters.filter(f=>f.team===target.team&&f.hp>0).length===1;
  if(ashCapFlip){view.pikachuCapFlipUsed=true;triggerTrainerCutIn(view,{team:actor.team,title:'10,000,000 VOLT!',subtitle:`${title(move.name).toUpperCase()} · FULL POWER`,color:'#ffe76a',capFlip:true,duration:1.25});audio.synth?.('zap',.75);if(view.cinematic)windup=Math.max(windup,1100);}
  else if(finisher&&heavy&&(finalFoe||(crit&&!view.finishingCutInUsed))){view.finishingCutInUsed=true;triggerTrainerCutIn(view,{team:actor.team,title:'FINISHING BLOW!',subtitle:`${title(actor.name).toUpperCase()} · ${title(move.name).toUpperCase()}`,color:c,duration:1.15});audio.synth?.('impact',.55);if(view.cinematic)windup=Math.max(windup,1050);}
  if(serious){drama=startDuelDrama(view,{...a,color:c});view.addFx('gather',source,source,c,windup);audio.sfx(move.type,'charge');}
  await w(windup);if(!valid()||!live(actor)||!live(target))return;
  actor.charge=false;if(drama)drama.phase='release';
  const dest={...target.pos};dx=dest.x-actor.pos.x;dy=dest.y-actor.pos.y;dist=Math.max(1,Math.hypot(dx,dy));nx=dx/dist;ny=dy/dist;
  const launch={...actor.pos},hitPoint=contact?duelContactPoint(actor,target):{x:dest.x-nx*plan.reach,y:dest.y-ny*plan.reach};
  if(dodge){
   const alternatives=[1,-1].map(sign=>field({x:dest.x-ny*sign*90,y:dest.y+nx*sign*90}));
   const evade=alternatives.sort((p,q)=>Math.hypot(q.x-dest.x,q.y-dest.y)-Math.hypot(p.x-dest.x,p.y-dest.y))[0];
   step(view,target,evade,180,'recoil');view.addFx('speed',dest,evade,'#dbeeff',210);view.addFx('approach-sweep',dest,evade,'#dbeeff',180,{fighter:target,easing:'recoil',behindFighters:true});duelDashSound(audio,.55);
  }else{target.action=heavy?'Charge':null;target.charge=false;if(heavy){resetPose(target);view.addFx('brace-ground',dest,dest,c,280,{behindFighters:true});}}
  const anticipate=()=>beforeFinishingHit(view,[{target,damage,protected:mult===0||dodge}],{wait:w,valid,audio,color:c});
  view.addFx('attack-dust',launch,launch,'#c7bb9f',260,{behindFighters:true});
  if(contact){
   contactState={actor,target};view.duelContact=contactState;
   view.addFx('approach-sweep',launch,hitPoint,c,heavy?210:150,{fighter:actor,slash:move.fx==='slash',easing:'strike',arc:move.fx==='dive'?27:move.fx==='kick'?10:0,behindFighters:true});view.addFx('speed',launch,hitPoint,c,heavy?230:170);duelDashSound(audio,.72);
   step(view,actor,hitPoint,heavy?210:150,'strike',move.fx==='dive'?27:move.fx==='kick'?10:0);
   await w(heavy?110:75);if(!valid())return;
   if(finisher&&!await anticipate())return;
   await w(heavy?100:75);if(!valid())return;
   await w(playDuelAction(view,actor,'Attack',heavy?140:85));if(!valid())return;
   const kind=move.name==='close-combat'?'punch':move.name==='crunch'?'bite':['slash','bite','punch','kick','tail'].includes(move.fx)?move.fx:'impact';
   if(move.fx==='slash')view.addFx('claw-followthrough',hitPoint,dest,c,240);
   const count=MULTI_HITS[move.name]||(move.fx==='kick'?2:1);
   for(let i=0;i<count;i++){if(i>0){await w(playDuelAction(view,actor,'Attack',65));if(!valid())return;}view.addFx('strike-arc',hitPoint,dest,c,150,{flip:i%2});view.addFx(kind,hitPoint,{x:dest.x+(i%2?7:-7),y:dest.y},c,130);if(i>0&&!dodge&&mult>0){audio.sfx(move.type,'impact',.3,move);view.burst?.(dest,c,8);view.damage(target,`${i+1} HITS!`,i===count-1);}}
  }else{
   const counter=!dodge&&mult>0&&(move.power>=85||['beam','bolt','wave','orb'].includes(move.fx))?target.options?.find(m=>!isContactMove(m)&&['beam','bolt','wave','orb','burst'].includes(m.fx)):null;
   const beamClash=!!(counter&&view.cinematic&&(finisher||rng()<.28));
   if(beamClash){
    target.direction=directionToward(target.pos,actor.pos);
    await Promise.all([w(playDuelAction(view,actor,'Shoot',130)),w(playDuelAction(view,target,'Shoot',130))]);if(!valid())return;
    const mA=view.mouth(actor,target),mB=view.mouth(target,actor);
    view.duelBeamClash={actor,target,fromA:mA,fromB:mB,colorA:c,colorB:colors[counter.type]||'#9acbe9',start:view.clock,duration:1.25};
    view.shake=5;view.shakeDuration=.35;view.shakeRemaining=.35;
    view.onHighlight?.('Beam Clash','clash');
    audio.synth?.('riser',.75);audio.sfx(move.type,'beam');audio.sfx(counter.type,'attack');
    await w(625);if(!valid())return;if(finisher&&!await anticipate())return;
    await w(625);if(!valid())return;view.duelBeamClash=null;view.burst?.({x:(mA.x+mB.x)/2,y:(mA.y+mB.y)/2},c,18);audio.synth?.('impact',.9);audio.synth?.('zap',.6);
   }else{
    await w(playDuelAction(view,actor,'Shoot',heavy?150:85));if(!valid())return;
    const mouth=view.mouth(actor,target),kind=move.name==='flamethrower'||move.name==='sacred-fire'?'flame':move.fx==='slash'?'slash-wave':move.fx==='burst'?'orb':move.fx;
    const duration=heavy?430:290;view.addFx('muzzle',mouth,dest,c,160);audio.sfx(move.type,'attack');
    if(move.name==='shadow-force')view.addFx('rift',dest,dest,c,350);
    const multiCount=!contact?MULTI_HITS[move.name]:0;
    if(multiCount){
     for(let i=0;i<multiCount;i++){
      if(i>0){await w(105);if(!valid())return;audio.sfx(move.type,'attack');}
      view.addFx(kind,mouth,{x:dest.x+(i%2?8:-8),y:dest.y},c,240);
      if(i>0&&!dodge&&mult>0){view.burst?.(dest,c,8);view.damage(target,`${i+1} HITS!`,i===multiCount-1);}
     }
    }else if(move.fx==='bolt'){view.addFx('anime-electric',mouth,dest,c,550);}
    else if(move.fx==='meteor'){view.addFx('anime-meteors',mouth,dest,c,750);}
    else if(['water','ice','grass'].includes(move.type)){view.addFx('element-'+move.type,mouth,dest,c,move.type==='ice'?550:move.type==='grass'&&move.fx==='beam'?580:520,{variant:move.name==='hydro-pump'?'hydro-pump':move.fx});}
    else if(move.fx==='ground'){view.addFx('fissure',launch,dest,c,250);view.addFx('ground',launch,dest,c,duration,{hero:heavy});}
    else if(move.name==='hydro-pump'&&actor.id===9){for(const offset of [-10,10])view.addFx('beam',{x:mouth.x+offset,y:mouth.y},dest,c,duration,{wide:heavy});}
    else view.addFx(kind,mouth,dest,c,duration,{wide:heavy});
    const travel=move.fx==='meteor'?500:move.fx==='bolt'?300:move.type==='water'||move.type==='ice'?320:move.type==='grass'?(move.fx==='beam'?360:290):heavy?280:185;
    await w(Math.round(travel*.48));if(!valid())return;if(finisher&&!await anticipate())return;
    await w(Math.round(travel*.52));if(!valid())return;
   }
  }
  actor.charge=false;target.charge=false;
  // The preselected dodge and actual type multiplier determine the outcome, not the animation.
  trainerAttackResult(view,a);
  if(dodge){
   if(target.id===445&&trainerFor(view,target.team)?.id==='cynthia'){view.burst?.(dest,'#e2c48c',16);view.damage(target,'SAND VEIL!');}
   else view.damage(target,'DODGED');
   log(title(target.name)+' dodges!');
  }
  else if(mult===0){view.damage(target,'IMMUNE');log('It has no effect on '+title(target.name)+'.');}
  else{
   if(!finisher&&!await anticipate())return;
   target.hp=Math.max(0,target.hp-damage);target.faintAt=view.clock+(finisher?.58:.19);if(drama)drama.phase='impact';
   const strength=hitStrength({move,damage,target,crit,finisher});view.impact(target,c,strength);view.updateHP(target);onDamage?.(damage,actor,target);
   view.damage(target,(crit?'CRIT ':'')+'−'+damage,crit);view.addFx('element-impact',dest,dest,c,460,{element:move.type});if(view.trainerMode){view.addFx('ground-decal',dest,dest,c,2600,{element:move.type,behindFighters:true});setDuelWeather(view,move);noteKoStreakAndMomentum(view,actor,target,mult,damage,target.hp<=0);if(!view.clutchCuePlayed&&isClutchState(view)){view.clutchCuePlayed=true;audio.synth?.('clutch',.75);}}audio.sfx(move.type,'impact',strength,move);
   if(contact&&!finisher){await w(75);if(!valid())return;}
   const skid=field({x:dest.x+nx*(finisher?41:heavy?32:19),y:dest.y+ny*(finisher?41:heavy?32:19)});view.addFx('skid-ground',dest,skid,'#cbbd9b',finisher?500:360,{behindFighters:true});step(view,target,skid,finisher?280:150,'recoil');
   if(finisher&&view.cinematic){view.slowRemaining=.36;view.timeScale=.35;audio.duck?.(1100);}
   if(finisher){await w(300);if(!valid())return;}
   if(['fire','water','ice','ground','rock','electric'].includes(move.type))view.scar(dest,move.type);
   if(RECOIL_MOVES.has(move.name)&&actor.hp>1){const recoil=Math.max(1,Math.min(actor.hp-1,Math.round(damage*.22)));actor.hp=Math.max(1,actor.hp-recoil);actor.hitUntil=view.clock+.16;view.updateHP(actor);view.damage(actor,'RECOIL −'+recoil);view.addFx('impact',actor.pos,actor.pos,'#ff8e66',180);}
   if(actor.wildfireActive&&target.hp>1){const burn=Math.min(target.hp-1,12);target.hp-=burn;view.updateHP(target);view.damage(target,'WILDFIRE −'+burn);}
   log(`${damage} damage.${crit?' Critical hit!':''}${mult>1?' Super effective!':mult<1?' Not very effective.':''}`);
  }
  actor.action=null;target.action=null;
  // Stay in the fight. Recover sideways from the impact rather than returning to starting slots.
  step(view,actor,{x:actor.pos.x+ny*side*19-nx*9,y:actor.pos.y-nx*side*19-ny*9},heavy?180:120);
  await w(heavy?185:125);if(!valid())return;
  if(target.hp<=0){
   audio.sfx('normal','collapse');audio.cry(target.id,!!target.bundled);log(title(target.name)+' fainted!','ko');const next=view.fighters.find(p=>p.team===target.team&&p.reserve&&p.hp>0)||view.fighters.find(p=>p.team===target.team&&p.benched&&p.hp>0);await w(next?500:820);if(!valid())return;
   if(!next){view.duelFinalDefeat=target;view.onHighlight?.('Final KO','ko');}else{view.retireFainted(target);await w(240);if(!valid())return;}
   if(next){endDuelDrama(view,drama);if(!await trainerRecallPause(view,target.team,next,w,valid,target.pos))return;next.slot=0;log(title(next.name)+' enters as reinforcement for '+view.teamName(target.team)+'!');await view.spawnReinforcement(next,w,valid);}
   if(valid()&&live(actor)&&actor.id===658&&!actor.ashGreninja&&trainerFor(view,actor.team)?.id?.startsWith('ash'))await activateAshGreninja(view,actor,audio,w,valid,log);
  }else{
   if(target.id===658&&!target.ashGreninja&&target.hp<=target.max*.58&&trainerFor(view,target.team)?.id?.startsWith('ash'))await activateAshGreninja(view,target,audio,w,valid,log);
   if(target.id===6&&!target.wildfireActive&&target.hp<=target.max*.52&&trainerFor(view,target.team)?.id==='leon'){target.wildfireActive=true;view.message('G-MAX WILDFIRE!',1000,true);view.burst?.(target.pos,'#ff6e2e',24);audio.sfx('fire','attack');view.onHighlight?.('G-Max Wildfire','perk');log('Leon\'s Charizard ignites the stadium with G-Max Wildfire!');}
   if(valid()&&view.canLowHpMega?.(target)&&target.hp<=target.max*.58)await view.triggerLowHpMega?.(target,w,valid);
   if(valid()&&live(target)&&mult>=2&&target.hp<=target.max*.48&&!target.switchedIn&&rng()<.35){
    const counter=view.fighters.find(p=>p.team===target.team&&p.reserve&&p.hp>0&&actor.types.every(t=>effectiveness(t,p.types)<=1));
    if(counter){
     view.message('TACTICAL SWITCH!',850,true);view.onHighlight?.('Tactical Switch','switch');
     log(`${view.teamName(target.team)} recalls ${title(target.name)} for a tactical switch!`);audio.synth?.('whoosh',.55);
     if(!await trainerRecallPause(view,target.team,counter,w,valid,target.pos))return;
     target.benched=true;target.el?.remove();target.el=null;counter.slot=0;counter.switchedIn=true;
     await view.spawnReinforcement(counter,w,valid);
    }
   }
  }
  if(valid()&&live(actor)&&view.canLowHpMega?.(actor)&&actor.hp<=actor.max*.58)await view.triggerLowHpMega?.(actor,w,valid);
  if(valid()&&live(actor)&&view.canMidEvolve?.(actor))await view.tryMidBattleEvolution?.(actor,w,valid);
 }finally{
  endDuelDrama(view,drama);view.duelBeamClash=null;if(view.duelContact===contactState)view.duelContact=null;view.trainerExchange=false;for(const p of [actor,target]){p.charge=false;p.action=null;p.duelAnimRate=1;if(valid())faceDuelOpponent(view,p);}
 }
}
