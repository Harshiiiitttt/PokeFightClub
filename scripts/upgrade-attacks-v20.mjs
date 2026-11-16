import fs from 'node:fs';
const edit=(name,fn)=>{const p='dist/'+name;fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));};
edit('battle-view.js',s=>{
 s="import {drawAttackPolish,attackEase} from './attack-polish.js?v=19';\n"+s;
 s=s.replace('move(p,to,duration,arc=0,curve=0){p.motion={from:{...p.pos},to,start:this.clock,duration:duration/1000,arc,curve};}',"move(p,to,duration,arc=0,curve=0,easing='smooth'){p.motion={from:{...p.pos},to,start:this.clock,duration:duration/1000,arc,curve,easing};}");
 s=s.replace('async motion(p,to,duration,wait,arc=0,curve=0){this.move(p,to,duration,arc,curve);','async motion(p,to,duration,wait,arc=0,curve=0,easing=\'smooth\'){this.move(p,to,duration,arc,curve,easing);');
 s=s.replace('e=t*t*(3-2*t);p.pos.x','e=attackEase(t,m.easing);p.pos.x');
 s=s.replace("if(drawGuardianFx(c,e,t,this.images)||drawAttackDetail(c,e,t))", "if(drawGuardianFx(c,e,t,this.images)||drawAttackDetail(c,e,t)||drawAttackPolish(c,e,t))");
 s=s.replace('e.from.y=mouth.y;}const t=', 'e.from.y=mouth.y;e.to.x=e.victim.pos.x;e.to.y=e.victim.pos.y;}const t=');
 s=s.replace("this.addFx('impact',p.pos,p.pos,color,heavy?240:150);", "this.addFx('impact',p.pos,p.pos,color,heavy?240:150);this.addFx('hit-shards',p.pos,p.pos,color,heavy?330:220);this.addFx('attack-dust',p.pos,p.pos,'#c7bb9f',400,{behindFighters:true});");
 return s;
});
edit('choreography.js',s=>{
 // Launch effects and sprite timing share the existing waits; no extra battle delay.
 s=s.replace("actor.charge=false;actor.lean=ny*8;", "actor.charge=false;actor.lean=ny*8;actor.animKey=null;actor.gbaAnimKey=null;");
 s=s.replace("audio.sfx(move.type,physical?'dash':'attack');", "view.addFx('attack-dust',source,source,'#c7bb9f',380,{behindFighters:true});if(!physical)view.addFx('muzzle',view.mouth(actor,target),dest,c,230);audio.sfx(move.type,physical?'dash':'attack');");
 s=s.replace("move.fx==='slash'?(actor.team===0?26:-26):0);if(!valid())return;", "!a.spacedRaid&&move.fx==='slash'?(actor.team===0?26:-26):0,'strike');if(!valid())return;");
 s=s.replace("view.move(actor,contact,240,28);", "view.move(actor,contact,240,28,0,'strike');");
 s=s.replace("for(let i=0;i<hits;i++){const hit=", "for(let i=0;i<hits;i++){actor.animKey=null;actor.gbaAnimKey=null;view.addFx('strike-arc',contact,dest,c,180,{flip:i%2});const hit=");
 s=s.replace("},180);\n  if(['fire'", "},180,0,0,'recoil');\n  if(['fire'");
 // Army and raid approaches benefit too, retaining their existing combat rules.
 s=s.replace('view.move(p,contact,360,12);',"view.addFx('attack-dust',origin,origin,'#c7bb9f',300,{behindFighters:true});view.move(p,contact,360,12,0,'strike');");
 s=s.replace('view.move(actor,contact,230,14);',"view.addFx('attack-dust',origin,origin,'#c7bb9f',300,{behindFighters:true});view.move(actor,contact,230,14,0,'strike');");
 return s;
});
