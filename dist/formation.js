const originalX=[116,270,424];
export const RAID_BOSS_START_POS={x:270,y:235};
export const RAID_BOSS_POS={x:270,y:480};

export function formationFor(fighters,team,raidEngaged=false){
 const alive=fighters.filter(p=>p.team===team&&p.hp>0&&!p.reserve).sort((a,b)=>a.slot-b.slot);
 const hasBoss=fighters.some(p=>p.isBoss);
 const engaged=raidEngaged||fighters.some(p=>p.raidEngaged);
 if(hasBoss){
  const hasGuardians=fighters.some(p=>p.isGuardian);
  if(alive.length===1&&alive[0].isBoss){
   return [{fighter:alive[0],position:hasGuardians?{x:270,y:285}:engaged?{...RAID_BOSS_POS}:{...RAID_BOSS_START_POS}}];
  }
  if(engaged){
   if(alive.length<=3){
    const isGuardian=alive.some(p=>p.isGuardian);
    const raidTriad=isGuardian
     ?(alive.length===1?[{x:270,y:700}]:alive.length===2?[{x:185,y:690},{x:355,y:690}]:[{x:145,y:675},{x:270,y:715},{x:395,y:675}])
     :(alive.length===1?[{x:270,y:585}]:alive.length===2?[{x:175,y:535},{x:365,y:535}]:[{x:166,y:515},{x:270,y:590},{x:374,y:515}]);
    return alive.map((fighter,index)=>({fighter,position:raidTriad[index]}));
   }
   const ringCaps=[12,17,21];
   const ringRadii=[[132,118],[182,168],[232,218]];
   return alive.map((fighter,index)=>{
    let ring=0,offset=index;
    while(ring<ringCaps.length-1&&offset>=ringCaps[ring]){offset-=ringCaps[ring];ring++;}
    const prevUsed=ring===0?0:ring===1?12:29;
    const inRing=Math.max(1,Math.min(ringCaps[ring],alive.length-prevUsed));
    const [rx,ry]=ringRadii[Math.min(ring,ringRadii.length-1)];
    const angle=(offset/inRing)*Math.PI*2-Math.PI/2+(ring%2?Math.PI/inRing:0);
    const x=Math.max(34,Math.min(506,Math.round(RAID_BOSS_POS.x+Math.cos(angle)*rx)));
    const y=Math.max(250,Math.min(710,Math.round(RAID_BOSS_POS.y+Math.sin(angle)*ry)));
    return {fighter,position:{x,y}};
   });
  }
 }
 if(alive.length<=3){
  const xs=alive.length===1?[270]:alive.length===2?[190,350]:originalX;
  return alive.map((fighter,index)=>({fighter,position:{x:xs[index],y:alive.length===3?(team===0?[325,258,325][index]:[682,748,682][index]):team===0?305:690}}));
 }
 const cols=alive.length<=6?3:alive.length<=12?Math.min(5,Math.ceil(alive.length/2)):alive.length<=25?Math.min(7,Math.ceil(alive.length/4)):10;
 const rows=Math.ceil(alive.length/cols);
 return alive.map((fighter,index)=>{
  const r=Math.floor(index/cols),c=index%cols,inRow=Math.min(cols,alive.length-r*cols);
  const step=inRow<=3?128:inRow<=5?88:inRow<=7?64:46,span=(inRow-1)*step;
  const x=inRow===1?270:Math.round(270-span/2+c*step);
  const rowStep=rows===1?0:Math.min(46,Math.floor(172/(rows-1)));
  const y=team===0?(352-r*rowStep-(c%2?6:0)):(642+r*rowStep+(c%2?6:0));
  return {fighter,position:{x,y}};
 });
}

export function formationHome(fighters,p){
 return formationFor(fighters,p.team).find(entry=>entry.fighter.uid===p.uid)?.position||(p.isBoss?{...RAID_BOSS_POS}:{x:originalX[p.slot%3]||270,y:p.team===0?325:690});
}
