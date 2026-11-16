import {EVOLVED_FORM_KEYS} from './form-art.js?v=32';
import {spriteKey} from './sprite-form.js?v=32';
import {visibleBounds,animationBounds,paintSprite} from './sprite-layout.js?v=32';

export function animationFrame(anim,seconds,loop=true){
 const ds=anim.durations,total=ds.reduce((a,b)=>a+b,0);
 let tick=Math.max(0,seconds*60);
 tick=loop?tick%total:Math.min(tick,total-.001);
 for(let i=0;i<ds.length;i++){if(tick<ds[i])return i;tick-=ds[i]}
 return ds.length-1;
}

export function directionToward(from,to){
 const angle=Math.atan2(to.y-from.y,to.x-from.x);
 return (Math.round((angle-Math.PI/2)/(Math.PI/4))+8)%8;
}

export function loadPmdImages(view){
 view.pendingPmd??=new Set();
 const selected=new Set(view.fighters.flatMap(p=>[spriteKey(p),'mega-'+p.id,EVOLVED_FORM_KEYS[p.id]]));
 for(const [id,p] of Object.entries(view.pmd||{})){
  if(!selected.has(id))continue;
  for(const a of Object.values(p.anims)){
   const key='pmd-'+id+'-'+a.name;
   if(!view.images[key]&&!view.pendingPmd.has(key)){
    view.pendingPmd.add(key);
    view.load(key,/^https:/.test(a.path)?a.path:'assets/'+a.path);
   }
  }
 }
}

const gbaSheetCache=new WeakMap();

export function quantizeToGbaCanvas(image,isBack=false,mirrorBack=false){
 const rawImg=image._native||image.native||image;
 const sw=rawImg.naturalWidth||rawImg.width||image.naturalWidth||image.width||0,sh=rawImg.naturalHeight||rawImg.height||image.naturalHeight||image.height||0;
 if(!sw||!sh||typeof document==='undefined')return null;
 const sb=visibleBounds(rawImg,{x:0,y:0,width:sw,height:sh});
 const outEl=document.createElement('canvas');
 outEl.width=64;outEl.height=64;
 const out=outEl.native||outEl;
 const ctx=out.getContext('2d',{willReadFrequently:true});
 if(!ctx)return null;
 ctx.imageSmoothingEnabled=false;
 ctx.clearRect(0,0,64,64);
 const maxDim=Math.max(1,sb.width,sb.height);
 const targetSpan=Math.min(50,maxDim);
 const scale=targetSpan/maxDim;
 const dw=Math.max(1,Math.round(sb.width*scale)),dh=Math.max(1,Math.round(sb.height*scale));
 const dx=Math.floor((64-dw)/2),dy=Math.floor(57-dh);
 if(mirrorBack){
  ctx.save();
  ctx.translate(64,0);
  ctx.scale(-1,1);
  ctx.drawImage(rawImg,sb.x,sb.y,sb.width,sb.height,64-dx-dw,dy,dw,dh);
  ctx.restore();
 }else{
  ctx.drawImage(rawImg,sb.x,sb.y,sb.width,sb.height,dx,dy,dw,dh);
 }
 let imgData;
 try{imgData=ctx.getImageData(0,0,64,64)}catch{return null}
 if(!imgData?.data)return null;
 const d=imgData.data;
 let anyOpaque=false;
 for(let i=0;i<d.length;i+=4){
  if(d[i+3]<96){
   d[i]=0;d[i+1]=0;d[i+2]=0;d[i+3]=0;
  }else{
   anyOpaque=true;
   let r=d[i],g=d[i+1],b=d[i+2];
   if(mirrorBack){
    r=Math.max(0,Math.round(r*.88));
    g=Math.max(0,Math.round(g*.88));
    b=Math.max(0,Math.round(b*.92));
   }
   d[i]=(r>>3)<<3;
   d[i+1]=(g>>3)<<3;
   d[i+2]=(b>>3)<<3;
   d[i+3]=255;
  }
 }
 if(!anyOpaque)return null;

 // Reinforce crisp 1px dark GBA outline around bright boundary pixels (e.g. modern renders)
 const copy=new Uint8ClampedArray(d);
 for(let y=0;y<64;y++){
  for(let x=0;x<64;x++){
   const idx=(y*64+x)*4;
   if(!copy[idx+3])continue;
   const isEdge=x===0||x===63||y===0||y===63||!copy[((y-1)*64+x)*4+3]||!copy[((y+1)*64+x)*4+3]||!copy[(y*64+x-1)*4+3]||!copy[(y*64+x+1)*4+3];
   if(isEdge&&(copy[idx]+copy[idx+1]+copy[idx+2])>260){
    d[idx]=24;d[idx+1]=24;d[idx+2]=32;d[idx+3]=255;
   }
  }
 }

 // Cap to <= 15 GBA colors
 const counts=new Map();
 for(let i=0;i<d.length;i+=4){
  if(!d[i+3])continue;
  const k=`${d[i]},${d[i+1]},${d[i+2]}`;
  counts.set(k,(counts.get(k)||0)+1);
 }
 if(counts.size>15){
  const sorted=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,15).map(([k])=>k.split(',').map(Number));
  for(let i=0;i<d.length;i+=4){
   if(!d[i+3])continue;
   let best=sorted[0],bestDist=Infinity;
   for(const c of sorted){
    const dr=d[i]-c[0],dg=d[i+1]-c[1],db=d[i+2]-c[2],dist=dr*dr+dg*dg+db*db;
    if(dist<bestDist){bestDist=dist;best=c}
   }
   d[i]=best[0];d[i+1]=best[1];d[i+2]=best[2];
  }
 }
 ctx.putImageData(imgData,0,0);
 return {canvas:out,imageData:imgData,bounds:visibleBounds(out,{x:0,y:0,width:64,height:64})};
}

