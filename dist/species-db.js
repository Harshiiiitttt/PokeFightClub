export const REGIONS = [
  {id:'kanto', name:'Kanto', gen:1, min:1, max:151},
  {id:'johto', name:'Johto', gen:2, min:152, max:251},
  {id:'hoenn', name:'Hoenn', gen:3, min:252, max:386},
  {id:'sinnoh', name:'Sinnoh', gen:4, min:387, max:493},
  {id:'unova', name:'Unova', gen:5, min:494, max:649},
  {id:'kalos', name:'Kalos', gen:6, min:650, max:721},
  {id:'alola', name:'Alola', gen:7, min:722, max:809},
  {id:'galar', name:'Galar', gen:8, min:810, max:905},
  {id:'paldea', name:'Paldea', gen:9, min:906, max:1025}
];

export const STARTER_LINES = {
  kanto: {grass:[1,2,3], fire:[4,5,6], water:[7,8,9]},
  johto: {grass:[152,153,154], fire:[155,156,157], water:[158,159,160]},
  hoenn: {grass:[252,253,254], fire:[255,256,257], water:[258,259,260]},
  sinnoh: {grass:[387,388,389], fire:[390,391,392], water:[393,394,395]},
  unova: {grass:[495,496,497], fire:[498,499,500], water:[501,502,503]},
  kalos: {grass:[650,651,652], fire:[653,654,655], water:[656,657,658]},
  alola: {grass:[722,723,724], fire:[725,726,727], water:[728,729,730]},
  galar: {grass:[810,811,812], fire:[813,814,815], water:[816,817,818]},
  paldea: {grass:[906,907,908], fire:[909,910,911], water:[912,913,914]}
};

export const LEGENDARY_IDS = new Set([
  144,145,146,150,151,
  243,244,245,249,250,251,
  377,378,379,380,381,382,383,384,385,386,
  480,481,482,483,484,485,486,487,488,489,490,491,492,493,
  494,638,639,640,641,642,643,644,645,646,647,648,649,
  716,717,718,719,720,721,
  785,786,787,788,789,790,791,792,800,801,802,807,808,809,
  888,889,890,891,892,893,894,895,896,897,898,905,
  1001,1002,1003,1004,1007,1008,1014,1015,1016,1017,1024,1025
]);

export const FIRST_STAGE_IDS = new Set([
  1,4,7,10,13,16,19,21,23,27,29,32,37,41,43,46,48,50,52,54,56,58,60,63,66,69,72,74,77,79,81,84,86,88,90,92,96,98,100,102,104,109,111,116,118,120,129,133,138,140,147,
  152,155,158,161,163,165,167,170,172,173,174,175,177,179,183,187,191,194,204,209,216,218,220,223,228,231,236,238,239,240,246,
  252,255,258,261,263,265,270,273,276,278,280,283,285,287,290,293,296,298,299,300,304,307,309,316,318,320,322,325,328,331,333,339,341,343,345,347,349,353,355,360,361,363,366,371,374,
  387,390,393,396,399,401,403,406,408,410,412,415,418,420,422,425,427,431,433,434,436,438,439,440,443,446,447,449,451,453,456,458,459,
  495,498,501,504,506,509,511,513,515,517,519,522,524,527,529,532,535,540,543,546,548,551,554,557,559,562,564,566,568,570,572,574,577,580,582,585,588,590,592,595,597,599,602,605,607,610,613,616,619,622,624,627,629,633,636,
  650,653,656,659,661,664,667,669,672,674,677,679,682,684,686,688,690,692,694,696,698,704,708,710,712,714,
  722,725,728,731,734,736,739,742,744,747,749,751,753,755,757,759,761,767,769,772,782,
  810,813,816,819,821,824,827,829,831,833,835,837,840,843,846,848,850,852,854,856,859,868,872,878,885,
  906,909,912,915,917,919,921,924,926,928,932,935,938,940,942,944,946,948,951,953,955,957,960,963,965,967,969,971,974,996
]);

