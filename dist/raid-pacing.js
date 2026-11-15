export const PHASE_ONE_LIMIT=10;
export function advanceRaidOpening(view,dt){if(view.raidPhase1Active)view.raidPhase1Elapsed=Math.min(PHASE_ONE_LIMIT,(view.raidPhase1Elapsed||0)+Math.max(0,dt)/(view.playbackSpeed||1));}
export function openingExpired(view,boss){return !!boss&&!boss.phase2&&(view.raidPhase1Elapsed||0)>=PHASE_ONE_LIMIT;}
export function raidWaitDuration(view,boss,ms){return boss?.phase2?ms*1.25:Math.max(0,Math.min(ms/(view.playbackSpeed||1),(PHASE_ONE_LIMIT-(view.raidPhase1Elapsed||0))*1000));}
