import fs from 'node:fs';
const p='dist/app.js';let s=fs.readFileSync(p,'utf8');s=s.replace("const labels=$('#intro-overlay [data-team]')","const labels=document.querySelectorAll('#intro-overlay [data-team]')");fs.writeFileSync(p,s);