export const MIDDLE_STAGE_IDS = new Set([
  2,5,8,11,14,17,25,30,33,35,39,44,61,64,67,70,75,93,112,113,117,125,126,137,148,
  153,156,159,176,178,180,188,221,233,247,
  253,256,259,266,268,271,274,281,288,294,305,315,329,356,364,372,375,
  388,391,394,397,404,507,520,525,533,536,541,544,552,575,578,583,600,603,608,611,634,
  651,654,657,662,665,670,680,705,
  723,726,729,732,737,762,783,790,
  811,814,817,822,825,838,857,860,886,
  907,910,913,922,929,933,958,997
]);

const TYPE_DEFAULT_MOVES = {
  grass: ['solar-beam','energy-ball','leaf-blade','body-slam'],
  fire: ['flamethrower','fire-blast','flare-blitz','fire-punch'],
  water: ['hydro-pump','surf','aqua-tail','waterfall'],
  electric: ['thunderbolt','thunder','volt-tackle','thunder-punch'],
  ice: ['ice-beam','blizzard','ice-punch','body-slam'],
  fighting: ['close-combat','aura-sphere','drain-punch','mach-punch'],
  poison: ['sludge-bomb','dark-pulse','crunch','body-slam'],
  ground: ['earthquake','earth-power','stone-edge','body-slam'],
  flying: ['air-slash','brave-bird','aerial-ace','quick-attack'],
  psychic: ['psychic','zen-headbutt','shadow-ball','dazzling-gleam'],
  bug: ['x-scissor','bug-buzz','aerial-ace','slash'],
  rock: ['stone-edge','rock-slide','earthquake','iron-head'],
  ghost: ['shadow-ball','dark-pulse','psychic','crunch'],
  dragon: ['dragon-pulse','draco-meteor','dragon-claw','dragon-rush'],
  dark: ['dark-pulse','crunch','bite','quick-attack'],
  steel: ['flash-cannon','meteor-mash','iron-head','iron-tail'],
  fairy: ['moonblast','dazzling-gleam','psychic','body-slam'],
  normal: ['hyper-beam','body-slam','extreme-speed','tackle']
};

