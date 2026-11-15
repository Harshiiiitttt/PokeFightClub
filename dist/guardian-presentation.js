import {applyFormArt} from './form-art.js?v=21';
export function presentGuardian(view,p,enabled){
 p.heroEntrance=enabled;p.presentationFacing=enabled?'front':null;p.direction=enabled?0:4;
 p.el?.classList.toggle('guardian-entrance-hero',enabled);
 if(p.formKey)applyFormArt(view,p,p.formKey);
 else{const img=p.el?.querySelector('img');if(img)view.sprite?.(img,p.id,true,!enabled);}
 p.animKey=null;p.gbaAnimKey=null;
}
// Same 540×960 geometry as the CSS guardian wrappers and their normalized sprite canvas.
export function guardianSpriteRect(p){
 const scale=p.heroEntrance?1.25:p.mega?13/12:1;
 const width=192*scale,height=224*scale;
 return{x:p.pos.x-width/2,y:p.pos.y-height/2,width,height};
}
export function bossSpriteRect(p){
 const widthFraction=p.formKey==='eternamax-890'?.28:p.phase2?.415:.35,heightFraction=p.formKey==='eternamax-890'?.1575:p.phase2?.235:.198;
 const width=192*(540*widthFraction/129.6),height=224*(960*heightFraction/129.6);
 return{x:p.pos.x-width/2,y:p.pos.y-height/2,width,height};
}
