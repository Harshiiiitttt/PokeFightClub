import fs from 'node:fs';
const spec=fs.readFileSync('upgrade-v2.py','utf8'),cut=spec.indexOf("s+=r'''"),end=spec.indexOf("'''",cut+7),header=spec.slice(0,cut);
let source=fs.readFileSync('dist/app.js','utf8');source=source.slice(0,source.indexOf('function position(p)'));
for(const line of header.split('\n').filter(l=>l.startsWith('s=s.replace(')))source=new Function('s',line+';return s;')(source);
source+=spec.slice(cut+7,end);fs.writeFileSync('dist/app.js',source);
let html=fs.readFileSync('dist/index.html','utf8');for(const line of spec.slice(spec.indexOf("p=Path('dist/index.html')")).split('\n').filter(l=>l.startsWith('s=s.replace(')))html=new Function('s',line.replace('s=s.replace(', 's=s.replaceAll(')+';return s;')(html);fs.writeFileSync('dist/index.html',html);
