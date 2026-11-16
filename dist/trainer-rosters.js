// Editable regional/anime-inspired six-Pokémon rosters; they are not a claim of one canonical episode lineup.
export const TRAINERS=[
 {id:'red',name:'RED',region:'Kanto',art:'red',npc:'red_normal',team:[25,6,3,9,131,143]},
 {id:'blue',name:'BLUE',region:'Kanto',art:'blue',npc:'blue',team:[18,65,112,103,130,59]},
 {id:'ash-kanto',name:'ASH',region:'Kanto',art:'ash',npc:'ash',team:[25,6,7,1,143,128]},
 {id:'ash-johto',name:'ASH',region:'Johto',art:'ash-johto',npc:'ash-johto',team:[25,153,156,158,164,214]},
 {id:'ash-hoenn',name:'ASH',region:'Hoenn',art:'ash-hoenn',npc:'ash-hoenn',team:[25,277,254,341,324,362]},
 {id:'ash-sinnoh',name:'ASH',region:'Sinnoh',art:'ash-sinnoh',npc:'ash-sinnoh',team:[25,398,389,392,418,472]},
 {id:'ash-unova',name:'ASH',region:'Unova',art:'ash-unova',npc:'ash-unova',team:[25,521,501,499,542,553]},
 {id:'ash-kalos',name:'ASH',region:'Kalos',art:'ash-kalos',npc:'ash-kalos',team:[25,658,663,701,715,706]},
 {id:'ash-alola',name:'ASH',region:'Alola',art:'ash-alola',npc:'ash-alola',team:[25,722,727,745,809,804]},
 {id:'ash-journeys',name:'ASH',region:'Journeys',art:'ash-capbackward',npc:'ash-capbackward',team:[25,149,94,448,865,882]},
 {id:'misty',name:'MISTY',region:'Kanto',art:'misty-gen3',npc:'misty-gen3',team:[121,120,130,186,222,54]},
 {id:'brock',name:'BROCK',region:'Kanto',art:'brock-gen3',npc:'brock-gen3',team:[208,74,169,259,453,438]},
 {id:'lance',name:'LANCE',region:'Johto',art:'lance',npc:'lance',team:[149,130,6,142,148,230]},
 {id:'steven',name:'STEVEN',region:'Hoenn',art:'steven-gen6',npc:'steven-gen6',team:[376,306,227,344,346,348]},
 {id:'cynthia',name:'CYNTHIA',region:'Sinnoh',art:'cynthia',npc:'cynthia',team:[445,442,350,407,448,468]},
 {id:'iris',name:'IRIS',region:'Unova',art:'iris-gen5bw2',npc:'iris-gen5bw2',team:[612,149,530,131,567,621]},
 {id:'diantha',name:'DIANTHA',region:'Kalos',art:'diantha',npc:'diantha',team:[282,701,697,699,711,706]},
 {id:'alain',name:'ALAIN',region:'Kalos',art:'alain',npc:'alain',team:[6,376,625,461,248,521]},
 {id:'kukui',name:'KUKUI',region:'Alola',art:'kukui',npc:'kukui',team:[727,628,462,395,3,448]},
 {id:'leon',name:'LEON',region:'Galar',art:'leon',npc:'leon',team:[6,887,812,815,537,866]}
];
export const trainerById=id=>TRAINERS.find(t=>t.id===id)||TRAINERS[0];
export const trainerFor=(view,team)=>trainerById(view.trainerIds?.[team]||['red','blue'][team]);
export const trainerPortrait=(view,team)=>view.images['trainer-art-'+trainerFor(view,team).art]||view.images['trainer-'+team];
export function setTrainerIdentity(view,ids){
 view.trainerIds=ids.map(id=>trainerById(id).id);
 for(const id of view.trainerIds){const t=trainerById(id),key='trainer-art-'+t.art;if(!view.images[key])view.load?.(key,'assets/trainers/'+t.art+'.png');}
}
export function trainerTeams(ids){const entries=ids.map(trainerById);return{teams:entries.map(t=>[...t.team]),titles:entries.map(t=>t.name),trainers:entries.map(t=>t.id)};}
const preset=(id,label,a,b)=>({id,label,names:[trainerById(a).name,trainerById(b).name],teams:[trainerById(a).team,trainerById(b).team],trainers:[a,b]});
export const REGIONAL_TRAINER_PRESETS=[
 preset('red-blue','Red vs Blue · Kanto','red','blue'),
 preset('ash-leon','Ash vs Leon · World Final','ash-journeys','leon'),
 preset('ash-alain','Ash vs Alain · Kalos','ash-kalos','alain'),
 preset('ash-kukui','Ash vs Kukui · Alola','ash-alola','kukui'),
 preset('ash-misty','Ash vs Misty · Kanto','ash-kanto','misty'),
 preset('steven-cynthia','Steven vs Cynthia · Champions','steven','cynthia'),
 preset('lance-iris','Lance vs Iris · Dragon Masters','lance','iris'),
 preset('ash-regions','Ash Hoenn vs Ash Sinnoh','ash-hoenn','ash-sinnoh'),
 preset('ash-early','Ash Johto vs Ash Unova','ash-johto','ash-unova'),
 preset('diantha-cynthia','Diantha vs Cynthia','diantha','cynthia')
];
