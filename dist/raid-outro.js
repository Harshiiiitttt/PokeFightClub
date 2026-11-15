import {applyFormArt} from './form-art.js?v=21';
import {endBeamStruggle} from './beam-struggle.js?v=21';
export const OUTRO_STEPS=[['impact',100],['collapse',1200],['silence',800],['pose',2200],['title',700],['hold',2000]];
export async function playRaidOutro({view,audio,fighters,winner,name,wait,valid}){
 const boss=fighters.find(p=>p.isBoss),survivors=fighters.filter(p=>p.team===winner&&p.hp>0),heroes=[...survivors].sort((a,b)=>a.slot-b.slot).slice(0,3),bossWin=winner===0&&!!boss;
 endBeamStruggle(view);view.ending=true;view.summoning=true;view.effects=[];view.moveLabels?.clear();view.notice=null;view.label=null;view.focus(null,null);view.letterbox=.6;view.cameraZoom=1;view.cameraPanY=0;view.outroTime=0;view.hudOpacity=1;
 view.stage?.classList.add('outro-active');view.stage?.style.setProperty('--outro-hud','1');
 for(const p of fighters){p.motion=null;p.charge=false;p.action=null;if(p.hp<=0&&p.el){view.captureDefeat?.(p);p.el.remove();p.el=null;}}
 const snapshot=view.defeatSnapshot?.team===winner?null:view.defeatSnapshot;
 const state={phase:'impact',phaseStarted:0,bossWin,name:name.replace(/\s+\(TOTAL VICTORY\)$/,''),heroes,snapshot,fade:0};view.outroState=state;
 audio.background(false);audio.sfx('normal','impact',1);
 try{
  for(const [phase,duration] of OUTRO_STEPS){
   state.phase=phase;state.phaseStarted=view.outroTime;
   if(phase==='impact'&&view.cinematic){view.hitStop=.1;view.flash=.12;view.flashColor='#fff2cf';}
   if(phase==='collapse'){
    if(view.cinematic){view.slowRemaining=.65;view.shake=8;view.shakeDuration=.35;view.shakeRemaining=.35;view.shakeClock=0;}
    audio.sfx('normal','collapse');
   }
   if(phase==='silence'){audio.hush?.();view.phase2Vortex=bossWin?view.phase2Vortex:null;view.vortexSuppression=bossWin?0:1;view.hudTarget=0;view.stage?.style.setProperty('--outro-hud','0');}
   if(phase==='pose'){
    for(const p of survivors){p.outroDimmed=!heroes.includes(p);p.el?.classList.toggle('outro-background',p.outroDimmed);}
    const positions=heroes.length===1?[{x:270,y:475}]:heroes.length===2?[{x:190,y:480},{x:350,y:480}]:[{x:145,y:480},{x:270,y:535},{x:395,y:480}];
    heroes.forEach((p,i)=>{p.presentationFacing='front';p.direction=0;p.action=null;p.outroInjured=p.hp/p.max<.3;p.outroHero=!p.isBoss;p.heroEntrance=!p.isBoss;p.el?.classList.add('outro-hero');p.el?.classList.toggle('outro-injured',p.outroInjured);if(p.formKey)applyFormArt(view,p,p.formKey);else{const img=p.el?.querySelector('img');if(img)view.sprite?.(img,p.id,true,false)}view.move(p,positions[i],600);});
    if(bossWin){audio.cry(boss.id,!!boss.bundled);audio.sfx('dark','charge');}
   }
   if(phase==='title')audio.sfx('normal','victory');
   await wait(duration);if(!valid())return false;
  }
  return true;
 }finally{if(valid()){view.outroState=null;view.summoning=false;view.letterbox=0;view.cameraZoom=1;view.cameraPanY=0;}}
}
