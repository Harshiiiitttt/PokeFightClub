import {beforeFinishingHit} from './finishing-hit.js?v=21';
import {guardianHomes,guardianContactDistance} from './guardian-spacing.js?v=21';
import {beginBeamStruggle,endBeamStruggle} from './beam-struggle.js?v=21';
import {megaForms} from './mega.js?v=21';
import {GUARDIAN_AWAKENINGS} from './battle-modes.js?v=21';
import {applyFormArt,EVOLVED_FORM_KEYS} from './form-art.js?v=21';
import {spriteExtent} from './sprite-layout.js?v=21';
import {isContactMove,hitStrength} from './combat-feel.js?v=21';
import {directionToward} from './pmd-animation.js?v=21';
import {arenaMoveMultiplier} from './arena-catalog.js?v=21';
import {title,colors,effectiveness} from './engine.js?v=21';
const signature=new Set(['thunder','roar-of-time','precipice-blades','spacial-rend','dragon-ascent','shadow-force','hydro-pump','solar-beam','aeroblast','dynamax-cannon','eternabeam','judgment','light-that-burns-the-sky','core-enforcer']);
const assets={fire:'fireball',water:'waterwisp',electric:'electroball',grass:'energyball',ice:'iceball',ghost:'shadowball',psychic:'shadowball',dragon:'shadowball',dark:'shadowball',poison:'poisonwisp',fairy:'energyball',steel:'rock2',normal:'energyball',fighting:'energyball'};
export async function choreograph(a,{view,audio,wait:w,valid,rng,log,onDamage}){
 const {actor,target,move,damage,mult,crit,dodge}=a,c=colors[move.type],source={...actor.pos},dest={...target.pos},dx=dest.x-source.x,dy=dest.y-source.y,dist=Math.max(1,Math.hypot(dx,dy)),nx=dx/dist,ny=dy/dist,raidClose=!a.spacedRaid&&!!(a.raidClose||actor.isBoss||target.isBoss),nativeContact=isContactMove(move),physical=nativeContact||raidClose,hero=signature.has(move.name),finisher=damage>=target.hp&&!dodge&&mult>0,strength=hitStrength({move,damage,target,crit,finisher}),heavy=strength>=.75,asset=assets[move.type]||'energyball',squad=a.squadAttackers||[],squadOrigins=squad.map(al=>({al,pos:{...(al.baseHome||al.pos)}}));
 let anticipated=false;
 const anticipate=async()=>{
  const amount=damage||Math.round(target.max*.65),hits=[{target,damage:amount,protected:raidClose&&view.canLowHpMega?.(target)},...(a.splashTargets||[]).map(target=>({target,damage:Math.max(1,Math.round(amount*.72)),protected:raidClose&&view.canLowHpMega?.(target)}))];
  if(anticipated||dodge||mult===0||!hits.some(h=>!h.protected&&h.target.hp>0&&h.damage>=h.target.hp))return valid();
  anticipated=true;return beforeFinishingHit(view,hits,{wait:w,valid,audio,color:c});
 };
 actor.direction=directionToward(source,dest);if(!a.spacedRaid&&(!raidClose||actor.isBoss||actor.mega))view.focus(actor,target,hero);actor.charge=true;actor.aura=c;actor.lean=-ny*5;for(const {al,pos} of squadOrigins){al.direction=directionToward(pos,dest);al.charge=true;al.aura=c;}view.announce(actor,move);for(const al of squad)view.announce(al,move);if(!actor.lastStand&&actor.hp/actor.max<.25&&view.fighters.filter(p=>p.team===actor.team&&p.hp>0).length===1){actor.lastStand=true;view.message('LAST STAND — '+title(actor.name),700);log(title(actor.name)+' is the last hope for '+view.teamName(actor.team)+'!');audio.cry(actor.id,!!actor.bundled)}log(squad.length?`${title(actor.name)} leads a ${squad.length+1}-Pokémon squad assault with ${title(move.name)}!`:`${title(actor.name)} uses ${title(move.name)} on ${title(target.name)}!`);
 const warmup=raidClose?(actor.isBoss?400:290):hero?540:physical?240:360;view.addFx('gather',source,source,c,warmup,{asset,hero});audio.sfx(move.type,'charge');if(hero||actor.isBoss)audio.cry(actor.id,!!actor.bundled);await w(warmup);if(!valid())return;
 actor.charge=false;actor.lean=ny*8;actor.animKey=null;actor.gbaAnimKey=null;for(const {al} of squadOrigins)al.charge=false;if(!physical){actor.action='Shoot';await w(view.attackDelay(actor,'Shoot'));if(!valid())return;}
 if(physical&&!raidClose&&!['shadow-force','dragon-ascent'].includes(move.name)){
  const pullback=move.fx==='slash'?18:move.name==='body-slam'?22:move.fx==='kick'?16:12;
  view.move(actor,{x:source.x-nx*pullback,y:source.y-ny*pullback},120);
  await w(120);if(!valid())return;
 }
 if(move.name==='thunder'&&!raidClose){audio.quiet?.(180);await w(180);if(!valid())return;}
 if(move.fx==='beam'&&!raidClose)view.move(actor,{x:source.x-nx*14,y:source.y-ny*14},210);
 if(finisher)audio.duck?.(950);
 view.addFx('attack-dust',source,source,'#c7bb9f',380,{behindFighters:true});if(!physical)view.addFx('muzzle',view.mouth(actor,target),dest,c,230);audio.sfx(move.type,physical?'dash':'attack');if(move.fx==='beam'&&!['water','fire'].includes(move.type))audio.cue?.('beam',.6);
 const reach=a.spacedRaid?guardianContactDistance(actor,target):Math.max(42,Math.min(66,(spriteExtent(actor.id)+spriteExtent(target.id))*.38)),contact={x:dest.x-nx*reach,y:dest.y-ny*reach};
 if(dodge){const evasion={x:clamp(dest.x+(dest.x<270?48:-48),70,470),y:dest.y+(target.team===0?-22:22)};target.direction=directionToward(dest,evasion);view.move(target,evasion,190);}
 if(move.name==='shadow-force'){
  actor.el.style.opacity='0';view.addFx('portal',source,source,c,360);await w(180);if(!valid())return;actor.pos={x:dest.x+nx*reach,y:dest.y+ny*reach};view.addFx('portal',actor.pos,actor.pos,c,380);actor.el.style.opacity='1';actor.action='Attack';actor.animKey=null;await w(140);if(!valid())return;view.move(actor,contact,140);view.addFx('slash',actor.pos,dest,c,220);if(!await anticipate())return;await w(140);
 }else if(move.name==='dragon-ascent'){
  view.addFx('ascent',source,contact,c,660,{asset});await view.motion(actor,{x:source.x-nx*22,y:source.y-ny*30},160,w,42);if(!valid())return;actor.lean=ny*13;view.move(actor,contact,240,28,0,'strike');await w(130);if(!await anticipate())return;await w(110);
 }else if(physical){
  if(move.fx==='rush'||raidClose)view.addFx('speed',source,contact,c,300);
  if(raidClose&&!actor.isBoss){
   for(const {al,pos} of squadOrigins){
    const adx=dest.x-pos.x,ady=dest.y-pos.y,ad=Math.max(1,Math.hypot(adx,ady));
    const alContact={x:dest.x-(adx/ad)*54,y:dest.y-(ady/ad)*54};
    view.addFx('speed',pos,alContact,c,300);
    view.move(al,alContact,320,16);
   }
  }else if(raidClose&&actor.isBoss){
   const bossFx=move.name==='flamethrower'?'flame':move.name==='draco-meteor'||move.fx==='meteor'?'meteor':move.name==='cross-poison'||move.fx==='slash'?'slash-wave':move.name==='sludge-bomb'||move.fx==='orb'?'wave':'beam';
   if(move.name==='eternabeam')view.addFx('rift',dest,dest,'#ff4d79',440);
   else view.addFx('shockwave',source,source,c,380);
   if(a.splashTargets?.length){
    for(const sub of a.splashTargets)view.addFx(bossFx,source,sub.pos,c,360,{asset,wide:move.name==='eternabeam'||move.name==='dynamax-cannon'});
   }
  }
  await view.motion(actor,contact,raidClose?330:move.fx==='rush'?240:Math.max(260,Math.min(520,dist*.95)),w,move.fx==='dive'?72:move.fx==='kick'?24:move.name==='body-slam'||raidClose?18:0,!a.spacedRaid&&move.fx==='slash'?(actor.team===0?26:-26):0,'strike');if(!valid())return;
  actor.action='Attack';if(!await anticipate())return;for(const {al} of squadOrigins)al.action='Attack';await w(raidClose?Math.max(160,Math.min(240,view.attackDelay(actor,'Attack'))):view.attackDelay(actor,'Attack'));if(!valid())return;let kind=move.name==='crunch'?'bite':move.name==='close-combat'?'punch':move.fx;
  if(!nativeContact&&raidClose){
   const distFx=move.name==='flamethrower'||move.name==='sacred-fire'?'flame':move.name==='draco-meteor'||move.fx==='meteor'?'meteor':move.name==='thunder'||move.fx==='bolt'?'bolt':move.fx==='burst'?'orb':move.fx;
   view.addFx(distFx,contact,dest,c,340,{asset,wide:hero});
  }
  if(!['slash','bite','punch','kick','tail'].includes(kind))kind='impact';
  const hits=raidClose?1:move.name==='close-combat'?3:move.fx==='kick'?2:1;
  for(let i=0;i<hits;i++){actor.animKey=null;actor.gbaAnimKey=null;view.addFx('strike-arc',contact,dest,c,180,{flip:i%2});const hit={x:dest.x+(i%2?9:-9),y:dest.y+(i%2?-5:5)};if(!dodge||kind!=='impact')view.addFx(kind,contact,hit,c,160);if(i<hits-1){if(!dodge&&mult>0){target.hitUntil=view.clock+.08;view.burst(hit,c,6);audio.sfx('fighting','impact',false,{fx:'punch'})}actor.lean=ny*(i%2?12:-4);await w(100);if(!valid())return}}
 }else if(move.name==='thunder'){
  const top={x:dest.x-28,y:dest.y-170};
  view.addFx('bolt',top,dest,c,280);
  for(const side of [-1,1])view.addFx('bolt',{x:top.x+14,y:top.y+65},{x:dest.x+side*32,y:dest.y-16},c,160);
  await w(90);if(!await anticipate())return;await w(110);
 }else if(move.name==='spacial-rend'){
  view.addFx('rift',dest,dest,c,600);await w(340);if(!valid())return;view.addFx('slash',source,dest,'#e2ffff',180);if(!await anticipate())return;
 }else if(move.name==='precipice-blades'||move.fx==='ground'){
  view.addFx('fissure',source,dest,c,500);await w(180);if(!valid())return;audio.sfx('ground');view.addFx('ground',source,dest,c,780,{hero});await w(420);if(!await anticipate())return;await w(160);
 }else if(move.name==='roar-of-time'){
  view.addFx('time',source,source,'#78ddff',750);view.particleStall=.24;await w(240);if(!valid())return;view.addFx('beam',view.mouth(actor,target),dest,'#85e9ff',680,{asset,wide:true,caster:actor,victim:target});await w(300);if(!await anticipate())return;await w(150);
 }else if(move.fx==='meteor'){
  view.addFx('meteor',source,dest,c,780);await w(430);if(!await anticipate())return;await w(160);
 }else if(move.fx==='slash'){
  view.addFx('slash-wave',view.mouth(actor,target),dest,c,500);await w(250);if(!await anticipate())return;await w(160);
 }else{
  const kind=move.name==='flamethrower'||move.name==='sacred-fire'?'flame':move.fx==='burst'?'orb':move.fx;
  if(move.name==='hydro-pump'&&actor.id===9){const mouth=view.mouth(actor,target);for(const side of [-1,1])view.addFx('beam',{x:mouth.x+side*14,y:mouth.y},dest,c,620,{asset,caster:actor,victim:target,muzzleX:side*14})}
  else view.addFx(kind,view.mouth(actor,target),dest,c,620,{asset,wide:hero,...(['beam','flame'].includes(kind)?{caster:actor,victim:target}:{})});
  await w(280);if(!await anticipate())return;await w(140);
 }
 if(!valid())return;
 actor.lean=0;
 const lowHpMegas=[];
 if(dodge&&!(raidClose&&view.canLowHpMega?.(target))){audio.sfx(move.type,'miss');view.damage(target,'DODGED');log(title(target.name)+' dodges!');}
 else if(mult===0&&!(raidClose&&view.canLowHpMega?.(target))){view.damage(target,'IMMUNE');log('It has no effect on '+title(target.name)+'.');}
 else{
  const effDmg=damage||Math.round(target.max*.65);
  if(!await anticipate())return;
  if(target.hp<=0)return;
  target.hp=Math.max(0,target.hp-effDmg);
  if(raidClose&&view.canLowHpMega?.(target)&&target.hp<=target.max*.55){
   target.hp=Math.max(1,Math.min(target.hp,Math.round(target.max*.2)));
   lowHpMegas.push(target);
  }
  target.faintAt=view.clock+(raidClose?.08:.32);onDamage?.(effDmg,actor,target);view.impact(target,c,strength);view.updateHP(target);const shown=target.isBoss?effDmg:Math.min(100,Math.round(effDmg/target.max*100));view.damage(target,squad.length?`${crit?'CRIT ':'SQUAD '}−${shown}`:(crit?'CRITICAL −'+shown:'−'+shown),crit);audio.sfx(move.type,'impact',strength,move);if(heavy)view.burst(target.pos,'#b29c78',12);
  if(a.splashTargets?.length){for(const sub of a.splashTargets){const sd=Math.max(1,Math.round(effDmg*.72));sub.hp=Math.max(0,sub.hp-sd);if(raidClose&&view.canLowHpMega?.(sub)&&sub.hp<=sub.max*.65){sub.hp=Math.max(1,Math.min(sub.hp,Math.round(sub.max*.22)));lowHpMegas.push(sub);}sub.faintAt=view.clock+(raidClose?.08:.32);onDamage?.(sd,actor,sub);view.impact(sub,c,.32);view.updateHP(sub);if(!raidClose)view.damage(sub,'−'+Math.min(100,Math.round(sd/sub.max*100)),false);}}
  const recoil=finisher?36:heavy?25:15;view.move(target,{x:clamp(dest.x+nx*recoil,40,500),y:clamp(dest.y+ny*recoil,190,805)},180,0,0,'recoil');
  if(['fire','water','ice','ground','rock','electric'].includes(move.type))view.scar(dest,move.type);if(move.type==='water')view.addFx('splash',dest,dest,c,560);if(move.type==='ice')view.addFx('ice-shards',dest,dest,c,500);if(move.type==='fire'&&heavy)view.addFx('smoke',dest,dest,c,850);if(move.name==='thunder'&&!raidClose){await w(140);if(!valid())return;audio.sfx('electric','thunder');}
  log(`${effDmg} damage.${crit?' Critical hit!':''}${mult>1?' Super effective!':mult<1?' Not very effective.':''}`);
  if(!raidClose){if(crit)view.message('A critical hit!',430);else if(mult>1)view.message('Super effective!',350);}
 }
 await w(raidClose?210:finisher?310:crit?220:140);if(!valid())return;view.label=null;
 if(physical){
  actor.action=null;actor.direction=directionToward(actor.pos,source);view.move(actor,source,raidClose?310:390);
  for(const {al,pos} of squadOrigins){al.action=null;al.direction=directionToward(al.pos,pos);view.move(al,pos,310);}
 }else if(move.fx==='beam')view.move(actor,source,240);else actor.lean=0;
 if(target.hp>0)view.move(target,{x:clamp(dest.x+(rng()-.5)*10,40,500),y:(raidClose||a.spacedRaid)?clamp(dest.y+(rng()-.5)*8,250,710):clamp(dest.y+(rng()-.5)*8,target.team===0?210:640,target.team===0?350:790)},220);
 await w(raidClose?310:physical?425:280);if(!valid())return;actor.action=null;const boss=raidClose?view.fighters?.find(p=>p.isBoss):null;actor.direction=boss?(actor.isBoss?0:directionToward(source,boss.pos)):(actor.team===0?0:4);target.direction=boss?(target.isBoss?0:directionToward(dest,boss.pos)):(target.team===0?0:4);for(const {al,pos} of squadOrigins){al.action=null;al.direction=boss?directionToward(pos,boss.pos):(al.team===0?0:4);}view.focus(null,null);
 if(lowHpMegas.length){if(!valid())return;await view.triggerLowHpMega?.(lowHpMegas[0],w,valid);}
 if(!raidClose&&target.hp>0&&target.hp<=target.max*.48&&view.canLowHpMega?.(target)){
  if(!valid())return;
  await view.triggerLowHpMega?.(target,w,valid);
 }
 if(actor.hp>0&&view.canMidEvolve?.(actor)&&(target.hp<=0||!raidClose)){
  if(!valid())return;
  await view.tryMidBattleEvolution?.(actor,w,valid);
 }
 if(a.splashTargets?.length){for(const sub of a.splashTargets)if(sub.hp<=0){log(title(sub.name)+' fainted!','ko');view.retireFainted?.(sub);}}
 if(target.hp<=0){
  if(raidClose&&!target.isBoss){
   log(title(target.name)+' fainted!','ko');
   view.retireFainted?.(target);
   if((view.fighters?.filter(p=>p.team===target.team&&p.hp>0&&!p.reserve).length||0)<=8){await view.regroup?.(target.team,w,valid);}
  }else{
   audio.sfx('normal','collapse');log(title(target.name)+' fainted!','ko');audio.cry(target.id,!!target.bundled);await w(650);if(!valid())return;view.retireFainted?.(target);const next=view.fighters?.find(p=>p.team===target.team&&p.reserve&&p.hp>0);if(next){next.slot=target.slot;view.message(title(next.name)+' enters!',520);log(title(next.name)+' enters as reinforcement for '+view.teamName(target.team)+'!');audio.cry(next.id,!!next.bundled);await view.spawnReinforcement?.(next,w,valid);}else if(!a.spacedRaid&&(view.fighters?.filter(p=>p.team===target.team&&p.hp>0&&!p.reserve).length||0)<=8){await view.regroup?.(target.team,w,valid);}
  }
 }
}