export const CURATED_SPECIES = {
  // Gen 1 starters & icons
  1:{name:'bulbasaur',types:['grass','poison'],stats:[45,49,49,65,65,45]},
  2:{name:'ivysaur',types:['grass','poison'],stats:[60,62,63,80,80,60]},
  4:{name:'charmander',types:['fire'],stats:[39,52,43,60,50,65]},
  5:{name:'charmeleon',types:['fire'],stats:[58,64,58,80,65,80]},
  7:{name:'squirtle',types:['water'],stats:[44,48,65,50,64,43]},
  8:{name:'wartortle',types:['water'],stats:[59,63,80,65,80,58]},
  18:{name:'pidgeot',types:['normal','flying'],stats:[83,80,75,70,70,101]},
  34:{name:'nidoking',types:['poison','ground'],stats:[81,102,77,85,75,85]},
  38:{name:'ninetales',types:['fire'],stats:[73,76,75,81,100,100]},
  59:{name:'arcanine',types:['fire'],stats:[90,110,80,100,80,95]},
  65:{name:'alakazam',types:['psychic'],stats:[55,50,45,135,95,120]},
  68:{name:'machamp',types:['fighting'],stats:[90,130,80,65,85,55]},
  103:{name:'exeggutor',types:['grass','psychic'],stats:[95,95,85,125,75,55]},
  130:{name:'gyarados',types:['water','flying'],stats:[95,125,79,60,100,81]},
  131:{name:'lapras',types:['water','ice'],stats:[130,85,80,85,95,60]},
  134:{name:'vaporeon',types:['water'],stats:[130,65,60,110,95,65]},
  135:{name:'jolteon',types:['electric'],stats:[65,65,60,110,95,130]},
  136:{name:'flareon',types:['fire'],stats:[65,130,60,95,110,65]},
  143:{name:'snorlax',types:['normal'],stats:[160,110,65,65,110,30]},
  // Gen 2 starters & icons
  152:{name:'chikorita',types:['grass'],stats:[45,49,65,49,65,45]},
  153:{name:'bayleef',types:['grass'],stats:[60,62,80,63,80,60]},
  154:{name:'meganium',types:['grass'],stats:[80,82,100,83,100,80]},
  155:{name:'cyndaquil',types:['fire'],stats:[39,52,43,60,50,65]},
  156:{name:'quilava',types:['fire'],stats:[58,64,58,80,65,80]},
  157:{name:'typhlosion',types:['fire'],stats:[78,84,78,109,85,100]},
  158:{name:'totodile',types:['water'],stats:[50,65,64,44,48,43]},
  159:{name:'croconaw',types:['water'],stats:[65,80,80,59,63,58]},
  160:{name:'feraligatr',types:['water'],stats:[85,105,100,79,83,78]},
  181:{name:'ampharos',types:['electric'],stats:[90,75,85,115,90,55]},
  196:{name:'espeon',types:['psychic'],stats:[65,65,60,130,95,110]},
  197:{name:'umbreon',types:['dark'],stats:[95,65,110,60,130,65]},
  212:{name:'scizor',types:['bug','steel'],stats:[70,130,100,55,80,65]},
  214:{name:'heracross',types:['bug','fighting'],stats:[80,125,75,40,95,85]},
  230:{name:'kingdra',types:['water','dragon'],stats:[75,95,95,95,95,85]},
  248:{name:'tyranitar',types:['rock','dark'],stats:[100,134,110,95,100,61]},
  251:{name:'celebi',types:['psychic','grass'],stats:[100,100,100,100,100,100]},
  // Gen 3 starters & icons
  252:{name:'treecko',types:['grass'],stats:[40,45,35,65,55,70]},
  253:{name:'grovyle',types:['grass'],stats:[50,65,45,85,65,95]},
  255:{name:'torchic',types:['fire'],stats:[45,60,40,70,50,45]},
  256:{name:'combusken',types:['fire','fighting'],stats:[60,85,60,85,60,55]},
  258:{name:'mudkip',types:['water'],stats:[50,70,50,50,50,40]},
  259:{name:'marshtomp',types:['water','ground'],stats:[70,85,70,60,70,50]},
  306:{name:'aggron',types:['steel','rock'],stats:[70,110,180,60,60,50]},
  330:{name:'flygon',types:['ground','dragon'],stats:[80,100,80,80,80,100]},
  350:{name:'milotic',types:['water'],stats:[95,60,79,100,125,81]},
  359:{name:'absol',types:['dark'],stats:[65,130,60,75,60,75]},
  380:{name:'latias',types:['dragon','psychic'],stats:[80,80,90,110,130,110]},
  381:{name:'latios',types:['dragon','psychic'],stats:[80,90,80,130,110,110]},
  385:{name:'jirachi',types:['steel','psychic'],stats:[100,100,100,100,100,100]},
  386:{name:'deoxys',types:['psychic'],stats:[50,150,50,150,50,150]},
  // Gen 4 starters & icons
  387:{name:'turtwig',types:['grass'],stats:[55,68,64,45,55,31]},
  388:{name:'grotle',types:['grass'],stats:[75,89,85,55,65,36]},
  389:{name:'torterra',types:['grass','ground'],stats:[95,109,105,75,85,56]},
  390:{name:'chimchar',types:['fire'],stats:[44,58,44,58,44,61]},
  391:{name:'monferno',types:['fire','fighting'],stats:[64,78,52,78,52,81]},
  392:{name:'infernape',types:['fire','fighting'],stats:[76,104,71,104,71,108]},
  393:{name:'piplup',types:['water'],stats:[53,51,53,61,56,40]},
  394:{name:'prinplup',types:['water'],stats:[64,66,68,81,76,50]},
  395:{name:'empoleon',types:['water','steel'],stats:[84,86,88,111,101,60]},
  398:{name:'staraptor',types:['normal','flying'],stats:[85,120,70,50,60,100]},
  405:{name:'luxray',types:['electric'],stats:[80,120,79,95,79,70]},
  407:{name:'roserade',types:['grass','poison'],stats:[60,70,65,125,105,90]},
  461:{name:'weavile',types:['dark','ice'],stats:[70,120,65,45,85,125]},
  466:{name:'electivire',types:['electric'],stats:[75,123,67,95,85,95]},
  467:{name:'magmortar',types:['fire'],stats:[75,95,67,125,95,83]},
  468:{name:'togekiss',types:['fairy','flying'],stats:[85,50,95,120,115,80]},
  491:{name:'darkrai',types:['dark'],stats:[70,90,90,135,90,125]},
  493:{name:'arceus',types:['normal'],stats:[120,120,120,120,120,120],moves:['judgment','hyper-beam','earth-power','flamethrower','ice-beam','thunderbolt','shadow-ball','recover']},
  // Gen 5 starters & icons
  495:{name:'snivy',types:['grass'],stats:[45,45,55,45,55,63]},
  496:{name:'servine',types:['grass'],stats:[60,60,75,60,75,83]},
  497:{name:'serperior',types:['grass'],stats:[75,75,95,75,95,113]},
  498:{name:'tepig',types:['fire'],stats:[65,63,45,45,45,45]},
  499:{name:'pignite',types:['fire','fighting'],stats:[90,93,55,70,55,55]},
  500:{name:'emboar',types:['fire','fighting'],stats:[110,123,65,100,65,65]},
  501:{name:'oshawott',types:['water'],stats:[55,55,45,63,45,45]},
  502:{name:'dewott',types:['water'],stats:[75,75,60,83,60,60]},
  503:{name:'samurott',types:['water'],stats:[95,100,85,108,70,70]},
  530:{name:'excadrill',types:['ground','steel'],stats:[110,135,60,50,65,88]},
  571:{name:'zoroark',types:['dark'],stats:[60,105,60,120,60,105]},
  609:{name:'chandelure',types:['ghost','fire'],stats:[60,55,90,145,90,80]},
  612:{name:'haxorus',types:['dragon'],stats:[76,147,90,60,70,97]},
  635:{name:'hydreigon',types:['dark','dragon'],stats:[92,105,90,125,90,98]},
  637:{name:'volcarona',types:['bug','fire'],stats:[85,60,65,135,105,100]},
  // Gen 6 starters & icons
  650:{name:'chespin',types:['grass'],stats:[56,61,65,48,45,38]},
  651:{name:'quilladin',types:['grass'],stats:[61,78,95,56,58,57]},
  652:{name:'chesnaught',types:['grass','fighting'],stats:[88,107,122,74,75,64]},
  653:{name:'fennekin',types:['fire'],stats:[40,45,40,62,60,60]},
  654:{name:'braixen',types:['fire'],stats:[59,59,58,90,70,73]},
  655:{name:'delphox',types:['fire','psychic'],stats:[75,69,72,114,100,104]},
  656:{name:'froakie',types:['water'],stats:[41,56,40,62,44,71]},
  657:{name:'frogadier',types:['water'],stats:[54,63,52,83,56,97]},
  663:{name:'talonflame',types:['fire','flying'],stats:[78,81,71,74,69,126]},
  681:{name:'aegislash',types:['steel','ghost'],stats:[60,110,110,110,110,60]},
  700:{name:'sylveon',types:['fairy'],stats:[95,65,65,110,130,60]},
  706:{name:'goodra',types:['dragon'],stats:[90,100,70,110,150,80]},
  715:{name:'noivern',types:['flying','dragon'],stats:[85,70,80,97,80,123]},
  718:{name:'zygarde',types:['dragon','ground'],stats:[108,100,121,81,95,95],moves:['core-enforcer','earthquake','precipice-blades','dragon-pulse','extreme-speed','crunch','stone-edge']},
  800:{name:'necrozma',types:['psychic','dragon'],stats:[97,137,101,137,89,99],moves:['light-that-burns-the-sky','psystrike','dragon-pulse','flash-cannon','earth-power','moonblast','psychic']},
  // Gen 7 starters & icons
  722:{name:'rowlet',types:['grass','flying'],stats:[68,55,55,50,50,42]},
  723:{name:'dartrix',types:['grass','flying'],stats:[78,75,75,70,70,52]},
  724:{name:'decidueye',types:['grass','ghost'],stats:[78,107,75,100,100,70]},
  725:{name:'litten',types:['fire'],stats:[45,65,40,60,40,70]},
  726:{name:'torracat',types:['fire'],stats:[65,85,50,80,50,90]},
  727:{name:'incineroar',types:['fire','dark'],stats:[95,115,90,80,90,60]},
  728:{name:'popplio',types:['water'],stats:[50,54,54,66,56,40]},
  729:{name:'brionne',types:['water'],stats:[60,69,69,91,81,50]},
  730:{name:'primarina',types:['water','fairy'],stats:[80,74,74,126,116,60]},
  745:{name:'lycanroc',types:['rock'],stats:[75,115,65,55,65,112]},
  778:{name:'mimikyu',types:['ghost','fairy'],stats:[55,90,80,50,105,96]},
  784:{name:'kommo-o',types:['dragon','fighting'],stats:[75,110,125,100,105,85]},
  785:{name:'tapu-koko',types:['electric','fairy'],stats:[70,115,85,95,75,130]},
  // Gen 8 starters & icons
  810:{name:'grookey',types:['grass'],stats:[50,65,50,40,40,65]},
  811:{name:'thwackey',types:['grass'],stats:[70,85,70,55,60,80]},
  812:{name:'rillaboom',types:['grass'],stats:[100,125,90,60,70,85]},
  813:{name:'scorbunny',types:['fire'],stats:[50,71,40,40,40,69]},
  814:{name:'raboot',types:['fire'],stats:[65,86,60,55,60,94]},
  815:{name:'cinderace',types:['fire'],stats:[80,116,75,65,75,119]},
  816:{name:'sobble',types:['water'],stats:[50,40,40,70,40,70]},
  817:{name:'drizzile',types:['water'],stats:[65,60,55,95,55,90]},
  818:{name:'inteleon',types:['water'],stats:[70,85,65,125,65,120]},
  823:{name:'corviknight',types:['flying','steel'],stats:[98,87,105,53,85,67]},
  849:{name:'toxtricity',types:['electric','poison'],stats:[75,98,70,114,70,75]},
  887:{name:'dragapult',types:['dragon','ghost'],stats:[88,120,75,100,75,142]},
  890:{name:'eternatus',types:['poison','dragon'],stats:[140,85,95,145,95,130],moves:['dynamax-cannon','eternabeam','cross-poison','flamethrower','draco-meteor','sludge-bomb','dragon-pulse','shadow-ball']},
  // Gen 9 starters & icons
  906:{name:'sprigatito',types:['grass'],stats:[40,61,54,45,45,65]},
  907:{name:'floragato',types:['grass'],stats:[61,80,63,60,63,83]},
  908:{name:'meowscarada',types:['grass','dark'],stats:[76,110,70,81,70,123]},
  909:{name:'fuecoco',types:['fire'],stats:[67,45,59,63,40,36]},
  910:{name:'crocalor',types:['fire'],stats:[81,55,78,90,58,49]},
  911:{name:'skeledirge',types:['fire','ghost'],stats:[104,75,100,110,75,66]},
  912:{name:'quaxly',types:['water'],stats:[55,65,45,50,45,50]},
  913:{name:'quaxwell',types:['water'],stats:[70,85,65,65,60,65]},
  914:{name:'quaquaval',types:['water','fighting'],stats:[85,120,80,85,75,85]},
  936:{name:'armarouge',types:['fire','psychic'],stats:[85,60,100,125,80,75]},
  937:{name:'ceruledge',types:['fire','ghost'],stats:[75,125,80,60,100,85]},
  959:{name:'tinkaton',types:['fairy','steel'],stats:[85,75,77,70,105,94]},
  998:{name:'baxcalibur',types:['dragon','ice'],stats:[115,145,92,75,86,87]},
  1007:{name:'koraidon',types:['fighting','dragon'],stats:[100,135,115,85,100,135]},
  1008:{name:'miraidon',types:['electric','dragon'],stats:[100,85,100,135,115,135]},
  1024:{name:'terapagos',types:['normal'],stats:[95,95,110,105,110,85]}
};

