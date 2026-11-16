import fs from 'node:fs';
import {createCanvas,Image} from '@napi-rs/canvas';
const manifestPath='dist/assets/pmd/mega-manifest.json',manifest=JSON.parse(fs.readFileSync(manifestPath));
const sources=JSON.parse(fs.readFileSync('dist/assets/sources.json'));
for(const [id,name] of [[3,'venusaur'],[9,'blastoise']]){
 const root=`gba-mega/${name}`,image=new Image();image.src=fs.readFileSync(`dist/assets/${root}/overworld.png`);
 const source=createCanvas(image.width,image.height),s=source.getContext('2d');s.drawImage(image,0,0);
 // GBA sheets store palette index zero as an opaque background colour.
 const pixels=s.getImageData(0,0,image.width,image.height),bg=[...pixels.data.slice(0,3)];
 for(let i=0;i<pixels.data.length;i+=4)if(bg.every((v,j)=>pixels.data[i+j]===v))pixels.data[i+3]=0;
 s.putImageData(pixels,0,0);
 const dir=`pmd/mega-${id}`,anims={};
 for(const state of ['Idle','Walk','Attack','Shoot','Hurt','Sleep','Charge','SpAttack']){
  const sequence=state==='Idle'?[0,1]:state==='Walk'?[0,1,0,1]:['Attack','Shoot','SpAttack'].includes(state)?[0,0,1,1,0,1]:[0,1];
  const frame=64,canvas=createCanvas(frame*sequence.length,frame*8),c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  for(let row=0;row<8;row++)for(let f=0;f<sequence.length;f++){
   // Native GBA pairs: down, up, left; right uses the mirrored left pair.
   const pair=row>=3&&row<=5?2:row===2||row===6?4:0;
   c.save();c.translate(f*frame+32,row*frame+44);if(row===6)c.scale(-1,1);
   c.drawImage(source,(pair+sequence[f])*32,0,32,32,-16,-32,32,32);c.restore();
  }
  const path=`${dir}/${state}-GBA.png`;fs.writeFileSync('dist/assets/'+path,canvas.toBuffer('image/png'));
  anims[state]={name:state,width:frame,height:frame,hit:state==='Attack'?2:1,durations:sequence.map((_,i)=>state==='Idle'?(i?10:32):state==='Walk'?8:6),path};
 }
 for(const [face,column] of [['front',0],['back',2]]){const c=createCanvas(32,32),ctx=c.getContext('2d');ctx.drawImage(source,column*32,0,32,32,0,0,32,32);fs.writeFileSync(`dist/assets/${dir}/${face}-GBA.png`,c.toBuffer('image/png'))}
 manifest['mega-'+id]={anims,baseId:id,form:name+'-mega',source:'pokeemerald-expansion native GBA overworld walking frames; battle actions use these poses with arena choreography',limitedDirections:true,directions:4,portrait:`${dir}/front-GBA.png`,front:`${dir}/front-GBA.png`,back:`${dir}/back-GBA.png`};
 fs.writeFileSync(`dist/assets/${dir}/credits.txt`,'GBA Mega overworld pixel art and native walking frames: rh-hideout/pokeemerald-expansion.\nhttps://github.com/rh-hideout/pokeemerald-expansion/tree/master/graphics/pokemon/'+name+'/mega\nOriginal contributor attribution: https://github.com/rh-hideout/pokeemerald-expansion/blob/master/CREDITS.md\nFour-direction walking poses are sequenced for idle and battle actions; attack motion/effects are provided by this app. No claim of native GBA attack animation.\n');
 for(const file of ['anim_front.png','back.png','overworld.png','normal.pal','overworld_normal.pal']){const path=`${root}/${file}`;if(!sources.some(s=>s.file===path))sources.push({file:path,source:`https://raw.githubusercontent.com/rh-hideout/pokeemerald-expansion/master/graphics/pokemon/${name}/mega/${file}`})}
 console.log('Built transparent native GBA frames:',name);
}
fs.writeFileSync(manifestPath,JSON.stringify(manifest));fs.writeFileSync('dist/assets/sources.json',JSON.stringify(sources,null,2));
