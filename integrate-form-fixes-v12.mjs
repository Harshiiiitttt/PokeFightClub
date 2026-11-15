import fs from 'node:fs';
let app=fs.readFileSync('dist/app.js','utf8');app="import {applyFormArt,EVOLVED_FORM_KEYS} from './form-art.js?v=12';\n"+app;
app=app.replace("  p.options=movesFor(p);\n  const img=p.el?.querySelector('img');", "  p.options=movesFor(p);\n  applyFormArt(view,p);\n  const img=p.el?.querySelector('img');");
// Preserve the common sprite/HUD updates, then enforce the selected form's art.
app=app.replace("  if(restoreHealth)view.damage(p,'HP RESTORED!',true);", "  applyFormArt(view,p);\n  if(restoreHealth)view.damage(p,'HP RESTORED!',true);");
app=app.replace("    g.el?.classList.add('mega-evolved');", "    applyFormArt(view,g);\n    g.el?.classList.add('mega-evolved');");
app=app.replace("Object.assign(p,{stats:form.stats,types:form.types,name:form.title});", "Object.assign(p,{stats:form.stats,types:form.types,name:form.title});\n      applyFormArt(view,p);");
app=app.replace("      {bundled:featured.includes(id)}", "      {bundled:featured.includes(id),...(isBoss&&[384,718,800].includes(id)?{formKey:EVOLVED_FORM_KEYS[id],transformed:true}:{})}");
app=app.replace('audioEngine.speakCountdown(step);','audioEngine.countdownCue(step);').replace(/\s*audioEngine\.speak\(`\$\{name\} wins!`,\{rate:1\.12,pitch:1\.32\}\);/,'');
fs.writeFileSync('dist/app.js',app);
let pmd=fs.readFileSync('dist/pmd-animation.js','utf8');pmd="import {EVOLVED_FORM_KEYS} from './form-art.js?v=12';\n"+pmd;
pmd=pmd.replace("[spriteKey(p),'mega-'+p.id]", "[spriteKey(p),'mega-'+p.id,EVOLVED_FORM_KEYS[p.id]]");
pmd=pmd.replace("if((view.style==='gba'&&!p.mega)||!anims)return null;", "if((view.style==='gba'&&!p.mega&&!p.transformed)||!anims)return null;");fs.writeFileSync('dist/pmd-animation.js',pmd);
let view=fs.readFileSync('dist/battle-view.js','utf8');view="import {applyFormArt,formAssetUrl} from './form-art.js?v=12';\nimport {announceMove,drawMoveLabels} from './move-labels.js?v=12';\n"+view;
view=view.replace('p.el=el;return el}', 'p.el=el;if(p.formKey)applyFormArt(this,p,p.formKey);return el}');
view=view.replace('this.particles=[];this.effects=[];this.label=null;this.notice=null;this.clock=0;', 'this.particles=[];this.effects=[];this.moveLabels=new Map();this.label=null;this.notice=null;this.clock=0;');
view=view.replace("const img=document.createElement('img');if(this.pmd?.[p.id])", "const img=document.createElement('img');if(this.pmd?.[p.formKey]?.portrait){img.src=formAssetUrl(this.pmd[p.formKey].portrait);}else if(this.pmd?.[p.id])");
view=view.replace("announce(p,move){this.label={p,text:title(p.name)+'  '+title(move.name),color:colors[move.type]};}", "announce(p,move,duration=1800){announceMove(this,p,move,duration);}");
view=view.replace("Math.sin(this.clock*2+p.slot)*.5+'px'", "Math.sin(this.clock*2+p.slot)*(p.formKey==='origin-487'?4:.5)+'px'");
const labelStart=view.indexOf(' if(this.label){const l=this.label,'),labelEnd=view.indexOf('\n if(this.notice',labelStart);
if(labelStart<0||labelEnd<0)throw Error('Move label integration point missing');view=view.slice(0,labelStart)+' drawMoveLabels(c,this);'+view.slice(labelEnd);fs.writeFileSync('dist/battle-view.js',view);
let choreo=fs.readFileSync('dist/choreography.js','utf8');choreo="import {applyFormArt,BOSS_FORM_KEYS} from './form-art.js?v=12';\n"+choreo;
choreo=choreo.replace("if(boss.id===384)boss.formKey='mega-384';", "if(BOSS_FORM_KEYS[boss.id])applyFormArt(view,boss,BOSS_FORM_KEYS[boss.id]);");
choreo=choreo.replace("if(!raidClose||actor.isBoss||actor.mega||hero)view.announce(actor,move);", "view.announce(actor,move);for(const al of squad)view.announce(al,move);");
choreo=choreo.replace("  const mc=colors[move.type]||'#ffffff'", "  view.announce?.(p,move,1500);\n  const mc=colors[move.type]||'#ffffff'");
// Army and guardian attacks each have their own independently tracked caption.
choreo=choreo.replace("   const gc=colors[move.type]", "   view.announce?.(g,move,1500);\n   const gc=colors[move.type]");
choreo=choreo.replace("  const mc=colors[move.type]||'#ffffff',mAsset=assets[move.type]||'energyball';\n  const origin={...(actor.baseHome", "  const mc=colors[move.type]||'#ffffff',mAsset=assets[move.type]||'energyball';\n  view.announce?.(actor,move,1500);\n  const origin={...(actor.baseHome");
// Boss labels are emitted after Judgment chooses its actual plate type.
choreo=choreo.replaceAll('  const bc=colors[bMove.type]', '  view.announce?.(boss,bMove,1600);\n  const bc=colors[bMove.type]');
choreo=choreo.replace(" boss.name=meta.title;", " boss.name=meta.title;\n view.announce?.(boss,{name:meta.move,type:meta.type},2200);");
choreo=choreo.replace("  audio.sfx(bossMeta.type,'charge');", "  view.announce?.(boss,{name:bossMeta.move,type:bossMeta.type},2600);\n  for(const g of guardians)view.announce?.(g,g.options?.[0]||{name:'dragon-ascent',type:g.types[0]},2600);\n  audio.sfx(bossMeta.type,'charge');");
fs.writeFileSync('dist/choreography.js',choreo);
let entrance=fs.readFileSync('dist/guardian-entrance.js','utf8');entrance=entrance.replace("audio.speak?.('The Ancient Guardians answer the call!',{rate:1.02,pitch:1.12});",'');fs.writeFileSync('dist/guardian-entrance.js',entrance);
let audio=fs.readFileSync('dist/battle-audio.js','utf8');audio=audio.replace(/^ speak\(text,.*\r?\n/m,'');audio=audio.replace(/^ speakCountdown\(step\).*\r?\n/m," countdownCue(step){const isGo=String(step).toUpperCase().startsWith('GO');this.cue(isGo?'victory':'ready',isGo?.7:.45);}\n");fs.writeFileSync('dist/battle-audio.js',audio);
for(const file of fs.readdirSync('dist').filter(f=>/\.(js|html|css)$/.test(f))){const path='dist/'+file;fs.writeFileSync(path,fs.readFileSync(path,'utf8').replaceAll('?v=11','?v=12'))}