function renderGbaPoseFrame(targetCtx,baseData,bounds,frameX,frameY,pose){
 const out=targetCtx.createImageData(64,64);
 const src=baseData.data,dst=out.data;
 const splitY=Math.round(bounds.y+bounds.height*.58);
 const midX=Math.round(bounds.x+bounds.width*.5);
 const wingMargin=Math.max(3,Math.round(bounds.width*.22));
 for(let sy=0;sy<64;sy++){
  const isUpper=sy<splitY;
  for(let sx=0;sx<64;sx++){
   const sIdx=(sy*64+sx)*4;
   if(!src[sIdx+3])continue;
   let dx=0,dy=0;
   if(isUpper){
    const isWing=sx<bounds.x+wingMargin||sx>=bounds.x+bounds.width-wingMargin;
    dx=pose.upperDx||0;
    dy=(pose.upperDy||0)+(isWing?(pose.wingDy||0):0);
   }else if(sx<midX){
    dx=pose.leftLegDx||0;
    dy=pose.leftLegDy||0;
   }else{
    dx=pose.rightLegDx||0;
    dy=pose.rightLegDy||0;
   }
   const tx=Math.max(0,Math.min(63,sx+dx)),ty=Math.max(0,Math.min(63,sy+dy));
   const dIdx=(ty*64+tx)*4;
   dst[dIdx]=src[sIdx];
   dst[dIdx+1]=src[sIdx+1];
   dst[dIdx+2]=src[sIdx+2];
   dst[dIdx+3]=255;
  }
 }
 targetCtx.putImageData(out,frameX,frameY);
}