const BOSS_PHASE2_META={
 487:{title:'Origin Giratina',banner:'ORIGIN GIRATINA',move:'shadow-force',type:'ghost',color:'#bf8dff',vortex:'#bf8dff',threshold:.4,shield:2450},
 483:{title:'Origin Dialga',banner:'ORIGIN DIALGA',move:'roar-of-time',type:'dragon',color:'#78ddff',vortex:'#78ddff',threshold:.4,shield:2450},
 484:{title:'Origin Palkia',banner:'ORIGIN PALKIA',move:'spacial-rend',type:'water',color:'#e4a6ff',vortex:'#e4a6ff',threshold:.4,shield:2450},
 890:{title:'Eternamax Eternatus',banner:'ETERNAMAX PHASE 2',move:'eternabeam',type:'dragon',color:'#ff3b78',vortex:'eternamax',threshold:.4,shield:2450},
 493:{title:'Omnipotent Arceus',banner:'JUDGMENT PHASE 2',move:'judgment',type:'fairy',color:'#ffe787',vortex:'arceus',threshold:.4,shield:2400},
 800:{title:'Ultra Necrozma',banner:'ULTRA NECROZMA',move:'light-that-burns-the-sky',type:'psychic',color:'#fff29c',vortex:'necrozma',threshold:.4,shield:2400},
 384:{title:'Mega Rayquaza',banner:'MEGA RAYQUAZA',move:'dragon-ascent',type:'flying',color:'#69f5b3',vortex:'rayquaza',threshold:.4,shield:2400},
 718:{title:'Complete Zygarde (100%)',banner:'COMPLETE ZYGARDE',move:'core-enforcer',type:'dragon',color:'#7af7a2',vortex:'zygarde',threshold:.5,shield:2650}
};
export function bossPhaseMeta(boss){if(BOSS_PHASE2_META[boss.id])return BOSS_PHASE2_META[boss.id];const mega=megaForms[boss.id],aw=GUARDIAN_AWAKENINGS[boss.id],type=mega?.[2]?.[0]||aw?.types?.[0]||boss.types?.[0]||'normal',name=mega?.[3]||aw?.title||'Enraged '+title(boss.baseSpeciesName||boss.name);return{title:name,banner:name.toUpperCase(),move:boss.options?.[0]?.name||'struggle',type,color:colors[type]||colors.normal,vortex:colors[type]||colors.normal,threshold:.4,shield:2400};}

