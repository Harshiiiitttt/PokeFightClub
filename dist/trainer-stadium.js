export const STADIUM_SURFACES={
 champion:{base:'#2b6353',stripe:'#306c59',edge:'#183c38',paint:'#adc7b3',accent:'#e9cc80',kind:'grass'},
 forest:{base:'#36593d',stripe:'#3b6142',edge:'#223729',paint:'#b2c69b',accent:'#bfce86',kind:'grass'},
 storm:{base:'#29494e',stripe:'#2d5155',edge:'#192f38',paint:'#9bbfbe',accent:'#a9cfe1',kind:'wet'},
 coast:{base:'#466a73',stripe:'#4c7179',edge:'#273f4f',paint:'#b3d9d1',accent:'#9edbdc',kind:'wet'},
 frost:{base:'#688795',stripe:'#6c8c9b',edge:'#3b5569',paint:'#d0e7e7',accent:'#d4eff4',kind:'ice'},
 volcano:{base:'#58484a',stripe:'#5d4c4e',edge:'#342d38',paint:'#bea392',accent:'#e9a06d',kind:'stone'},
 stadium:{base:'#7b7060',stripe:'#807565',edge:'#494338',paint:'#d0c6ab',accent:'#e5c38b',kind:'sand'},
 spear:{base:'#585f70',stripe:'#5d6476',edge:'#333d50',paint:'#c2c6d0',accent:'#b5ccf0',kind:'stone'},
 temporal:{base:'#605d78',stripe:'#65627d',edge:'#37384f',paint:'#c1b9d5',accent:'#d5b6e6',kind:'stone'},
 eclipse:{base:'#49495e',stripe:'#4e4e64',edge:'#2b2b40',paint:'#ada8c7',accent:'#c9a7e1',kind:'stone'},
 crystal:{base:'#4f6675',stripe:'#546d7c',edge:'#2d3d51',paint:'#afc9d2',accent:'#b4e7e6',kind:'stone'}
};
export function drawStadiumSurface(c,view={}){
 const p=STADIUM_SURFACES[view.arena]||STADIUM_SURFACES.champion;c.save();c.imageSmoothingEnabled=false;
 c.fillStyle='#101c2b';c.fillRect(0,0,540,960);
 // Terraced seating and aisles are part of the world, leaving clear space behind the HUD.
 for(let row=0;row<4;row++){const y=126+row*24;c.fillStyle=row%2?'#202e3c':'#233240';c.fillRect(0,y,540,23);c.fillStyle='#4b5660';c.fillRect(0,y+21,540,2);}
 for(const x of [91,267,443]){c.fillStyle='#283a46';c.fillRect(x,126,7,96);for(let y=127;y<221;y+=8){c.fillStyle='#5c6870';c.fillRect(x,y,7,1);}}
 c.fillStyle='#223440';c.fillRect(0,220,540,25);c.fillRect(0,834,540,61);
 for(let y=222;y<243;y+=6){c.fillStyle='#2b414a';c.fillRect(0,y,540,1);}
 // Raised infield lip and a recessed runoff lane around the battle markings.
 c.fillStyle='#0b1823';c.fillRect(21,249,500,584);c.fillStyle=p.edge;c.fillRect(24,251,492,575);
 c.fillStyle='#73858b';c.fillRect(25,253,490,2);c.fillStyle='#344c55';c.fillRect(25,819,490,5);
 for(const x of [29,503])for(let y=267;y<812;y+=12){c.fillStyle='#101f29';c.fillRect(x,y,8,4);c.fillStyle='#4d6466';c.fillRect(x,y,8,1);}
 c.fillStyle=p.base;c.fillRect(43,257,454,546);
 for(let i=0;i<14;i++){c.fillStyle=i%2?p.stripe:p.base;c.fillRect(44,258+i*39,452,39);}
 // Fixed-seed surface detail stays still when the camera moves or an attack hits.
 let seed=8127;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 c.globalAlpha=.12;
 for(let i=0;i<1050;i++){const x=48+Math.floor(rnd()*444),y=260+Math.floor(rnd()*538);c.fillStyle=i%3?'#bbd5bd':'#071820';c.fillRect(x,y,1+Math.floor(rnd()*3),1);}
 if(p.kind==='stone'){
  c.strokeStyle='#1a2638';c.lineWidth=1;c.globalAlpha=.16;
  for(let y=266;y<799;y+=37)for(let x=48+(Math.floor(y/37)%2)*21;x<490;x+=43){c.beginPath();c.moveTo(x,y);c.lineTo(x+35,y);c.lineTo(x+39,y+13);c.moveTo(x+35,y);c.lineTo(x+32,y-19);c.stroke();}
 }else if(p.kind==='ice'||p.kind==='wet'){
  c.strokeStyle=p.paint;c.lineWidth=1;c.globalAlpha=p.kind==='ice'?.16:.08;
  for(let i=0;i<18;i++){const x=60+rnd()*420,y=280+rnd()*495;c.beginPath();c.moveTo(x,y);c.lineTo(Math.min(489,x+15+rnd()*30),y-5);c.stroke();}
 }else if(p.kind==='sand'){
  c.fillStyle='#e4d3ac';c.globalAlpha=.12;for(let i=0;i<42;i++){const x=55+rnd()*425,y=270+rnd()*520;c.fillRect(x,y,8+rnd()*12,1);}
 }
 c.globalAlpha=1;
 const light=c.createRadialGradient(270,526,20,270,526,337);light.addColorStop(0,'#ddf5cf0b');light.addColorStop(.65,'#071c2400');light.addColorStop(1,'#071c244f');c.fillStyle=light;c.fillRect(43,257,454,546);
 c.strokeStyle=p.paint;c.globalAlpha=.58;c.lineWidth=2;c.strokeRect(47,258,446,536);
 c.beginPath();c.moveTo(47,526);c.lineTo(493,526);c.stroke();c.beginPath();c.arc(270,526,81,0,Math.PI*2);c.stroke();
 c.lineWidth=1;c.globalAlpha=.22;c.beginPath();c.arc(270,526,87,0,Math.PI*2);c.stroke();
 c.globalAlpha=.5;c.beginPath();c.arc(270,526,17,0,Math.PI*2);c.stroke();c.fillStyle=p.base;c.beginPath();c.arc(270,526,9,0,Math.PI*2);c.fill();c.stroke();
 // Painted team approach lanes and short touchline ticks anchor the arena in a real stadium.
 for(const [y,color] of [[319,'#e4a08d'],[733,'#9abedc']]){c.globalAlpha=.15;c.fillStyle=color;c.fillRect(246,y,48,3);c.fillRect(252,y+6,36,2);}
 c.globalAlpha=.45;c.fillStyle=p.accent;for(const x of [47,490])for(const y of [361,691])c.fillRect(x,y,3,12);
 c.restore();
}