export function ensureGbaSheet(image,id,isBack=false,mirrorBack=false){
 if(!image)return null;
 let byKey=gbaSheetCache.get(image);
 if(!byKey){byKey=new Map();gbaSheetCache.set(image,byKey)}
 const cacheKey=`${id}-${isBack?'back':'front'}-${mirrorBack?'1':'0'}-${image.src||''}-${image.naturalWidth||image.width||0}`;
 if(byKey.has(cacheKey))return byKey.get(cacheKey);

 const base=quantizeToGbaCanvas(image,isBack,mirrorBack);
 if(!base)return null;

 const fDir=isBack?-1:1,xDir=isBack?1:-1;
 const stateDefs={
  Idle:{
   row:0,hit:1,durations:[18,12,18,12],
   poses:[
    {upperDx:0,upperDy:0,wingDy:0,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0},
    {upperDx:0,upperDy:1,wingDy:1,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0},
    {upperDx:0,upperDy:-1,wingDy:-2,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0},
    {upperDx:xDir,upperDy:0,wingDy:-1,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0}
   ]
  },
  Walk:{
   row:1,hit:1,durations:[7,7,7,7],
   poses:[
    {upperDx:-1,upperDy:-2,wingDy:-1,leftLegDx:-1,leftLegDy:-2,rightLegDx:1,rightLegDy:0},
    {upperDx:-1,upperDy:0,wingDy:1,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:-1},
    {upperDx:1,upperDy:-2,wingDy:-1,leftLegDx:-1,leftLegDy:0,rightLegDx:1,rightLegDy:-2},
    {upperDx:1,upperDy:0,wingDy:1,leftLegDx:0,leftLegDy:-1,rightLegDx:0,rightLegDy:0}
   ]
  },
  Attack:{
   row:2,hit:2,durations:[5,5,6,6,5,5],
   poses:[
    {upperDx:-xDir*2,upperDy:-fDir+1,wingDy:1,leftLegDx:-xDir,leftLegDy:0,rightLegDx:0,rightLegDy:0},
    {upperDx:-xDir*3,upperDy:-fDir*2+2,wingDy:2,leftLegDx:-xDir,leftLegDy:0,rightLegDx:-xDir,rightLegDy:0},
    {upperDx:xDir*4,upperDy:fDir*3-2,wingDy:-2,leftLegDx:xDir*2,leftLegDy:fDir-1,rightLegDx:xDir,rightLegDy:0},
    {upperDx:xDir*3,upperDy:fDir*2-1,wingDy:-1,leftLegDx:xDir,leftLegDy:0,rightLegDx:xDir,rightLegDy:0},
    {upperDx:xDir,upperDy:1,wingDy:1,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0},
    {upperDx:0,upperDy:0,wingDy:0,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0}
   ]
  },
  Shoot:{
   row:3,hit:2,durations:[5,6,7,6,5,5],
   poses:[
    {upperDx:0,upperDy:2,wingDy:1,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0},
    {upperDx:-xDir,upperDy:2,wingDy:2,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0},
    {upperDx:xDir*3,upperDy:-3,wingDy:-3,leftLegDx:0,leftLegDy:-1,rightLegDx:0,rightLegDy:-1},
    {upperDx:xDir*2,upperDy:-2,wingDy:-2,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0},
    {upperDx:-xDir*2,upperDy:1,wingDy:1,leftLegDx:-xDir,leftLegDy:0,rightLegDx:0,rightLegDy:0},
    {upperDx:0,upperDy:0,wingDy:0,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0}
   ]
  },
  Hurt:{
   row:4,hit:1,durations:[5,5,6,6],
   poses:[
    {upperDx:-xDir*4,upperDy:2,wingDy:2,leftLegDx:-xDir*2,leftLegDy:1,rightLegDx:-xDir*2,rightLegDy:1},
    {upperDx:xDir*3,upperDy:1,wingDy:-1,leftLegDx:xDir,leftLegDy:0,rightLegDx:xDir,rightLegDy:0},
    {upperDx:-xDir*2,upperDy:2,wingDy:1,leftLegDx:-xDir,leftLegDy:0,rightLegDx:-xDir,rightLegDy:0},
    {upperDx:0,upperDy:1,wingDy:0,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0}
   ]
  },
  Sleep:{
   row:5,hit:1,durations:[30,30],
   poses:[
    {upperDx:-1,upperDy:3,wingDy:2,leftLegDx:0,leftLegDy:1,rightLegDx:0,rightLegDy:1},
    {upperDx:0,upperDy:4,wingDy:3,leftLegDx:0,leftLegDy:1,rightLegDx:0,rightLegDy:1}
   ]
  },
  Charge:{
   row:6,hit:1,durations:[4,4,4,4],
   poses:[
    {upperDx:-2,upperDy:2,wingDy:1,leftLegDx:-1,leftLegDy:0,rightLegDx:-1,rightLegDy:0},
    {upperDx:2,upperDy:1,wingDy:-2,leftLegDx:1,leftLegDy:0,rightLegDx:1,rightLegDy:0},
    {upperDx:-1,upperDy:-1,wingDy:-3,leftLegDx:0,leftLegDy:-1,rightLegDx:0,rightLegDy:-1},
    {upperDx:1,upperDy:2,wingDy:1,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0}
   ]
  },
  SpAttack:{
   row:7,hit:2,durations:[5,6,7,6,5,5],
   poses:[
    {upperDx:0,upperDy:2,wingDy:1,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0},
    {upperDx:-xDir,upperDy:2,wingDy:2,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0},
    {upperDx:xDir*3,upperDy:-3,wingDy:-3,leftLegDx:0,leftLegDy:-1,rightLegDx:0,rightLegDy:-1},
    {upperDx:xDir*2,upperDy:-2,wingDy:-2,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0},
    {upperDx:-xDir*2,upperDy:1,wingDy:1,leftLegDx:-xDir,leftLegDy:0,rightLegDx:0,rightLegDy:0},
    {upperDx:0,upperDy:0,wingDy:0,leftLegDx:0,leftLegDy:0,rightLegDx:0,rightLegDy:0}
   ]
  }
 };

 const sheetEl=document.createElement('canvas');
 sheetEl.width=64*6;sheetEl.height=64*8;
 const sheet=sheetEl.native||sheetEl;
 const sctx=sheet.getContext('2d',{willReadFrequently:true});
 sctx.imageSmoothingEnabled=false;
 const anims={};
 for(const [name,def] of Object.entries(stateDefs)){
  def.poses.forEach((pose,f)=>renderGbaPoseFrame(sctx,base.imageData,base.bounds,f*64,def.row*64,pose));
  anims[name]={name,row:def.row,width:64,height:64,hit:def.hit,durations:def.durations};
 }
 const entry={sheet,anims,bounds:base.bounds,baseCanvas:base.canvas};
 byKey.set(cacheKey,entry);
 return entry;
}