export async function triggerBossPhase2(boss,fighters,{view,audio,wait:w,valid,rng,log,onDamage}){
 if(!boss||boss.phase2||boss.hp<=0)return;
 view.raidPhase1Active=false;view.phaseTransition=true;view.onPhase2Start?.(boss);
 try{
 boss.baseSpeciesName??=boss.name;
 const meta=bossPhaseMeta(boss);
 boss.phase2=true;view.effects=[];view.focus(null,null);view.letterbox=1;view.cameraZoom=1.04;
 for(const p of fighters){p.motion=null;p.charge=false;p.action=null;}
 boss.charge=true;boss.action='Charge';audio.quiet?.(650);view.message('A TRUE POWER AWAKENS',650,true);
 await w(650);if(!valid())return;
 view.addFx('awakening-helix',boss.pos,boss.pos,meta.color,1200,{behindFighters:true});view.addFx('guardian-pulse',boss.pos,boss.pos,meta.color,1200,{behindFighters:true});audio.sfx(meta.type,'charge');
 await w(1100);if(!valid())return;boss.charge=false;boss.action='Attack';
 view.phase2Vortex=meta.vortex;
 boss.name=meta.title;
 view.announce?.(boss,{name:meta.move,type:meta.type},2200);
 const trueTypes=megaForms[boss.id]?.[2]||GUARDIAN_AWAKENINGS[boss.id]?.types;if(trueTypes)boss.types=[...trueTypes];
 if(EVOLVED_FORM_KEYS[boss.id])applyFormArt(view,boss,EVOLVED_FORM_KEYS[boss.id]);
 boss.el?.classList.add('boss-phase2');
 const hud=document.getElementById('hud-'+boss.uid);
 if(hud){
  hud.classList.add('phase2-shield');
  const strong=hud.querySelector('strong');
  if(strong)strong.textContent=meta.title;
 }
 const bpos={...boss.pos};
 view.letterbox=1;
 view.cameraZoom=1.1;
 view.message(meta.banner,1200,true);
 view.addFx('rift',bpos,bpos,meta.color,1200,{behindFighters:true});
 view.addFx('shockwave',bpos,bpos,meta.color,620);
 view.addFx('doom-ring',bpos,bpos,meta.color,1200,{behindFighters:true});
 view.burst(bpos,meta.color,34);
 if(view.cinematic){
  view.flash=.28;
  view.flashColor=meta.color;
  view.shake=9;
  view.shakeDuration=.6;
  view.shakeRemaining=.6;
  view.shakeClock=0;
 }
 audio.sfx('dragon','charge');
 audio.cry(boss.id,!!boss.bundled);
 const shieldHp=meta.shield;
 boss.max+=Math.round(shieldHp*.55);
 boss.hp=Math.min(boss.max,boss.hp+shieldHp);
 view.updateHP(boss);
 log(`PHASE 2: ${meta.title.toUpperCase()} — ${meta.title} enters Phase 2! The sky darkens into a vortex and ${shieldHp} Shield HP is restored!`);
 await w(1200);
 if(!valid()||boss.hp<=0)return;
 const pendingMega=fighters.find(p=>!p.isBoss&&!p.reserve&&p.hp>0&&!p.mega&&view.canLowHpMega?.(p));
 if(pendingMega){
  await view.triggerLowHpMega?.(pendingMega,w,valid);
  if(!valid()||boss.hp<=0)return;
 }
 // Phase 2 Doom Ring faints all non-Mega Pokémon across the arena
 const weakTargets=fighters.filter(p=>!p.isBoss&&!p.reserve&&p.hp>0&&!p.mega&&!p.isGuardian);
 if(weakTargets.length){
  if(!await beforeFinishingHit(view,weakTargets.map(target=>({target,damage:target.hp})),{wait:w,valid,audio,color:meta.color}))return;
  audio.sfx(meta.type,'impact',.9);
  for(const sub of weakTargets){
   const dmg=sub.hp;
   sub.hp=0;
   sub.faintAt=view.clock+.05;
   onDamage?.(dmg,boss,sub);
   view.impact(sub,meta.color,.45);
   view.updateHP(sub);
   view.retireFainted?.(sub);
  }
  log(`${meta.title}'s Phase 2 Doom Ring faints all ${weakTargets.length} non-Mega Pokémon! Only Mega Evolved Pokémon remain!`,'ko');
 }
 await w(600);
 if(!valid()||boss.hp<=0)return;
 const aliveTargets=fighters.filter(p=>!p.isBoss&&!p.reserve&&p.hp>0);
 if(aliveTargets.length){
  const sweep=aliveTargets.slice().sort(()=>rng()-.5).slice(0,Math.min(8,aliveTargets.length));
  const uMove={name:meta.move,type:meta.type,power:160,fx:'beam'};
  log(`${meta.title} fires ${title(meta.move)} across ${sweep.length} Mega Pokémon!`);
  for(const sub of sweep){
   view.addFx(meta.move==='light-that-burns-the-sky'?'meteor':'beam',bpos,sub.pos,meta.color,900,{asset:'shadowball',wide:true});
  }
  await w(650);
  if(!valid())return;
  audio.sfx(meta.type,'impact',.95,uMove);
  for(let i=0;i<sweep.length;i++){
   const sub=sweep[i];
   if(sub.hp<=0)continue;
   const dmg=Math.round(145+rng()*55);
   if(!await beforeFinishingHit(view,[{target:sub,damage:dmg}],{wait:w,valid,audio,color:meta.color}))return;
   sub.hp=Math.max(0,sub.hp-dmg);
   sub.faintAt=view.clock+.08;
   onDamage?.(dmg,boss,sub);
   view.impact(sub,meta.color,i===0?.8:.35);
   view.updateHP(sub);
   if(sub.hp<=0){
    log(title(sub.name)+' fainted!','ko');
    view.retireFainted?.(sub);
   }
  }
 }
 await w(600);
 view.label=null;
 view.letterbox=0;
 view.cameraZoom=1;
 }finally{if(valid()){view.phaseTransition=false;boss.action=null;boss.charge=false;}}
}

