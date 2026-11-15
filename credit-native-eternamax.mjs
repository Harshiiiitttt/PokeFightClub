import fs from 'node:fs';
import {parseHTML} from 'linkedom';
const path='dist/index.html',{document}=parseHTML(fs.readFileSync(path,'utf8')),p=document.createElement('p');
p.innerHTML='Eternamax animation sheets: <a href="https://github.com/PMDCollab/SpriteCollab/tree/master/sprite/0890/0001" target="_blank" rel="noreferrer">SpriteCollab</a>. <a href="assets/pmd/eternamax-890-native/credits.txt" target="_blank" rel="noreferrer">Original artist credits</a>, licensed CC BY-NC 4.0. Floating idle frames are reused for travel and the boss uses a frontal presentation.';
document.querySelector('#credits-dialog').append(p);fs.writeFileSync(path,document.toString());
