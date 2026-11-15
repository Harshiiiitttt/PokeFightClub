import fs from 'node:fs/promises';
await fs.mkdir('dist/assets/fx',{recursive:true});await fs.mkdir('dist/assets/audio',{recursive:true});
const manifest=[];
async function get(url,file){const r=await fetch(url);if(!r.ok){console.log('Unavailable',file,r.status);return}await fs.writeFile('dist/assets/'+file,Buffer.from(await r.arrayBuffer()));manifest.push({file,source:url});}
const fx=['fireball','waterwisp','electroball','energyball','shadowball','iceball','rock1','rock2','fist','foot','claw','slash','hit','explosion','poisonwisp','psychic','topbite','bottombite'];
await Promise.all(fx.map(n=>get(`https://play.pokemonshowdown.com/fx/${n}.png`,`fx/${n}.png`)));
await get('https://play.pokemonshowdown.com/audio/oras-trainer.mp3','audio/battle.mp3');
const ids=Object.keys(JSON.parse(await fs.readFile('dist/pokemon.json')));let cursor=0;await Promise.all(Array.from({length:6},async()=>{while(cursor<ids.length){const id=ids[cursor++];await get(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`,`audio/${id}.ogg`)}}));
for(const name of ['building','general'])await get(`https://raw.githubusercontent.com/pret/pokeemerald/master/data/tilesets/primary/${name}/tiles.png`,`${name}-tiles.png`);
await get('https://play.pokemonshowdown.com/fx/bg-gen3-forest.png','forest-bg.png');await get('https://play.pokemonshowdown.com/fx/bg-volcanocave.png','volcano-bg.png');
await fs.writeFile('dist/assets/sources.json',JSON.stringify(manifest,null,2));console.log('Downloaded',manifest.length,'assets');