export function gbaState(view,p,fallback){
 const raw=fallback?._native||fallback?.native||fallback;
 const width=raw?.naturalWidth||raw?.width||fallback?.naturalWidth||fallback?.width||0;
 const height=raw?.naturalHeight||raw?.height||fallback?.naturalHeight||fallback?.height||0;
 if(!width||!height)return null;
 const isBack=view.pmd?.[p.formKey]?.frontOnly?false:p.presentationFacing?p.presentationFacing==='back':p.trainerDuel?(fallback?.dataset?.facing==='back'):p.team===1||(fallback?.dataset?.facing==='back');
 const mirrorBack=fallback?.dataset?.mirrorBack==='1';
 const gba=ensureGbaSheet(fallback,p.id,isBack,mirrorBack);
 if(!gba)return null;
 let name=p.hp<=0?(view.clock>=(p.faintAt||0)?'Sleep':'Hurt'):p.hitUntil>view.clock?'Hurt':p.action||(p.charge?'Charge':p.motion?'Walk':'Idle');
 const anim=gba.anims[name]||gba.anims.Idle;
 const key='gba-'+name+'-'+(isBack?'back':'front')+'-'+p.id;
 if(p.gbaAnimKey!==key){p.gbaAnimKey=key;p.gbaAnimStart=view.clock||0}
 const frame=animationFrame(anim,((view.clock||0)-(p.gbaAnimStart||0))*(p.trainerDuel&&['Attack','Shoot','SpAttack'].includes(name)?p.duelAnimRate||1:1),!['Attack','Shoot','SpAttack','Hurt'].includes(name));
 return {anim,image:gba.sheet,row:anim.row,frame,bounds:gba.bounds};
}

export function pmdState(view,p){
 const rawForm=spriteKey(p),form=p.formKey|| (view.pmd?.[rawForm]?.anims?rawForm:String(p.id)),anims=view.pmd?.[form]?.anims;
 if((view.style==='gba'&&!p.mega&&!p.transformed)||!anims)return null;
 let name=p.hp<=0?(view.clock>=(p.faintAt||0)?'Sleep':'Hurt'):p.hitUntil>view.clock?'Hurt':p.action||(p.charge?'Charge':p.motion?'Walk':'Idle');
 if(!anims[name])name=name==='Shoot'?'SpAttack':name==='Charge'?'SpAttack':'Idle';
 const anim=anims[name]||anims.Idle||anims.Walk;if(!anim)return null;
 const image=view.images['pmd-'+form+'-'+anim.name];if(!image)return null;
 let row=view.pmd?.[form]?.frontOnly?0:p.direction??(p.team===0?0:4);
 if(image.height<anim.height*8)row=0;
 else if(!view.pmd?.[form]?.limitedDirections)row=(8-row)%8;
 const key=anim.name+'-'+row+'-'+form;if(p.animKey!==key){p.animKey=key;p.animStart=view.clock}
 return{anim,image,row,frame:animationFrame(anim,(view.clock-p.animStart)*(p.trainerDuel&&['Attack','Shoot','SpAttack'].includes(name)?p.duelAnimRate||1:1),!['Attack','Shoot','SpAttack','Hurt'].includes(name)),form};
}

