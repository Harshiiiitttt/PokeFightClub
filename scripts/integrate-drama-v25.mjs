import fs from 'node:fs';
const edit=(name,fn)=>{const p='dist/'+name;fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));};
edit('trainer-combat.js',s=>{
 s="import {startDuelDrama,endDuelDrama} from './duel-drama.js?v=24';\n"+s;
 s=s.replace('Math.max(96,','Math.max(84,').replace('*.5+20);','*.5+12);');
 s=s.replace('(contact?40:85)+rng()*22','(contact?22:52)+rng()*16');
 s=s.replace('view.trainerExchange=true;view.duelBeat=', 'let drama=null;const serious=heavy||finisher||move.fx===\'bolt\'||move.fx===\'meteor\';\n view.trainerExchange=true;view.duelBeat=');
 s=s.replace("actor.charge=heavy;actor.aura=c;\n  if(heavy){view.addFx('gather',source,source,c,230);audio.sfx(move.type,'charge');}\n  await w(heavy?200:120);", "actor.charge=serious;actor.aura=c;\n  const windup=finisher?560:heavy?440:serious?330:120;\n  if(serious){drama=startDuelDrama(view,{...a,color:c});view.addFx('gather',source,source,c,windup);audio.sfx(move.type,'charge');}\n  await w(windup);");
 s=s.replace('actor.charge=false;\n  const dest=', "actor.charge=false;if(drama)drama.phase='release';\n  const dest=");
 s=s.replace('target.hp=Math.max(0,target.hp-damage);target.faintAt=view.clock+.19;', "target.hp=Math.max(0,target.hp-damage);target.faintAt=view.clock+(finisher?.58:.19);if(drama)drama.phase='impact';");
 s=s.replace("step(view,target,{x:dest.x+nx*(heavy?32:19),y:dest.y+ny*(heavy?32:19)},150,'recoil');", "step(view,target,{x:dest.x+nx*(finisher?41:heavy?32:19),y:dest.y+ny*(finisher?41:heavy?32:19)},finisher?280:150,'recoil');\n   if(finisher&&view.cinematic){view.slowRemaining=.36;view.timeScale=.35;audio.duck?.(1100);}\n   if(finisher){await w(300);if(!valid())return;}");
 s=s.replace("log(title(target.name)+' fainted!','ko');await w(230);", "log(title(target.name)+' fainted!','ko');const next=view.fighters.find(p=>p.team===target.team&&p.reserve&&p.hp>0);await w(next?500:820);");
 s=s.replace("view.retireFainted(target);await w(165);if(!valid())return;\n   const next=view.fighters.find(p=>p.team===target.team&&p.reserve&&p.hp>0);", "if(!next){view.duelFinalDefeat=target;}else{view.retireFainted(target);await w(240);if(!valid())return;}");
 s=s.replace('view.trainerExchange=false;for(const p of [actor,target])', 'endDuelDrama(view,drama);view.trainerExchange=false;for(const p of [actor,target])');
 return s;
});
edit('battle-view.js',s=>{
 s="import {drawDuelDrama} from './duel-drama.js?v=24';\nimport {keepDuelSeparation} from './duel-clearance.js?v=24';\n"+s;
 s=s.replace('mount(fighters){','mount(fighters){this.duelDrama=null;this.duelFinalDefeat=null;');
 s=s.replace("(p.formKey==='origin-487'?4:.5)+'px')}}", "(p.formKey==='origin-487'?4:.5)+'px')}keepDuelSeparation(this);}");
 s=s.replace(' const particleDt=this.particleStall', ' drawDuelDrama(back,this);const particleDt=this.particleStall');
 return s;
});
edit('overworld-arena.js',s=>{
 const at=" npc(c,view.images['npc-red_normal'],270,248,0,1.35);";
 s=s.replace(at,` // Audience falls into shadow while the trainer boxes remain visible and separate from the field.
 c.fillStyle='#050b18';c.globalAlpha=.52;c.fillRect(0,101,540,126);c.fillRect(0,910,540,50);c.globalAlpha=1;
 for(const [team,y] of [[0,225],[1,831]]){c.fillStyle='#263c46';c.fillRect(213,y,114,54);c.strokeStyle=team?'#83aed0':'#ce9184';c.lineWidth=2;c.strokeRect(215,y+2,110,50);c.globalAlpha=.45;c.strokeStyle='#c7d4c7';c.lineWidth=1;c.beginPath();c.ellipse(270,y+29,26,9,0,0,Math.PI*2);c.stroke();c.globalAlpha=1;}
`+at);
 return s;
});
edit('trainer-duel.js',s=>{
 s=s.replace("await wait(900);if(!valid())return false;const hero=", "await wait(900);if(!valid())return false;if(view.duelFinalDefeat?.el)view.retireFainted(view.duelFinalDefeat);const hero=");
 s=s.replace("hero.animKey=null;hero.gbaAnimKey=null;", "hero.animKey=null;hero.gbaAnimKey=null;view.move(hero,{x:270,y:565},600);");
 s=s.replace("audio.sfx('normal','victory');await wait(5200);return valid();", "await wait(1700);if(!valid())return false;audio.sfx('normal','victory');await wait(3400);if(!valid())return false;await wait(2000);return valid();");
 s=s.replace("if(time<.9)return;c.save();c.globalAlpha=Math.min(1,(time-.9)*2);", "if(time<2.6){c.save();c.textAlign='center';c.font='700 13px \"Space Grotesk\",Inter,sans-serif';c.fillStyle='#e9dbb2';c.strokeStyle='#15212b';c.lineWidth=3;const caption=time<.9?'THE DUST SETTLES':view.teamName(s.winner)+' · VICTORIOUS';c.strokeText(caption,270,775);c.fillText(caption,270,775);c.restore();return;}c.save();c.globalAlpha=Math.min(1,(time-2.6)*2);");
 return s;
});
