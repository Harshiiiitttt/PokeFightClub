import {ARENA_RAILS} from './arena-layout.js?v=32';
export function drawArenaBarricades(c,view){
 if(!view.trainerMode)return;c.save();
 // Raised curbs and two rail lines run outside the usable fighting area.
 for(const x of [ARENA_RAILS.left,ARENA_RAILS.right]){
  c.fillStyle='#111e29';c.fillRect(x-6,ARENA_RAILS.top,14,ARENA_RAILS.bottom-ARENA_RAILS.top);c.fillStyle='#4e6670';c.fillRect(x-4,ARENA_RAILS.top,8,ARENA_RAILS.bottom-ARENA_RAILS.top);c.fillStyle='#9caeac';c.fillRect(x-3,ARENA_RAILS.top,2,ARENA_RAILS.bottom-ARENA_RAILS.top);
  for(let y=ARENA_RAILS.top+5;y<=ARENA_RAILS.bottom-5;y+=43){c.fillStyle='#142331';c.fillRect(x-6,y+3,12,15);c.fillStyle='#7f9597';c.fillRect(x-6,y-4,11,15);c.fillStyle='#c4ccbb';c.fillRect(x-5,y-5,9,4);c.fillStyle='#344e5a';c.fillRect(x+3,y-1,2,11);}
 }
 for(const y of [ARENA_RAILS.top,ARENA_RAILS.bottom])for(const [x,w] of [[ARENA_RAILS.left,ARENA_RAILS.gateLeft-ARENA_RAILS.left],[ARENA_RAILS.gateRight,ARENA_RAILS.right-ARENA_RAILS.gateRight]]){
  c.fillStyle='#101c27';c.fillRect(x,y+3,w,12);c.fillStyle='#6c858b';c.fillRect(x,y,w,8);c.fillStyle='#b5c1b4';c.fillRect(x,y,w,2);
  for(let px=x;px<=x+w;px+=33){c.fillStyle='#405b69';c.fillRect(px-3,y-6,7,18);c.fillStyle='#bdc8bb';c.fillRect(px-3,y-7,7,3);}
 }
 // Open trainer gates and a restrained Poké Ball centre crest.
 c.setLineDash([5,7]);c.strokeStyle='#b8c8b8';c.globalAlpha=.35;c.lineWidth=1;for(const [y,to] of [[ARENA_RAILS.top,315],[ARENA_RAILS.bottom,843]]){c.beginPath();c.moveTo(270,y);c.lineTo(270,to);c.stroke();}c.setLineDash([]);
 c.globalAlpha=.45;c.lineWidth=3;c.beginPath();c.arc(270,526,15,0,Math.PI*2);c.stroke();c.fillStyle='#2d6750';c.beginPath();c.arc(270,526,11,0,Math.PI*2);c.fill();
 c.globalAlpha=.7;for(const [x,color] of [[ARENA_RAILS.left,'#b36e68'],[ARENA_RAILS.right,'#6c91b3']]){c.fillStyle='#263a49';c.fillRect(x-10,491,20,32);c.fillStyle=color;c.fillRect(x-8,493,16,25);c.strokeStyle='#e2d6ad';c.lineWidth=1;c.beginPath();c.arc(x,505,5,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(x-5,505);c.lineTo(x+5,505);c.stroke();}
 c.restore();
}
