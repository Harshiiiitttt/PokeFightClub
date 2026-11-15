import assert from 'node:assert/strict';
import {announceMove,drawMoveLabels} from './dist/move-labels.js';
import {colors} from './dist/engine.js';
const calls=[],c={save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},roundRect(){},fill(){},measureText:t=>({width:t.length*6}),fillText(text,x,y){calls.push({text,x,y,color:this.fillStyle})}};
const view={clock:0},fighters=[0,1,2].map(i=>({uid:String(i),hp:100,pos:{x:200+i*7,y:400},el:{querySelector:()=>({dataset:{bodyTop:-80}})}}));
for(const [i,type] of ['fire','water','normal'].entries())announceMove(view,fighters[i],{name:['flamethrower','hydro-pump','body-slam'][i],type});
drawMoveLabels(c,view);assert.equal(calls.length,3,'Simultaneous attacks require three independent labels');assert.deepEqual(calls.map(c=>c.color),[colors.fire,colors.water,colors.normal]);assert(calls.every(c=>c.y<320),'Labels must sit above actual sprite bounds');
assert(new Set(calls.map(c=>c.x+','+c.y)).size===3,'Labels should avoid stacking directly on top of one another');
fighters[0].pos={x:400,y:600};calls.length=0;drawMoveLabels(c,view);assert(calls[0].x>350&&calls[0].y>450,'Labels must follow the moving attacker');
fighters[1].hp=0;calls.length=0;drawMoveLabels(c,view);assert.equal(calls.length,2);view.clock=2;drawMoveLabels(c,view);assert.equal(view.moveLabels.size,0,'Old move labels must expire');
for(const type of Object.keys(colors)){announceMove(view,fighters[0],{name:'test-move',type});assert.equal(view.moveLabels.get('0').color,colors[type]);}
console.log('PASS: all 18 type colours, independent simultaneous labels, above-sprite placement, collision spacing, moving anchors, expiry and KO cleanup.');
