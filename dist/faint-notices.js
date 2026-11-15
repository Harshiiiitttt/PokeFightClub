import {title} from './engine.js?v=21';
export function noteFaint(view,p){if(p.hp>0||p.faintNoticeShown)return;p.faintNoticeShown=true;view.faintNotices??=[];view.faintNotices.push({text:title(p.name||'Pokémon')+' fainted!',until:(view.noticeTime??view.presentationTime??0)+5});}
export function drawFaintNotices(c,view){
 const time=view.noticeTime??view.presentationTime??0;c.clearRect(0,0,540,960);view.faintNotices=(view.faintNotices||[]).filter(n=>n.until>time);
 const hidden=!!view.matchIntro||!!view.phaseTransition||['pose','title','hold'].includes(view.outroState?.phase),shown=hidden?[]:view.faintNotices.slice(-3);
 view.stage?.classList.toggle('faint-active',shown.length>0);if(!shown.length)return;
 c.save();c.textAlign='right';c.textBaseline='middle';c.font='bold 10px monospace';const bottom=view.fighters.some(p=>p.isBoss)?852:730;
 for(let i=0;i<shown.length;i++){const n=shown[shown.length-1-i],y=bottom-i*15,w=Math.min(260,c.measureText(n.text).width+12);c.globalAlpha=Math.min(1,(n.until-time)*2);c.fillStyle='#0a1019dc';c.fillRect(526-w,y-7,w,14);c.fillStyle='#ff6e72';c.fillText(n.text,520,y,248)}
 if(view.faintNotices.length>3){c.fillStyle='#ff9a9d';c.font='9px monospace';c.fillText('+'+(view.faintNotices.length-3)+' more fainted',520,bottom-45)}c.restore();
}
