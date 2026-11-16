import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {TRAINERS} from './dist/trainer-rosters.js';
import {spriteCandidates} from './dist/classic-sprites.js';
const data=JSON.parse(fs.readFileSync('dist/pokemon.json')),manifest=JSON.parse(fs.readFileSync('dist/assets/pmd/manifest.json')),sources=JSON.parse(fs.readFileSync('dist/assets/sources.json'));
async function get(url){for(const u of [...new Set([url,url.replace('https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/','https://cdn.jsdelivr.net/gh/PMDCollab/SpriteCollab@master/')])])try{const r=await fetch(u,{signal:AbortSignal.timeout(14000)});if(r.ok)return Buffer.from(await r.arrayBuffer());}catch{}throw Error('Download failed: '+url);}
async function save(url,file){const p='dist/assets/'+file;if(fs.existsSync(p))return fs.readFileSync(p);const b=await get(url);fs.mkdirSync(p.slice(0,p.lastIndexOf('/')),{recursive:true});fs.writeFileSync(p,b);sources.push({file,source:url});return b;}
function persist(){fs.writeFileSync('dist/pokemon.json',JSON.stringify(data));fs.writeFileSync('dist/assets/pmd/manifest.json',JSON.stringify(manifest));fs.writeFileSync('dist/assets/sources.json',JSON.stringify(sources,null,2));}
const jobs=[...new Set(TRAINERS.flatMap(t=>t.team))],errors=[];let cursor=0,done=0;
async function pokemon(id){
 if(!data[id]){const p=JSON.parse(await get('https://pokeapi.co/api/v2/pokemon/'+id));data[id]={id,name:p.name,height:p.height,types:p.types.map(t=>t.type.name),stats:p.stats.map(s=>s.base_stat),moves:p.moves.map(m=>m.move.name)};}
 for(const face of ['front','back']){if(fs.existsSync(`dist/assets/classic/${face}/${id}.png`))continue;let found=false;for(const url of spriteCandidates(id,face==='back',data[id].name,false)){try{await save(url,`classic/${face}/${id}.png`);found=true;break;}catch{}}if(!found)throw Error('Missing fallback '+id);}
 await save(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`,`audio/${id}.ogg`);
 if(!fs.existsSync(`dist/assets/audio/${id}.mp3`))execFileSync('ffmpeg',['-y','-loglevel','error','-i',`dist/assets/audio/${id}.ogg`,`dist/assets/audio/${id}.mp3`],{windowsHide:true});
 if(!manifest[id]){
  const dir=String(id).padStart(4,'0'),base=`https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/sprite/${dir}/`,xml=(await save(base+'AnimData.xml',`pmd/${id}/AnimData.xml`)).toString(),all={};
  for(const match of xml.matchAll(/<Anim>([\s\S]*?)<\/Anim>/g)){const t=match[1],tag=n=>t.match(new RegExp(`<${n}>([^<]+)</${n}>`))?.[1],name=tag('Name');all[name]={name,copy:tag('CopyOf'),width:+tag('FrameWidth'),height:+tag('FrameHeight'),hit:+tag('HitFrame'),durations:[...t.matchAll(/<Duration>(\d+)<\/Duration>/g)].map(m=>+m[1])};}
  const anims={};for(const state of ['Idle','Walk','Attack','Shoot','Hurt','Sleep','Charge','SpAttack']){let a=all[state]||all[state==='Shoot'?'SpAttack':state==='Charge'?'SpAttack':state==='SpAttack'?'Shoot':state];const seen=new Set();while(a?.copy&&!seen.has(a.name)){seen.add(a.name);a=all[a.copy];}if(!a?.width||!a?.durations.length)continue;const path=`pmd/${id}/${a.name}-Anim.png`;await save(base+a.name+'-Anim.png',path);anims[state]={...a,path};}
  if(!anims.Idle||!anims.Walk)throw Error('Missing directional poses '+id);const portrait=`pmd/${id}/portrait.png`;await save(`https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait/${dir}/Normal.png`,portrait);await save(base+'credits.txt',`pmd/${id}/credits.txt`);manifest[id]={anims,portrait};
 }
 done++;persist();console.log(done+'/'+jobs.length,id,data[id].name);
}
const portraitJob=(async()=>{for(const art of new Set(TRAINERS.map(t=>t.art)))await save(`https://play.pokemonshowdown.com/sprites/trainers/${art}.png`,`trainers/${art}.png`);fs.appendFileSync('dist/assets/trainers/CREDITS.txt','\nRegional trainer portraits: Pokémon Showdown trainer sprite collection. Official game art and credited community anime sprites; not all artwork is open-source. See individual source URLs in assets/sources.json and https://play.pokemonshowdown.com/sprites/trainers/ for sprite artist credits.\n');persist();console.log('All regional trainer portraits bundled');})();
await Promise.all([...Array.from({length:6},async()=>{while(cursor<jobs.length){const id=jobs[cursor++];try{await pokemon(id)}catch(e){errors.push(id);console.log('FAILED',id,e.message);persist();}}}),portraitJob]);persist();if(errors.length){console.log('RETRY IDS',errors.join(' '));process.exitCode=1;}
