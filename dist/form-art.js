export const EVOLVED_FORM_KEYS={3:'mega-3',6:'mega-6',9:'mega-9',94:'mega-94',150:'mega-150',254:'mega-254',257:'mega-257',260:'mega-260',282:'mega-282',373:'mega-373',376:'mega-376',382:'mega-382',383:'mega-383',384:'mega-384',445:'mega-445',448:'mega-448',483:'origin-483',484:'origin-484',487:'origin-487',718:'complete-718',800:'mega-800',888:'crowned-888',889:'crowned-889',890:'eternamax-890'};
export const BOSS_FORM_KEYS={384:'mega-384',718:'complete-718',800:'mega-800',890:'eternamax-890'};
export function formAssetUrl(path){return /^(assets\/|https?:)/.test(path)?path:'assets/'+path}
export function applyFormArt(view,p,key=EVOLVED_FORM_KEYS[p.id]){
 const art=view.pmd?.[key];if(!key||!art)return false;
 Object.assign(p,{formKey:key,transformed:true,animKey:null,gbaAnimKey:null});
 p.el?.classList.toggle('eternamax-form',key==='eternamax-890');
 view.loadPmd?.();
 const img=p.el?.querySelector('img'),back=art.frontOnly?false:p.presentationFacing?p.presentationFacing==='back':p.team===1;
 if(img){img.onerror=null;if(art[back?'back':'front'])img.src=formAssetUrl(art[back?'back':'front']);img.alt=p.name;img.dataset.facing=back?'back':'front';img.dataset.form=key;}
 const hud=typeof document==='undefined'?null:document.getElementById('hud-'+p.uid);
 if(hud){hud.dataset.form=key;hud.dataset.species=String(p.id);const portrait=hud.querySelector('img');if(portrait&&art.portrait){portrait.onerror=null;portrait.src=formAssetUrl(art.portrait);portrait.alt=p.name;portrait.dataset.form=key;portrait.dataset.species=String(p.id);}}
 return true;
}
