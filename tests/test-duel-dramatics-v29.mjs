import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
import {view,studio} from './test-trainer-native.mjs';
import {createFighter,moves} from '../dist/engine.js';
import {TRAINER_PRESETS,drawTrainerIntro} from '../dist/trainer-duel.js';
import {TRAINER_STANCES,DUEL_FIELD} from '../dist/arena-layout.js';
import {duelBody,duelClearanceMargin} from '../dist/duel-clearance.js';
import {playDuelAction} from '../dist/duel-actions.js';
import {pmdState} from '../dist/pmd-animation.js';
import {choreographTrainerExchange} from '../dist/trainer-combat.js';
const data=JSON.parse(fs.readFileSync('dist/pokemon.json')),preset=TRAINER_PRESETS[0];
function mount(){const ids=preset.teams.map(t=>[...t]);ids[0][0]=6;view.mount(ids.flatMap((team,t)=>team.map((id,i)=>Object.assign(createFighter(data[id],t,0,{reserve:i>0,uidIndex:i}),{uid:t+'-'+i,reserve:i>0,trainerDuel:true}))));view.customTeamNames=['RED','BLUE'];view.stage.querySelector('#intro-overlay').classList.add('hidden');view.stage.querySelector('#result').classList.add('hidden');view.draw(.016);}
const shots=[];function save(name){studio.renderCompositeFrame();const img=createCanvas(540,960);img.getContext('2d').drawImage(studio.canvas.native,0,0);shots.push(img);fs.writeFileSync('D:/pokemon-reference/'+name+'-v29.png',img.toBuffer('image/png'));}
mount();for(const b of TRAINER_STANCES){assert(b.y>=258&&b.y+b.h<=794,'Trainer pads must sit inside the field');assert(b.feet.y-36.8>=b.y&&b.feet.y<=b.y+b.h);}
view.matchIntro={names:preset.names,lineups:preset.teams,start:view.presentationTime-1.2,duration:3.4};view.draw(.016);save('dramatic-vs-intro');view.matchIntro=null;view.draw(.016);save('inside-trainers-stadium');
// Native hit frames can exceed the old 340ms cap. The effect delay must match the full hit timing.
const a=view.fighters[0],b=view.fighters[6];a.action=null;const delay=playDuelAction(view,a,'Attack',85);pmdState(view,a);view.clock+=delay/1000+.00001;const state=pmdState(view,a);assert(state.frame>=(state.anim.hit||1),'Native strike reaches its hit frame when the claw effect appears');a.action=null;a.duelAnimRate=1;
const fx=new Set(),sounds=[],orig=view.addFx.bind(view);view.addFx=(kind,...args)=>{fx.add(kind);return orig(kind,...args);};let brace=false,slash=false,skid=false,evade=false;
const audio={dash:g=>sounds.push(g),sfx(){},cry(){},duck(){}};
const wait=async ms=>{for(let i=0;i<Math.ceil(ms/1000*60);i++){view.draw(1/60);const aa=duelBody(a),bb=duelBody(b),gap=Math.max(Math.abs(aa.x-bb.x)-(aa.w+bb.w)/2,Math.abs(aa.y-bb.y)-(aa.h+bb.h)/2);assert(gap>=duelClearanceMargin(view)-.12,'Duel bodies must not overlap');for(const p of [a,b])assert(p.pos.y>=DUEL_FIELD.top-.1&&p.pos.y<=DUEL_FIELD.bottom+.1,'Fighters remain clear of trainer pads');if(!brace&&view.effects.some(e=>e.kind==='brace-ground')){save('heavy-hit-brace');brace=true;}if(!slash&&view.effects.some(e=>e.kind==='claw-followthrough')){save('slash-followthrough');slash=true;}if(!skid&&view.effects.some(e=>e.kind==='skid-ground')){save('defender-skid');skid=true;}if(!evade&&view.effects.some(e=>e.kind==='approach-sweep'&&e.fighter===b)){save('near-miss-dodge');evade=true;}}};
const ctx={view,audio,wait,valid:()=>true,rng:()=>.6,log(){}};
await choreographTrainerExchange({actor:a,target:b,move:moves.find(m=>m.name==='scratch'),damage:12,mult:1,crit:true,dodge:false},ctx);
const hp=b.hp;await choreographTrainerExchange({actor:a,target:b,move:moves.find(m=>m.name==='scratch'),damage:99,mult:1,crit:false,dodge:true},ctx);assert.equal(b.hp,hp,'A cinematic near miss must not deal damage');
assert(brace&&slash&&skid&&evade);assert(sounds.length>=3);assert.equal(view.duelContact,null);assert.equal(a.duelAnimRate,1);assert.equal(view.duelDrama,null);
const montage=createCanvas(shots.length*270,480);shots.forEach((img,i)=>montage.getContext('2d').drawImage(img,i*270,0,270,480));fs.writeFileSync('D:/pokemon-reference/duel-dramatics-v29.png',montage.toBuffer('image/png'));
console.log('PASS: VS intro, trainers inside field, native hit-frame sync, dash sounds, brace/claw/skid effects, near-miss with no damage, non-overlap and cleanup.');

