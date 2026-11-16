const clamp=n=>Math.max(0,Math.min(1,n));
const ease=t=>1-(1-clamp(t))**3;
export const smoothFollow=(current,target,seconds,rate)=>current+(target-current)*(1-Math.exp(-Math.max(0,seconds)*rate));
// Numbers remain authoritative; only the painted bar eases into its new value.
export function sampleTrainerHealth(view,p){
 const now=view.noticeTime??view.presentationTime??0,target=clamp(p.hp/p.max);
 view.trainerHPState??=new Map();let s=view.trainerHPState.get(p.uid);
 const value=state=>state.from+(state.target-state.from)*ease((now-state.at)/.23);
 const chip=state=>state.chip+(state.target-state.chip)*ease((now-state.at-.12)/.5);
 if(!s||now<s.at||s.max!==p.max){s={target,from:target,chip:target,at:now,max:p.max};view.trainerHPState.set(p.uid,s);}
 if(s.target!==target){const from=value(s),trail=chip(s);s={target,from,chip:target>from?target:Math.max(from,trail),at:now,max:p.max};view.trainerHPState.set(p.uid,s);}
 if(!view.cinematic)return{value:target,trail:target};
 return{value:value(s),trail:Math.max(value(s),chip(s))};
}
export function trainerHudVisibility(view){
 if(view.matchIntro)return 0;
 if(view.trainerOutro)return 1-ease((view.presentationTime-view.trainerOutro.start)/.75);
 return 1;
}
// Quiet secondary ambience during a charge/clash, so silhouettes and move effects read first.
export function arenaEffectVisibility(view){
 if(view.matchIntro||view.trainerOutro)return .35;
 if(view.trainerCutIn||view.duelBeamClash)return .25;
 if(view.duelDrama&&view.duelDrama.phase!=='recover')return .5;
 return 1;
}
