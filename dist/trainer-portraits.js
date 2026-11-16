import {spriteKey} from './sprite-form.js?v=32';
import {formAssetUrl} from './form-art.js?v=32';
import {spriteCandidates} from './classic-sprites.js?v=32';
export function ensureTrainerPortrait(view,p){
 const form=spriteKey(p),key='hud-portrait-'+form;if(view.images[key])return view.images[key];
 view.trainerPortraitRequests??=new Map();
 if(!view.trainerPortraitRequests.has(key)){
  const art=view.pmd?.[form],sources=[art?.portrait,art?.front,art?.form?`gen5-${art.form}.png`:null,`pmd/${p.id}/portrait.png`,`assets/classic/front/${p.id}.png`,...spriteCandidates(p.id,false,p.name,false)].filter(Boolean).map(formAssetUrl),candidates=[...new Set(sources)];
  view.trainerPortraitRequests.set(key,true);
  const attempt=index=>{if(index>=candidates.length)return;const image=view.load(key,candidates[index]),ready=image.onload;image.onerror=()=>attempt(index+1);image.onload=(...args)=>{ready?.apply(image,args);if(form===String(p.id))view.images['intro-'+p.id]=image;};};attempt(0);
 }
 return view.images['intro-'+p.id];
}
