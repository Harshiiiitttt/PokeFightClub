import {playRaidOutro} from './raid-outro.js?v=21';
import {openingExpired,raidWaitDuration} from './raid-pacing.js?v=21';
import {applyFormArt,EVOLVED_FORM_KEYS,formAssetUrl} from './form-art.js?v=21';
import {playGuardianEntrance} from './guardian-entrance.js?v=21';
import {arenaCatalog} from './arena-catalog.js?v=21';
import {ensurePmd} from './pmd-loader.js?v=21';
import {spriteCandidates} from './classic-sprites.js?v=21';
import {choreograph,choreographRaidWave,choreographAct2Wave,choreographArmyWave,triggerBossPhase2} from './choreography.js?v=21';
import {formationFor} from './formation.js?v=21';
import {megaColors} from './evolution-fx.js?v=21';
import {megaForms} from './mega.js?v=21';
import {title,colors,movesFor,createFighter,chooseAttack} from './engine.js?v=21';
import {BattleView} from './battle-view.js?v=21';
import {BattleAudio} from './battle-audio.js?v=21';
import {resolveSpeciesData,speciesMeta,EVOLUTION_CHAINS} from './species-db.js?v=21';
import {
  MODE_CATALOG,
  FUTURE_FORMS,
  GUARDIAN_AWAKENINGS,
  DEFAULT_SAVED_PRESETS,
  pickGuardianTrio,
  buildMatchupTeams,
  createTournament,
  findNextTournamentMatch,
  recordTournamentMatch,
  simulateMatchInstant
} from './battle-modes.js?v=21';
import {RecordingStudio} from './recording-studio.js?v=21';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function setVal(el,val){if(!el)return;try{el.value=val}catch{}const opts=[...(el.querySelectorAll?.('option')||[])];for(const o of opts)o.removeAttribute('selected');const hit=opts.find(o=>o.value===String(val));if(hit){hit.selected=true;hit.setAttribute('selected','')}}
let cache={},roster=[],teams=[[144,145,146],[243,244,245]],arena='stadium',fighters=[],running=false,paused=false,done=false,speed=1,cinematic=!matchMedia('(prefers-reduced-motion: reduce)').matches,sound=true,round=0,runId=0,seed=1,startSeed=1,rng,lastTime=0,elapsed=0,selectSlot=[0,0],filter='featured',limit=60,pickerBusy=false;
let currentMode='classic',currentMatchup='',battleRules='natural',battleFormat='simultaneous',seriesLength=1,seriesScore=[0,0],seriesGame=1,modeTitles=['',''],customTitles=['',''],totalDamageDealt=0,savedPresets=[...DEFAULT_SAVED_PRESETS],battleHistory=[],tournament=null;

const featured=[144,145,146,243,244,245,6,9,3,25,94,149,150,151,249,250,254,257,260,282,373,376,382,383,384,445,448,483,484,487,643,644,646,658,716,717,791,792,800,888,889,890];
const view=new BattleView($('#stage'),setImage),audioEngine=new BattleAudio(message=>{$('#playback-label').textContent=message;$('#audio-status').textContent=message;$('#audio-status').hidden=false;});
const studio=new RecordingStudio(view,$('#stage'),msg=>{const el=$('#studio-status');if(el){el.textContent=msg;el.hidden=!msg;}});
let visualRng=Math.random;
const names=Object.fromEntries(Object.entries(arenaCatalog).map(([id,a])=>[id,a.name]));

function randomSeed(){return crypto.getRandomValues(new Uint32Array(1))[0]}
function seeded(s){return ()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}

function setImage(img,id,battle=false,back=false){
  img.crossOrigin='anonymous';
  const name=cache[id]?.name||roster.find(p=>p.id===id)?.name;
  const isFeatured=featured.includes(id);
  const candidates=spriteCandidates(id,battle&&back,name,isFeatured);
  const frontFallback=battle&&back?spriteCandidates(id,false,name,isFeatured):[];
  const localFallback=`assets/classic/${battle&&back?'back':'front'}/${id}.png`;
  let index=0,frontIndex=0;
  img.dataset.facing=battle&&back?'back':'front';
  delete img.dataset.mirrorBack;
  img.onerror=()=>{
    if(++index<candidates.length)img.src=candidates[index];
    else if(frontIndex<frontFallback.length){
      img.dataset.mirrorBack='1';
      img.src=frontFallback[frontIndex++];
    }
    else if(!img.src.endsWith(localFallback))img.src=localFallback;
    else{img.onerror=null;img.src='assets/missing-mon.svg';img.alt=title(name||'Pokémon')+' (sprite unavailable)';}
  };
  img.src=candidates[0];
}

