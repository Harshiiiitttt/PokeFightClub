import assert from 'node:assert/strict';
import fs from 'node:fs';
import {view,studio,boss,guardians} from './test-guardian-visibility.mjs';
import {choreographAct2Wave} from './dist/choreography.js';
import {guardianHomes} from './dist/guardian-spacing.js';
import {isContactMove} from './dist/combat-feel.js';
boss.hp=boss.max=100000;boss.act2Wave=2;boss.act2Triggered=true;boss.motion=null;boss.pos={x:270,y:285};view.ending=false;view.outroState=null;
view.faintNotices=[];
for(const g of guardians){g.hp=g.max=100000;g.motion=null;g.retiredAt=undefined;g.faintNoticeShown=false;if(!g.el){const el=view.createFighterEl(g);view.stage.querySelector('#fighters').append(el);}g.el.style.opacity='1';g.el.classList.remove('fainted');}
let minDistance=Infinity,physical=0,ranged=0,captured=false;
const announce=view.announce.bind(view);view.announce=(p,m,...rest)=>{if(!p.isBoss){if(isContactMove(m))physical++;else ranged++;}return announce(p,m,...rest)};
const audio={sfx(){},cry(){},duck(){},quiet(){}};
async function wait(ms){for(let i=0;i<Math.ceil(ms/1000*60);i++){view.draw(1/60);if(view.guardianCombat){for(const g of guardians)minDistance=Math.min(minDistance,Math.hypot(g.pos.x-boss.pos.x,g.pos.y-boss.pos.y));if(!captured&&guardians.some(g=>g.action==='Attack')){studio.renderCompositeFrame();fs.writeFileSync('D:/pokemon-reference/guardian-combat-v19.png',studio.canvas.native.toBuffer('image/png'));captured=true;}}}}
for(let i=0;i<2;i++)await choreographAct2Wave(view.fighters,{view,audio,wait,valid:()=>true,rng:()=>.1,log(){}});
assert(minDistance>=180,`Heroes must not overlap boss bodies: closest ${minDistance}`);assert(physical>0&&ranged>0,'Guardians must use both native contact and ranged attacks');assert(captured);
const two=guardianHomes(boss,guardians.slice(0,2)),one=guardianHomes(boss,guardians.slice(0,1));assert(two[0].pos.x<boss.pos.x&&two[1].pos.x>boss.pos.x);assert.equal(one[0].pos.x,boss.pos.x);
console.log(`PASS: normal guardian contact/ranged choreography, no pile-on (closest ${minDistance.toFixed(1)}px), stable lanes, and centered surviving formations.`);
