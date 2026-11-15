import fs from 'node:fs';
const forms={
 'mega-150':'mewtwo/mega_y','mega-254':'sceptile/mega','mega-257':'blaziken/mega','mega-260':'swampert/mega','mega-282':'gardevoir/mega','mega-373':'salamence/mega','mega-376':'metagross/mega','mega-382':'kyogre/primal','mega-383':'groudon/primal','mega-445':'garchomp/mega','mega-800':'necrozma/ultra',
 'origin-483':'dialga/origin','origin-484':'palkia/origin','origin-487':'giratina/origin','complete-718':'zygarde/complete','crowned-888':'zacian/crowned_sword','crowned-889':'zamazenta/crowned_shield','eternamax-890':'eternatus/eternamax'
};
let cursor=0;const entries=Object.entries(forms),sources=JSON.parse(fs.readFileSync('dist/assets/sources.json'));
await Promise.all(Array.from({length:4},async()=>{while(cursor<entries.length){const [key,path]=entries[cursor++],dir='dist/assets/form-source/'+key;fs.mkdirSync(dir,{recursive:true});
 const response=await fetch('https://api.github.com/repos/rh-hideout/pokeemerald-expansion/contents/graphics/pokemon/'+path);if(!response.ok)throw Error(key+': '+response.status);const files=await response.json();
 const wanted=files.filter(f=>['overworld.png','anim_front.png','front.png','back.png'].includes(f.name));
 for(const f of wanted){const r=await fetch(f.download_url,{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error(f.download_url);fs.writeFileSync(dir+'/'+f.name,Buffer.from(await r.arrayBuffer()));const file='form-source/'+key+'/'+f.name;if(!sources.some(s=>s.file===file))sources.push({file,source:f.download_url})}
 console.log(key,wanted.map(f=>f.name).join(', '));
}}));
fs.writeFileSync('dist/assets/sources.json',JSON.stringify(sources,null,2));fs.writeFileSync('D:/pokemon-reference/form-source-catalog.json',JSON.stringify(forms,null,2));
