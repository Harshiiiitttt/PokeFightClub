import fs from 'node:fs';
let p='test-trainer-duel.mjs',s=fs.readFileSync(p,'utf8').replace('export {configureModeUI,view};','export {configureModeUI,view,teams};');if(!s.includes('export {app,document,frames}'))s+='\nexport {app,document,frames};\n';fs.writeFileSync(p,s);
