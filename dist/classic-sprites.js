const base='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/';
export function spriteCandidates(id,back,name,bundled=false){
 const face=back?'back':'front',folder=back?'back/':'',list=[];
 if(bundled)list.push(`assets/classic/${face}/${id}.png`);
 if(id<=386){
  list.push(`${base}generation-iii/firered-leafgreen/${folder}${id}.png`);
  if(!back)list.push(`${base}generation-iii/emerald/${id}.png`);
  list.push(`${base}generation-iii/ruby-sapphire/${folder}${id}.png`);
 }
 else if(id<=493)list.push(`${base}${back?'generation-v/black-white':'generation-iv/platinum'}/${folder}${id}.png`);
 else if(id<=649)list.push(`${base}generation-v/black-white/${folder}${id}.png`);
 if(name)list.push(`https://play.pokemonshowdown.com/sprites/gen5${back?'-back':''}/${name.replaceAll('-','')}.png`);
 list.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${back?'back/':''}${id}.png`);
 return list;
}
