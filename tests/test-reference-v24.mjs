import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanvas,Image} from '@napi-rs/canvas';
import {view,studio} from './test-trainer-native.mjs';
import {createFighter,moves} from '../dist/engine.js';
import {choreographTrainerExchange} from '../dist/trainer-combat.js';
import {TRAINER_PRESETS,trainerSpriteRect} from '../dist/trainer-duel.js';
import {trainerVisualScale,trainerVisualExtent} from '../dist/trainer-scale.js';
import {pokemonHeights} from '../dist/pokemon-heights.js';
import {drawCompactTrainerHUD,trainerResultAnchor,noteTrainerResult} from '../dist/trainer-overlay.js';
import {drawDuelAnimeFX} from '../dist/duel-anime-fx.js';
const cache=JSON.parse(fs.readFileSync('dist/pokemon.json')),shots=[];assert.equal(Object.keys(pokemonHeights).length,1025);assert(trainerVisualExtent({id:25})<trainerVisualExtent({id:143}));assert(trainerVisualScale({id:143})<1.25);
const fresh=()=>TRAINER_PRESETS[0].teams.flatMap((ids,t)=>ids.map((id,i)=>Object.assign(createFighter(cache[id],t,0,{reserve:i>0,uidIndex:i}),{uid:t+'-'+i,trainerDuel:true,reserve:i>0})));
view.mount(fresh());view.customTeamNames=['RED','BLUE'];view.stage.querySelector('#intro-overlay').classList.add('hidden');view.stage.querySelector('#result').classList.add('hidden');
const save=name=>{studio.renderCompositeFrame();const img=createCanvas(540,960);img.getContext('2d').drawImage(studio.canvas.native,0,0);shots.push(img);fs.writeFileSync('D:/pokemon-reference/'+name+'-v24.png',img.toBuffer('image/png'));};
view.draw(.016);save('compact-hud');const a=view.fighters[0],b=view.fighters[6],s=trainerVisualScale(a),r=trainerSpriteRect(a);assert.equal(r.width,192*s);assert.equal(a.el.style.width,24*s+'%');
let thunderCaptured=false,meteorCaptured=false,phase='electric',maxZoom=1;const audio={sfx(){},cry(){},duck(){}};
async function wait(ms){for(let i=0;i<Math.ceil(ms/1000*60);i++){view.draw(1/60);maxZoom=Math.max(maxZoom,view._zoomNow);const electric=view.effects.find(e=>e.kind==='anime-electric'),meteor=view.effects.find(e=>e.kind==='anime-meteors');if(phase==='electric'&&!thunderCaptured&&electric&&(view.clock-electric.start)/electric.duration>.59&&view.trainerResults.length){save('thunderbolt');thunderCaptured=true;}if(phase==='meteor'&&!meteorCaptured&&meteor&&(view.clock-meteor.start)/meteor.duration>.5){save('meteor-shower');meteorCaptured=true;}}}
await choreographTrainerExchange({actor:a,target:b,move:moves.find(m=>m.name==='thunderbolt'),damage:55,mult:2,crit:false,dodge:false},{view,audio,wait,valid:()=>true,rng:()=>.58,log(){}});assert(thunderCaptured);assert.equal(b.hp,b.max-55);assert.equal(view.trainerResults.at(-1).text,'SUPER EFFECTIVE!');
const result=view.trainerResults.at(-1),anchor=trainerResultAnchor(view,b,result.bodyTop),clock=view.clock;view.clock+=.3;assert.deepEqual(trainerResultAnchor(view,b,result.bodyTop),anchor,'Effectiveness text must not rise, bounce or scale with age');view.clock=clock;
for(const state of Object.values(view.pmd[149].anims)){const img=new Image();img.src=fs.readFileSync('dist/assets/'+state.path);view.images['pmd-149-'+state.name]=img;}const portrait=new Image();portrait.src=fs.readFileSync('dist/assets/pmd/149/portrait.png');view.images['intro-149']=portrait;const rock=new Image();rock.src=fs.readFileSync('dist/assets/fx/rock2.png');view.images.rock2=rock;const dragon=createFighter(cache[149],0,0);Object.assign(a,dragon,{uid:'0-0',trainerDuel:true,reserve:false});view.sprite(a.el.querySelector('img'),149,true,false);phase='meteor';
await choreographTrainerExchange({actor:a,target:b,move:moves.find(m=>m.name==='draco-meteor'),damage:55,mult:1,crit:false,dodge:false},{view,audio,wait,valid:()=>true,rng:()=>.58,log(){}});assert(meteorCaptured);assert(maxZoom>1.25,'Signature attacks must get cinematic closeups');
// Fixed-pixel overlay typography and HP positions do not scale with the world camera.
const text=[],rects=[],proxy=new Proxy({measureText:s=>({width:s.length*5})},{get:(o,k)=>k==='fillText'?((value,x,y)=>text.push({value,x,y,font:o.font})):k==='fillRect'?((...args)=>rects.push(args)):k in o?o[k]:()=>{},set:(o,k,v)=>{o[k]=v;return true}});
view.trainerResults=[];noteTrainerResult(view,{target:b,mult:.5});drawCompactTrainerHUD(proxy,view);assert(text.some(t=>t.value==='NOT VERY EFFECTIVE…'&&t.font.includes('15px')&&t.font.includes('Space Grotesk')));assert(rects.some(r=>r[1]===40&&r[3]===18),'HUD health bars must remain in the compact top band');
const canvas=createCanvas(540,960),c=canvas.getContext('2d');for(const kind of ['anime-electric','anime-meteors']){c.clearRect(0,0,540,960);const fx={kind,color:'#ffdd88',from:{x:200,y:390},to:{x:320,y:580}};assert(drawDuelAnimeFX(c,fx,.6));const one=canvas.toBuffer('image/png');c.clearRect(0,0,540,960);drawDuelAnimeFX(c,fx,.6);assert(one.equals(canvas.toBuffer('image/png')),'Anime effects must replay deterministically');}
const montage=createCanvas(1620,960);shots.forEach((img,i)=>montage.getContext('2d').drawImage(img,i*540,0));fs.writeFileSync('D:/pokemon-reference/reference-polish-v24.png',montage.toBuffer('image/png'));
console.log('PASS: reference-style compact HUD, real FireRed NPCs, all-species height scaling, static outlined effectiveness typography, matching DOM/recorded sizes, native Thunderbolt/meteor sequences, deterministic effects and cinematic closeups.');
