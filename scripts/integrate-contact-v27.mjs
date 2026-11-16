import fs from 'node:fs';
const edit=(name,fn)=>{const p='dist/'+name;fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));};
edit('trainer-combat.js',s=>{
 s="import {duelContactPoint} from './duel-clearance.js?v=26';\n"+s;
 s=s.replace('(contact?22:52)', '(contact?14:52)').replace('let drama=null;const serious=', 'let drama=null,contactState=null;const serious=');
 s=s.replace('hitPoint={x:dest.x-nx*plan.reach,y:dest.y-ny*plan.reach};','hitPoint=contact?duelContactPoint(actor,target):{x:dest.x-nx*plan.reach,y:dest.y-ny*plan.reach};');
 s=s.replace("  if(contact){\n   view.addFx('speed'", "  if(contact){\n   contactState={actor,target};view.duelContact=contactState;\n   view.addFx('speed'");
 s=s.replace('endDuelDrama(view,drama);view.trainerExchange=false;', 'endDuelDrama(view,drama);if(view.duelContact===contactState)view.duelContact=null;view.trainerExchange=false;');
 return s;
});
edit('battle-view.js',s=>s.replace('mount(fighters){','mount(fighters){this.duelContact=null;'));
edit('trainer-duel.js',s=>"import {TRAINER_STANCES} from './arena-layout.js?v=26';\n"+s.replace("{x:270,y:p.team===0?228:850}", 'TRAINER_STANCES[p.team].hand'));
edit('overworld-arena.js',s=>{
 s="import {TRAINER_STANCES} from './arena-layout.js?v=26';\nimport {drawChannelBoards} from './channel-boards.js?v=26';\n"+s;
 s=s.replace('c.rect(0,0,540,227)', 'c.rect(0,0,540,190)').replace('row<7;row++','row<6;row++').replace('c.fillRect(0,0,540,227)','c.fillRect(0,0,540,190)');
 const start=s.indexOf(' for(const [team,y] of [[0,225]'),end=s.indexOf(" npc(c,view.images['npc-cameraman']",start);
 s=s.slice(0,start)+` drawChannelBoards(c,view);
 for(const [team,box] of TRAINER_STANCES.entries()){c.fillStyle='#263c46';c.fillRect(box.x,box.y,box.w,box.h);c.strokeStyle=team?'#83aed0':'#ce9184';c.lineWidth=2;c.strokeRect(box.x+1,box.y+1,box.w-2,box.h-2);c.globalAlpha=.45;c.strokeStyle='#c7d4c7';c.lineWidth=1;c.beginPath();c.ellipse(box.feet.x,box.feet.y-2,15,5,0,0,Math.PI*2);c.stroke();c.globalAlpha=1;npc(c,view.images[team?'npc-blue':'npc-red_normal'],box.feet.x,box.feet.y,team?1:0,1.15);}
`+s.slice(end);
 s=s.replace("'],17,510,2", "'],38,510,2").replace("'],523,510,2", "'],502,510,2");
 s=s.replace('y=state.team?821:199', 'y=TRAINER_STANCES[state.team].y-8');
 return s;
});
edit('arena-barricades.js',s=>{
 s="import {ARENA_RAILS} from './arena-layout.js?v=26';\n"+s;
 s=s.replace('for(const x of [37,503])','for(const x of [ARENA_RAILS.left,ARENA_RAILS.right])').replace('279,14,537','ARENA_RAILS.top,14,ARENA_RAILS.bottom-ARENA_RAILS.top').replace('279,8,537','ARENA_RAILS.top,8,ARENA_RAILS.bottom-ARENA_RAILS.top').replace('279,2,537','ARENA_RAILS.top,2,ARENA_RAILS.bottom-ARENA_RAILS.top');
 s=s.replace('let y=292;y<=805;', 'let y=ARENA_RAILS.top+5;y<=ARENA_RAILS.bottom-5;');
 s=s.replace('for(const y of [286,815])for(const [x,w] of [[39,165],[336,165]])', 'for(const y of [ARENA_RAILS.top,ARENA_RAILS.bottom])for(const [x,w] of [[ARENA_RAILS.left,ARENA_RAILS.gateLeft-ARENA_RAILS.left],[ARENA_RAILS.gateRight,ARENA_RAILS.right-ARENA_RAILS.gateRight]])');
 s=s.replace('[[280,312],[818,830]]', '[[ARENA_RAILS.top,315],[ARENA_RAILS.bottom,843]]');
 s=s.replace("[[37,'#b36e68'],[503,'#6c91b3']]", "[[ARENA_RAILS.left,'#b36e68'],[ARENA_RAILS.right,'#6c91b3']]");
 return s;
});
