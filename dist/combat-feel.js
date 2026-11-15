export function isContactMove(move){return move.category==='physical'&&!['ground','meteor','burst','beam','orb','wave','bolt','shuriken'].includes(move.fx)}
export function hitStrength({move,damage,target,crit=false,finisher=false}){if(finisher)return 1;if(crit)return .9;const ratio=damage/Math.max(1,target.max);if(move.power>=110||ratio>=.3)return .85;if(move.power>=90||ratio>=.2)return .58;return .27}
export function shakeProfile(strength){const s=typeof strength==='boolean'?(strength?1:.3):Math.max(0,Math.min(1,strength));return {amplitude:3+s*s*21,duration:.16+s*.28,freeze:.025+s*.075}}
