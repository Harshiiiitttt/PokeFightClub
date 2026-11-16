import fs from 'node:fs/promises';
const file='dist/assets/sources.json',sources=JSON.parse(await fs.readFile(file));
for(const name of ['leftslash','rightslash','impact','lightning','sword']){const url=`https://play.pokemonshowdown.com/fx/${name}.png`,r=await fetch(url);if(!r.ok)throw Error('Missing '+name);await fs.writeFile(`dist/assets/fx/${name}.png`,Buffer.from(await r.arrayBuffer()));sources.push({file:`fx/${name}.png`,source:url})}
await fs.writeFile(file,JSON.stringify(sources,null,2));
