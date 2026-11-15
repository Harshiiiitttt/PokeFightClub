import fs from 'node:fs/promises';
const roster=JSON.parse(await fs.readFile('roster-response.json','utf8')).results.map((p,i)=>({id:i+1,name:p.name}));
await fs.writeFile('dist/roster.json',JSON.stringify(roster));
const ids=[6,9,3,25,94,149,150,151,249,250,254,257,260,282,373,376,382,383,384,445,448,483,484,487,643,644,646,658,716,717,791,792,800,888,889,890];
const cache={};let cursor=0;
await Promise.all(Array.from({length:6},async()=>{while(cursor<ids.length){const id=ids[cursor++];const r=await fetch('https://pokeapi.co/api/v2/pokemon/'+id);if(!r.ok)throw Error('Data '+id);const p=await r.json();cache[id]={id,name:p.name,types:p.types.map(x=>x.type.name),stats:p.stats.map(x=>x.base_stat),moves:p.moves.map(x=>x.move.name)};for(const [ext,url] of [['gif',`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`],['png',`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`]]){const a=await fetch(url);if(a.ok)await fs.writeFile(`dist/assets/${id}.${ext}`,Buffer.from(await a.arrayBuffer()));}console.log('Downloaded',id)}}));
await fs.writeFile('dist/pokemon.json',JSON.stringify(cache));
