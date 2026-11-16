import fs from 'node:fs';
const edit=(name,fn)=>{const p='dist/'+name;fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));};
edit('trainer-overlay.js',s=>{
 s="import {ensureTrainerPortrait} from './trainer-portraits.js?v=25';\n"+s;
 s=s.replace(" c.fillStyle='#171b29f5';c.fillRect(0,0,540,100);c.fillStyle='#354359';c.fillRect(0,96,540,4);", ' // The HUD has no backdrop or portrait matte; only its readable labels and HP tracks remain.');
 s=s.replace("c.fillStyle='#555c77';c.fillRect(faceX,1,50,58);const image=view.images['intro-'+p.id];if(image)c.drawImage(image,faceX+1,2,48,56);", "const image=ensureTrainerPortrait(view,p);if(image)c.drawImage(image,faceX+1,3,48,48);else{c.strokeStyle='#d8e1da';c.lineWidth=2;c.beginPath();c.arc(faceX+25,27,11,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(faceX+14,27);c.lineTo(faceX+36,27);c.stroke();}");
 s=s.replace("c.fillText(title(p.name).toUpperCase(),textX,18,204);", "c.strokeStyle='#101b26';c.lineWidth=3;c.strokeText(title(p.name).toUpperCase(),textX,18,204);c.fillText(title(p.name).toUpperCase(),textX,18,204);");
 return s;
});
edit('app.js',s=>{
 s="import {ensureTrainerPortrait} from './trainer-portraits.js?v=25';\n"+s;
 s=s.replace("for(const id of new Set(lineups.flat())){const source=view.pmd?.[id]?.portrait||('assets/classic/front/'+id+'.png');view.load('intro-'+id,source);}", "for(const id of new Set(lineups.flat())){ensureTrainerPortrait(view,{id,name:cache[id]?.name});}");
 s=s.replace('  view.waitForFinisher=ms=>', '  view.waitForTrainer=ms=>wait(ms,token,true,true);\n  view.waitForFinisher=ms=>');
 return s;
});
edit('battle-view.js',s=>{
 s="import {drawElementalDuelFX} from './elemental-duel-fx.js?v=25';\n"+s;
 s=s.replace('mount(fighters){','mount(fighters){this.trainerRecall=null;this.waitForTrainer=null;');
 s=s.replace('if(drawDuelAnimeFX(c,e,t,this.images)||','if(drawElementalDuelFX(c,e,t)||drawDuelAnimeFX(c,e,t,this.images)||');
 return s;
});
edit('trainer-duel.js',s=>s.replace('row<4;row++){c.fillStyle=', 'row<8;row++){c.fillStyle=').replace('101+row*31','row*31').replace('129+row*31','28+row*31').replace(' if(!view.cinematic||view.matchIntro||view.trainerOutro)', ' if(!view.cinematic||view.matchIntro||view.trainerOutro||view.trainerRecall)'));
edit('overworld-arena.js',s=>{
 s="import {drawArenaBarricades} from './arena-barricades.js?v=25';\n"+s;
 s=s.replace('c.rect(0,101,540,126)','c.rect(0,0,540,227)').replace('row<4;row++','row<7;row++').replace('y=131+row*29','y=35+row*29').replace('c.fillRect(0,101,540,126)','c.fillRect(0,0,540,227)');
 s=s.replace(' for(const [team,y] of [[0,225],[1,831]])', ' drawArenaBarricades(c,view);\n for(const [team,y] of [[0,225],[1,831]])');
 s=s.replace("'],21,510,2", "'],17,510,2").replace("'],519,510,2", "'],523,510,2");
 s=s.replace(' c.restore();\n}', ` if(view.trainerRecall){const state=view.trainerRecall,y=state.team?821:199,t=(view.noticeTime??view.presentationTime)-state.start;for(let i=0;i<3;i++){c.globalAlpha=t*2.5>i?1:.25;c.fillStyle=state.team?'#bad7f1':'#efb0a3';c.beginPath();c.arc(260+i*10,y,2.5,0,Math.PI*2);c.fill();}c.globalAlpha=1;}
 c.restore();
}`);
 return s;
});
edit('trainer-recall.js',s=>s.replace('start:view.presentationTime','start:view.noticeTime??view.presentationTime'));
edit('trainer-combat.js',s=>{
 s="import {trainerRecallPause} from './trainer-recall.js?v=25';\n"+s;
 s=s.replace("else if(move.fx==='ground'){", "else if(['water','ice','grass'].includes(move.type)){view.addFx('element-'+move.type,mouth,dest,c,move.type==='ice'?550:move.type==='grass'&&move.fx==='beam'?580:520,{variant:move.name==='hydro-pump'?'hydro-pump':move.fx});}\n   else if(move.fx==='ground'){");
 s=s.replace("const travel=move.fx==='meteor'?500:move.fx==='bolt'?300:heavy?280:185;", "const travel=move.fx==='meteor'?500:move.fx==='bolt'?300:move.type==='water'||move.type==='ice'?320:move.type==='grass'?(move.fx==='beam'?360:290):heavy?280:185;");
 s=s.replace("view.damage(target,(crit?'CRIT ':'')+'−'+damage,crit);audio.sfx", "view.damage(target,(crit?'CRIT ':'')+'−'+damage,crit);view.addFx('element-impact',dest,dest,c,460,{element:move.type});audio.sfx");
 s=s.replace("if(next){next.slot=0;log(", "if(next){endDuelDrama(view,drama);if(!await trainerRecallPause(view,target.team,next,w,valid))return;next.slot=0;log(");
 return s;
});