const ALL_STARTER_IDS = new Set(Object.values(STARTER_LINES).flatMap(r => Object.values(r).flat()));

export const EVOLUTION_CHAINS = (() => {
  const map = {
    92: 93, 93: 94,
    147: 148, 148: 149,
    246: 247, 247: 248,
    280: 281, 281: 282,
    371: 372, 372: 373,
    374: 375, 375: 376,
    443: 444, 444: 445,
    447: 448
  };
  for (const r of Object.values(STARTER_LINES)) {
    for (const line of Object.values(r)) {
      map[line[0]] = line[1];
      map[line[1]] = line[2];
    }
  }
  return map;
})();

export function regionForId(id) {
  for (const r of REGIONS) if (id >= r.min && id <= r.max) return r.id;
  return 'kanto';
}

export function genForId(id) {
  for (const r of REGIONS) if (id >= r.min && id <= r.max) return r.gen;
  return 1;
}

export function stageForId(id) {
  if (LEGENDARY_IDS.has(id)) return 'single';
  if (FIRST_STAGE_IDS.has(id)) return 'first';
  if (MIDDLE_STAGE_IDS.has(id)) return 'middle';
  return 'final';
}

const ALL_TYPES = ['grass','fire','water','electric','psychic','ice','dragon','dark','fairy','fighting','flying','poison','ground','rock','bug','ghost','steel','normal'];

