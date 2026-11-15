import fs from 'node:fs';
import {createCanvas,Image} from '@napi-rs/canvas';
const dir='dist/assets/pmd/eternamax-890-native',root='https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/sprite/0890/0001/';fs.mkdirSync(dir,{recursive:true});
async function get(file,url=root+file){const path=dir+'/'+file;if(!fs.existsSync(path)){const mirror=url.replace('https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/','https://cdn.jsdelivr.net/gh/PMDCollab/SpriteCollab@master/');let error;for(const endpoint of [mirror,url]){try{console.log('Fetching',file);const r=await fetch(endpoint,{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error(endpoint+': '+r.status);const data=Buffer.from(await r.arrayBuffer());fs.writeFileSync(path,data);error=null;break}catch(e){error=e}}if(error)throw error}return fs.readFileSync(path)}
const xml=(await get('AnimData.xml')).toString(),all={};
for(const match of xml.matchAll(/<Anim>([\s\S]*?)<\/Anim>/g)){const text=match[1],tag=n=>text.match(new RegExp(`<${n}>([^<]+)</${n}>`))?.[1],name=tag('Name');all[name]={name,copy:tag('CopyOf'),width:+tag('FrameWidth'),height:+tag('FrameHeight'),hit:+tag('HitFrame'),durations:[...text.matchAll(/<Duration>(\d+)<\/Duration>/g)].map(x=>+x[1])}}
const anims={};for(const state of ['Idle','Walk','Attack','Shoot','Hurt','Sleep','Charge','SpAttack']){
 let a=all[state==='Walk'?'Idle':state]||all[state==='SpAttack'?'Shoot':'Idle'];while(a.copy)a=all[a.copy];if(!a.width||!a.durations.length)throw Error('Invalid native animation '+state);
 await get(a.name+'-Anim.png');anims[state]={...a,path:'pmd/eternamax-890-native/'+a.name+'-Anim.png'};
}
await get('credits.txt');await get('portrait.png','https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait/0890/0001/Normal.png');
const idle=anims.Idle,image=new Image();image.src=fs.readFileSync('dist/assets/'+idle.path);
for(const [face,row] of [['front',0],['back',4]]){const canvas=createCanvas(idle.width,idle.height),c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(image,0,row*idle.height,idle.width,idle.height,0,0,idle.width,idle.height);fs.writeFileSync(dir+'/'+face+'.png',canvas.toBuffer('image/png'))}
const manifestPath='dist/assets/pmd/mega-manifest.json',manifest=JSON.parse(fs.readFileSync(manifestPath));
manifest['eternamax-890']={baseId:890,form:'eternatus-eternamax',anims,front:'pmd/eternamax-890-native/front.png',back:'pmd/eternamax-890-native/back.png',portrait:'pmd/eternamax-890-native/portrait.png',frontOnly:true,limitedDirections:false,directions:8,source:'SpriteCollab native Eternamax animation sheets; original Idle/Attack/Shoot/Charge frames; floating Idle used for travel',credits:'pmd/eternamax-890-native/credits.txt'};
fs.writeFileSync(manifestPath,JSON.stringify(manifest));
const sourcePath='dist/assets/sources.json',sources=JSON.parse(fs.readFileSync(sourcePath));for(const file of ['AnimData.xml','credits.txt','Idle-Anim.png','Attack-Anim.png','Shoot-Anim.png','Charge-Anim.png','portrait.png']){const path='pmd/eternamax-890-native/'+file;if(fs.existsSync('dist/assets/'+path)&&!sources.some(s=>s.file===path))sources.push({file:path,source:file==='portrait.png'?'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait/0890/0001/Normal.png':root+file})}fs.writeFileSync(sourcePath,JSON.stringify(sources,null,2));
console.log('Installed native Eternamax art:',Object.entries(anims).map(([k,a])=>k+': '+a.durations.length+' frames').join(', '));
