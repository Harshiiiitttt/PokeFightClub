export const arenaCatalog={
 spear:{name:'SPEAR PILLAR',label:'Spear Pillar',image:'spear',mood:'aether',weather:'✦ ANCIENT DRAGON SANCTUARY',weatherEffect:'distortion',terrain:'psychic',boostTypes:['dragon','steel'],weakenTypes:[]},
 coast:{name:'PRIMAL COAST',label:'Primal Coast',image:'coast',mood:'tide',weather:'✦ OCEAN SPRAY · WATER +30%',weatherEffect:'rain',terrain:null,boostTypes:['water'],weakenTypes:['fire']},
 eclipse:{name:'ECLIPSE ALTAR',label:'Eclipse Altar',image:'eclipse',mood:'eclipse',weather:'✦ ECLIPSE · GHOST/PSYCHIC +25%',weatherEffect:'aurora',terrain:'psychic',boostTypes:['ghost','psychic'],weakenTypes:[]},
 champion:{name:'CHAMPION STADIUM',label:'Champion Stadium',image:'champion',mood:'crowd',weather:'✦ CHAMPIONSHIP · NEUTRAL FIELD',weatherEffect:'stadium',terrain:null,boostTypes:[],weakenTypes:[]},
 stadium:{name:'BARREN VALLEY',label:'Barren Valley',image:'rocky',mood:'dust',weather:'✦ SANDSTORM · ROCK/GROUND +20%',weatherEffect:'sandstorm',terrain:null,boostTypes:['rock','ground'],weakenTypes:[],chipImmune:['rock','ground','steel'],chipLabel:'Sandstorm'},
 forest:{name:'DUSK FOREST',label:'Dusk Forest',image:'forest',mood:'fireflies',weather:'✦ GRASSY TERRAIN · GRASS +25%',weatherEffect:'mist',terrain:'grassy',boostTypes:['grass','bug'],weakenTypes:[],healTypes:['grass']},
 volcano:{name:'DARK CRATER',label:'Dark Crater',image:'volcano',mood:'embers',weather:'✦ HARSH SUNLIGHT · FIRE +35%',weatherEffect:'sun',terrain:null,boostTypes:['fire'],weakenTypes:['water']},
 frost:{name:'FROZEN SUMMIT',label:'Frozen Summit',image:'frost',mood:'snow',weather:'✦ HAILSTORM · ICE +25%',weatherEffect:'hail',terrain:null,boostTypes:['ice'],weakenTypes:[],chipImmune:['ice'],chipLabel:'Hail'},
 storm:{name:'STORM PLAINS',label:'Storm Plains',image:'storm',mood:'storm',weather:'✦ HEAVY RAIN & ELECTRIC TERRAIN',weatherEffect:'rain',terrain:'electric',boostTypes:['water','electric'],weakenTypes:['fire']},
 temporal:{name:'TEMPORAL RUINS',label:'Temporal Ruins',image:'temporal',mood:'aether',weather:'✦ PSYCHIC TERRAIN · PSYCHIC/DRAGON +25%',weatherEffect:'distortion',terrain:'psychic',boostTypes:['psychic','dragon'],weakenTypes:[]},
 crystal:{name:'CRYSTAL CAVERN',label:'Crystal Cavern',image:'crystal',mood:'crystal',weather:'✦ MISTY TERRAIN · FAIRY/STEEL +25%',weatherEffect:'aurora',terrain:'misty',boostTypes:['fairy','steel'],weakenTypes:[]}
};

export function arenaMoveMultiplier(arenaKey,moveType){
 const info=arenaCatalog[arenaKey];
 if(!info)return 1;
 if(info.boostTypes?.includes(moveType))return info.weatherEffect==='sun'&&moveType==='fire'?1.35:info.weatherEffect==='rain'&&(moveType==='water'||moveType==='electric')?1.3:1.25;
 if(info.weakenTypes?.includes(moveType))return .75;
 return 1;
}
