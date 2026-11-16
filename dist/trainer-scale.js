// Height is in decimetres, as supplied by PokéAPI. Compress the range for a readable duel.
import {pokemonHeights} from './pokemon-heights.js?v=32';
import {spriteExtent} from './sprite-layout.js?v=32';
export function trainerVisualExtent(p){const metres=(p.height||pokemonHeights[p.id]||15)/10;const base=Math.max(40,Math.min(88,36+14*Math.log2(1+metres)));return p.id===6&&(p.mega||/mega/i.test(p.formKey||''))?base*1.22:[500,503].includes(p.id)?base*1.28:base;}
export function trainerVisualScale(p){return trainerVisualExtent(p)/spriteExtent(p.id);}
