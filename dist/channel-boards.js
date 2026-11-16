import {ARENA_RAILS} from './arena-layout.js?v=32';
export function drawChannelBoards(c,view){
 if(!view.trainerMode)return;c.save();c.font='700 11px "Space Grotesk",Inter,sans-serif';c.textBaseline='middle';c.textAlign='left';
 const time=view.cinematic?view.clock:0;
 let leftText='PokeFightClub  •  POKÉMON BATTLES',rightText='SUBSCRIBE  •  PokeFightClub',leftColor='#98d9d4',rightColor='#ebc773',alert=false;
 if(view.cinematic){
  if(view.trainerOutro){const win=view.teamName(view.trainerOutro.winner);leftText=`CHAMPION ${win}  •  VICTORY`;rightText=`${win} WINS  •  PokeFightClub`;leftColor='#ffe48a';rightColor='#ffe48a';alert=true;}
  else if(view.trainerRecall){const who=view.teamName(view.trainerRecall.team);leftText=`${who}  •  RECALLING POKÉMON`;rightText=`NEXT CHALLENGER INBOUND`;leftColor='#f4b1a4';rightColor='#9acbe9';alert=true;}
  else if(view.trainerAttack?.result&&view.clock<(view.trainerAttack.until||0)){
   const r=view.trainerAttack.result;
   if(r.includes('SUPER EFFECTIVE')){leftText='SUPER EFFECTIVE HIT!';rightText='CRITICAL ADVANTAGE  •  PokeFightClub';leftColor='#ffe48a';rightColor='#ffe48a';alert=true;}
   else if(r==='DODGED'){leftText='EVASIVE MANEUVER!';rightText='DODGED  •  PokeFightClub';leftColor='#bfe9ff';rightColor='#bfe9ff';}
  }
 }
 for(const [row,y] of [ARENA_RAILS.top,ARENA_RAILS.bottom].entries())for(const [col,x] of [28,329].entries()){
  const w=183,h=18,text=col?rightText:leftText,color=col?rightColor:leftColor;
  c.fillStyle=alert?'#121928':'#07131f';c.fillRect(x,y-9,w,h);c.strokeStyle=alert&&Math.sin(time*12)>0?color:'#566d7b';c.lineWidth=1;c.strokeRect(x,y-9,w,h);c.save();c.beginPath();c.rect(x+3,y-7,w-6,h-4);c.clip();
  c.globalAlpha=alert?.2:.12;c.fillStyle=color;for(let px=x+5;px<x+w;px+=5)for(let py=y-5;py<y+6;py+=5)c.fillRect(px,py,1,1);c.globalAlpha=1;c.fillStyle=color;
  if(view.cinematic){const span=c.measureText(text).width+30,offset=(time*(alert?36:24)+row*39)%span;for(let px=x+8-offset;px<x+w;px+=span)c.fillText(text,px,y+.5);}
  else{c.textAlign='center';c.fillText(col?'SUBSCRIBE':'PokeFightClub',x+w/2,y+.5,w-12);c.textAlign='left';}
  c.restore();
 }
 c.restore();
}
