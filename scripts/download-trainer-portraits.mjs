import fs from 'node:fs/promises';
await fs.mkdir('dist/assets/trainers',{recursive:true});
const sources=JSON.parse(await fs.readFile('dist/assets/sources.json'));
for(const name of ['red','blue']){const url=`https://play.pokemonshowdown.com/sprites/trainers/${name}.png`,r=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error(name+' trainer unavailable');const data=Buffer.from(await r.arrayBuffer());if(data.readUInt32BE(0)!==0x89504e47)throw Error('Expected PNG');const file=`trainers/${name}.png`;await fs.writeFile('dist/assets/'+file,data);if(!sources.some(s=>s.file===file))sources.push({file,source:url});console.log(name,'trainer bundled');}
await fs.writeFile('dist/assets/sources.json',JSON.stringify(sources,null,2));
await fs.writeFile('dist/assets/trainers/CREDITS.txt','Red and Blue trainer sprite artwork: Pokémon / Game Freak / Nintendo, as distributed by Pokémon Showdown.\nSources:\nhttps://play.pokemonshowdown.com/sprites/trainers/red.png\nhttps://play.pokemonshowdown.com/sprites/trainers/blue.png\nTrainer sprites are game artwork, not original open-source artwork.\n');