export async function choreographRaidWave(fighters,{view,audio,wait:w,valid,rng,log,onDamage,waveIndex=1,phaseWait=w,phaseValid=valid}){
 const boss=fighters.find(p=>p.isBoss&&p.hp>0);
 const alive=fighters.filter(p=>!p.isBoss&&!p.reserve&&p.hp>0);
 if(!boss||!alive.length)return;
 if(boss.raidFavor===undefined)boss.raidFavor=.94+rng()*.34;
 const bossMeta=bossPhaseMeta(boss);
 if(!boss.phase2&&(boss.hp<=boss.max*bossMeta.threshold||alive.length<=15)){
  await triggerBossPhase2(boss,fighters,{view,audio,wait:phaseWait,valid:phaseValid,rng,log,onDamage});
  if(!valid()||boss.hp<=0)return;
 }
 const currentAlive=fighters.filter(p=>!p.isBoss&&!p.reserve&&p.hp>0);
 if(!currentAlive.length)return;
 const waveSize=Math.min(currentAlive.length,8+Math.floor(rng()*3));
 const attackers=currentAlive.slice().sort((a,b)=>((a.lastWave||0)-(b.lastWave||0))||(rng()-.5)).slice(0,waveSize);
 for(const p of attackers)p.lastWave=waveIndex;
 let waveDmg=0;
 const lowHpMegas=[];
 const midEvolvers=[];
 const megaIds=new Set([3,6,9,94,150,254,257,260,282,373,376,382,383,384,445,448,800]);
 const wMult=arenaMoveMultiplier(view.arena,'dragon');

 const attackerTasks=attackers.map(async(p,idx)=>{
  await w(idx*95);
  if(!valid()||p.hp<=0||boss.hp<=0)return;
  const move=p.options?.[Math.floor(rng()*p.options.length)]||{name:'tackle',type:'normal',power:50,fx:'melee'};
  view.announce?.(p,move,1500);
  const mc=colors[move.type]||'#ffffff',mAsset=assets[move.type]||'energyball';
  const origin={...p.pos},bpos={...boss.pos};
  const dx=bpos.x-origin.x,dy=bpos.y-origin.y,dist=Math.max(1,Math.hypot(dx,dy)),nx=dx/dist,ny=dy/dist;
  const contact={
   x:Math.max(46,Math.min(494,Math.round(bpos.x-nx*56+(rng()-.5)*34))),
   y:Math.max(225,Math.min(735,Math.round(bpos.y-ny*50+(rng()-.5)*34)))
  };
  p.direction=directionToward(origin,bpos);
  p.charge=true;p.aura=mc;
  view.addFx('speed',origin,contact,mc,340);
  view.addFx('attack-dust',origin,origin,'#c7bb9f',300,{behindFighters:true});view.move(p,contact,360,12,0,'strike');
  await w(360);
  if(!valid()||p.hp<=0||boss.hp<=0){p.charge=false;return;}
  p.charge=false;
  p.action='Attack';
  const liveBoss={...boss.pos};
  const fxKind=move.name==='flamethrower'||move.name==='sacred-fire'?'flame':move.name==='draco-meteor'||move.fx==='meteor'?'meteor':move.name==='thunder'||move.fx==='bolt'?'bolt':move.fx==='beam'?'beam':move.fx==='wave'?'wave':move.fx==='slash'?'slash':move.fx==='bite'?'bite':move.fx==='punch'?'punch':move.fx==='kick'?'kick':'impact';
  view.addFx(fxKind,contact,liveBoss,mc,280,{asset:mAsset});
  if(idx%3===0)audio.sfx(move.type,'impact',.35,move);
  const aMult=arenaMoveMultiplier(view.arena,move.type);
  const dmg=Math.max(10,Math.round(((p.mega?52:33)+rng()*18)*aMult*(1.85-boss.raidFavor*.8)));
  waveDmg+=dmg;
  const floorHp=!boss.phase2?Math.max(1,Math.round(boss.max*.15)):0;
  if(!await beforeFinishingHit(view,[{target:boss,damage:dmg,protected:floorHp>0}],{wait:w,valid,audio,color:mc}))return;
  if(boss.hp<=0)return;
  boss.hp=Math.max(floorHp,boss.hp-dmg);
  boss.hitUntil=view.clock+.1;
  onDamage?.(dmg,p,boss);
  view.updateHP(boss);
  view.burst(liveBoss,mc,5);
  if(view.canMidEvolve?.(p)&&midEvolvers.length<2)midEvolvers.push(p);
  await w(190);
  if(!valid())return;
  p.action=null;
  if(p.hp>0){
   const roamDest={
    x:Math.max(44,Math.min(496,Math.round(contact.x-nx*(46+rng()*42)+(rng()-.5)*65))),
    y:Math.max(220,Math.min(740,Math.round(contact.y-ny*(42+rng()*38)+(rng()-.5)*60)))
   };
   p.baseHome={...roamDest};
   p.direction=directionToward(p.pos,roamDest);
   view.move(p,roamDest,430);
   await w(430);
  }
 });

 const bossTask=(async()=>{
  await w(180);
  if(!valid()||boss.hp<=0)return;
  const targetsAlive=fighters.filter(p=>!p.isBoss&&!p.reserve&&p.hp>0);
  if(!targetsAlive.length)return;
  const recent=boss.recentMoves||[];
  let opts=(boss.options||[]).filter(m=>m.name!==boss.lastMove&&!recent.includes(m.name));
  if(!opts.length)opts=(boss.options||[]).filter(m=>m.name!==boss.lastMove);
  if(!opts.length)opts=boss.options||[{name:'dynamax-cannon',type:'dragon',power:100,fx:'beam'}];
  const bMove={...opts[Math.floor(rng()*opts.length)]};
  if(boss.id===493&&bMove.name==='judgment'){
   const plateTypes=['fire','water','electric','ice','dragon','fairy','psychic','dark'];
   bMove.type=plateTypes[waveIndex%plateTypes.length];
   boss.types=[bMove.type];
  }
  boss.lastMove=bMove.name;
  boss.recentMoves=[bMove.name,...recent].slice(0,2);
  view.announce?.(boss,bMove,1600);
  const bc=colors[bMove.type]||'#ff4d79',bAsset=assets[bMove.type]||'shadowball';
  const unEvolved=targetsAlive.filter(e=>megaIds.has(e.id)&&!e.mega);
  const primary=unEvolved.length&&waveIndex>=3?unEvolved[Math.floor(rng()*unEvolved.length)]:targetsAlive[Math.floor(rng()*targetsAlive.length)];
  const splash=targetsAlive.filter(e=>e!==primary).sort((a,b)=>Math.hypot(a.pos.x-primary.pos.x,a.pos.y-primary.pos.y)-Math.hypot(b.pos.x-primary.pos.x,b.pos.y-primary.pos.y)).slice(0,Math.min(boss.phase2?7:6,targetsAlive.length-1));
  const hitList=[primary,...splash];
  const bSource={...boss.pos},bDest={...primary.pos};
  const dx=bDest.x-bSource.x,dy=bDest.y-bSource.y,d=Math.max(1,Math.hypot(dx,dy));
  const bContact={
   x:Math.max(130,Math.min(410,Math.round(bSource.x+(dx/d)*Math.min(68,d*.4)+(rng()-.5)*28))),
   y:Math.max(255,Math.min(620,Math.round(bSource.y+(dy/d)*Math.min(58,d*.38)+(rng()-.5)*24)))
  };
  boss.direction=directionToward(bSource,bDest);
  boss.charge=true;boss.aura=bc;
  view.addFx('gather',bSource,bSource,bc,360,{asset:bAsset,hero:true});
  view.move(boss,bContact,380);
  audio.sfx(bMove.type,'charge');
  log(`${title(boss.name)} unleashes ${title(bMove.name)} across ${hitList.length} Pokémon!`);
  await w(380);
  if(!valid()||boss.hp<=0){boss.charge=false;return;}
  boss.charge=false;
  boss.action='Attack';
  const bossFx=bMove.name==='flamethrower'?'flame':bMove.name==='draco-meteor'||bMove.name==='light-that-burns-the-sky'||bMove.fx==='meteor'?'meteor':bMove.name==='cross-poison'||bMove.fx==='slash'?'slash-wave':bMove.name==='sludge-bomb'||bMove.fx==='orb'?'wave':'beam';
  if(bMove.name==='eternabeam'||bMove.name==='judgment')view.addFx('rift',bDest,bDest,bc,460);
  else view.addFx('shockwave',bContact,bContact,bc,400);
  for(const sub of hitList){
   view.addFx(bossFx,bContact,sub.pos,bc,380,{asset:bAsset,wide:signature.has(bMove.name)});
  }
  await w(260);
  if(!valid()||boss.hp<=0)return;
  const hitDamage=hitList.map((sub,i)=>Math.round(((i===0?132:98)+rng()*44)*boss.raidFavor*(boss.phase2?1.52:1)*wMult));
  if(!await beforeFinishingHit(view,hitList.map((target,i)=>({target,damage:hitDamage[i],protected:view.canLowHpMega?.(target)})),{wait:w,valid,audio,color:bc}))return;
  audio.sfx(bMove.type,'impact',.8,bMove);
  for(let i=0;i<hitList.length;i++){
   const sub=hitList[i];
   if(sub.hp<=0)continue;
   const sd=hitDamage[i];
   sub.hp=Math.max(0,sub.hp-sd);
   if(view.canLowHpMega?.(sub)&&sub.hp<=sub.max*.6){
    sub.hp=Math.max(1,Math.min(sub.hp,Math.round(sub.max*.22)));
    lowHpMegas.push(sub);
   }
   sub.faintAt=view.clock+.08;
   onDamage?.(sd,boss,sub);
   view.impact(sub,bc,i===0?.65:.3);
   view.updateHP(sub);
   if(sub.hp<=0){
    log(title(sub.name)+' fainted!','ko');
    view.retireFainted?.(sub);
   }
  }
  await w(220);
  if(!valid())return;
  boss.action=null;
  view.label=null;
  const bossNext={
   x:Math.max(130,Math.min(410,Math.round(bContact.x+(rng()-.5)*52))),
   y:Math.max(255,Math.min(620,Math.round(bContact.y+(rng()-.5)*46)))
  };
  boss.baseHome={...bossNext};
  boss.direction=directionToward(boss.pos,bossNext);
  view.move(boss,bossNext,380);
  await w(380);
 })();

 await Promise.all([...attackerTasks,bossTask]);
 if(!valid())return;
 log(`${attackers.length} Pokémon swarmed ${title(boss.name)} for ${waveDmg} combined damage!`);
 for(const ev of midEvolvers){
  if(!valid()||ev.hp<=0||boss.hp<=0)break;
  await view.tryMidBattleEvolution?.(ev,w,valid);
 }
 if(lowHpMegas.length&&boss.hp>0){
  await view.triggerLowHpMega?.(lowHpMegas[0],w,valid);
 }
 boss.act1LowestHpRatio=Math.min(boss.act1LowestHpRatio??1,boss.hp/Math.max(1,boss.max));
 if(!boss.phase2&&boss.hp>0&&(boss.hp<=boss.max*bossMeta.threshold||fighters.filter(p=>!p.isBoss&&!p.reserve&&p.hp>0).length<=15)){
  await triggerBossPhase2(boss,fighters,{view,audio,wait:phaseWait,valid:phaseValid,rng,log,onDamage});
 }
 if(boss.hp<=0&&!view.raidOutroEnabled){
  view.letterbox=1;
  view.cameraZoom=1.14;
  if(view.cinematic){view.slowRemaining=.85;view.timeScale=.3;}
  audio.sfx('normal','collapse');
  log(title(boss.name)+' fainted!','ko');
  audio.cry(boss.id,!!boss.bundled);
  await w(500);
  view.letterbox=0;
  view.cameraZoom=1;
  if(valid())view.retireFainted?.(boss);
 }
}