async function data(id){
  if(cache[id])return cache[id];
  try{
    const saved=JSON.parse(localStorage.getItem('bt-pokemon-'+id)||'null');
    if(saved){cache[id]=saved;return saved}
  }catch{}
  try{
    const r=await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`,{signal:AbortSignal.timeout(4500)});
    if(r.ok){
      const p=await r.json(),d={id:p.id,name:p.name,types:p.types.map(x=>x.type.name),stats:p.stats.map(x=>x.base_stat),moves:p.moves.map(x=>x.move.name)};
      cache[id]=d;
      try{localStorage.setItem('bt-pokemon-'+id,JSON.stringify(d))}catch{}
      return d;
    }
  }catch{}
  return resolveSpeciesData(id,cache,roster);
}

function ensureTeamData(){
  for(const id of teams.flat())resolveSpeciesData(id,cache,roster);
  if(view?.pmd){
    for(const id of new Set(teams.flat()))ensurePmd(view,id);
  }
}

function syncCustomTitles(){
  if(currentMode==='eternatus-raid'&&teams[0]?.[0]){const id=teams[0][0];modeTitles[0]='BOSS '+title(cache[id]?.name||roster.find(p=>p.id===id)?.name||'Pokémon');}
  const tA=customTitles[0]?.trim()||modeTitles[0]?.trim()||'';
  const tB=customTitles[1]?.trim()||modeTitles[1]?.trim()||'';
  view.customTeamNames=(tA||tB)?[tA||'TEAM EMERALD',tB||'TEAM CRIMSON']:null;
  const hA=$('#team-a-heading'),hB=$('#team-b-heading'),cA=$('#team-a-count'),cB=$('#team-b-count');
  if(hA)hA.textContent=tA||'TEAM EMERALD';
  if(hB)hB.textContent=tB||'TEAM CRIMSON';
  if(cA)cA.textContent=currentMode==='eternatus-raid'&&teams[0].length===1?'RAID BOSS':`${teams[0].length} POKÉMON`;
  if(cB)cB.textContent=currentMode==='eternatus-raid'&&teams[1].length===1?'RAID BOSS':`${teams[1].length} POKÉMON`;
}

function renderTeams(){
  ensureTeamData();
  syncCustomTitles();
  teams.forEach((team,t)=>{
    const container=$('#team-'+(t?'b':'a'));
    const visibleSlots=team.slice(0,6);
    const nodes=visibleSlots.map((id,s)=>{
      const b=document.createElement('button');
      b.className='team-slot';
      b.disabled=running;
      b.setAttribute('aria-label',`Replace ${title(cache[id]?.name||'Pokémon')} on Team ${t?'Crimson':'Emerald'}`);
      const img=document.createElement('img');
      img.alt='';
      setImage(img,id,false);
      const info=document.createElement('span');
      const strong=document.createElement('strong');
      strong.textContent=title(cache[id]?.name||roster.find(p=>p.id===id)?.name||'Pokémon');
      const small=document.createElement('small');
      small.textContent=(team.length===1&&currentMode==='eternatus-raid')?'BOSS · '+cache[id]?.types.join(' / '):cache[id]?.types.join(' / ')||'SELECTED';
      info.append(strong,small);
      const edit=document.createElement('span');
      edit.className='edit';
      edit.textContent='＋';
      b.append(img,info,edit);
      b.onclick=()=>openPicker(t,s);
      return b;
    });
    if(team.length>6){
      const badge=document.createElement('div');
      badge.className='team-more-badge';
      badge.textContent=`+${team.length-6} MORE IN ${battleFormat==='reinforcements'?'RESERVE BENCH':'BATTALION'}`;
      nodes.push(badge);
    }
    container.replaceChildren(...nodes);
  });
}

function saveTeams(){
  if(currentMode==='classic'){
    try{localStorage.setItem('bt-reference-teams',JSON.stringify(teams))}catch{}
  }
}

function buildFightersList(){
  ensureTeamData();
  const isDefaultClassic=currentMode==='classic'&&battleRules==='natural'&&teams.every(t=>t.length===3);
  if(isDefaultClassic){
    return teams.flatMap((team,t)=>team.map((id,s)=>Object.assign(createFighter(cache[id],t,s),{bundled:featured.includes(id)})));
  }
  const isRaid=currentMode==='eternatus-raid';
  const useReinforcements=battleFormat==='reinforcements'&&(teams[0].length>3||teams[1].length>3);
  const challengerCount=isRaid?Math.max(teams[0].length,teams[1].length):teams[0].length;
  return teams.flatMap((team,t)=>team.map((id,s)=>{
    const isBoss=isRaid&&t===0&&team.length===1;
    const isReserve=useReinforcements&&!isBoss&&s>=3;
    const slot=useReinforcements&&!isBoss?s%3:s;
    return Object.assign(
      createFighter(cache[id],t,slot,{rules:battleRules,reserve:isReserve,bossRaid:isBoss,challengerCount,uidIndex:s}),
      {bundled:featured.includes(id)}
    );
  }));
}

function openPicker(t,s){
  selectSlot=[t,s];
  filter=currentMode==='legendary-clash'?'legendary':currentMode==='starter-showdown'?'starters':'featured';
  limit=60;
  $('#search').value='';
  if($('#filter-region'))setVal($('#filter-region'),'all');
  if($('#filter-type'))setVal($('#filter-type'),'all');
  if($('#filter-stage'))setVal($('#filter-stage'),'all');
  $('#picker-context').textContent=`${t?'CRIMSON':'EMERALD'} / SLOT ${s+1}`;
  $$('.picker-filters button').forEach(b=>b.classList.toggle('selected',b.dataset.filter===filter));
  renderPicker();
  const dlg=$('#picker');if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');
  $('#search').focus?.();
}

function renderPicker(){
  const q=$('#search').value.trim().toLowerCase().replaceAll(' ','-').replace('#','');
  const regionFilter=$('#filter-region')?.value||'all';
  const typeFilter=$('#filter-type')?.value||'all';
  const stageFilter=$('#filter-stage')?.value||'all';
  const hasAdvanced=regionFilter!=='all'||typeFilter!=='all'||stageFilter!=='all';
  const found=roster.filter(p=>{
    const meta=speciesMeta(p.id,cache,roster);
    const matchTab=q||hasAdvanced||filter==='all'||(filter==='featured'&&featured.includes(p.id))||(filter==='starters'&&meta.starter)||(filter==='legendary'&&meta.legendary);
    if(!matchTab)return false;
    if(q&&!p.name.includes(q)&&String(p.id)!==q)return false;
    if(regionFilter!=='all'&&meta.region!==regionFilter)return false;
    if(typeFilter!=='all'&&!meta.types.includes(typeFilter))return false;
    if(stageFilter!=='all'&&meta.stage!==stageFilter)return false;
    return true;
  });
  $('#result-count').textContent=`${found.length} Pokémon · ${Math.min(limit,found.length)} shown`;
  $('#more').hidden=found.length<=limit;
  $('#pokemon-grid').replaceChildren(...found.slice(0,limit).map(p=>{
    const meta=speciesMeta(p.id,cache,roster);
    const b=document.createElement('button');
    b.className='pokemon-card';
    b.disabled=pickerBusy;
    const img=document.createElement('img');
    img.alt='';
    img.loading='lazy';
    setImage(img,p.id,false);
    const n=document.createElement('strong');
    n.textContent=title(p.name);
    const no=document.createElement('small');
    no.textContent=(megaForms[p.id]?'Mega · ':FUTURE_FORMS[p.id]?'Form · ':'')+'#'+String(p.id).padStart(4,'0')+' · '+meta.region.toUpperCase();
    b.append(img,n,no);
    b.onclick=async()=>{
      if(pickerBusy)return;
      const [t,s]=selectSlot;
      if(teams[t].includes(p.id)&&teams[t][s]!==p.id){$('#picker-context').textContent='Already on this team';return}
      pickerBusy=true;
      b.textContent='Loading…';
      try{
        await data(p.id);
        await ensurePmd(view,p.id);
        teams[t][s]=p.id;
        saveTeams();
        const dlg=$('#picker');if(dlg.close)dlg.close();else dlg.removeAttribute('open');
        renderTeams();
        resetPreview();
      }catch(e){
        $('#picker-context').textContent='Load failed — check connection';
      }finally{
        pickerBusy=false;
        renderPicker();
      }
    };
    return b;
  }));
  if(!found.length){
    const p=document.createElement('p');
    p.className='picker-error';
    p.textContent='No Pokémon found. Try another filter or name.';
    $('#pokemon-grid').append(p);
  }
}

function updateSeriesBanner(){
  const banner=$('#series-status');
  if(!banner)return;
  if(seriesLength<=1){
    banner.hidden=true;
    return;
  }
  banner.hidden=false;
  const maxWins=Math.ceil(seriesLength/2);
  const champ=seriesScore[0]>=maxWins?view.teamName(0):seriesScore[1]>=maxWins?view.teamName(1):null;
  banner.textContent=champ
    ?`SERIES COMPLETE · ${champ} WINS (${seriesScore[0]}–${seriesScore[1]})`
    :`BEST OF 3 SERIES · ${seriesScore[0]}–${seriesScore[1]} · GAME ${seriesGame}`;
}

function prepareMatchIntro(){
  const lineups=teams.map(team=>team.slice(0,3));
  for(const t of [0,1]){const host=document.querySelector('[data-lineup="'+t+'"]');if(host){host.dataset.count=String(lineups[t].length);host.replaceChildren(...lineups[t].map(id=>{const img=document.createElement('img');setImage(img,id,false,false);img.alt=title(cache[id]?.name||'Pokémon');return img}));}}
  for(const id of new Set(lineups.flat())){const source=view.pmd?.[id]?.portrait||('assets/classic/front/'+id+'.png');view.load('intro-'+id,source);}
  return{lineups,names:[view.teamName(0),view.teamName(1)],arena:names[arena],format:currentMode==='eternatus-raid'?'50 VS 1 · BOSS RAID':teams[0].length+' VS '+teams[1].length+' · AUTOMATIC BATTLE'};
}
function resetPreview(){
  if(running)return;
  $('#match-intro').hidden=true;
  done=false;
  $('#result').classList.add('hidden');
  $('#intro-overlay').classList.remove('hidden');
  $('#battle-status').textContent='AWAITING CHALLENGERS';
  $('#playback-label').textContent='Ready when you are';
  const modeInfo=MODE_CATALOG[currentMode]||MODE_CATALOG.classic;
  $('#turn').textContent=currentMode==='classic'?'3 VS 3 / REFERENCE PACE':`${modeInfo.badge} · ${battleRules.toUpperCase()}`;
  const sub=$('#ready-subtitle');
  if(sub){
    sub.textContent=currentMode==='eternatus-raid'
      ?`50 VS 1 BOSS RAID · ${battleFormat.toUpperCase()}`
      :teams[0].length>3
        ?`${teams[0].length} VS ${teams[1].length} · ${battleFormat.toUpperCase()}`
        :'3 ON 3 · AUTOMATIC BATTLE';
  }
  $('#replay').disabled=true;
  fighters=buildFightersList();
  view.mount(fighters);
  prepareMatchIntro();
  const labels=document.querySelectorAll('#intro-overlay [data-team]');
  labels.forEach(el=>el.textContent=view.teamName(+el.dataset.team));
  $('#ready-arena').textContent=names[arena];
  updateSeriesBanner();
}

function log(text,kind=''){
  const box=$('#log');
  box.querySelector('.empty-log')?.remove();
  const entry=document.createElement('div');
  entry.className='log-entry '+kind;
  const time=document.createElement('time');
  time.textContent=String(round).padStart(2,'0');
  const content=document.createElement('span');
  content.textContent=text;
  entry.append(time,content);
  box.append(entry);
  box.scrollTop=box.scrollHeight;
  $('#log-count').textContent=`${box.children.length} EVENTS`;
}

function wait(ms,token,unscaled=false,realtime=false){
  return new Promise(resolve=>{
    let left=ms,last=performance.now();
    function tick(now){
      if(token!==runId){resolve(false);return}
      if(!paused)left-=Math.min(now-last,50)*(realtime?1:speed)*(unscaled?1:(view.timeScale||1));
      last=now;
      if(left<=0)resolve(true);
      else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

function lockUI(){
  $('#mega').disabled=running;
  if($('#evolve-midbattle'))$('#evolve-midbattle').disabled=running;
  if($('#form-changes'))$('#form-changes').disabled=running;
  if($('#battle-mode'))$('#battle-mode').disabled=running;
  if($('#mode-matchup'))$('#mode-matchup').disabled=running;
  if($('#battle-rules'))$('#battle-rules').disabled=running;
  if($('#battle-format'))$('#battle-format').disabled=running;
  renderTeams();
  $('#shuffle').disabled=running;
  $$('.arena-option').forEach(b=>b.disabled=running);
  $('#start').disabled=running;
  $('#start').firstChild.textContent=running?'BATTLE IN PROGRESS ':'LET THEM BATTLE ';
  $('#pause').disabled=!running;
  $('#replay').disabled=running||!done;
  $('#stop').disabled=!running;
}

function recordBattleHistory(entry){
  battleHistory.unshift(entry);
  if(battleHistory.length>20)battleHistory.length=20;
  try{localStorage.setItem('bt-battle-history',JSON.stringify(battleHistory))}catch{}
  renderHistory();
}

function renderHistory(){
  const host=$('#history-list');
  if(!host)return;
  if(!battleHistory.length){
    host.innerHTML='<p class="empty-history">Completed battles, survivors, damage dealt and replay seeds appear here.</p>';
    return;
  }
  host.replaceChildren(...battleHistory.map(item=>{
    const card=document.createElement('div');
    card.className='history-card';
    const top=document.createElement('div');
    top.className='history-top';
    const strong=document.createElement('strong');
    strong.textContent=item.winnerName||'STALEMATE';
    const badge=document.createElement('small');
    badge.textContent=`${item.turns}T · ${item.totalDamage} DMG`;
    top.append(strong,badge);
    const sub=document.createElement('p');
    sub.textContent=`${item.teamAName} vs ${item.teamBName} · Survivors: ${item.survivors.join(', ')||'None'}`;
    const bottom=document.createElement('div');
    bottom.className='history-bottom';
    const seedLabel=document.createElement('span');
    seedLabel.textContent=`SEED ${item.seed}`;
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='mini-button history-replay-btn';
    btn.textContent='↻ Replay Seed';
    btn.onclick=()=>{
      if(running)return;
      currentMode=item.mode||'classic';
      setVal($('#battle-mode'),currentMode);
      battleRules=item.rules||'natural';
      setVal($('#battle-rules'),battleRules);
      battleFormat=item.format||'simultaneous';
      setVal($('#battle-format'),battleFormat);
      teams=item.teams.map(t=>[...t]);
      modeTitles=[item.teamAName,item.teamBName];
      startSeed=item.seed;
      renderTeams();
      resetPreview();
      start(true);
    };
    bottom.append(seedLabel,btn);
    card.append(top,sub,bottom);
    return card;
  }));
}

const BUNDLED_MEGA_SHEETS=new Set([3,6,9,94,384,448]);

async function evolveMegaFighter(p,w,valid,fast=false,restoreHealth=false){
  if(!p||p.mega||!megaForms[p.id])return true;
  const [sprite,stats,types,customTitle]=megaForms[p.id];
  const megaTitle=customTitle||('Mega '+title(p.name)+(p.id===6?' X':''));
  const isPrimalOrUltra=megaTitle.startsWith('Primal ')||megaTitle.startsWith('Ultra ');
  const color=megaColors[p.id]||'#f0932b';
  const duration=fast?(cinematic?260:110):(cinematic?1900:700);
  view.message(title(p.name)+(isPrimalOrUltra?' awakens its ancient power!':' is Mega Evolving!'),duration*.6);
  if(cinematic)view.addFx('evolution',p.pos,p.pos,color,duration,{species:p.id});
  p.charge=cinematic;p.aura=color;
  audioEngine.sfx('fairy','charge');
  await w(duration*.6);
  if(!valid())return false;
  p.charge=false;
  Object.assign(p,{mega:true,formKey:'mega-'+p.id,animKey:null,stats,types,name:megaTitle});
  if(currentMode==='eternatus-raid')p.el?.classList.add('mega-evolved');
  if(restoreHealth){
    p.max=2*stats[0]+170;
    p.hp=p.max;
  }
  p.options=movesFor(p);
  applyFormArt(view,p);
  const img=p.el?.querySelector('img');
  if(img){
    const formArt=view.pmd[p.formKey];
    if(formArt?.[p.team===1?'back':'front']){
      img.onerror=null;
      img.src='assets/'+formArt[p.team===1?'back':'front'];
    }else if(BUNDLED_MEGA_SHEETS.has(p.id)){
      img.onerror=null;
      img.src='assets/gen5'+(p.team===1?'-back':'')+'-'+sprite+'.png';
    }
    img.alt=p.name;
  }
  const hud=document.getElementById('hud-'+p.uid);
  if(hud){
    hud.querySelector('strong').textContent=p.name;
    if(view.pmd[p.formKey]?.portrait){
      hud.querySelector('img').src='assets/'+view.pmd[p.formKey].portrait;
    }else if(BUNDLED_MEGA_SHEETS.has(p.id)){
      hud.querySelector('img').src='assets/gen5-'+sprite+'.png';
    }
  }
  view.updateHP(p);
  applyFormArt(view,p);
  if(restoreHealth)view.damage(p,'HP RESTORED!',true);
  if(cinematic)view.burst(p.pos,color,24);
  view.message(p.name+(restoreHealth?' · HP RESTORED!':'!'),duration*.4,true);
  audioEngine.cry(p.id,p.bundled);
  log(p.name+' enters the battle!'+(restoreHealth?' Health fully restored!':''));
  await w(duration*.4);
  return valid();
}

async function evolveMegaSurge(w,valid){
  if(currentMode==='eternatus-raid'&&!fighters.some(p=>p.isBoss&&p.phase2))return valid();
  const list=fighters.filter(p=>!p.isBoss&&!p.reserve&&p.hp>0&&!p.mega&&megaForms[p.id]);
  if(!list.length)return valid();
  const duration=cinematic?800:320;
  view.message('MEGA SURGE',duration*.55,true);
  audioEngine.sfx('fairy','charge');
  for(const p of list){
    const color=megaColors[p.id]||'#f0932b';
    if(cinematic)view.addFx('evolution',p.pos,p.pos,color,duration,{species:p.id});
    p.charge=cinematic;
    p.aura=color;
  }
  await w(duration*.55);
  if(!valid())return false;
  for(const p of list){
    const [sprite,stats,types,customTitle]=megaForms[p.id];
    const megaTitle=customTitle||('Mega '+title(p.name)+(p.id===6?' X':''));
    const color=megaColors[p.id]||'#f0932b';
    p.charge=false;
    Object.assign(p,{mega:true,formKey:'mega-'+p.id,animKey:null,stats,types,name:megaTitle});
    applyFormArt(view,p);
    p.el?.classList.add('mega-evolved');
    p.max=2*stats[0]+170;
    p.hp=p.max;
    p.options=movesFor(p);
    const img=p.el?.querySelector('img');
    if(img){
      const formArt=view.pmd[p.formKey];
      if(formArt?.[p.team===1?'back':'front']){
        img.onerror=null;
        img.src='assets/'+formArt[p.team===1?'back':'front'];
      }else if(BUNDLED_MEGA_SHEETS.has(p.id)){
        img.onerror=null;
        img.src='assets/gen5'+(p.team===1?'-back':'')+'-'+sprite+'.png';
      }
      img.alt=p.name;
    }
    const hud=document.getElementById('hud-'+p.uid);
    if(hud){
      hud.querySelector('strong').textContent=p.name;
      if(view.pmd[p.formKey]?.portrait){
        hud.querySelector('img').src='assets/'+view.pmd[p.formKey].portrait;
      }else if(BUNDLED_MEGA_SHEETS.has(p.id)){
        hud.querySelector('img').src='assets/gen5-'+sprite+'.png';
      }
    }
    view.updateHP(p);
    if(cinematic)view.burst(p.pos,color,16);
  }
  if(cinematic){
    view.flash=.22;
    view.flashColor='#ffe599';
  }
  audioEngine.cry(list[0].id,list[0].bundled);
  log(`${list.map(p=>p.name).join(', ')} Mega Evolve simultaneously and restore full HP!`);
  await w(duration*.45);
  return valid();
}

async function triggerLegendarySummonAct2(boss,w,valid){
 if(!boss||boss.act2Triggered)return valid();
 boss.act2Triggered=true;
 const shaved=1-Math.min(1,boss.act1LowestHpRatio??1),tiers=Math.floor(shaved/.25),willMult=1+(tiers===0?.08:tiers*.15),willLabel=tiers>0?'+'+tiers*15+'% WILL OF THE 50!':'GUARDIAN SPIRIT!';
 const fallen=fighters.filter(p=>p.team===1&&!p.isGuardian&&p.hp<=0);
 const guardians=pickGuardianTrio(boss.id,rng).map((gid,idx)=>{
  const g=createFighter(resolveSpeciesData(gid,cache,roster),1,[0,2,1][idx],{rules:'natural',uidIndex:100+idx});
  const maxHp=Math.round(g.max*4.4),awak=GUARDIAN_AWAKENINGS[gid];
  Object.assign(g,{isGuardian:true,raidEngaged:true,willMult,max:maxHp,hp:maxHp,bundled:featured.includes(gid),entranceHidden:true,summonColor:awak?.color||megaColors[gid]||'#ffe58a',awakenedName:awak?.title||title(g.name)});
  // Fetch directional metadata concurrently with the soul-gathering scene.
  ensurePmd(view,gid).then(()=>{if(valid())view.loadPmd()});
  const portrait=view.pmd?.[gid]?.portrait||('assets/classic/front/'+gid+'.png');view.load('guardian-portrait-'+gid,portrait);
  return g;
 });
 fighters.push(...guardians);view.loadPmd();
 view.phase2Vortex=view.phase2Vortex||'eternatus';
 log('ACT 2 — ALL 50 HAVE FALLEN! THE ANCIENT GUARDIANS ANSWER THE CALL!','ko');
 const attach=(g,pos)=>{g.pos={...pos};g.baseHome={...pos};g.motion=null;g.hitUntil=0;g.face=-1;g.direction=4;$('#fighters').append(view.createFighterEl(g));};
 const awaken=()=>{
  for(const g of guardians){
    const awak=GUARDIAN_AWAKENINGS[g.id];
    const mega=megaForms[g.id];
    const col=awak?.color||megaColors[g.id]||'#ffe58a';
    if(mega){
      const [sprite,stats,types,customTitle]=mega;
      const boosted=stats.map(v=>Math.round(v*1.15));
      Object.assign(g,{mega:true,formKey:'mega-'+g.id,animKey:null,stats:boosted,types,name:customTitle||awak?.title||title(g.name)});
      const img=g.el?.querySelector('img');
      if(img&&BUNDLED_MEGA_SHEETS.has(g.id)){img.onerror=null;img.src='assets/gen5-back-'+sprite+'.png';}
    }else if(awak){
      const boosted=awak.stats.map(v=>Math.round(v*1.15));
      Object.assign(g,{mega:true,animKey:null,stats:boosted,types:awak.types,name:awak.title});
    }
    applyFormArt(view,g);
    g.el?.classList.add('mega-evolved');
    g.options=movesFor(g);
    const hud=document.getElementById('hud-'+g.uid);
    if(hud)hud.querySelector('strong').textContent=g.name;
    view.updateHP(g);
    view.burst(g.pos,col,18);
  }
  view.drawHUD();
 };
 const completed=await playGuardianEntrance({boss,guardians,fallen,view,audio:audioEngine,wait:w,valid,attach,awaken,log,willLabel});
 return completed;
}

async function evolveStageFighter(p,w,valid){
  const nextId=EVOLUTION_CHAINS[p?.id];
  if(!p||p.hp<=0||p.isBoss||!nextId)return true;
  const oldName=title(p.name);
  const nextData=resolveSpeciesData(nextId,cache,roster);
  ensurePmd(view,nextId);
  const color=colors[nextData.types[0]]||'#ffe599';
  const isFast=currentMode==='eternatus-raid'||currentMode==='army-battle'||fighters.length>8;
  const duration=isFast?(cinematic?300:130):(cinematic?850:340);
  if(!isFast)view.message(`What? ${oldName} is evolving!`,duration*.55);
  if(cinematic)view.addFx('evolution',p.pos,p.pos,color,duration,{species:nextId});
  p.charge=cinematic;
  p.aura=color;
  audioEngine.sfx('fairy','charge');
  await w(duration*.55);
  if(!valid())return false;
  p.charge=false;
  const hpRatio=Math.max(0.35,p.hp/Math.max(1,p.max));
  const newStats=battleRules==='balanced'?nextData.stats.map(v=>Math.round(v*0.5+92)):nextData.stats;
  const newMax=2*newStats[0]+170;
  const newHp=Math.min(newMax,Math.round(newMax*Math.min(1,hpRatio+0.25)));
  Object.assign(p,{
    id:nextId,
    name:nextData.name,
    types:nextData.types,
    stats:newStats,
    max:newMax,
    hp:newHp,
    formKey:null,
    animKey:null,
    bundled:featured.includes(nextId)
  });
  p.options=movesFor(p);
  const img=p.el?.querySelector('img');
  if(img){
    setImage(img,nextId,true,p.team===1&&currentMode!=='eternatus-raid');
    img.alt=title(nextData.name);
  }
  const hud=document.getElementById('hud-'+p.uid);
  if(hud){
    const s=hud.querySelector('strong');
    if(s)s.textContent=title(nextData.name);
    const hImg=hud.querySelector('img');
    if(hImg)setImage(hImg,nextId,false,false);
  }
  view.updateHP(p);
  if(!isFast)view.damage(p,`EVOLVED → ${title(nextData.name).toUpperCase()}!`,true);
  if(cinematic)view.burst(p.pos,color,18);
  if(!isFast)view.message(`${oldName} evolved into ${title(nextData.name)}!`,duration*.45,true);
  audioEngine.cry(nextId,p.bundled);
  log(`${oldName} evolved into ${title(nextData.name)}!`);
  await w(duration*.45);
  return valid();
}

function applyArenaFieldHazards(){
  const cat=arenaCatalog[arena];
  if(!cat)return;
  const active=fighters.filter(p=>!p.reserve&&p.hp>0&&!p.isBoss);
  if(!active.length)return;
  if((cat.weatherEffect==='sandstorm'||cat.weatherEffect==='hail')&&round%2===0){
    const immune=cat.chipImmune||[];
    let chipped=0;
    for(const p of active){
      if(p.types.some(t=>immune.includes(t)))continue;
      if(p.hp<=1)continue;
      const chip=Math.max(1,Math.min(p.hp-1,Math.round(p.max*0.035)));
      p.hp-=chip;
      view.updateHP(p);
      chipped++;
    }
    if(chipped>0&&round<=4){
      log(`The ${cat.weatherEffect==='sandstorm'?'raging sandstorm':'pelting hail'} buffets the battlefield!`);
    }
  }else if(cat.terrain==='grassy'&&round%2===0){
    const healTypes=cat.healTypes||['grass'];
    for(const p of active){
      if(!p.types.some(t=>healTypes.includes(t))||p.hp>=p.max)continue;
      p.hp=Math.min(p.max,p.hp+Math.max(4,Math.round(p.max*0.045)));
      view.updateHP(p);
    }
  }
}

view.canMidEvolve=p=>!!$('#evolve-midbattle')?.checked&&!p?.isBoss&&!!EVOLUTION_CHAINS[p?.id];
view.tryMidBattleEvolution=(p,w,valid)=>evolveStageFighter(p,w,valid);
view.canLowHpMega=p=>(currentMode!=='eternatus-raid'||fighters.some(x=>x.isBoss&&x.phase2))&&!!$('#mega')?.checked&&!p?.isBoss&&!p?.mega&&!!megaForms[p?.id];
view.triggerLowHpMega=async(p,w,valid)=>currentMode==='eternatus-raid'?evolveMegaSurge(w,valid):evolveMegaFighter(p,w,valid,true,false);
view.onReinforce=async()=>{};
view.onPhase2Start=()=>{$('#battle-status').textContent='PHASE 2 · TRUE FORM AWAKENING';};

async function start(replay=false){
  if(running||!fighters.length)return;
  runId++;
  const token=runId;
  running=true;
  paused=false;
  done=false;
  round=0;
  elapsed=0;
  totalDamageDealt=0;
  startSeed=replay?startSeed:randomSeed();
  seed=startSeed;
  rng=seeded(seed);
  visualRng=seeded(seed^0x5121);
  fighters=buildFightersList();
  view.mount(fighters);
  view.waitForFinisher=ms=>wait(view.raidPhase1Active?Math.min(ms,Math.max(0,(10-(view.raidPhase1Elapsed||0))*1000)):ms,token,true,true);
  $('#stage').classList.remove('paused');
  $('#pause').innerHTML='Ⅱ <span>Pause</span>';
  $('#intro-overlay').classList.add('hidden');
  $('#result').classList.add('hidden');
  $('#log').replaceChildren();
  $('#battle-status').textContent='BATTLE LIVE';
  $('#playback-label').textContent='The showdown is live';
  lockUI();
  if($('#auto-record')?.checked)studio.startRecording(audioEngine);
  log('The challengers enter the arena. Let the battle begin!');
  $('#audio-status').hidden=true;
  audioEngine.begin(sound);
  audioEngine.sfx('normal','ready');
  const cryTarget=fighters[1]||fighters[0];
  if(cryTarget)audioEngine.cry(cryTarget.id,featured.includes(cryTarget.id));
  const intro=$('#match-intro');
  intro.querySelector('small').textContent=names[arena];
  const sides=intro.querySelectorAll('strong');
  sides[0].textContent=view.teamName(0);
  sides[1].textContent=view.teamName(1);
  intro.style.setProperty('--entrance','0');
  intro.hidden=true;
  view.matchIntro={...prepareMatchIntro(),start:view.presentationTime,duration:cinematic?1.2:.28};
  view.letterbox=.65;
  view.cameraZoom=1.05;
  if(!await wait(cinematic?1200:280,token,true,true))return;
  view.matchIntro=null;intro.hidden=true;
  const cdDur=cinematic?380:95;
  for(const step of ['3','2','1','GO!']){
    audioEngine.countdownCue(step);
    view.message(step,cdDur,true,true);
    if(step==='GO!'&&cinematic){
      view.flash=.18;
      view.flashColor='#ffe680';
      view.burst({x:270,y:480},'#ffe680',24);
    }
    if(!await wait(cdDur+20,token))return;
  }
  view.letterbox=0;
  view.cameraZoom=1;
  if(currentMode==='eternatus-raid'){
    view.raidPhase1Active=true;view.raidPhase1Elapsed=0;
    $('#battle-status').textContent='PHASE 1 · OPENING ASSAULT';
    await view.advanceRaidCharge(ms=>wait(ms,token),()=>token===runId);
    if(token!==runId)return;
  }
  if($('#mega').checked&&currentMode!=='eternatus-raid'){
    const chosen=[0,1].map(team=>fighters.find(p=>p.team===team&&!p.reserve&&megaForms[p.id])).filter(Boolean);
    for(const p of chosen){
      if(!await evolveMegaFighter(p,ms=>wait(ms,token),()=>token===runId,false,false))return;
    }
  }
  if($('#form-changes')?.checked&&currentMode!=='eternatus-raid'){
    const chosenForms=[0,1].map(team=>fighters.find(p=>p.team===team&&!p.reserve&&!p.mega&&FUTURE_FORMS[p.id])).filter(Boolean);
    for(const p of chosenForms){
      const form=FUTURE_FORMS[p.id];
      const duration=cinematic?1400:500;
      view.message(title(p.name)+' awakens its true form!',duration*.6);
      p.charge=cinematic;p.aura=form.color;
      audioEngine.sfx('dragon','charge');
      if(!await wait(duration*.6,token))return;
      p.charge=false;
      Object.assign(p,{stats:form.stats,types:form.types,name:form.title});
      applyFormArt(view,p);
      p.options=movesFor(p);
      const hud=document.getElementById('hud-'+p.uid);
      if(hud)hud.querySelector('strong').textContent=p.name;
      if(cinematic)view.burst(p.pos,form.color,24);
      view.message(p.name+'!',duration*.4,true);
      audioEngine.cry(p.id,p.bundled);
      log(p.name+' unleashes its awakened power!');
      if(!await wait(duration*.4,token))return;
    }
  }
  const isLargeBattle=fighters.length>8||currentMode==='army-battle'||currentMode==='eternatus-raid';
  const maxTurns=isLargeBattle?500:180;
  const attackCfg={rules:battleRules,bossRaid:currentMode==='eternatus-raid',arena};
  const paceDivisor=fighters.filter(p=>!p.reserve).length>16?2.4:fighters.filter(p=>!p.reserve).length>6?1.5:1;
  while(token===runId&&fighters.some(p=>p.team===0&&p.hp>0)&&round<maxTurns){
    const team1HasAlive=fighters.some(p=>p.team===1&&p.hp>0);
    if(!team1HasAlive){
      const act2Boss=currentMode==='eternatus-raid'?fighters.find(p=>p.isBoss&&p.hp>0):null;
      if(act2Boss&&!act2Boss.act2Triggered){
        if(!await triggerLegendarySummonAct2(act2Boss,ms=>wait(ms,token),()=>token===runId))return;
        continue;
      }
      break;
    }
    round++;
    $('#turn').textContent=`TURN ${String(round).padStart(2,'0')} · ${fighters.filter(p=>p.hp>0).length} REMAIN`;
    const boss=currentMode==='eternatus-raid'?fighters.find(p=>p.isBoss&&p.hp>0):null;
    if(openingExpired(view,boss)){await triggerBossPhase2(boss,fighters,{view,audio:audioEngine,wait:ms=>wait(ms,token,true,true),valid:()=>token===runId,rng,log,onDamage:dmg=>{totalDamageDealt+=dmg}});if(token!==runId)return;}
    if(boss?.phase2&&!boss.act2Triggered&&$('#mega')?.checked&&boss.hp<=boss.max*.65){
      const pendingMegas=fighters.filter(p=>!p.isBoss&&!p.reserve&&p.hp>0&&!p.mega&&megaForms[p.id]);
      if(pendingMegas.length){
        view.addFx('shockwave',boss.pos,boss.pos,'#d4a1f9',380);
        if(!await evolveMegaSurge(ms=>wait(ms,token),()=>token===runId))return;
      }
    }
    if(currentMode==='eternatus-raid'){
      if(boss?.act2Triggered){
        await choreographAct2Wave(fighters,{
          view,
          audio:audioEngine,
          wait:ms=>wait(ms*1.25,token),
          valid:()=>token===runId,
          rng,
          log,
          onDamage:dmg=>{totalDamageDealt+=dmg;},
          waveIndex:round
        });
      }else{
        const openingWave=!boss.phase2;
        await choreographRaidWave(fighters,{
          view,
          audio:audioEngine,
          wait:ms=>wait(raidWaitDuration(view,boss,ms),token,true,!boss.phase2),
          phaseWait:ms=>wait(ms,token,true,true),
          phaseValid:()=>token===runId,
          valid:()=>token===runId&&(!openingWave||view.raidPhase1Elapsed<10),
          rng,
          log,
          onDamage:dmg=>{totalDamageDealt+=dmg;},
          waveIndex:round
        });
      }
      if(openingExpired(view,boss)){await triggerBossPhase2(boss,fighters,{view,audio:audioEngine,wait:ms=>wait(ms,token,true,true),valid:()=>token===runId,rng,log,onDamage:dmg=>{totalDamageDealt+=dmg}});if(token!==runId)return;}
      applyArenaFieldHazards();
      if(!await wait(45,token))return;
      continue;
    }
    if(currentMode==='army-battle'){
      await choreographArmyWave(fighters,{
        view,
        audio:audioEngine,
        wait:ms=>wait(ms,token),
        valid:()=>token===runId,
        rng,
        log,
        onDamage:dmg=>{totalDamageDealt+=dmg;},
        rules:battleRules,
        waveIndex:round
      });
      applyArenaFieldHazards();
      if(!await wait(60,token))return;
      continue;
    }
    const attack=chooseAttack(fighters,rng,attackCfg);
    if(!attack)break;
    await animateAttack(attack,token,paceDivisor);
    applyArenaFieldHazards();
    if(!await wait(Math.round(220/paceDivisor),token))return;
  }
  if(token!==runId)return;
  view.label=null;view.moveLabels?.clear();
  const a=fighters.filter(p=>p.team===0&&p.hp>0),b=fighters.filter(p=>p.team===1&&p.hp>0),winner=!a.length?1:!b.length?0:null;
  const raidBossObj=currentMode==='eternatus-raid'?fighters.find(p=>p.isBoss):null;
  const name=winner===1&&raidBossObj?.act2Triggered?'SUMMONED GUARDIANS':winner===0&&raidBossObj?.act2Triggered?`${title(raidBossObj.name).toUpperCase()} (TOTAL VICTORY)`:winner!==null?view.teamName(winner):'';
  if(winner!==null&&currentMode==='eternatus-raid'){
    if(!await playRaidOutro({view,audio:audioEngine,fighters,winner,name,wait:ms=>wait(ms,token,true,true),valid:()=>token===runId}))return;
  }else if(winner!==null){
    audioEngine.background(false);
    audioEngine.sfx('normal','victory');
    view.burst({x:270,y:380},'#ffe58a',36);
    view.burst({x:170,y:450},'#ff856d',24);
    view.burst({x:370,y:450},'#8ef5c8',24);
    view.message(name+' WINS!',600,true);
    if(!await wait(600,token))return;
  }
  const survivingFighters=winner===0?a:b;
  const survivors=survivingFighters.map(p=>title(p.name));
  const eyebrow=$('#result-eyebrow');
  if(eyebrow)eyebrow.textContent=$('#winner-subtitle')?.value?.trim()||'THE DUST HAS SETTLED';
  $('#result h2').textContent=winner!==null?name+' WINS!':'A LEGENDARY STALEMATE';
  const mvpStrip=$('#result-mvp-strip');
  if(mvpStrip){
    const mvpList=(survivingFighters.length?survivingFighters:fighters.filter(p=>p.team===(winner??0))).slice(0,3);
    mvpStrip.replaceChildren(...mvpList.map(p=>{
      const card=document.createElement('div');
      card.className='result-mvp-card'+(p.isBoss?' boss-mvp':'');
      const img=document.createElement('img');
      if(view.pmd[p.formKey]?.portrait)img.src=formAssetUrl(view.pmd[p.formKey].portrait);else setImage(img,p.id,false,false);
      img.alt=title(p.name);
      const lbl=document.createElement('strong');
      lbl.textContent=title(p.name);
      card.append(img,lbl);
      return card;
    }));
  }
  const kpiGrid=$('#result-kpi-grid');
  if(kpiGrid){
    const dmgFmt=totalDamageDealt>=1000?`${(totalDamageDealt/1000).toFixed(1)}K`:String(totalDamageDealt);
    kpiGrid.innerHTML=`<div class="result-kpi-box"><b>${round}</b><span>TURNS</span></div><div class="result-kpi-box"><b>${dmgFmt}</b><span>TOTAL DMG</span></div><div class="result-kpi-box"><b>${survivingFighters.length}</b><span>SURVIVORS</span></div>`;
  }
  const survivorSummary=survivors.length>5
    ?`${survivors.slice(0,4).join(', ')} and ${survivors.length-4} more`
    :survivors.join(', ');
  $('#result p').textContent=winner!==null
    ?`${survivorSummary} ${survivors.length===1?'stands':'stand'} victorious!`
    :`Neither team fell after ${maxTurns} turns. Try a new matchup.`;
  $('#result-stats').textContent=`${round} TURNS · ${Math.round(elapsed)}s · SEED ${startSeed}`;
  $('#result').classList.remove('hidden');
  $('#battle-status').textContent='BATTLE COMPLETE';
  $('#playback-label').textContent=winner!==null?name+' takes the arena':'An evenly matched showdown';
  log(winner!==null?name+' wins!':'The battle ends in a draw.','ko');
  audioEngine.background(false);

  if(seriesLength>1&&winner!==null&&!replay){
    const maxWins=Math.ceil(seriesLength/2);
    if(seriesScore[0]<maxWins&&seriesScore[1]<maxWins){
      seriesScore[winner]++;
      if(seriesScore[0]<maxWins&&seriesScore[1]<maxWins)seriesGame++;
    }
    updateSeriesBanner();
    const seriesChamp=seriesScore[0]>=maxWins?view.teamName(0):seriesScore[1]>=maxWins?view.teamName(1):null;
    $('#rematch').textContent=seriesChamp?`NEW SERIES (${seriesScore[0]}–${seriesScore[1]}) ↻`:`GAME ${seriesGame} OF 3 ↻`;
  }else{
    $('#rematch').textContent='REMATCH ↻';
  }

  if(currentMode==='tournament'&&tournament&&winner!==null){
    const next=findNextTournamentMatch(tournament);
    if(next){
      recordTournamentMatch(tournament,next.round,next.matchIndex,winner,{turns:round,seed:startSeed});
      saveTournamentState();
      renderTournamentUI();
      if(tournament.champion){
        if(eyebrow)eyebrow.textContent='🏆 TOURNAMENT CHAMPION CROWNED';
        $('#result h2').textContent=`${tournament.champion.name} WINS THE CUP!`;
      }
    }
  }

  recordBattleHistory({
    winner,
    winnerName:winner!==null?name:'STALEMATE',
    teamAName:view.teamName(0),
    teamBName:view.teamName(1),
    survivors:survivors.slice(0,6),
    totalDamage:totalDamageDealt,
    turns:round,
    seed:startSeed,
    mode:currentMode,
    rules:battleRules,
    format:battleFormat,
    teams:teams.map(t=>[...t]),
    arena
  });

  if(studio.recording){if(currentMode==='eternatus-raid'&&!await wait(1200,token,true,true))return;studio.stopRecording();}
  running=false;done=true;
  lockUI();
}

async function animateAttack(a,token,paceDivisor=1){
  return choreograph(a,{
    view,
    audio:audioEngine,
    wait:ms=>wait(ms/paceDivisor,token),
    valid:()=>token===runId,
    rng:visualRng,
    log,
    onDamage:dmg=>{totalDamageDealt+=dmg;}
  });
}

function frame(now){
  const dt=Math.min((now-lastTime)/1000,.05);
  lastTime=now;
  if(!paused){
    view.cinematic=cinematic;
    view.playbackSpeed=speed;view.draw(view.outroState||view.phaseTransition||view.matchIntro?dt:dt*speed);
    studio.tick();
    const intro=$('#match-intro');
    if(!intro.hidden)intro.style.setProperty('--entrance',cinematic?String(Math.min(1,view.clock/.48)):'1');
    if(running)elapsed+=dt;
  }
  requestAnimationFrame(frame);
}

// Mode & Matchup UI management
function configureModeUI(mode,keepTeams=false){
  currentMode=mode;
  const info=MODE_CATALOG[mode]||MODE_CATALOG.classic;
  if($('#mode-description'))$('#mode-description').textContent=info.description;
  const controls=$('#mode-controls');
  if(!controls)return;
  if(mode==='classic'){
    controls.hidden=true;
    modeTitles=['',''];
    if(!keepTeams){
      renderTeams();
      resetPreview();
    }
    return;
  }
  controls.hidden=false;
  const matchupSelect=$('#mode-matchup');
  const matchupWrap=$('#matchup-wrap');
  if(info.matchups?.length){
    matchupWrap.hidden=false;
    matchupSelect.replaceChildren(...info.matchups.map(m=>{
      const opt=document.createElement('option');
      opt.value=m.id;
      opt.textContent=m.label;
      return opt;
    }));
    currentMatchup=info.matchups[0].id;
    setVal(matchupSelect,currentMatchup);
  }else{
    matchupWrap.hidden=true;
    currentMatchup='';
  }
  $('#region-controls').hidden=mode!=='region-wars';
  $('#starter-controls').hidden=mode!=='starter-showdown';
  $('#type-controls').hidden=mode!=='type-wars';
  $('#tournament-controls').hidden=mode!=='tournament';
  if(mode==='eternatus-raid'){
    battleFormat='simultaneous';
    setVal($('#battle-format'),'simultaneous');
    if($('#mega'))$('#mega').checked=true;
  }else if(mode==='starter-showdown'){
    battleFormat='reinforcements';
    setVal($('#battle-format'),'reinforcements');
  }
  if(mode==='tournament'){
    if(!tournament)tournament=createTournament(+$('#tournament-size').value||8,$('#tournament-theme').value||'all');
    renderTournamentUI();
    loadCurrentTournamentMatch();
    return;
  }
  applyModeSelection(keepTeams);
}

function applyModeSelection(keepTeams=false){
  if(currentMode==='classic'){
    renderTeams();
    resetPreview();
    return;
  }
  if(currentMode==='tournament'){
    loadCurrentTournamentMatch();
    return;
  }
  const built=buildMatchupTeams({
    mode:currentMode,
    matchup:currentMatchup,
    regionA:$('#region-a')?.value||'kanto',
    regionB:$('#region-b')?.value||'johto',
    regionPool:$('#region-pool')?.value||'starters',
    starterStage:$('#starter-stage')?.value||'final',
    typeA:$('#type-a')?.value||'grass',
    typeB:$('#type-b')?.value||'water',
    squadSize:+($('#type-size')?.value||3)
  });
  if(!keepTeams)teams=built.teams;
  modeTitles=built.titles||['',''];
  const multiSquad=teams[0].length>3||teams[1].length>3;
  if($('#format-controls'))$('#format-controls').hidden=!multiSquad||currentMode==='army-battle';
  if(currentMode==='army-battle')battleFormat='simultaneous';
  seriesScore=[0,0];
  seriesGame=1;
  renderTeams();
  resetPreview();
}

// Tournament UI & Logic
function saveTournamentState(){
  try{localStorage.setItem('bt-tournament-state',JSON.stringify(tournament))}catch{}
}

function loadCurrentTournamentMatch(){
  if(!tournament)return;
  const next=findNextTournamentMatch(tournament);
  if(next){
    teams=[next.match.teamA.ids.slice(),next.match.teamB.ids.slice()];
    modeTitles=[next.match.teamA.name,next.match.teamB.name];
  }else if(tournament.champion){
    teams=[tournament.champion.ids.slice(),[144,145,146]];
    modeTitles=[tournament.champion.name,'CHALLENGERS'];
  }
  renderTeams();
  resetPreview();
}

function renderTournamentUI(){
  const host=$('#tournament-bracket');
  const champBox=$('#tournament-champion');
  if(!host||!tournament)return;
  if(tournament.champion){
    champBox.hidden=false;
    const champMons=tournament.champion.ids.map(id=>title(resolveSpeciesData(id,cache,roster).name)).join(', ');
    champBox.innerHTML=`<strong>🏆 CHAMPION: ${tournament.champion.name}</strong><small>${champMons}</small>`;
  }else{
    champBox.hidden=true;
  }
  const roundNames=tournament.size===16
    ?['ROUND OF 16','QUARTERFINALS','SEMIFINALS','GRAND FINAL']
    :['QUARTERFINALS','SEMIFINALS','GRAND FINAL'];
  const next=findNextTournamentMatch(tournament);
  host.replaceChildren(...tournament.rounds.map((rMatches,rIdx)=>{
    const col=document.createElement('div');
    col.className='bracket-round';
    const h=document.createElement('h4');
    h.textContent=roundNames[rIdx]||`ROUND ${rIdx+1}`;
    col.append(h);
    for(const m of rMatches){
      const card=document.createElement('div');
      card.className='bracket-match'+(next&&next.round===rIdx&&next.matchIndex===m.matchIndex?' active-match':'')+(m.winner?' completed-match':'');
      const aName=m.teamA?.name||'TBD';
      const bName=m.teamB?.name||'TBD';
      const s1=document.createElement('span');
      s1.className=m.winner&&m.winnerSide===0?'winner-side':'';
      s1.textContent=aName;
      const s2=document.createElement('span');
      s2.className=m.winner&&m.winnerSide===1?'winner-side':'';
      s2.textContent=bName;
      card.append(s1,s2);
      col.append(card);
    }
    return col;
  }));
}

// Saved Matchups Presets
function renderSavedPresets(){
  const sel=$('#saved-presets');
  if(!sel)return;
  sel.replaceChildren(...savedPresets.map((p,idx)=>{
    const opt=document.createElement('option');
    opt.value=String(idx);
    opt.textContent=p.name;
    return opt;
  }));
}

function loadPresetByIndex(idx){
  if(running)return;
  const p=savedPresets[idx];
  if(!p)return;
  currentMode=p.mode||'classic';
  setVal($('#battle-mode'),currentMode);
  currentMatchup=p.matchup||'';
  battleRules=p.rules||'natural';
  setVal($('#battle-rules'),battleRules);
  battleFormat=p.format||'simultaneous';
  setVal($('#battle-format'),battleFormat);
  if(p.starterStage&&$('#starter-stage'))setVal($('#starter-stage'),p.starterStage);
  configureModeUI(currentMode,true);
  if(p.matchup&&$('#mode-matchup'))setVal($('#mode-matchup'),p.matchup);
  teams=p.teams.map(t=>[...t]);
  modeTitles=p.titles?[...p.titles]:['',''];
  if($('#format-controls'))$('#format-controls').hidden=!(teams[0].length>3||teams[1].length>3)||currentMode==='army-battle';
  renderTeams();
  resetPreview();
}

// Event Listeners
$('#start').onclick=()=>start();
$('#stage-start').onclick=()=>start();
$('#rematch').onclick=()=>{
  if(seriesLength>1){
    const maxWins=Math.ceil(seriesLength/2);
    if(seriesScore[0]>=maxWins||seriesScore[1]>=maxWins){
      seriesScore=[0,0];
      seriesGame=1;
      updateSeriesBanner();
    }
  }
  if(currentMode==='tournament')loadCurrentTournamentMatch();
  start();
};
$('#replay').onclick=()=>start(true);
$('#pause').onclick=()=>{
  if(!running)return;
  paused=!paused;
  $('#stage').classList.toggle('paused',paused);
  $('#pause').innerHTML=paused?'▶ <span>Resume</span>':'Ⅱ <span>Pause</span>';
  $('#playback-label').textContent=paused?'The battle is paused':'The showdown is live';
  audioEngine.pause(paused);
};
$('#stop').onclick=()=>{
  runId++;
  running=false;
  paused=false;
  audioEngine.pause(false);
  audioEngine.background(false);
  audioEngine.cancelSpeech();
  if(studio.recording)studio.stopRecording();
  $('#stage').classList.remove('paused');
  resetPreview();
  lockUI();
  log('Battle stopped. Adjust your teams and start again.');
};
$('#sound').onclick=async()=>{
  try{
    sound=audioEngine.blocked?true:!sound;
    if(sound){
      const activation=audioEngine.enable();
      audioEngine.background(running&&!paused);
      await activation;
    }else audioEngine.disable();
    $('#sound span').textContent=sound?'ON':'OFF';
    $('#sound').setAttribute('aria-label',sound?'Mute battle sound':'Enable battle sound');
  }catch{
    sound=false;
    $('#playback-label').textContent='Audio unavailable. You can still watch the battle.';
  }
};
$('#music-volume').oninput=e=>{audioEngine.setMix('music',+e.target.value/100);$('#music-value').textContent=Math.round(+e.target.value)+'%'};
$('#effects-volume').oninput=e=>{audioEngine.setMix('effects',+e.target.value/100);$('#effects-value').textContent=e.target.value+'%'};
$('#test-sfx').onclick=()=>{sound=true;audioEngine.enable();audioEngine.sfx('fighting','impact',1);$('#sound span').textContent='ON';$('#audio-status').hidden=true;};
$('#music').onchange=e=>{audioEngine.musicEnabled=e.target.checked;audioEngine.background(running&&!paused)};
$('#cinematic').checked=cinematic;$('#cinematic').onchange=e=>cinematic=e.target.checked;
$$('#speeds button').forEach(b=>b.onclick=()=>{speed=Number(b.dataset.speed);$$('#speeds button').forEach(x=>x.classList.toggle('selected',x===b))});
$$('.arena-option').forEach(b=>b.onclick=()=>{
  if(running)return;
  arena=b.dataset.arena;
  view.arena=arena;
  $$('.arena-option').forEach(x=>x.classList.toggle('selected',x===b));
  $('#arena-name').textContent=names[arena];
  $('#ready-arena').textContent=names[arena];
  $('#weather').textContent=arenaCatalog[arena].weather;
  view.drawArena();
});
$('#shuffle').onclick=()=>{
  if(running)return;
  if(currentMode!=='classic'&&currentMode!=='legendary-clash'&&currentMode!=='trainer-teams'){
    applyModeSelection(false);
    return;
  }
  const ids=[...featured];
  for(let i=ids.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [ids[i],ids[j]]=[ids[j],ids[i]];
  }
  teams=[ids.slice(0,3),ids.slice(3,6)];
  renderTeams();
  saveTeams();
  resetPreview();
};
$('#close-picker').onclick=()=>{const dlg=$('#picker');if(dlg.close)dlg.close();else dlg.removeAttribute('open')};
$('#search').oninput=()=>{limit=60;renderPicker()};
$$('.picker-filters button').forEach(b=>b.onclick=()=>{
  filter=b.dataset.filter;
  limit=60;
  $$('.picker-filters button').forEach(x=>x.classList.toggle('selected',x===b));
  renderPicker();
});
for(const selId of ['#filter-region','#filter-type','#filter-stage']){
  $(selId)?.addEventListener('change',()=>{limit=60;renderPicker()});
}
$('#more').onclick=()=>{limit+=60;renderPicker()};

function clean(on){
  document.body.classList.toggle('clean-mode',on);
  $('#clean').textContent=on?'↙ Exit clean view':'▣ Clean 9:16 view';
  $('#clean').setAttribute('aria-pressed',String(on));
}
$('#clean').onclick=()=>clean(!document.body.classList.contains('clean-mode'));
$('#studio-clean')?.addEventListener('click',()=>clean(!document.body.classList.contains('clean-mode')));
document.addEventListener('keydown',e=>{if(e.key==='Escape')clean(false)});

$('#fullscreen').onclick=async()=>{
  try{
    if(document.fullscreenElement)await document.exitFullscreen();
    else await $('.theater').requestFullscreen();
  }catch{
    $('#playback-label').textContent='Fullscreen is unavailable in this browser';
  }
};
$('#sprite-style').onchange=e=>{view.style=e.target.value;if(!running)resetPreview()};
$('#credits').onclick=()=>{const d=$('#credits-dialog');if(d.showModal)d.showModal();else d.setAttribute('open','')};
$('.dialog-close').onclick=()=>{const d=$('#credits-dialog');if(d.close)d.close();else d.removeAttribute('open')};

// Mode, Rules, Series, Tournament, Presets, Studio Listeners
$('#battle-mode')?.addEventListener('change',e=>{if(!running)configureModeUI(e.target.value,false)});
$('#mode-matchup')?.addEventListener('change',e=>{
  if(running)return;
  currentMatchup=e.target.value;
  if(currentMode==='region-wars'){
    const preset=MODE_CATALOG['region-wars'].matchups.find(m=>m.id===currentMatchup);
    if(preset&&currentMatchup!=='custom'){
      setVal($('#region-a'),preset.regionA);
      setVal($('#region-b'),preset.regionB);
    }
  }else if(currentMode==='type-wars'){
    const preset=MODE_CATALOG['type-wars'].matchups.find(m=>m.id===currentMatchup);
    if(preset&&currentMatchup!=='custom'){
      setVal($('#type-a'),preset.typeA);
      setVal($('#type-b'),preset.typeB);
    }
  }
  applyModeSelection(false);
});
for(const id of ['#region-a','#region-b','#region-pool']){
  $(id)?.addEventListener('change',()=>{
    if(running)return;
    if((id==='#region-a'||id==='#region-b')&&$('#mode-matchup')){setVal($('#mode-matchup'),'custom');currentMatchup='custom';}
    applyModeSelection(false);
  });
}
$('#starter-stage')?.addEventListener('change',()=>{if(!running)applyModeSelection(false)});
for(const id of ['#type-a','#type-b','#type-size']){
  $(id)?.addEventListener('change',()=>{
    if(running)return;
    if((id==='#type-a'||id==='#type-b')&&$('#mode-matchup')){setVal($('#mode-matchup'),'custom');currentMatchup='custom';}
    applyModeSelection(false);
  });
}
$('#battle-format')?.addEventListener('change',e=>{
  if(running)return;
  battleFormat=e.target.value;
  renderTeams();
  resetPreview();
});
$('#battle-rules')?.addEventListener('change',e=>{
  if(running)return;
  battleRules=e.target.value;
  resetPreview();
});
$('#series-mode')?.addEventListener('change',e=>{
  seriesLength=+e.target.value||1;
  seriesScore=[0,0];
  seriesGame=1;
  updateSeriesBanner();
});

// Tournament controls
$('#tournament-size')?.addEventListener('change',()=>{
  if(running)return;
  tournament=createTournament(+$('#tournament-size').value||8,$('#tournament-theme').value||'all');
  saveTournamentState();
  renderTournamentUI();
  loadCurrentTournamentMatch();
});
$('#tournament-theme')?.addEventListener('change',()=>{
  if(running)return;
  tournament=createTournament(+$('#tournament-size').value||8,$('#tournament-theme').value||'all');
  saveTournamentState();
  renderTournamentUI();
  loadCurrentTournamentMatch();
});
$('#tournament-reset')?.addEventListener('click',()=>{
  if(running)return;
  tournament=createTournament(+$('#tournament-size').value||8,$('#tournament-theme').value||'all');
  saveTournamentState();
  renderTournamentUI();
  loadCurrentTournamentMatch();
});
$('#tournament-sim-match')?.addEventListener('click',()=>{
  if(running||!tournament)return;
  const next=findNextTournamentMatch(tournament);
  if(!next)return;
  const res=simulateMatchInstant(next.match.teamA.ids,next.match.teamB.ids,cache,roster,battleRules,randomSeed());
  recordTournamentMatch(tournament,next.round,next.matchIndex,res.winner,res);
  saveTournamentState();
  renderTournamentUI();
  loadCurrentTournamentMatch();
});
$('#tournament-sim-round')?.addEventListener('click',()=>{
  if(running||!tournament)return;
  const first=findNextTournamentMatch(tournament);
  if(!first)return;
  const targetRound=first.round;
  let next=findNextTournamentMatch(tournament);
  while(next&&next.round===targetRound){
    const res=simulateMatchInstant(next.match.teamA.ids,next.match.teamB.ids,cache,roster,battleRules,randomSeed());
    recordTournamentMatch(tournament,next.round,next.matchIndex,res.winner,res);
    next=findNextTournamentMatch(tournament);
  }
  saveTournamentState();
  renderTournamentUI();
  loadCurrentTournamentMatch();
});

// Saved Presets listeners
$('#load-preset')?.addEventListener('click',()=>loadPresetByIndex(+$('#saved-presets').value||0));
$('#save-preset')?.addEventListener('click',()=>{
  const rawName=$('#preset-name')?.value?.trim();
  const name=rawName||`${view.teamName(0)} vs ${view.teamName(1)}`;
  const entry={
    name,
    mode:currentMode,
    matchup:currentMatchup,
    starterStage:$('#starter-stage')?.value||'final',
    format:battleFormat,
    rules:battleRules,
    teams:teams.map(t=>[...t]),
    titles:[view.teamName(0),view.teamName(1)]
  };
  savedPresets.unshift(entry);
  try{localStorage.setItem('bt-saved-matchups',JSON.stringify(savedPresets))}catch{}
  renderSavedPresets();
  if($('#preset-name'))$('#preset-name').value='';
});
$('#delete-preset')?.addEventListener('click',()=>{
  const idx=+$('#saved-presets').value||0;
  if(savedPresets.length<=1)return;
  savedPresets.splice(idx,1);
  try{localStorage.setItem('bt-saved-matchups',JSON.stringify(savedPresets))}catch{}
  renderSavedPresets();
});

// Studio & History listeners
$('#team-a-title')?.addEventListener('input',e=>{customTitles[0]=e.target.value;syncCustomTitles();if(!running)resetPreview()});
$('#team-b-title')?.addEventListener('input',e=>{customTitles[1]=e.target.value;syncCustomTitles();if(!running)resetPreview()});
$('#winner-subtitle')?.addEventListener('input',e=>{studio.winnerSubtitle=e.target.value});
$('#record-video')?.addEventListener('click',()=>{
  if(studio.recording){
    studio.stopRecording();
    $('#record-video').textContent='● Record 9:16 Video';
  }else{
    studio.startRecording(audioEngine);
    $('#record-video').textContent='■ Stop & Export Video';
  }
});
$('#clear-history')?.addEventListener('click',()=>{
  battleHistory=[];
  try{localStorage.removeItem('bt-battle-history')}catch{}
  renderHistory();
});

async function init(){
  try{
    [cache,roster,view.pmd,view.megaPmd]=await Promise.all([
      fetch('pokemon.json').then(r=>r.json()),
      fetch('roster.json').then(r=>r.json()),
      fetch('assets/pmd/manifest.json').then(r=>r.json()),
      fetch('assets/pmd/mega-manifest.json').then(r=>r.json())
    ]);
    Object.assign(view.pmd,view.megaPmd);
    view.loadPmd();
    try{
      const saved=JSON.parse(localStorage.getItem('bt-reference-teams'));
      if(saved?.length===2&&saved.every(t=>t.length===3&&t.every(id=>Number.isInteger(id)&&id>=1&&id<=1025))){
        await Promise.all(saved.flat().map(data));
        teams=saved;
      }
    }catch{}
    try{
      const customSaved=JSON.parse(localStorage.getItem('bt-saved-matchups'));
      if(Array.isArray(customSaved)&&customSaved.length)savedPresets=customSaved;
    }catch{}
    try{
      const savedHist=JSON.parse(localStorage.getItem('bt-battle-history'));
      if(Array.isArray(savedHist))battleHistory=savedHist;
    }catch{}
    try{
      const savedTourney=JSON.parse(localStorage.getItem('bt-tournament-state'));
      if(savedTourney?.rounds)tournament=savedTourney;
    }catch{}
    renderSavedPresets();
    renderHistory();
    await Promise.all(teams.flat().map(id=>ensurePmd(view,id)));
    renderTeams();
    resetPreview();
    view.drawArena();
    lockUI();
    requestAnimationFrame(frame);
  }catch(e){
    $('#playback-label').textContent='Could not load battle data. Refresh to retry.';
    $('#start').disabled=true;
    $('#stage-start').disabled=true;
    console.error(e);
  }
}
init();