function drawAshGreninjaForm(canvas,clock){
 const c=canvas.getContext('2d'),cx=canvas.width/2,top=Number(canvas.dataset.bodyTop||-30),bh=Number(canvas.dataset.bodyHeight||56),cy=canvas.height/2+top+bh*.46,r=Math.max(22,bh*.56);
 c.save();
 // Subtle crimson-black Battle Bond tint over the head/crest pixels only.
 c.globalCompositeOperation='source-atop';
 const crest=c.createLinearGradient(0,canvas.height/2+top,0,canvas.height/2+top+bh*.42);
 crest.addColorStop(0,'rgba(215,38,68,.32)');crest.addColorStop(1,'rgba(215,38,68,0)');
 c.fillStyle=crest;c.fillRect(cx-r,canvas.height/2+top,r*2,bh*.45);
 // Giant spinning crimson-cyan Water Shuriken & Bond aura behind Greninja's back.
 c.globalCompositeOperation='destination-over';
 const aura=c.createRadialGradient(cx,cy,r*.2,cx,cy,r*1.25);
 aura.addColorStop(0,'rgba(85,225,255,.42)');aura.addColorStop(.65,'rgba(225,60,95,.2)');aura.addColorStop(1,'rgba(85,225,255,0)');
 c.fillStyle=aura;c.beginPath();c.arc(cx,cy,r*1.25,0,Math.PI*2);c.fill();
 c.translate(cx,cy);c.rotate(clock*3.8);
 for(let i=0;i<4;i++){
  c.rotate(Math.PI/2);
  c.fillStyle='rgba(75,215,255,.88)';c.strokeStyle='rgba(235,252,255,.95)';c.lineWidth=1.4;
  c.beginPath();c.moveTo(0,-4);c.quadraticCurveTo(r*.55,-r*.28,r,0);c.quadraticCurveTo(r*.45,r*.22,0,4);c.closePath();c.fill();c.stroke();
 }
 c.fillStyle='rgba(255,82,112,.92)';c.beginPath();c.arc(0,0,r*.22,0,Math.PI*2);c.fill();
 c.fillStyle='#ffffff';c.beginPath();c.arc(0,0,r*.1,0,Math.PI*2);c.fill();
 c.restore();
}
export function drawPmd(view,p){
 const canvas=p.el.querySelector('canvas');if(!canvas)return;
 const fallback=p.el.querySelector('img');if(fallback?.style)fallback.style.display='none';
 const isRaid=!!view.fighters?.some(x=>x.isBoss)&&!p.isGuardian,megaScale=((isRaid&&!!p.mega)||!!p.phase2)&&!p.isGuardian;
 const state=pmdState(view,p);
 if(!state){
  const gba=gbaState(view,p,fallback);
  if(gba){
   canvas.style.display='block';
   const {anim,image,row,frame,bounds}=gba;
   paintSprite(canvas,image,{x:frame*anim.width,y:row*anim.height,width:anim.width,height:anim.height},p.id,bounds,bounds,megaScale,isRaid);
   if(p.ashGreninja)drawAshGreninjaForm(canvas,view.clock||0);
   return;
  }
  const width=fallback.naturalWidth||fallback.width||0,height=fallback.naturalHeight||fallback.height||0;
  if(!width||!height){canvas.style.display='none';return}
  canvas.style.display='block';
  const rect={x:0,y:0,width,height},bounds=visibleBounds(fallback,rect);
  paintSprite(canvas,fallback,rect,p.id,bounds,bounds,megaScale,isRaid);
  if(p.ashGreninja)drawAshGreninjaForm(canvas,view.clock||0);
  return;
 }
 canvas.style.display='block';
 const {anim,image,row,frame,form}=state,pose=animationBounds(image,anim,row),idle=view.pmd[form].anims.Idle||view.pmd[form].anims.Walk,idleImage=view.images['pmd-'+form+'-'+idle.name];
 let reference=pose;
 if(idleImage){
  const front=animationBounds(idleImage,idle,0),back=animationBounds(idleImage,idle,idleImage.height>=idle.height*8?4:0);
  reference={x:0,y:0,width:Math.max(front.width,back.width),height:Math.max(front.height,back.height)};
 }
 paintSprite(canvas,image,{x:frame*anim.width,y:row*anim.height,width:anim.width,height:anim.height},p.id,reference,pose,megaScale,isRaid);
 if(p.ashGreninja)drawAshGreninjaForm(canvas,view.clock||0);
}