export async function choreographAct2Wave(fighters,{view,audio,wait:w,valid,rng,log,onDamage,waveIndex=1}){
 const boss=fighters.find(p=>p.isBoss&&p.hp>0);
 const guardians=fighters.filter(p=>p.isGuardian&&p.hp>0);
 if(!boss||!guardians.length)return;
 const bossMeta=bossPhaseMeta(boss);
 boss.act2Wave=(boss.act2Wave||0)+1;

 // Dramatic 1v3 Standoff Tug-of-War Beam Clash when Guardians face the Boss's Ultimate
 if(guardians.length>=2&&(boss.act2Wave===1||(!boss.secondClash&&boss.hp<=boss.max*0.5))){
  if(boss.act2Wave>1)boss.secondClash=true;
  view.cinematicStandoff=true;
  try{
  const standoffSlots=[{x:152,y:690},{x:270,y:722},{x:388,y:690}];
  view.letterbox=1;
  view.cameraZoom=1.02;
  view.message('BEAM CLASH',620,true);
  view.move(boss,{x:270,y:295},320);
  guardians.forEach((g,idx)=>view.move(g,standoffSlots[g.slot%3]||standoffSlots[1],320));
  await w(320);
  if(!valid())return;
  boss.direction=0;
  boss.charge=true;
  boss.aura=bossMeta.color;
  for(const g of guardians){
   g.direction=4;
   g.charge=true;
   g.aura=colors[g.types[0]]||'#ffe58a';
  }
  view.announce?.(boss,{name:bossMeta.move,type:bossMeta.type},2600);
  for(const g of guardians)view.announce?.(g,g.options?.[0]||{name:'dragon-ascent',type:g.types[0]},2600);
  audio.sfx(bossMeta.type,'charge');
  log(`${title(boss.name)} and the Summoned Guardians lock into a 1v3 Beam Clash!`);
  await w(380);
  if(!valid())return;
  const guardianWin=rng()<(0.52+(guardians[0].willMult-1)*0.6);
  const bMouth={x:270,y:318};
  const mid={x:270,y:495};
  boss.charge=false;
  boss.action='Attack';
  for(const g of guardians){
   g.charge=false;
   g.action='Shoot';
  }
  beginBeamStruggle(view,boss,guardians,guardianWin);
  view.addFx('clash-ground',mid,mid,bossMeta.color,1750,{boss,guardians,guardianWin,behindFighters:true});
  audio.sfx(bossMeta.type,'beam');
  view.addFx('beam-clash',bMouth,mid,bossMeta.color,1750,{
   boss,guardians:guardians.map(g=>({fighter:g,pos:{...g.pos},color:colors[g.types[0]]||'#ffe58a'})),
   guardianWin
  });
  view.addFx('shockwave',mid,mid,'#ffe58a',850);
  view.burst(mid,'#ffffff',28);
  if(view.cinematic){view.shake=11;view.shakeDuration=1.7;view.shakeRemaining=1.7;view.shakeClock=0;}
  await w(880);
  if(!valid())return;
  audio.sfx('electric','charge');
  view.addFx('shockwave',mid,mid,bossMeta.color,850);
  view.burst(mid,guardianWin?'#ffe58a':bossMeta.color,34);
  await w(870);
  if(!valid())return;
  endBeamStruggle(view);
  const clashHits=guardianWin?[{target:boss,damage:Math.round((1350+rng()*380)*(guardians[0].willMult||1))}]:guardians.map(target=>({target,damage:Math.round((320+rng()*115)*(boss.raidFavor||1))}));
  if(!await beforeFinishingHit(view,clashHits,{wait:w,valid,audio,color:guardianWin?'#ffe58a':bossMeta.color}))return;
  const detPos=guardianWin?{x:270,y:295}:{x:270,y:700};
  audio.sfx(bossMeta.type,'impact');
  view.addFx('doom-ring',detPos,detPos,guardianWin?'#ffe58a':bossMeta.color,680);
  view.addFx('shockwave',detPos,detPos,guardianWin?'#ffe58a':bossMeta.color,620);
  view.burst(detPos,guardianWin?'#ffe58a':bossMeta.color,44);
  if(view.cinematic){view.flash=.36;view.flashColor=guardianWin?'#ffe58a':bossMeta.color;}
  if(guardianWin){
   const clashDmg=clashHits[0].damage;
   boss.hp=Math.max(0,boss.hp-clashDmg);
   view.impact(boss,'#ffe58a',.95);
   view.updateHP(boss);
   log(`The Guardians overpower ${title(boss.name)}'s beam in the clash for ${clashDmg} massive damage!`);
  }else{
   for(const {target:g,damage:gd} of clashHits){
    g.hp=Math.max(0,g.hp-gd);
    view.impact(g,bossMeta.color,.75);
    view.updateHP(g);
    if(g.hp<=0){log(title(g.name)+' fainted!','ko');view.retireFainted?.(g);}
   }
   log(`${title(boss.name)} wins the Beam Clash and blasts the Guardians!`);
  }
  if(view.raidOutroEnabled&&(boss.hp<=0||!guardians.some(g=>g.hp>0)))return;
  boss.action=null;
  for(const g of guardians)g.action=null;
  await w(360);
  if(!valid())return;
  if(boss.hp>0){boss.baseHome={x:270,y:285};view.move(boss,boss.baseHome,280);}
  for(const g of guardians.filter(p=>p.hp>0)){
   const gx=[145,270,395][g.slot%3]||270,gy=[675,715,675][g.slot%3]||690;
   g.baseHome={x:gx,y:gy};
   view.move(g,g.baseHome,280);
  }
  await w(280);
  if(valid()){
   if(boss.hp>0)boss.direction=0;
   for(const g of guardians.filter(p=>p.hp>0)){
    g.direction=directionToward(g.baseHome,boss.baseHome||{x:270,y:285});
   }
  }
  view.letterbox=0;
  view.cameraZoom=1;
  if(!valid())return;
  }finally{endBeamStruggle(view);view.cinematicStandoff=false;}
 }

 // Use the normal move choreography, with a separate approach lane for each hero.
 if(boss.hp<=0)return;
 view.guardianCombat=true;view.guardianExchange=true;
 try{
  boss.motion=null;boss.action=null;boss.baseHome={...boss.pos};
  const formation=guardianHomes(boss,guardians);
  for(const {fighter:g,pos} of formation){g.action=null;g.baseHome=pos;view.move(g,pos,600);}
  await w(600);if(!valid())return;
  const pickMove=p=>{const opts=p.options||[];const fresh=opts.filter(m=>m.name!==p.lastGuardianMove);const varied=fresh.filter(m=>isContactMove(m)!==p.lastGuardianContact);const pool=varied.length?varied:fresh.length?fresh:opts;const move=pool[Math.floor(rng()*pool.length)]||{name:'tackle',type:'normal',power:50,category:'physical',fx:'rush'};p.lastGuardianMove=move.name;p.lastGuardianContact=isContactMove(move);return move;};
  const strike=async(actor,target,damage)=>{
   if(!valid()||actor.hp<=0||target.hp<=0)return;
   const move=pickMove(actor);
   await choreograph({actor,target,move,damage:Math.round(damage*arenaMoveMultiplier(view.arena,move.type)),mult:1,crit:false,dodge:false,spacedRaid:true},{view,audio,wait:w,valid,rng,log,onDamage});
  };
  for(const {fighter:g} of formation){
   if(!valid()||boss.hp<=0)break;
   if(g.hp<=0)continue;
   await strike(g,boss,(365+rng()*130)*(g.willMult||1)*(1.85-(boss.raidFavor||1)*.6));
   if(!valid()||boss.hp<=0)break;
   const alive=guardians.filter(p=>p.hp>0);
   if(!alive.length)break;
   const victim=alive[Math.floor(rng()*alive.length)];
   await strike(boss,victim,(370+rng()*135)*(boss.raidFavor||1)*(boss.phase2?1.18:1));
   if(valid()&&victim.hp<=0){for(const {fighter,pos} of guardianHomes(boss,guardians)){fighter.baseHome=pos;view.move(fighter,pos,420);}await w(420);}
  }
 }finally{view.guardianExchange=false;for(const p of [boss,...guardians]){p.charge=false;p.action=null;}}

}

