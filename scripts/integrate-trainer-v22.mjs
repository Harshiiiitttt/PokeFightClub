import fs from 'node:fs';
const edit=(name,fn)=>{const path='dist/'+name;fs.writeFileSync(path,fn(fs.readFileSync(path,'utf8')));};
edit('trainer-duel.js',s=>s.replace('[887,122,887,815,812,6]','[887,866,818,815,812,6]'));
edit('battle-modes.js',s=>"import {TRAINER_PRESETS} from './trainer-duel.js?v=21';\n"+s.replace("  'classic': {",`  'trainer-duel': {label:'Trainer Duel (6v6)',badge:'6 VS 6 · TRAINER DUEL',description:'Red vs Blue or custom six-Pokémon teams. One active fighter per trainer, cinematic tracking camera, full battle and replacements after each faint.',matchups:TRAINER_PRESETS},
  'classic': {`).replace("  if (mode === 'trainer-teams') {",`  if(mode==='trainer-duel'){const preset=TRAINER_PRESETS.find(p=>p.id===matchup)||TRAINER_PRESETS[0];return {teams:preset.teams.map(t=>[...t]),titles:[...preset.names]};}
  if (mode === 'trainer-teams') {`));
edit('index.html',s=>s.replace('<option value="trainer-teams">','<option value="trainer-duel">Trainer Duel (6v6 · Cinematic)</option><option value="trainer-teams">'));
edit('formation.js',s=>s.replace(' const hasBoss=fighters.some(p=>p.isBoss);',` if(fighters.some(p=>p.trainerDuel))return alive.map(fighter=>({fighter,position:{x:team===0?185:355,y:team===0?365:660}}));
 const hasBoss=fighters.some(p=>p.isBoss);`));
