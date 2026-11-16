import fs from 'node:fs';
let s=fs.readFileSync('build-sounds.mjs','utf8');s=s.replace('victory:.85}', 'victory:.85,punch:.2,kick:.28,beam:.85,thunder:1.05,crack:.18,debris:.6,collapse:.5,ready:.42}');s=s.replace("if(name==='strike'||name==='heavy')",`if(name==='punch'||name==='kick'){const f=name==='punch'?155:95;v=(Math.sin(2*Math.PI*(f*t-80*t*t))*.7+r*.22+low*.5)*attack*Math.exp(-t*17)}
 else if(name==='beam'){phase+=2*Math.PI*(190+Math.sin(t*30)*30)/rate;const env=Math.min(1,t/.06,(duration-t)/.22);v=(Math.sin(phase)*.5+Math.sin(phase*1.49)*.2+low*.5)*Math.max(0,env)}
 else if(name==='thunder'){v=(low*2+Math.sin(2*Math.PI*38*t)*.3)*Math.min(1,t/.02)*Math.exp(-t*2.8)*(1+.3*Math.sin(t*24))}
 else if(name==='crack'){v=(r*.7+Math.sin(2*Math.PI*220*t)*.25)*attack*Math.exp(-t*30)}
 else if(name==='debris'){const tap=Math.max(0,Math.sin(t*141))**14;v=(r*.6+low*.4)*tap*(1-p)}
 else if(name==='collapse'){v=(Math.sin(2*Math.PI*63*t)*.6+low*.9)*attack*Math.exp(-t*10)+r*.1*Math.exp(-t*19)}
 else if(name==='ready'){const note=t<.16?392:587;v=Math.sin(2*Math.PI*note*t)*.45*Math.exp(-5*(t%.16))*Math.min(1,(1-p)*5)}
 else if(name==='strike'||name==='heavy')`);fs.writeFileSync('build-sounds.mjs',s);
let a=fs.readFileSync('dist/battle-audio.js','utf8');a=a.replace("'slash','bite','victory']","'slash','bite','victory','punch','kick','beam','thunder','crack','debris','collapse','ready']");const cut=a.indexOf(" sfx(type,");a=a.slice(0,cut)+`
 quiet(duration=180){for(const a of this.active)if(a._cue==='charge'||a._cue==='cry'){a.pause();this.active.delete(a)}this.duck(duration);this.music.volume=0;}
 cue(name,gain=1){if(!this.enabled)return;const pool=this.pools.get(name);if(!pool)return;const a=pool.find(x=>!this.active.has(x))||pool[0];a._cue=name;this.play(a,this.effectsVolume*gain);}
 sfx(type,phase='attack',strength=false,move){if(!this.enabled)return;const heavy=typeof strength==='number'?strength>=.75:strength;const pack={fire:'flame',water:'water',electric:'electric',ice:'ice',ground:'ground',rock:'ground',steel:'steel',fighting:'whoosh',normal:'whoosh',flying:'whoosh',grass:'whoosh',bug:'whoosh'};const contact=move?.fx==='slash'?'slash':move?.fx==='bite'||move?.name==='crunch'?'bite':move?.fx==='kick'?'kick':move?.fx==='punch'||move?.name==='close-combat'?'punch':null;const name=['ready','victory','collapse','thunder','beam'].includes(phase)?phase:phase==='impact'&&contact?contact:phase==='impact'?(heavy?'heavy':type==='steel'?'steel':'strike'):phase==='charge'?'charge':phase==='dash'||phase==='miss'?'whoosh':pack[type]||'energy';this.duck(heavy?900:650);this.cue(name,phase==='charge'?.42:1);if(phase==='impact'&&heavy){if(name!=='heavy')this.cue('heavy',.55);this.cue('crack',.42);this.cue('debris',.28);}}
}
`;a=a.replace('this.cries.set(id,a)}a.currentTime',"a._cue='cry';this.cries.set(id,a)}a.currentTime");fs.writeFileSync('dist/battle-audio.js',a);
