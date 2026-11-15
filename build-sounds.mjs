import fs from 'node:fs';
fs.mkdirSync('dist/assets/sfx',{recursive:true});const rate=44100;let seed=7451;const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/2147483648-1};
const specs={charge:.35,whoosh:.32,strike:.24,heavy:.58,flame:.62,water:.62,electric:.5,ice:.45,energy:.55,ground:.65,steel:.4,slash:.23,bite:.28,victory:.85,punch:.2,kick:.28,beam:.85,thunder:1.05,crack:.18,debris:.6,collapse:.5,ready:.42};
for(const [name,duration] of Object.entries(specs)){const n=Math.floor(rate*duration),samples=new Float32Array(n);let low=0,phase=0,peak=0;for(let i=0;i<n;i++){const t=i/rate,p=t/duration,r=noise();low=low*.92+r*.08;let v=0;const attack=Math.min(1,t/.006),decay=Math.exp(-t*(name==='heavy'?8:12));
 if(name==='punch'||name==='kick'){const f=name==='punch'?155:95;v=(Math.sin(2*Math.PI*(f*t-80*t*t))*.7+r*.22+low*.5)*attack*Math.exp(-t*17)}
 else if(name==='beam'){phase+=2*Math.PI*(190+Math.sin(t*30)*30)/rate;const env=Math.min(1,t/.06,(duration-t)/.22);v=(Math.sin(phase)*.5+Math.sin(phase*1.49)*.2+low*.5)*Math.max(0,env)}
 else if(name==='thunder'){v=(low*2+Math.sin(2*Math.PI*38*t)*.3)*Math.min(1,t/.02)*Math.exp(-t*2.8)*(1+.3*Math.sin(t*24))}
 else if(name==='crack'){v=(r*.7+Math.sin(2*Math.PI*220*t)*.25)*attack*Math.exp(-t*30)}
 else if(name==='debris'){const tap=Math.max(0,Math.sin(t*141))**14;v=(r*.6+low*.4)*tap*(1-p)}
 else if(name==='collapse'){v=(Math.sin(2*Math.PI*63*t)*.6+low*.9)*attack*Math.exp(-t*10)+r*.1*Math.exp(-t*19)}
 else if(name==='ready'){const note=t<.16?392:587;v=Math.sin(2*Math.PI*note*t)*.45*Math.exp(-5*(t%.16))*Math.min(1,(1-p)*5)}
 else if(name==='strike'||name==='heavy'){const deep=name==='heavy'?65:130;phase+=2*Math.PI*(deep*Math.exp(-t*7)+30)/rate;v=(Math.sin(phase)*.7+low*.9+r*.15)*attack*decay;if(name==='heavy')v+=low*.5*Math.exp(-t*3)}
 else if(name==='slash'){v=(r-low)*Math.sin(Math.PI*p)*Math.exp(-p*4)+.3*Math.sin(2*Math.PI*(2300*t-3400*t*t))*decay}
 else if(name==='bite'){v=(low+r*.2)*Math.exp(-18*t)*(1+2*Math.exp(-90*Math.abs(t-.09)))}
 else if(name==='victory'){const note=Math.min(3,Math.floor(t/.17));phase+=2*Math.PI*[392,494,587,784][note]/rate;v=Math.sin(phase)*Math.exp(-6*(t-note*.17))*Math.min(1,(1-p)*8)}
 else if(name==='whoosh'){v=(r-low)*.7*Math.sin(Math.PI*p)**2;v+=low*.5*Math.sin(Math.PI*p)}
 else if(name==='charge'){phase+=2*Math.PI*(140+p*p*540)/rate;v=(Math.sin(phase)*.5+Math.sin(phase*1.5)*.2+low*.3)*Math.sin(Math.PI*p)*.5}
 else if(name==='flame'){v=(low*2+r*.18+Math.sin(2*Math.PI*48*t)*.18)*(Math.min(1,t/.04)*(1-p)**.6)}
 else if(name==='water'){v=((r-low)*.35+low*1.1+Math.sin(2*Math.PI*(320*t+180*t*t))*.1)*Math.sin(Math.PI*p)**.6}
 else if(name==='electric'){const gate=Math.sin(t*145)>-.2?1:.2;v=(r*.38+Math.sign(Math.sin(2*Math.PI*(150*t+800*t*t)))*.3)*gate*attack*(1-p)}
 else if(name==='ice'){v=(Math.sin(2*Math.PI*1647*t)+Math.sin(2*Math.PI*2531*t)*.6+Math.sin(2*Math.PI*3479*t)*.4)*.35*decay+r*.12*attack*(1-p)}
 else if(name==='ground'){v=(low*2.4+Math.sin(2*Math.PI*42*t)*.45)*Math.min(1,t/.025)*Math.exp(-t*4)+r*.09*Math.exp(-t*15)}
 else if(name==='steel'){v=(Math.sin(2*Math.PI*420*t)+Math.sin(2*Math.PI*679*t)*.7+Math.sin(2*Math.PI*1241*t)*.4)*.4*decay+r*.1*attack*(1-p)}
 else{phase+=2*Math.PI*(650*(1-p)+90)/rate;v=(Math.sin(phase)*.6+Math.sin(phase*1.51)*.2+low*.25)*Math.min(1,t/.02)*(1-p)}samples[i]=v;peak=Math.max(peak,Math.abs(v))}
 const data=Buffer.alloc(44+n*2);data.write('RIFF');data.writeUInt32LE(data.length-8,4);data.write('WAVE',8);data.write('fmt ',12);data.writeUInt32LE(16,16);data.writeUInt16LE(1,20);data.writeUInt16LE(1,22);data.writeUInt32LE(rate,24);data.writeUInt32LE(rate*2,28);data.writeUInt16LE(2,32);data.writeUInt16LE(16,34);data.write('data',36);data.writeUInt32LE(n*2,40);for(let i=0;i<n;i++)data.writeInt16LE(Math.round(samples[i]/peak*.72*32767),44+i*2);fs.writeFileSync(`dist/assets/sfx/${name}.wav`,data)}
fs.writeFileSync('dist/assets/sfx/credits.txt','Original sound effects created for this project: charge, whoosh, strike, heavy impact, flame, water, electric, ice, energy, ground and steel. Synthesized offline into PCM WAV files.\n');console.log('Built',Object.keys(specs).length,'playable PCM attack sound files.');
