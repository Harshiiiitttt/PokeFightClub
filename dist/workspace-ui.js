export function arenaDimensions(width,height){const w=Math.max(0,Math.min(width,height*9/16));return{width:w,height:w*16/9}}
export function initWorkspace(doc=document){
 const tabs=[...doc.querySelectorAll('[data-setup-tab]')],panes=[...doc.querySelectorAll('[data-setup-panel]')];
 const select=(key,focus=false)=>{for(const tab of tabs){const chosen=tab.dataset.setupTab===key;tab.setAttribute('aria-selected',String(chosen));tab.tabIndex=chosen?0:-1;if(chosen&&focus)tab.focus()}for(const pane of panes)pane.hidden=pane.dataset.setupPanel!==key;};
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab.dataset.setupTab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();select(tabs[n].dataset.setupTab,true)}})});
 const backdrop=doc.querySelector('#panel-backdrop');let opened=null;
 const close=()=>{doc.body.classList.remove('settings-open','commentary-open');for(const id of ['open-settings','open-commentary'])doc.getElementById(id)?.setAttribute('aria-expanded','false');backdrop.hidden=true;const previous=opened;opened=null;if(previous)doc.getElementById(previous)?.focus()};
 for(const [id,cls] of [['open-settings','settings-open'],['open-commentary','commentary-open']])doc.getElementById(id)?.addEventListener('click',()=>{if(opened===id){close();return}close();opened=id;doc.body.classList.add(cls);doc.getElementById(id).setAttribute('aria-expanded','true');backdrop.hidden=false;doc.getElementById(id==='open-settings'?'close-settings':'close-commentary')?.focus()});
 for(const id of ['close-settings','close-commentary','panel-backdrop'])doc.getElementById(id)?.addEventListener('click',close);
 doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened&&!doc.querySelector('dialog[open]')){close();return}if(e.key==='Tab'&&opened){const panel=doc.getElementById(opened==='open-settings'?'match-settings':'commentary-panel');const controls=[...panel.querySelectorAll('button,input,select,a[href],[tabindex]')].filter(el=>!el.disabled&&!el.closest('[hidden]')&&!(el.hasAttribute('tabindex')&&+el.getAttribute('tabindex')<0));const first=controls[0],last=controls.at(-1);if(!first)return;if(e.shiftKey&&doc.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&doc.activeElement===last){e.preventDefault();first.focus()}}});
 if(typeof window!=='undefined'&&window.matchMedia)for(const query of ['(max-width:850px)','(max-width:1150px)'])window.matchMedia(query).addEventListener?.('change',close);
 const viewport=doc.querySelector('.stage-viewport'),stage=doc.querySelector('#stage');
 if(viewport&&stage&&typeof ResizeObserver==='function'){const observer=new ResizeObserver(entries=>{for(const entry of entries){const {width,height}=arenaDimensions(entry.contentRect.width,entry.contentRect.height);stage.style.width=width+'px';stage.style.height=height+'px';}});observer.observe(viewport);}
 select('teams');return{select,close};
}
if(typeof document!=='undefined')initWorkspace();
