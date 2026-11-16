import fs from 'node:fs';
let app=fs.readFileSync('dist/app.js','utf8');
const start=app.indexOf('async function triggerLegendarySummonAct2('),end=app.indexOf('\nasync function evolveStageFighter',start);
if(start<0||end<0)throw Error('Missing summon integration points');
const old=app.slice(start,end),awakeStart=old.indexOf('  for(const g of guardians){',old.indexOf('// Awaken all 3')),awakeEnd=old.indexOf('\n  if(cinematic){view.flash',awakeStart),awakening=old.slice(awakeStart,awakeEnd);
const replacement=`async function triggerLegendarySummonAct2(boss,w,valid){
 if(!boss||boss.act2Triggered)return valid();
 boss.act2Triggered=true;
 const shaved=1-Math.min(1,boss.act1LowestHpRatio??1),tiers=Math.floor(shaved/.25),willMult=1+(tiers===0?.08:tiers*.15),willLabel=tiers>0?'+'+tiers*15+'% WILL OF THE 50!':'GUARDIAN SPIRIT!';
 const fallen=fighters.filter(p=>p.team===1&&!p.isGuardian&&p.hp<=0);
 const guardians=pickGuardianTrio(boss.id,rng).map((gid,idx)=>{
  const g=createFighter(resolveSpeciesData(gid,cache,roster),1,[0,2,1][idx],{rules:'natural',uidIndex:100+idx});
  const maxHp=Math.round(g.max*4.4),awak=GUARDIAN_AWAKENINGS[gid];
  Object.assign(g,{isGuardian:true,raidEngaged:true,willMult,max:maxHp,hp:maxHp,bundled:featured.includes(gid),entranceHidden:true,summonColor:awak?.color||megaColors[gid]||'#ffe58a',awakenedName:awak?.title||title(g.name)});
  // Fetch directional metadata concurrently with the soul-gathering scene.
  ensurePmd(view,gid).then(()=>{if(valid())view.loadPmd()});
  const portrait=view.pmd?.[gid]?.portrait||('assets/classic/front/'+gid+'.png');view.load('guardian-portrait-'+gid,portrait);
  return g;
 });
 fighters.push(...guardians);view.loadPmd();
 view.phase2Vortex=view.phase2Vortex||'eternatus';
 log('ACT 2 — ALL 50 HAVE FALLEN! THE ANCIENT GUARDIANS ANSWER THE CALL!','ko');
 const attach=(g,pos)=>{g.pos={...pos};g.baseHome={...pos};g.motion=null;g.hitUntil=0;g.face=-1;g.direction=4;$('#fighters').append(view.createFighterEl(g));};
 const awaken=()=>{
${awakening}
  view.drawHUD();
 };
 const completed=await playGuardianEntrance({boss,guardians,fallen,view,audio:audioEngine,wait:w,valid,attach,awaken,log,willLabel});
 return completed;
}
`;
app="import {playGuardianEntrance} from './guardian-entrance.js?v=11';\n"+app.slice(0,start)+replacement+app.slice(end);
app=app.replace("audioEngine.background(false);\n  if(studio.recording)","audioEngine.background(false);\n  audioEngine.cancelSpeech();\n  if(studio.recording)");
fs.writeFileSync('dist/app.js',app);
let view=fs.readFileSync('dist/battle-view.js','utf8');
view="import {drawGuardianFx} from './guardian-fx.js?v=11';\n"+view;
view=view.replace('this.phase2Vortex=null;this.cameraZoom=1;','this.phase2Vortex=null;this.summoning=false;this.summonDim=0;this.vortexSuppression=0;this.cameraPanY=0;this._panNow=0;this.cameraZoom=1;');
view=view.replace('if(p.raidEngaged&&p.hp>0&&!p.action','if(!this.summoning&&p.raidEngaged&&p.hp>0&&!p.action');
view=view.replace('if(!p.el||p.reserve)continue;','if(!p.el||p.reserve||p.entranceHidden)continue;');
view=view.replace('world.style.transform=`translate(',"this._panNow=(this._panNow||0)+((this.cameraPanY||0)-(this._panNow||0))*Math.min(1,cameraDt*6);world.style.transform=`translate(");
view=view.replace('Math.cos(this.shakeClock*117)*power*.5','Math.cos(this.shakeClock*117)*power*.5+this._panNow');
view=view.replace('this.cinematic,this.phase2Vortex);','this.cinematic,this.phase2Vortex,this.vortexSuppression||0);if(this.summonDim){c.fillStyle=\'#08051c\';c.globalAlpha=this.summonDim;c.fillRect(0,0,W,H);c.globalAlpha=1;}');
view=view.replace('if(drawAttackDetail(c,e,t)){}','if(drawGuardianFx(c,e,t,this.images)||drawAttackDetail(c,e,t)){}');
fs.writeFileSync('dist/battle-view.js',view);
let ambience=fs.readFileSync('dist/arena-ambience.js','utf8').replace('vortex=null){','vortex=null,suppression=0){');
ambience=ambience.replace('  c.globalAlpha=.18+.06*Math.sin(time*3);','  c.translate(0,-suppression*170);\n  c.globalAlpha=(.18+.06*Math.sin(time*3))*(1-suppression*.85);').replace('c.globalAlpha=.24-r*.04;','c.globalAlpha=(.24-r*.04)*(1-suppression*.85);');fs.writeFileSync('dist/arena-ambience.js',ambience);
let choreo=fs.readFileSync('dist/choreography.js','utf8').replace('standoffSlots[idx]||standoffSlots[1]','standoffSlots[g.slot%3]||standoffSlots[1]');fs.writeFileSync('dist/choreography.js',choreo);
let studio=fs.readFileSync('dist/recording-studio.js','utf8');
studio=studio.replace('    if (this.view.scenery) c.drawImage','    c.save();\n    const zoom=this.view._zoomNow||1;\n    c.translate(W/2,H/2+(this.view._panNow||0));c.scale(zoom,zoom);c.translate(-W/2,-H/2);\n    if (this.view.scenery) c.drawImage');
studio=studio.replace('.filter(p => p.el && !p.reserve)', '.filter(p => p.el && !p.reserve && !p.entranceHidden)');studio=studio.replace('    this.drawCompositeHUD(c, 0, 82);','    c.restore();\n    this.drawCompositeHUD(c, 0, 82);');fs.writeFileSync('dist/recording-studio.js',studio);
for(const file of fs.readdirSync('dist').filter(f=>/\.(js|css|html)$/.test(f))){const path='dist/'+file;fs.writeFileSync(path,fs.readFileSync(path,'utf8').replaceAll('?v=10','?v=11'))}
