import fs from 'node:fs';
import {parseHTML} from 'linkedom';
import {createCanvas,Image} from '@napi-rs/canvas';
import {ensureGbaSheet} from './dist/pmd-animation.js';
import {megaForms} from './dist/mega.js';
const {document}=parseHTML('<html></html>');globalThis.document=document;
const create=document.createElement.bind(document);document.createElement=tag=>{const e=create(tag);if(tag==='canvas'){const c=createCanvas(1,1);e.native=c;e.getContext=()=>c.getContext('2d');for(const k of ['width','height'])Object.defineProperty(e,k,{get:()=>c[k],set:v=>c[k]=v})}return e};
const paths={'mega-150':'mewtwo/mega_y','mega-254':'sceptile/mega','mega-257':'blaziken/mega','mega-260':'swampert/mega','mega-282':'gardevoir/mega','mega-373':'salamence/mega','mega-376':'metagross/mega','mega-382':'kyogre/primal','mega-383':'groudon/primal','mega-445':'garchomp/mega','mega-800':'necrozma/ultra','origin-483':'dialga/origin','origin-484':'palkia/origin','origin-487':'giratina/origin','complete-718':'zygarde/complete','crowned-888':'zacian/crowned_sword','crowned-889':'zamazenta/crowned_shield','eternamax-890':'eternatus/eternamax'};
const manifest=JSON.parse(fs.readFileSync('dist/assets/pmd/mega-manifest.json')),sources=JSON.parse(fs.readFileSync('dist/assets/sources.json'));
function transparent(path){const img=new Image();img.src=fs.readFileSync(path);const canvas=createCanvas(img.width,img.height),c=canvas.getContext('2d');c.drawImage(img,0,0);const pixels=c.getImageData(0,0,img.width,img.height),bg=[...pixels.data.slice(0,3)];for(let i=0;i<pixels.data.length;i+=4)if(bg.every((v,j)=>pixels.data[i+j]===v))pixels.data[i+3]=0;c.putImageData(pixels,0,0);return canvas}
for(const [key,path] of Object.entries(paths)){
 const id=+key.split('-')[1],sourceDir='dist/assets/form-source/'+key,dir='pmd/'+key;fs.mkdirSync('dist/assets/'+dir,{recursive:true});
 for(const file of fs.readdirSync(sourceDir)){const target='form-source/'+key+'/'+file;if(!sources.some(s=>s.file===target))sources.push({file:target,source:'https://raw.githubusercontent.com/rh-hideout/pokeemerald-expansion/master/graphics/pokemon/'+path+'/'+file})}
 const hasWalk=fs.existsSync(sourceDir+'/overworld.png'),native=hasWalk?transparent(sourceDir+'/overworld.png'):null,cell=native?.height,cols=hasWalk?native.width/cell:0;
 const poses=hasWalk?null:['front','back'].map(face=>{const base=transparent(sourceDir+'/'+face+'.png');return ensureGbaSheet(base,id,face==='back')});
 const anims={};
 for(const state of ['Idle','Walk','Attack','Shoot','Hurt','Sleep','Charge','SpAttack']){
  const sequence=state==='Idle'?[0,1]:state==='Walk'?[0,1,0,1]:['Attack','Shoot','SpAttack'].includes(state)?[0,0,1,1,0,1]:[0,1];
  const def=poses?.[0].anims[state],count=def?.durations.length||sequence.length,frame=96,canvas=createCanvas(frame*count,frame*8),c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  for(let row=0;row<8;row++)for(let f=0;f<count;f++){
   const back=row>=3&&row<=5,pair=back?2:row===2?4:row===6?(cols===8?6:4):0;
   c.save();c.translate(f*frame+48,row*frame+76);if(row===6&&cols===6)c.scale(-1,1);
   if(hasWalk)c.drawImage(native,(pair+sequence[f])*cell,0,cell,cell,-cell/2,-cell,cell,cell);
   else{const pose=poses[back?1:0],a=pose.anims[state];c.drawImage(pose.sheet,f*64,a.row*64,64,64,-32,-64,64,64)}c.restore();
  }
  const output=dir+'/'+state+'-GBA.png';fs.writeFileSync('dist/assets/'+output,canvas.toBuffer('image/png'));anims[state]={name:state,width:frame,height:frame,hit:def?.hit??1,durations:def?.durations||sequence.map((_,i)=>state==='Idle'?(i?10:32):state==='Walk'?8:6),path:output};
 }
 for(const [face,pair] of [['front',0],['back',2]]){const output=hasWalk?createCanvas(cell,cell):transparent(sourceDir+'/'+face+'.png');if(hasWalk)output.getContext('2d').drawImage(native,pair*cell,0,cell,cell,0,0,cell,cell);fs.writeFileSync(`dist/assets/${dir}/${face}-GBA.png`,output.toBuffer('image/png'))}
 manifest[key]={baseId:id,form:megaForms[id]?.[0]||key,anims,front:dir+'/front-GBA.png',back:dir+'/back-GBA.png',portrait:dir+'/front-GBA.png',limitedDirections:true,directions:hasWalk?4:2,frontOnly:key==='eternamax-890',source:hasWalk?'pokeemerald-expansion native GBA transformed-form walking poses; attack choreography supplied by app':'pokeemerald-expansion Eternamax GBA front/back art with app-authored animated pixel poses'};
 fs.writeFileSync('dist/assets/'+dir+'/credits.txt','Transformed-form GBA art: https://github.com/rh-hideout/pokeemerald-expansion/tree/master/graphics/pokemon/'+path+'\nContributor attribution: https://github.com/rh-hideout/pokeemerald-expansion/blob/master/CREDITS.md\nWalking poses are native where available; battle choreography and Eternamax pose sequences are supplied by this app.\n');
 console.log(key,hasWalk?'native '+cols+' poses':'animated front/back GBA poses');
}
fs.writeFileSync('dist/assets/pmd/mega-manifest.json',JSON.stringify(manifest));fs.writeFileSync('dist/assets/sources.json',JSON.stringify(sources,null,2));
await import('./install-native-eternamax.mjs');
