import {visibleBounds} from './sprite-layout.js?v=32';
// Portraits preserve their aspect ratio. Trainer faces use curated head crops keyed by visible bounds.
const HEAD_BOUNDS={
 '22,8,37,69':{x:27,y:8,width:22,height:22},'24,2,34,77':{x:26,y:2,width:24,height:24},
 '24,13,29,64':{x:28,y:13,width:22,height:21},'19,13,36,64':{x:28,y:13,width:22,height:21},
 '21,11,39,64':{x:27,y:11,width:23,height:22},'23,10,34,64':{x:27,y:10,width:23,height:22},
 '23,8,36,70':{x:28,y:8,width:22,height:22},'24,6,36,72':{x:31,y:6,width:23,height:23},
 '19,8,38,71':{x:28,y:8,width:24,height:23},'24,12,29,65':{x:28,y:12,width:22,height:21},
 '20,9,38,61':{x:26,y:16,width:25,height:23},'23,8,31,63':{x:27,y:8,width:23,height:23},
 '13,4,59,74':{x:25,y:4,width:25,height:24},'20,4,38,75':{x:27,y:4,width:25,height:24},
 '13,1,53,79':{x:31,y:1,width:25,height:25},'4,3,75,74':{x:26,y:10,width:25,height:24},
 '16,1,48,79':{x:20,y:1,width:24,height:24},'25,4,30,75':{x:31,y:4,width:22,height:24},
 '18,2,37,77':{x:34,y:2,width:22,height:24},'3,0,76,80':{x:23,y:0,width:25,height:25}
};
export function drawHUDPortrait(c,image,x,y,size,head=false){
 if(!image)return false;const b=visibleBounds(image,{x:0,y:0,width:image.width,height:image.height});
 let source=b;if(head){const hit=HEAD_BOUNDS[`${b.x},${b.y},${b.width},${b.height}`];if(hit)source=hit;else{const crown={x:b.x,y:b.y,width:b.width,height:Math.ceil(b.height*.2)},top=visibleBounds(image,crown),w=Math.round(Math.max(top.width,b.height*.28)),h=Math.min(25,Math.ceil(b.height*.32));source={x:Math.round(Math.max(0,Math.min(image.width-w,b.x+top.x+top.width/2-w/2))),y:b.y,width:w,height:h};}}
 const scale=Math.min(size/source.width,size/source.height),w=Math.round(source.width*scale),h=Math.round(source.height*scale);
 c.drawImage(image,source.x,source.y,source.width,source.height,Math.round(x+(size-w)/2),Math.round(y+(size-h)/2),w,h);return true;
}
export function drawRosterBall(c,x,y,status,active,color){
 c.save();const alpha=c.globalAlpha??1;c.translate(x,y);c.lineWidth=1.5;c.strokeStyle='#0a1420';
 if(active){c.strokeStyle=color;c.lineWidth=1.5;c.beginPath();c.arc(0,0,10,0,Math.PI*2);c.stroke();c.fillStyle=color;c.beginPath();c.moveTo(-3,14);c.lineTo(3,14);c.lineTo(0,11);c.closePath();c.fill();}
 c.globalAlpha=alpha*(status==='fainted'?.48:1);c.strokeStyle='#111b29';c.fillStyle=status==='fainted'?'#63717c':'#edf2e9';c.beginPath();c.arc(0,0,7.5,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle=status==='fainted'?'#454c5b':active?'#f5c659':'#dc6066';c.beginPath();c.arc(0,0,6.5,Math.PI,Math.PI*2);c.fill();
 c.strokeStyle='#172233';c.beginPath();c.moveTo(-7,0);c.lineTo(7,0);c.stroke();c.fillStyle='#172233';c.beginPath();c.arc(0,0,3,0,Math.PI*2);c.fill();c.fillStyle='#f5f2dc';c.beginPath();c.arc(0,0,1.5,0,Math.PI*2);c.fill();
 if(status==='fainted'){c.globalAlpha=alpha;c.strokeStyle='#e79b94';c.lineWidth=1.5;c.beginPath();c.moveTo(-5,-5);c.lineTo(5,5);c.moveTo(5,-5);c.lineTo(-5,5);c.stroke();}c.restore();
}
