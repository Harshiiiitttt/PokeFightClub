import {presentGuardian} from './guardian-presentation.js?v=21';
export const GUARDIAN_LANDINGS=[{x:145,y:650},{x:395,y:650},{x:270,y:690}];
export async function playGuardianEntrance({boss,guardians,fallen,view,audio,wait,valid,attach,awaken,log,willLabel}){
 const cinematic=view.cinematic!==false,w=ms=>wait(cinematic?ms:Math.round(ms*.35));
 const fx=(kind,from,to,color,duration,extra={})=>view.addFx(kind,from,to,color,duration,{...extra,behindFighters:true});
 const colors=guardians.map(g=>g.summonColor||'#ffe58a');
 const shake=(power,duration)=>{if(!cinematic)return;Object.assign(view,{shake:power,shakeDuration:duration,shakeRemaining:duration,shakeClock:0})};
 view.summoning=true;view.cameraZoom=1;view.cameraPanY=0;view.label=null;view.moveLabels?.clear();view.notice=null;view.focus(null,null);view.letterbox=cinematic?1:0;
 boss.motion=null;boss.action=null;boss.charge=true;boss.baseHome={x:270,y:285};boss.direction=0;view.move(boss,boss.baseHome,520);
 const points=Array.from({length:50},(_,i)=>({...fallen[i]?.pos||{x:45+i*97%450,y:260+i*139%500}}));
 try{
  view.summonDim=cinematic?.66:.24;
  fx('soul-gather',{x:270,y:480},{x:270,y:700},'#b7eaff',2300,{points,targets:GUARDIAN_LANDINGS,colors});
  for(let i=0;i<3;i++)fx('summon-rune',GUARDIAN_LANDINGS[i],GUARDIAN_LANDINGS[i],colors[i],11000,{element:guardians[i].types[0],index:i});
  audio.quiet?.(2200);audio.sfx('fairy','charge');view.message('WILL OF THE 50',1800,true);log('Fifty souls rise and gather in the three elemental runes.');
  await w(2300);if(!valid())return false;
  for(let i=0;i<3;i++){
   const g=guardians[i],pos=GUARDIAN_LANDINGS[i],leader=i===2,color=colors[i];
   fx('sky-pillar',{x:pos.x,y:-160},pos,color,1100,{leader,element:g.types[0]});audio.sfx(g.types[0],'beam');
   await w(180);if(!valid())return false;
   attach(g,{x:pos.x,y:leader?-130:pos.y-170});g.entranceHidden=false;presentGuardian(view,g,true);g.silhouette=true;g.el?.classList.add('guardian-silhouette');g.charge=true;g.aura=color;
   view.move(g,pos,leader?650:420);
   await w(leader?650:420);if(!valid())return false;
   g.pos={...pos};g.motion=null;g.baseHome={...pos};
   view.scar?.(pos,g.types[0]);fx('landing-crater',pos,pos,color,850,{leader});fx('guardian-pulse',pos,pos,color,700);view.burst(pos,color,leader?40:24);
   fx('landing-dust',pos,pos,color,850);g.action='Hurt';
   shake(leader?16:10,leader?.8:.5);audio.sfx(g.types[0],'impact',1);audio.cry(g.id,!!g.bundled);
   log(`${leader?'Apex leader':i===0?'Left guardian':'Right guardian'} ${g.name} lands!`);
   await w(100);if(!valid())return false;
   g.silhouette=false;g.el?.classList.remove('guardian-silhouette');
   view.move(g,{x:pos.x,y:pos.y+8},90);await w(90);if(!valid())return false;
   view.move(g,pos,140);await w(140);if(!valid())return false;g.pos={...pos};g.motion=null;g.action=null;
   await w(leader?440:290);if(!valid())return false;
  }
  view.notice=null;
  view.addFx('guardian-cutin',{x:0,y:480},{x:540,y:480},'#ffe58a',2100,{guardians:guardians.map(g=>({id:g.id,name:g.awakenedName||g.name,color:g.summonColor,portraitKey:'guardian-portrait-'+g.id}))});
  audio.sfx('flying','dash');audio.duck?.(2400);
  await w(2100);if(!valid())return false;
  for(let i=0;i<3;i++){const g=guardians[i];fx('evolution',g.pos,g.pos,colors[i],1350,{species:g.id,compact:true});fx('awakening-helix',g.pos,g.pos,colors[i],1350);g.charge=true;}
  audio.sfx('fairy','charge');await w(800);if(!valid())return false;
  awaken();for(const g of guardians)presentGuardian(view,g,true);
  for(let i=0;i<3;i++){const g=guardians[i];fx('guardian-pulse',g.pos,g.pos,colors[i],900);view.burst(g.pos,'#ffe599',24)}
  fx('guardian-dawn',{x:270,y:730},{x:270,y:285},'#ffe599',1600);view.vortexSuppression=1;view.summonDim=.15;
  if(cinematic){view.flash=.1;view.flashColor='#ffe9a0'}shake(12,.65);audio.sfx('fairy','impact',1);
  log(`${guardians.map(g=>g.name).join(', ')} awaken together (${willLabel})!`);
  await w(650);if(!valid())return false;
  for(const g of guardians)g.charge=false;
  view.addFx('guardian-rollcall',{x:270,y:650},{x:270,y:650},'#ffe599',1200,{guardians:guardians.map(g=>({name:g.name,pos:{...g.pos},color:g.summonColor}))});
  await w(1150);if(!valid())return false;
  for(const g of guardians)presentGuardian(view,g,false);
  boss.action='Hurt';boss.charge=false;boss.reactionShot=true;boss.el?.classList.add('boss-reaction-muted');audio.quiet?.(650);
  view.addFx('boss-reaction',boss.pos,boss.pos,boss.aura||'#ff5a86',700,{portrait:boss.el?.querySelector('canvas'),name:boss.name});
  await w(650);if(!valid())return false;boss.action=null;boss.reactionShot=false;boss.el?.classList.remove('boss-reaction-muted');
  view.cameraZoom=cinematic?1.16:1;view.cameraPanY=cinematic?65:0;
  boss.baseHome={x:270,y:285};boss.direction=0;view.move(boss,boss.baseHome,400);boss.action='Attack';boss.charge=false;
  const hpBefore=boss.hp;
  audio.cry(boss.id,!!boss.bundled);audio.sfx('dark','impact',.9);shake(13,.7);
  fx('guardian-pulse',boss.baseHome,boss.baseHome,'#ff4d79',850);
  for(let step=1;step<=10;step++){boss.hp=Math.round(hpBefore+(boss.max-hpBefore)*step/10);view.updateHP(boss);await w(65);if(!valid())return false;}
  boss.hp=boss.max;view.updateHP(boss);boss.action=null;
  view.message('BOSS · FULL POWER',450,true);log(`${boss.name} roars and regenerates to FULL HP (${boss.max}/${boss.max})!`);
  await w(350);if(!valid())return false;
  view.cameraZoom=cinematic?1.06:1;view.cameraPanY=0;view.summonDim=0;
  for(const g of guardians){g.charge=false;g.action=null;g.direction=4;g.baseHome={x:g.pos.x,y:g.pos.y-20};view.move(g,g.baseHome,300)}
  audio.sfx('steel','dash');await w(320);if(!valid())return false;
  boss.guardianEntranceReady=true;view.notice=null;
  return true;
 }finally{
  // A stopped battle mounts a fresh view; never overwrite that new run's state.
  if(valid()){for(const g of guardians){g.silhouette=false;g.el?.classList.remove('guardian-silhouette');presentGuardian(view,g,false);}view.summoning=false;view.summonDim=0;view.cameraPanY=0;view.cameraZoom=1;view.letterbox=0;boss.charge=false;}
 }
}