export async function choreographArmyWave(fighters,{view,audio,wait:w,valid,rng,log,onDamage,rules='natural',waveIndex=1}){
 const team0=fighters.filter(p=>p.team===0&&!p.reserve&&p.hp>0);
 const team1=fighters.filter(p=>p.team===1&&!p.reserve&&p.hp>0);
 if(!team0.length||!team1.length)return;
 const pickWave=(list,count)=>list.slice().sort((a,b)=>((a.lastWave||0)-(b.lastWave||0))||(rng()-.5)).slice(0,Math.min(list.length,count));
 const wave0=pickWave(team0,3+Math.floor(rng()*2));
 const wave1=pickWave(team1,3+Math.floor(rng()*2));
 const allAttackers=[...wave0,...wave1];
 for(const p of allAttackers)p.lastWave=waveIndex;
 const lowHpMegas=[];
 const midEvolvers=[];

 const tasks=allAttackers.map(async(actor,idx)=>{
  await w(idx*75);
  if(!valid()||actor.hp<=0)return;
  const enemies=fighters.filter(p=>p.team!==actor.team&&!p.reserve&&p.hp>0);
  if(!enemies.length)return;
  const target=enemies[Math.floor(rng()*enemies.length)];
  const move=actor.options?.[Math.floor(rng()*actor.options.length)]||{name:'tackle',type:'normal',power:50,fx:'melee'};
  const mc=colors[move.type]||'#ffffff',mAsset=assets[move.type]||'energyball';
  view.announce?.(actor,move,1500);
  const origin={...(actor.baseHome||actor.pos)},dest={...target.pos};
  const dx=dest.x-origin.x,dy=dest.y-origin.y,dist=Math.max(1,Math.hypot(dx,dy)),nx=dx/dist,ny=dy/dist;
  const contact={x:dest.x-nx*44,y:dest.y-ny*40};
  actor.direction=directionToward(origin,dest);
  actor.charge=true;actor.aura=mc;
  view.addFx('speed',origin,contact,mc,220);
  view.addFx('attack-dust',origin,origin,'#c7bb9f',300,{behindFighters:true});view.move(actor,contact,230,14,0,'strike');
  await w(230);
  if(!valid()||actor.hp<=0){actor.charge=false;return;}
  actor.charge=false;
  actor.action='Attack';
  const fxKind=move.name==='flamethrower'?'flame':move.fx==='bolt'?'bolt':move.fx==='beam'?'beam':move.fx==='slash'?'slash':'impact';
  view.addFx(fxKind,contact,dest,mc,220,{asset:mAsset});
  if(idx%2===0)audio.sfx(move.type,'impact',.4,move);
  if(target.hp>0){
   const rawMult=effectiveness(move.type,target.types);
   const mult=rules==='balanced'?(rawMult===0?.5:Math.max(.5,Math.min(2,rawMult))):rawMult;
   const wMult=arenaMoveMultiplier(view.arena,move.type);
   const atk=actor.stats[1],def=Math.max(1,target.stats[2]);
   const dmg=Math.max(12,Math.round(((22*move.power*(atk/def)/50)+8)*mult*wMult*(.85+rng()*.3)));
   if(!await beforeFinishingHit(view,[{target,damage:dmg,protected:view.canLowHpMega?.(target)}],{wait:w,valid,audio,color:mc}))return;
   if(target.hp<=0)return;
   target.hp=Math.max(0,target.hp-dmg);
   if(view.canLowHpMega?.(target)&&target.hp<=target.max*.5){
    target.hp=Math.max(1,Math.min(target.hp,Math.round(target.max*.25)));
    lowHpMegas.push(target);
   }
   target.faintAt=view.clock+.08;
   onDamage?.(dmg,actor,target);
   view.impact(target,mc,.35);
   view.updateHP(target);
   if(target.hp<=0){
    log(`${title(actor.name)} knocks out ${title(target.name)} with ${title(move.name)}!`,'ko');
    view.retireFainted?.(target);
    const next=fighters.find(p=>p.team===target.team&&p.reserve&&p.hp>0);
    if(next){next.slot=target.slot;await view.spawnReinforcement?.(next,w,valid);}
   }
  }
  if(actor.hp>0&&view.canMidEvolve?.(actor)&&midEvolvers.length<2)midEvolvers.push(actor);
  await w(140);
  if(!valid())return;
  actor.action=null;
  if(actor.hp>0){
   actor.direction=directionToward(actor.pos,origin);
   view.move(actor,origin,230);
   await w(230);
   if(valid()&&actor.hp>0)actor.direction=actor.team===0?0:4;
  }
 });

 await Promise.all(tasks);
 if(!valid())return;
 for(const ev of midEvolvers){
  if(!valid()||ev.hp<=0)break;
  await view.tryMidBattleEvolution?.(ev,w,valid);
 }
 for(const m of lowHpMegas){
  if(!valid()||m.hp<=0||m.mega)continue;
  await view.triggerLowHpMega?.(m,w,valid);
 }
}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
