import fs from 'node:fs/promises';
import {createCanvas,loadImage} from '@napi-rs/canvas';
for(const face of ['front','back']){
 const file=`dist/assets/classic/${face}/815.png`,original=await fs.readFile(file),image=await loadImage(original);if(image.width===64&&image.height===64)continue;
 await fs.mkdir('dist/assets/classic/source/815',{recursive:true});await fs.writeFile(`dist/assets/classic/source/815/${face}.png`,original);
 const source=createCanvas(image.width,image.height),s=source.getContext('2d');s.drawImage(image,0,0);const pixels=s.getImageData(0,0,image.width,image.height).data;let left=image.width,top=image.height,right=-1,bottom=-1;
 for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++)if(pixels[(y*image.width+x)*4+3]>12){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 if(right<left)throw Error('Empty Cinderace fallback '+face);const w=right-left+1,h=bottom-top+1,scale=56/Math.max(w,h),dw=Math.round(w*scale),dh=Math.round(h*scale),canvas=createCanvas(64,64),c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(image,left,top,w,h,Math.floor((64-dw)/2),60-dh,dw,dh);await fs.writeFile(file,canvas.toBuffer('image/png'));
 console.log('Normalized Cinderace '+face+' fallback to 64×64; native animation pack unchanged.');
}
