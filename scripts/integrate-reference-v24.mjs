import fs from 'node:fs';
const edit=(name,fn)=>{const path='dist/'+name;fs.writeFileSync(path,fn(fs.readFileSync(path,'utf8')));};
edit('trainer-duel.js',s=>{
 s="import {drawCompactTrainerHUD,noteTrainerResult} from './trainer-overlay.js?v=23';\nimport {drawOverworldArena} from './overworld-arena.js?v=23';\nimport {trainerVisualScale} from './trainer-scale.js?v=23';\n"+s;
 s=s.replace('export function trainerSpriteRect(p){return{x:p.pos.x-120,y:p.pos.y-140,width:240,height:280};}', 'export function trainerSpriteRect(p){const s=trainerVisualScale(p);return{x:p.pos.x-96*s,y:p.pos.y-112*s,width:192*s,height:224*s};}');
 s=s.replace('s.impactAt=view.clock;s.result=', 's.impactAt=view.clock;noteTrainerResult(view,a);s.result=');
 const crowdStart=s.indexOf(' for(let row=0;row<4;row++)'),crowdEnd=s.indexOf(" c.fillStyle='#354652'",crowdStart);
 s=s.slice(0,crowdStart)+" for(let row=0;row<4;row++){c.fillStyle=row%2?'#263545':'#293c4b';c.fillRect(0,101+row*31,540,30);c.fillStyle='#42566a';c.fillRect(0,129+row*31,540,2);}\n"+s.slice(crowdEnd);
 const worldStart=s.indexOf('export function drawTrainerSurroundings('),worldEnd=s.indexOf('export function updateTrainerCamera',worldStart);
 s=s.slice(0,worldStart)+`export function drawTrainerSurroundings(c,view){drawOverworldArena(c,view);}
`+s.slice(worldEnd);
 const hudStart=s.indexOf('export function drawTrainerHUD('),hudEnd=s.indexOf('export function drawTrainerIntro',hudStart);
 s=s.slice(0,hudStart)+`export function drawTrainerHUD(c,view){drawCompactTrainerHUD(c,view);}
`+s.slice(hudEnd);
 s=s.replace("const zoom=Math.min(contact?(s.move.power>=100?1.36:1.28):charge?1.09:1.16,440/(Math.abs(a.x-b.x)+250),610/(Math.abs(a.y-b.y)+250));", "const special=['bolt','meteor'].includes(s.move.fx),impact=s.result&&view.clock-s.impactAt<.34;\n const zoom=Math.min(contact?(s.move.power>=100?1.44:1.32):special?(impact?1.44:charge?1.08:1.26):charge?1.08:1.18,460/(Math.abs(a.x-b.x)+215),640/(Math.abs(a.y-b.y)+215));");
 s=s.replace("['beam','bolt','flame','orb','wave','slash-wave','meteor'].includes(e.kind)","['beam','bolt','flame','orb','wave','slash-wave','meteor','anime-electric','anime-meteors'].includes(e.kind)");
 s=s.replace('clamp(zoom,1,1.36)','clamp(zoom,1,1.46)');
 return s;
});
edit('battle-view.js',s=>{
 s="import {trainerVisualScale} from './trainer-scale.js?v=23';\nimport {NPC_NAMES} from './overworld-arena.js?v=23';\nimport {drawDuelAnimeFX} from './duel-anime-fx.js?v=23';\n"+s;
 s=s.replace("this.load('trainer-0'", "for(const npc of NPC_NAMES)this.load('npc-'+npc,'assets/npc/'+npc+'.png');this.load('trainer-0'");
 s=s.replace('mount(fighters){','mount(fighters){this.trainerResults=[];');
 s=s.replace("el.id=p.uid;el.dataset.species", "if(p.trainerDuel){const scale=trainerVisualScale(p);el.style.width=24*scale+'%';el.style.height=13.5*scale+'%';}el.id=p.uid;el.dataset.species");
 s=s.replace('scale=p.trainerDuel?1.25:1;', 'scale=p.trainerDuel?trainerVisualScale(p):1;');
 s=s.replace('if(drawTrainerEffect(c,e,t)||','if(drawDuelAnimeFX(c,e,t,this.images)||drawTrainerEffect(c,e,t)||');
 return s;
});
edit('recording-studio.js',s=>"import {trainerVisualScale} from './trainer-scale.js?v=23';\n"+s.replace('p.pos.y + (p.trainerDuel?35:18)', 'p.pos.y + (p.trainerDuel?28*trainerVisualScale(p):18)').replace('p.trainerDuel?32:22','p.trainerDuel?22*trainerVisualScale(p):22').replace('p.trainerDuel?9:7','p.trainerDuel?7*trainerVisualScale(p):7'));
edit('move-labels.js',s=>"import {trainerVisualScale} from './trainer-scale.js?v=23';\n"+s.replace("c.font='bold 10px monospace';", "c.font=view.trainerMode?'italic 700 12px \"Space Grotesk\",Inter,sans-serif':'bold 10px monospace';").replace('(p.trainerDuel?1.25:1)', '(p.trainerDuel?trainerVisualScale(p):1)'));
edit('trainer-combat.js',s=>{
 s="import {trainerVisualScale} from './trainer-scale.js?v=23';\n"+s;
 s=s.replace('Math.max(124,(spriteExtent(a.id)+spriteExtent(b.id))*.625+14)', 'Math.max(96,(spriteExtent(a.id)*trainerVisualScale(a)+spriteExtent(b.id)*trainerVisualScale(b))*.5+20)');
 s=s.replace("if(move.fx==='ground'){", "if(move.fx==='bolt'){view.addFx('anime-electric',mouth,dest,c,550);}\n   else if(move.fx==='meteor'){view.addFx('anime-meteors',mouth,dest,c,750);}\n   else if(move.fx==='ground'){");
 s=s.replace('await w(heavy?150:100);if(!valid())return;if(finisher&&!await anticipate())return;\n   await w(heavy?130:85);', "const travel=move.fx==='meteor'?500:move.fx==='bolt'?300:heavy?280:185;\n   await w(Math.round(travel*.48));if(!valid())return;if(finisher&&!await anticipate())return;\n   await w(Math.round(travel*.52));");
 return s;
});
edit('app.js',s=>s.replace('d={id:p.id,name:p.name,types:', 'd={id:p.id,name:p.name,height:p.height,types:'));
