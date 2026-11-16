import fs from 'node:fs/promises';
import {TRAINER_BUNDLED_IDS} from './dist/trainer-duel.js';
import {spriteCandidates} from './dist/classic-sprites.js';
const cache=JSON.parse(await fs.readFile('dist/pokemon.json')),manifest=JSON.parse(await fs.readFile('dist/assets/pmd/manifest.json')),sources=JSON.parse(await fs.readFile('dist/assets/sources.json'));
async function get(url){for(const u of [url,url.replace('https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/','https://cdn.jsdelivr.net/gh/PMDCollab/SpriteCollab@master/')])try{const r=await fetch(u,{signal:AbortSignal.timeout(12000)});if(r.ok)return Buffer.from(await r.arrayBuffer());}catch{}throw Error('Download failed: '+url);}
async function save(url,file){const path='dist/assets/'+file;try{return await fs.readFile(path);}catch{}const bytes=await get(url);await fs.mkdir(path.slice(0,path.lastIndexOf('/')),{recursive:true});await fs.writeFile(path,bytes);sources.push({file,source:url});return bytes;}
for(const id of (process.argv.length>2?process.argv.slice(2).map(Number):TRAINER_BUNDLED_IDS)){
 if(!cache[id]){const p=JSON.parse(await get('https://pokeapi.co/api/v2/pokemon/'+id));cache[id]={id,name:p.name,types:p.types.map(t=>t.type.name),stats:p.stats.map(s=>s.base_stat),moves:p.moves.map(m=>m.move.name)};}
 for(const face of ['front','back']){let found=false;for(const url of spriteCandidates(id,face==='back',cache[id].name,false)){try{await save(url,`classic/${face}/${id}.png`);found=true;break;}catch{}}if(!found)throw Error('Missing '+face+' sprite '+id);}
 await save(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`,`audio/${id}.ogg`);
 if(!manifest[id]){
  const dir=String(id).padStart(4,'0'),base=`https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/sprite/${dir}/`,xml=(await save(base+'AnimData.xml',`pmd/${id}/AnimData.xml`)).toString(),all={};
  for(const match of xml.matchAll(/<Anim>([\s\S]*?)<\/Anim>/g)){const text=match[1],tag=n=>text.match(new RegExp(`<${n}>([^<]+)</${n}>`))?.[1],name=tag('Name');all[name]={name,copy:tag('CopyOf'),width:+tag('FrameWidth'),height:+tag('FrameHeight'),hit:+tag('HitFrame'),durations:[...text.matchAll(/<Duration>(\d+)<\/Duration>/g)].map(m=>+m[1])};}
  const anims={};for(const state of ['Idle','Walk','Attack','Shoot','Hurt','Sleep','Charge','SpAttack']){let a=all[state]||all[state==='Shoot'?'SpAttack':state==='Charge'?'SpAttack':state];const seen=new Set();while(a?.copy&&!seen.has(a.name)){seen.add(a.name);a=all[a.copy];}if(!a?.width||!a?.durations.length)continue;const path=`pmd/${id}/${a.name}-Anim.png`;await save(base+a.name+'-Anim.png',path);anims[state]={...a,path};}
  if(!anims.Idle||!anims.Walk)throw Error('Missing native animations '+id);const portrait=`pmd/${id}/portrait.png`;await save(`https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait/${dir}/Normal.png`,portrait);await save(base+'credits.txt',`pmd/${id}/credits.txt`);manifest[id]={anims,portrait};
 }
 console.log('Bundled trainer fighter',id,cache[id].name);
}
await fs.writeFile('dist/pokemon.json',JSON.stringify(cache));await fs.writeFile('dist/assets/pmd/manifest.json',JSON.stringify(manifest));await fs.writeFile('dist/assets/sources.json',JSON.stringify(sources,null,2));
