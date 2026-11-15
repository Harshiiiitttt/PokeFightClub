export function guardianHomes(boss,guardians){
 const alive=guardians.filter(p=>p.hp>0).sort((a,b)=>a.slot-b.slot);
 const offsets=alive.length===1?[[0,250]]:alive.length===2?[[-174,195],[174,195]]:[[-174,195],[0,290],[174,195]];
 return alive.map((fighter,i)=>({fighter,pos:{x:Math.max(66,Math.min(474,boss.pos.x+offsets[i][0])),y:Math.min(740,boss.pos.y+offsets[i][1])}}));
}
// Includes the transformed bodies, not just the original 64px sprites.
export function guardianContactDistance(actor,target){return actor.isBoss||target.isBoss?190:140;}
