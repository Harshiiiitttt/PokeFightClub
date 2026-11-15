import fs from 'node:fs';
const path='dist/app.js';let s=fs.readFileSync(path,'utf8');s=s.replace("$('#arena-name').textContent=names[arena];", "$('#arena-name').textContent=names[arena];$('#ready-arena').textContent=names[arena];");fs.writeFileSync(path,s);
const html='dist/index.html';fs.writeFileSync(html,fs.readFileSync(html,'utf8').replace('3 ON 3 · AUTOMATIC · SOUND ON','3 ON 3 · AUTOMATIC BATTLE'));