edit('app.js',s=>{
 s="import {playTrainerOutro} from './trainer-duel.js?v=21';\n"+s;
 s=s.replace("const useReinforcements=battleFormat==='reinforcements'", "const trainerDuel=currentMode==='trainer-duel';\n  const useReinforcements=battleFormat==='reinforcements'");
 s=s.replace('const isReserve=useReinforcements&&!isBoss&&s>=3;', 'const isReserve=trainerDuel?s>=1:useReinforcements&&!isBoss&&s>=3;');
 s=s.replace('const slot=useReinforcements&&!isBoss?s%3:s;', 'const slot=trainerDuel?0:useReinforcements&&!isBoss?s%3:s;');
 s=s.replace('{bundled:featured.includes(id)}\n    );', "{bundled:featured.includes(id),trainerDuel,...(trainerDuel?{uid:t+'-'+s,rosterIndex:s,reserve:isReserve}:{})}\n    );");
 s=s.replace('const lineups=teams.map(team=>team.slice(0,3));',"const lineups=teams.map(team=>team.slice(0,currentMode==='trainer-duel'?6:3));");
 s=s.replace("view.matchIntro={...prepareMatchIntro(),start:view.presentationTime,duration:cinematic?1.2:.28};", "const introDuration=currentMode==='trainer-duel'?(cinematic?3:.5):(cinematic?1.2:.28);\n  view.matchIntro={...prepareMatchIntro(),start:view.presentationTime,duration:introDuration};");
 s=s.replace('wait(cinematic?1200:280,token,true,true)', 'wait(introDuration*1000,token,true,true)');
 s=s.replace('const maxTurns=isLargeBattle?500:180;',"const maxTurns=currentMode==='trainer-duel'?Infinity:isLargeBattle?500:180;");
 s=s.replace("const attackCfg={rules:battleRules,bossRaid:","const attackCfg={trainer:currentMode==='trainer-duel',rules:battleRules,bossRaid:");
 s=s.replace('  return choreograph(a,{',"  return choreograph({...a,trainerDuel:currentMode==='trainer-duel'},{");
 s=s.replace("  }else if(winner!==null){\n    audioEngine.background(false);", "  }else if(winner!==null&&currentMode==='trainer-duel'){\n    if(!await playTrainerOutro({view,audio:audioEngine,winner,wait:ms=>wait(ms,token,true,true),valid:()=>token===runId}))return;\n  }else if(winner!==null){\n    audioEngine.background(false);");
 s=s.replace("  if(mode==='eternatus-raid'){\n    battleFormat", "  if(mode==='trainer-duel'){arena='champion';view.arena=arena;battleRules='natural';setVal($('#battle-rules'),'natural');$('#arena-name').textContent=names[arena];$('#ready-arena').textContent=names[arena];$('#weather').textContent=arenaCatalog[arena].weather;$$('.arena-option').forEach(b=>b.classList.toggle('selected',b.dataset.arena===arena));}\n  if(mode==='eternatus-raid'){\n    battleFormat");
 s=s.replace("hidden=!multiSquad||currentMode==='army-battle'", "hidden=!multiSquad||currentMode==='army-battle'||currentMode==='trainer-duel'");
 return s;
});
edit('engine.js',s=>s.replace('const move=pool[Math.floor(rng()*pool.length)];',"const viable=cfg?.trainer?pool.filter(m=>effectiveness(m.type,target.types)>0):pool,legal=viable.length?viable:cfg?.trainer?actor.options.filter(m=>effectiveness(m.type,target.types)>0):pool,choices=legal.length?legal:[moves.find(m=>m.name==='struggle')];const move=choices[Math.floor(rng()*choices.length)];").replace('const rawMult=effectiveness(move.type,target.types),mult=',"const rawMult=cfg?.trainer&&move.name==='struggle'?1:effectiveness(move.type,target.types),mult="));
edit('choreography.js',s=>{
 s="import {trainerAttackStart,trainerAttackResult} from './trainer-duel.js?v=21';\n"+s;
 s=s.replace(' let anticipated=false;', ' trainerAttackStart(view,a);\n let anticipated=false;');
 s=s.replace('const reach=a.spacedRaid?', 'const reach=a.trainerDuel?108:a.spacedRaid?');
 s=s.replace("if(dodge&&!(raidClose&&view.canLowHpMega?.(target))){", "if(dodge&&!(raidClose&&view.canLowHpMega?.(target))){trainerAttackResult(view,a);");
 s=s.replace("else if(mult===0&&!(raidClose&&view.canLowHpMega?.(target))){", "else if(mult===0&&!(raidClose&&view.canLowHpMega?.(target))){trainerAttackResult(view,a);");
 s=s.replace('target.faintAt=view.clock+(raidClose?.08:.32);onDamage', 'trainerAttackResult(view,a);target.faintAt=view.clock+(raidClose?.08:.32);onDamage');
 s=s.replace('view.message(title(next.name)+\' enters!\',520);', "if(!view.trainerMode)view.message(title(next.name)+' enters!',520);");
 return s;
});
edit('battle-view.js',s=>{
 s="import {drawTrainerArena,drawTrainerSurroundings,drawTrainerHUD,drawTrainerOutro,updateTrainerCamera} from './trainer-duel.js?v=21';\n"+s;
 s=s.replace('mount(fighters){',"mount(fighters){this.trainerMode=fighters.some(p=>p.trainerDuel);this.trainerAttack=null;this.trainerOutro=null;this.cameraPanX=0;this._panXNow=0;this.stage.classList.toggle('trainer-duel-mode',this.trainerMode);");
 s=s.replace('drawArena(){const c=this.bg;',"drawArena(){const c=this.bg;if(this.trainerMode&&this.arena==='champion'){drawTrainerArena(c);return;}");
 s=s.replace('this.clock+=dt;this.updateSprites();', 'this.clock+=dt;this.updateSprites();updateTrainerCamera(this);');
 s=s.replace('this._zoomNow.toFixed(4)', 'this._zoomNow.toFixed(4)');
 s=s.replace('Math.min(1,cameraDt*8);this._letterboxNow', 'Math.min(1,cameraDt*(this.trainerMode?2.8:8));this._letterboxNow');
 s=s.replace('this.cameraShakeX=Math.sin', 'this._panXNow=(this._panXNow||0)+((this.cameraPanX||0)-(this._panXNow||0))*Math.min(1,cameraDt*3);this.cameraShakeX=Math.sin');
 s=s.replace('${Math.sin(this.shakeClock*91)*power*.7}px,','${Math.sin(this.shakeClock*91)*power*.7+this._panXNow}px,');
 s=s.replace('drawFinishingHit(back,this);', 'drawTrainerSurroundings(back,this);drawFinishingHit(back,this);');
 s=s.replace('drawFaintNotices(this.overlayCtx,this);','drawFaintNotices(this.overlayCtx,this);drawTrainerHUD(this.overlayCtx,this);drawTrainerOutro(this.overlayCtx,this);');
 return s;
});
edit('match-presentation.js',s=>"import {drawTrainerIntro} from './trainer-duel.js?v=21';\n"+s.replace('export function drawMatchPresentation(c,view){','export function drawMatchPresentation(c,view){if(view.trainerMode){drawTrainerIntro(c,view);return;}'));
edit('recording-studio.js',s=>s.replace('W/2+(this.view.cameraShakeX||0)', 'W/2+(this.view.cameraShakeX||0)+(this.view._panXNow||0)').replace('    this.drawCompositeHUD(c, 0, raidHud?30:82);\n    this.drawCompositeHUD(c, 1, raidHud?884:790);', '    if(!this.view.trainerMode){this.drawCompositeHUD(c, 0, raidHud?30:82);this.drawCompositeHUD(c, 1, raidHud?884:790);}'));
fs.appendFileSync('dist/workspace.css',`\n.trainer-duel-mode>.team-hud,.trainer-duel-mode .stage-bottom{display:none!important}.trainer-duel-mode #hud-overlay{z-index:1100}.ready-lineup[data-count="6"] img{width:5.2cqw;height:7cqw}\n`);
