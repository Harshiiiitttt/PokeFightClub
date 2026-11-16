import fs from 'node:fs';
const edit=(name,fn)=>{const p='dist/'+name;fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));};
edit('trainer-combat.js',s=>{
 s=s.replace('Math.max(84,','Math.max(56,').replace('*.5+12);','*.5+10);').replace('(contact?14:52)+rng()*16','(contact?12:28)+rng()*12');
 s=s.replace("function step(view,p,to,ms,style='smooth',arc=0){p.action=null;p.charge=false;view.move(p,field(to),ms,arc,0,style);}", "function step(view,p,to,ms,style='smooth',arc=0,curve=0){p.action=null;p.charge=false;view.move(p,field(to),ms,arc,curve,style);}");
 const start=s.indexOf('  const plan=duelFormation'),end=s.indexOf('  await w(approach);',start);
 s=s.slice(0,start)+`  const plan=duelFormation(actor,target,rng,contact,view.duelBeat),approach=Math.hypot(actor.pos.x-plan.actor.x,actor.pos.y-plan.actor.y)>80?290:160;
  const closing=Math.hypot(actor.pos.x-target.pos.x,actor.pos.y-target.pos.y)-Math.hypot(plan.actor.x-plan.target.x,plan.actor.y-plan.target.y)>24||Math.hypot(actor.pos.x-plan.actor.x,actor.pos.y-plan.actor.y)>28,curve=contact&&move.fx==='slash'?(view.duelBeat%2?10:-10):0;
  if(closing)view.addFx('approach-sweep',actor.pos,plan.actor,c,approach,{fighter:actor,slash:move.fx==='slash',easing:'strike',curve,arc:curve?5:0,behindFighters:true});
  step(view,actor,plan.actor,approach,closing?'strike':'smooth',curve?5:0,curve);step(view,target,plan.target,approach);
`+s.slice(end);
 s=s.replace("view.addFx('speed',launch,hitPoint,c,heavy?230:170);audio.sfx", "view.addFx('approach-sweep',launch,hitPoint,c,heavy?210:150,{fighter:actor,slash:move.fx==='slash',easing:'strike',arc:move.fx==='dive'?27:move.fx==='kick'?10:0,behindFighters:true});view.addFx('speed',launch,hitPoint,c,heavy?230:170);audio.sfx");
 return s;
});
edit('battle-view.js',s=>{
 s="import {constrainTrainerCamera} from './trainer-camera.js?v=27';\nimport {drawDuelApproach} from './duel-approach.js?v=27';\n"+s;
 s=s.replace('world.style.transform=`translate(${Math.sin(this.shakeClock*91)*power*.7+this._panXNow}px,${Math.cos(this.shakeClock*117)*power*.5+this._panNow}px)', 'constrainTrainerCamera(this);world.style.transform=`translate(${this.cameraShakeX+this._panXNow}px,${this.cameraShakeY+this._panNow}px)');
 s=s.replace('if(drawElementalDuelFX(c,e,t)||','if(drawDuelApproach(c,e,t,this)||drawElementalDuelFX(c,e,t)||');
 return s;
});
edit('recording-studio.js',s=>s.replace('    c.clearRect(0, 0, W, H);',"    c.clearRect(0, 0, W, H);if(this.view.trainerMode){c.fillStyle='#172532';c.fillRect(0,0,W,H);}"));
edit('index.html',s=>s.replace('<title>Pokémon Battle Theater</title>', '<title>PokeFightClub · Battle Theater v28</title>'));
fs.appendFileSync('dist/workspace.css','\n.stage.trainer-duel-mode{overflow:hidden;background:#172532}.trainer-duel-mode #battle-world{background:#172532}\n');