export function fallbackTypesForId(id) {
  const primary = ALL_TYPES[(id * 7 + 3) % ALL_TYPES.length];
  if (id % 3 === 0) {
    const secondary = ALL_TYPES[(id * 13 + 5) % ALL_TYPES.length];
    if (secondary !== primary) return [primary, secondary];
  }
  return [primary];
}

export function movesForTypes(types) {
  const set = new Set();
  for (const t of types) {
    for (const m of (TYPE_DEFAULT_MOVES[t] || TYPE_DEFAULT_MOVES.normal)) set.add(m);
  }
  for (const m of TYPE_DEFAULT_MOVES.normal) set.add(m);
  return [...set];
}

export function resolveSpeciesData(id, cache = {}, roster = []) {
  if (cache[id]) return cache[id];
  const curated = CURATED_SPECIES[id];
  if (curated) {
    const d = {
      id,
      name: curated.name,
      types: curated.types,
      stats: curated.stats,
      moves: curated.moves || movesForTypes(curated.types)
    };
    cache[id] = d;
    return d;
  }
  const entry = roster.find(p => p.id === id);
  const name = entry?.name || `pokemon-${id}`;
  const types = fallbackTypesForId(id);
  const stage = stageForId(id);
  const base = LEGENDARY_IDS.has(id) ? 105 : stage === 'first' ? 54 : stage === 'middle' ? 74 : 92;
  const stats = [
    base + (id * 11) % 25,
    base + (id * 17) % 35,
    base + (id * 13) % 30,
    base + (id * 19) % 35,
    base + (id * 23) % 30,
    base + (id * 29) % 35
  ];
  const d = {id, name, types, stats, moves: movesForTypes(types)};
  cache[id] = d;
  return d;
}

export function speciesMeta(id, cache = {}, roster = []) {
  const d = cache[id] || CURATED_SPECIES[id];
  const name = d?.name || roster.find(p => p.id === id)?.name || `pokemon-${id}`;
  const types = d?.types || fallbackTypesForId(id);
  return {
    id,
    name,
    types,
    region: regionForId(id),
    gen: genForId(id),
    stage: stageForId(id),
    starter: ALL_STARTER_IDS.has(id),
    legendary: LEGENDARY_IDS.has(id)
  };
}
