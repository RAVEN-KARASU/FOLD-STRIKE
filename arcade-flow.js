// Full arcade presentation. Combat remains in game.js; screen timers use wall time.
(function () {
  const root=document.createElement('section');root.id='arcade-flow';root.setAttribute('aria-label','FOLD//STRIKE');document.body.appendChild(root);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const modes=[{id:1,name:'VS CPU',detail:'Elige tu rival y lucha contra la CPU.'},{id:2,name:'VERSUS',detail:'Dos jugadores en un mismo equipo.'},{id:3,name:'REMOTO',detail:'La pelea en el PC; el mando en tu teléfono por Internet o red local.'},{id:4,name:'TRAINING',detail:'Practica con energía ilimitada y un rival configurable.'},{id:4,name:'TUTORIAL',tutorial:true,detail:'Aprende movimiento, ataques, defensa y contraataques en la arena.'},{id:2,name:'TORNEO',swiss:true,detail:'Nombres, proteínas y cruces suizos. Todos siguen compitiendo.'}];
  const homeItems=[{name:'ARCADE',detail:'VS CPU · VERSUS · REMOTO · TRAINING · TUTORIAL · TORNEO'},{name:'CAMPAÑA',detail:'Cinco capítulos. Anticuerpos, dianas y 20 encuentros.'},{name:'AJUSTES',detail:'Sonido, controles, imagen y reglas a tu medida.'},{name:'CRÉDITOS',detail:'Las personas, investigaciones y proyectos detrás del juego.'}];
  const fallback='assets/roster/1UBQ.svg';
  const safeImage=p=>p?.startsWith('assets/roster/')||p?.startsWith('assets/campaign/')||p?.startsWith('data:image/svg+xml;charset=utf-8,')?p:fallback;
  const game=()=>window.proteinFighter;
  const state={screen:'boot',rows:[],mode:1,modeIndex:0,homeIndex:0,tutorial:false,player:0,index:0,art:0,selected:[null,null],
    due:performance.now()+3600,lastNow:performance.now(),busy:false,error:'',pads:0,revision:0,remoteRevision:-1,
    bootIndex:0,creditIndex:0,dialogueIndex:0,dialogueLines:[],battleStage:0,
    campaignIndex:0,heroIndex:0,result:null,history:[],continues:0,customReturn:'select',guestConfirmed:false};
  const screenEvent=()=>dispatchEvent(new CustomEvent('protein-screen',{detail:state}));
  let afterDialogue=null;
  const current=()=>state.rows[state.index];
  function show(screen,seconds=0) {
    const changed=state.screen!==screen;
    const delay=changed?SceneTransition.run(root,()=>render(false)):SceneTransition.remaining;
    state.screen=screen;state.due=seconds?performance.now()+delay+seconds*1000:0;state.revision++;state.error='';if(!changed)render(false);
    if(screen==='dialogue')state.dialogueAt=performance.now()+delay;
    screenEvent();
  }
  function hide(){if(state.screen===null&&root.hidden)return;SceneTransition.run(root,()=>{root.hidden=true;document.documentElement.removeAttribute('data-arcade-screen');});state.screen=null;state.due=0;state.revision++;screenEvent();}
  function nameOf(i){return (SwissTournament.active&&game()?.selections[i]?.meta?.competitor)||state.selected[i]?.row?.name||game()?.selections[i]?.name||'PROTEIN';}
  function rowOf(i){return state.selected[i]?.row||game()?.selections[i]?.meta||{name:nameOf(i),portrait:fallback};}
  function artOf(i){return ProteinRoster.artsFor(rowOf(i))[state.selected[i]?.art??game()?.selections[i]?.meta?.art??0];}
  function header(){return '';} // Settings and controls live in the home/pause menus.
  function footer(label,sub=''){return `<footer class="flow-ribbon"><strong>${label}</strong><span>${sub}</span><b id="flow-countdown"></b></footer>`;}
  function portrait(row,cls=''){return `<img class="flow-portrait ${cls}" src="${esc(safeImage(row?.portrait))}" alt="${esc(row?.name||'Proteína')}" draggable="false">`;}
  function selectedPanel(row,player){return `<div class="select-model-preview">${portrait(row,'hero')}<canvas class="selection-model" role="img" aria-label="Vista tridimensional de ${esc(row?.name||'proteína')}"></canvas></div><div class="flow-player-name"><small>${player+1}P</small><strong>${esc(row?.name||'CUSTOM PDB')}</strong></div><div class="flow-bio">${SignatureMoves.get(row?.id)?`<strong class="signature-info">ESPECIAL · Q / LB: ${esc(SignatureMoves.get(row.id).name)}</strong><small>${esc(SignatureMoves.get(row.id).description)}</small>`:''}<p>${esc(row?.overview||row?.description||'Tu proteína, tu luchador.')}</p><span>${row?.pdb?`PDB ${esc(row.pdb)} · CADENA ${esc(row.chain?.trim()||'sin ID')} · ${row.residues} RESIDUOS`:'IMPORTA PDB / mmCIF / ALPHAFOLD'}</span>${row?.pdb?`<button data-action="dossier">FUNCIÓN, APLICACIONES Y DOI</button><a href="https://doi.org/${esc(row.doi||'10.2210/pdb'+row.pdb+'/pdb')}" target="_blank" rel="noopener noreferrer">DOI ${esc(row.doi||'10.2210/pdb'+row.pdb+'/pdb')}</a>`:''}</div>`;}
  function dossier(){
    const row=state.screen==='campaign-hero'?ProteinCampaign.actor(ProteinCampaign.chapter.heroes[state.heroIndex]):['select','opponent'].includes(state.screen)?current():rowOf(state.player);if(!row?.pdb)return;
    let dialog=document.getElementById('protein-dossier');
    if(!dialog){dialog=document.createElement('dialog');dialog.id='protein-dossier';dialog.addEventListener('keydown',e=>e.stopPropagation());document.body.appendChild(dialog);}
    dialog.innerHTML=`<button class="dossier-close">VOLVER · B</button><small>FICHA MOLECULAR</small><h2>${esc(row.name)}</h2><h3>QUÉ ES</h3><p>${esc(row.overview||row.description)}</p><h3>USO E INTERÉS CIENTÍFICO</h3><p>${esc(row.application||'Estructura personalizada importada por el jugador.')}</p><p>${esc(row.archiveNote||'')}</p><h3>ESTRUCTURA EXPERIMENTAL</h3><p>${esc(row.title||'')}<br>PDB ${esc(row.pdb)} · cadena ${esc(row.chain?.trim()||'sin ID')} · ${row.residues||''} residuos</p><a href="https://doi.org/${esc(row.doi)}" target="_blank" rel="noopener noreferrer">DOI PDB: ${esc(row.doi)}</a>${row.articleDoi?`<a href="https://doi.org/${esc(row.articleDoi)}" target="_blank" rel="noopener noreferrer">DOI del artículo: ${esc(row.articleDoi)}</a>`:''}<p class="dossier-note">El luchador adapta la estructura y añade extremidades. Sus movimientos y estadísticas son reglas del juego.</p>`;
    dialog.querySelector('button').onclick=()=>dialog.close();dialog.showModal();
  }
  function grid(){return `<div class="flow-roster" role="group" aria-label="20 proteínas, Random e importación">${state.rows.map((row,i)=>`<button class="roster-card ${i===state.index?'selected':''}" data-index="${i}" aria-label="${esc(row.name)} ${row.pdb}" aria-pressed="${i===state.index}" style="--portrait-hue:${row.hue}"><img src="${row.portrait}" alt=""><span>${esc(row.name)}</span>${i===state.index?`<b>${state.player+1}P</b>`:''}</button>`).join('')}<button class="roster-card random-card ${state.index===21?'selected':''}" data-index="21" aria-label="Random: proteína y Super Art al azar"><img src="assets/roster/random.svg" alt="?"></button><button class="roster-custom ${state.index===20?'selected':''}" data-index="20">＋ CUSTOM PDB</button></div>`;}

  function render(preserveFocus=true) {
    const focusKey=preserveFocus?MenuInput.token(MenuInput.current(root)):null;
    const screen=state.screen;document.documentElement.dataset.arcadeScreen=screen||'';
    // Preserve the animated title DOM when changing modes, instead of restarting
    // its logo animation and recreating its focused button on every stick tap.
    if(preserveFocus&&screen==='title'&&root.dataset.screen==='title'&&root.querySelector('.flow-modes')){
      root.querySelectorAll('[data-home]').forEach(b=>b.classList.toggle('selected',+b.dataset.home===state.homeIndex));
      root.querySelector('.mode-description').textContent=homeItems[state.homeIndex].detail;return;
    }
    if(!screen){root.hidden=true;return;}
    if(screen==='remote'){root.hidden=true;return;}
    root.hidden=false;root.dataset.screen=screen;
    let html='';
    if(screen==='boot') html=Presentation.boot(state.bootIndex);
    else if(screen==='title') html=`${header('')}<div class="title-emblem"><small>FIGHT FOR THE FOLD</small><h1 class="fold-title"><img class="fold-wordmark" src="assets/brand/foldstrike-wordmark.png" alt="FOLD//STRIKE" width="2172" height="724"></h1><p>MOLECULAR ARCADE</p></div><div class="flow-modes">${homeItems.map((m,i)=>`<button data-home="${i}" class="${i===state.homeIndex?'selected':''}">${m.name}</button>`).join('')}</div><p class="mode-description">${homeItems[state.homeIndex].detail}</p><a class="lab-credit" href="https://sbbcs-ufro.github.io/page/" target="_blank" rel="noopener noreferrer">© 2026 SB²CS® — Universidad de La Frontera. All rights reserved.</a>`;
    else if(screen==='arcade')html=`${header('ARCADE')}<div class="arcade-menu"><small>ELIGE CÓMO JUGAR</small><h1>UNA ARENA.<br>SEIS MANERAS DE ENTRAR.</h1><div>${modes.map((m,i)=>`<button data-mode="${i}" class="${i===state.modeIndex?'selected':''}"><strong>${m.name}</strong><span>${m.detail}</span></button>`).join('')}</div><footer><button data-action="back">REGRESAR</button><button data-action="settings">PERSONALIZAR ARCADE</button></footer></div>`;
    else if(screen==='swiss-setup')html=header('ARCADE · TORNEO')+SwissUI.setup(state.rows);
    else if(screen==='swiss-board')html=header('TORNEO SUIZO')+SwissUI.board(state.rows);
    else if(screen==='tournament')html=`${header('TORNEO · SERIE COMPLETADA')}<div class="tournament-finale"><small>CAMPEÓN DE LA SERIE</small><h1>${esc(nameOf(Tournament.state.wins[0]>Tournament.state.wins[1]?0:1))}</h1><strong>${Tournament.state.wins.join(' — ')}</strong><p>Primero en ganar ${Tournament.state.target} combates.</p><button data-action="statistics">ESTADÍSTICAS DEL ÚLTIMO COMBATE</button><button data-action="arcade">VOLVER A ARCADE</button></div>`;
    else if(screen==='lan')html=header('REMOTE · MANDOS POR QR')+LocalControls.panel();
    else if(screen==='dialogue')html=header('HISTORIA · '+ProteinCampaign.chapter.topic)+Presentation.dialogue(state);
    else if(screen==='credits')html=Presentation.credit(state.creditIndex);
    else if(['campaign','campaign-hero','campaign-map','chapter-brief','chapter-clear','campaign-complete'].includes(screen))html=campaignScreen(screen);
    else if(['select','opponent'].includes(screen)) {
      const row=state.index===21?{name:'RANDOM',description:'Proteína y Super Art al azar. Una elección y a combatir.',portrait:'assets/roster/random.svg'}:current()||state.selected[state.player]?.row;
      html=`${header(screen==='opponent'?([2,3].includes(state.mode)?'2P PLAYER SELECT':'CHOOSE YOUR OPPONENT'):'1P PLAYER SELECT')}${selectedPanel(row,state.player)}${grid()}<div class="flow-select-actions"><button data-action="back">ATRÁS</button><button class="confirm" data-action="confirm">${state.index===20?'BUSCAR PROTEÍNA':'CONFIRMAR'}</button></div>${footer(screen==='opponent'?([2,3].includes(state.mode)?'PLAYER SELECT':'FIRST STAGE'):'PLAYER SELECT','20 ESTRUCTURAS PDB · ↑ ↓ ← → / STICK · ENTER / A')}`;
    } else if(screen==='arts') {
      const row=rowOf(state.player);
      html=`${header(`${state.player+1}P ${row.name}`)}${selectedPanel(row,state.player)}<div class="flow-arts">${ProteinRoster.artsFor(row).map((a,i)=>`<button class="art-card ${i===state.art?'selected':''}" data-art="${i}"><b>${a.roman}</b><span><strong>${a.name}</strong><small>${a.description}</small><em>↓ ↘ → ↓ ↘ → + ATAQUE · E / LT</em></span><i>${a.type}</i></button>`).join('')}</div><div class="flow-select-actions"><button data-action="back">ATRÁS</button><button class="confirm" data-action="confirm">ELEGIR SUPER ART</button></div>${footer('SUPER ARTS SELECT',`${esc(row.name)} · UN BOTÓN PARA ACTIVAR TU ELECCIÓN`)}`;
    } else if(screen==='versus'||screen==='waiting') {
      html=`${header(screen==='waiting'?'WAITING FOR CHALLENGER':'NEXT BATTLE')}${portrait(rowOf(0),'vs-left')}${portrait(rowOf(1),'vs-right')}<div class="vs-name left"><small>1P</small><strong>${esc(nameOf(0))}</strong><span>${artOf(0).roman} · ${artOf(0).name}</span></div><div class="versus-mark">VS</div><div class="vs-name right"><small>2P${[1,5].includes(state.mode)?' · CPU':''}</small><strong>${esc(nameOf(1))}</strong><span>${artOf(1).roman} · ${artOf(1).name}</span></div><div class="flow-loading" aria-live="polite">${state.error?esc(state.error):screen==='waiting'?'ESPERANDO AL ANFITRIÓN':state.busy?'PREPARANDO ESTRUCTURAS…':'READY TO FIGHT'}</div>${state.error?'<button class="flow-retry" data-action="retry">REINTENTAR</button>':''}`;
    } else if(['winner','continue','gameover','results'].includes(screen)) {
      const r=state.result||{winner:0,stats:[{},{}],wins:[0,0]}, winner=Math.max(0,r.winner), row=rowOf(winner), st=r.stats[winner]||{};
      const score=Math.round((st.damage||0)*100+(st.parries||0)*300+(st.supers||0)*500+(r.wins[winner]||0)*1000);
      const value=(st.hits||0)*2+(st.blocks||0)+(st.parries||0)*5+(st.supers||0)*4;
      const grade=value>=50?'S':value>=35?'A':value>=24?'B':value>=15?'C':value>=8?'D':value>=4?'E':value>0?'F':'G';
      html=`${header(screen==='winner'?'WINNER':screen==='results'?'FINAL RESULTS':screen==='gameover'?'GAME OVER':'CONTINUE?')}${portrait(row,'winner-portrait')}<div class="winner-name">${esc(row.name)}</div><div class="winner-stats"><h2>${screen==='results'?'FINAL RESULTS':'WINNER'}</h2><div class="result-grade">${grade}</div><dl><dt>OFFENSE</dt><dd>${st.hits||0} HITS</dd><dt>DEFENSE</dt><dd>${(st.blocks||0)+(st.parries||0)} GUARDS</dd><dt>TECHNIQUE</dt><dd>${(st.specials||0)+(st.supers||0)} ARTS</dd></dl><strong>SCORE ${String(score).padStart(8,'0')}</strong><small>${r.wins.join(' — ')} · ${state.history.length} COMBATE${state.history.length===1?'':'S'}</small></div>`;
      if(screen==='winner')html+=`<div class="winner-quote">“Cada estructura tiene una apertura.<br>Encuentra la tuya.”</div><div class="result-actions winner-actions"><button data-action="confirm">CONTINUAR</button><button data-action="statistics">ESTADÍSTICAS</button></div>`;
      else if(screen==='continue')html+=`${footer('CONTINUE?','A / ENTER PARA REVANCHA · B / ESC PARA RESULTADOS')}<div class="continue-number" id="continue-number">10</div><div class="result-actions"><button data-action="confirm">CONTINUAR</button><button data-action="statistics">ESTADÍSTICAS</button></div>`;
      else if(screen==='gameover')html+=footer('GAME OVER');
      else html+=`<div class="result-actions"><button data-action="confirm">NUEVO DESAFÍO</button><button data-action="home">INICIO</button></div><div class="stage-history">${state.history.map((h,i)=>`<span>${i+1} · ${esc(h.names[Math.max(0,h.winner)])}</span>`).join('')}</div>`;
    } else if(screen==='error')html=`${header('NO SE PUDO CARGAR')}<div class="flow-error">${esc(state.error)}<button data-action="reload">RECARGAR</button></div>`;
    if(screen==='results')html=resultsPanel();
    if(screen==='title')html+='<a class="credits-access" href="https://foldstrike.framer.website/" target="_blank" rel="noopener noreferrer">FEEDBACK ↗</a><a class="raven-access" href="https://raven-karasu.github.io/page/" target="_blank" rel="noopener noreferrer">RAVEN ↗</a>';
    if(screen==='winner'&&Tournament.state)html+=`<div class="tournament-score">TORNEO · ${Tournament.state.wins.join(' — ')} · PRIMERO A ${Tournament.state.target}</div>`;
    if(screen==='dialogue'&&root.querySelector('.dialogue-stage')){
      const next=document.createElement('div');next.innerHTML=html;
      root.querySelector('.dialogue-stage').dataset.speaker=next.querySelector('.dialogue-stage').dataset.speaker;
      root.querySelector('.dialogue-box').innerHTML=next.querySelector('.dialogue-box').innerHTML;
      root.querySelectorAll('.story-fighter').forEach((el,i)=>el.classList.toggle('speaking',next.querySelectorAll('.story-fighter')[i].classList.contains('speaking')));
    }else root.innerHTML=html;
    if(screen.startsWith('swiss-'))SwissUI.mount(root,state.rows,{show,play:async index=>{const pair=SwissTournament.startPair(index);state.mode=2;state.tutorial=false;state.history=[];state.selected=pair.map(p=>({row:state.rows.find(r=>r.id===p.protein),art:p.art}));if(state.selected.some(s=>!s.row))throw new Error('No se encuentra una proteína del torneo.');game().beginSelection();await prepareBattle();}});
    window.DialogueModels?.mount(state,['select','opponent'].includes(screen)?(state.index<20?current():null):['arts','campaign-hero'].includes(screen)?(screen==='campaign-hero'?ProteinCampaign.actor(ProteinCampaign.chapter.heroes[state.heroIndex]):rowOf(state.player)):null);if(screen==='lan')LocalControls.mount();MenuInput.restore(root,focusKey);if(screen==='dialogue'&&!MenuInput.current(root))MenuInput.focus(root.querySelector('.dialogue-box [data-choice].selected')||root.querySelector('.dialogue-box [data-action=confirm]'));updateDialogue(performance.now());
  }
  function resultsPanel(){
    const r=state.result||{stats:[{},{}],wins:[0,0]},stats=[0,1].map(i=>r.stats?.[i]||{});
    const rows=[['Ataques realizados',s=>s.attacks||0],['Ataques acertados',s=>s.landedAttacks||0],['Efectividad',s=>(s.attacks?100*(s.landedAttacks||0)/s.attacks:0).toFixed(1)+' %'],['Impactos totales',s=>s.hits||0],['Saltos',s=>s.jumps||0],['Combo máximo',s=>s.maxCombo||0],['Choques / ganados',s=>(s.clashes||0)+' / '+(s.clashWins||0)],['Contraataques',s=>s.counters||0],['Bloqueos',s=>s.blocks||0],['Parries',s=>s.parries||0],['Especiales / Super Arts',s=>(s.specials||0)+' / '+(s.supers||0)],['Daño causado',s=>(s.damage||0).toFixed(1)],['Daño recibido',s=>(s.damageTaken||0).toFixed(1)]];
    return `${header('RESULTADOS DE LA PARTIDA')}<div class="match-report"><h1>ASÍ FUE EL COMBATE</h1><p>${r.wins.join(' — ')} RONDAS · ${(stats[0].activeSeconds||0).toFixed(1)} s DE TIEMPO ACTIVO</p><table><thead><tr><th>ESTADÍSTICA</th><th>${esc(nameOf(0))}</th><th>${esc(nameOf(1))}</th></tr></thead><tbody>${rows.map(([label,value])=>`<tr><th>${label}</th>${stats.map(st=>`<td>${value(st)}</td>`).join('')}</tr>`).join('')}</tbody></table><small>Efectividad = ataques que impactaron sin bloqueo / ataques realizados. Un especial puede producir varios impactos. El daño mide puntos de vida perdidos.</small></div><div class="result-actions"><button data-action="back">VOLVER</button><button data-action="confirm">CONTINUAR</button><button data-action="home">INICIO</button></div>`;
  }
  function startDialogue(kind,done){
    const C=ProteinCampaign,p=C.progress,stage=kind==='post'?state.battleStage:p.stage;
    state.choiceIndex=0;state.dialogueKind=kind;state.dialogueStage=stage;state.dialogueIndex=0;
    state.dialogueHero=C.actor(p.hero);state.dialogueBoss=C.actor(C.chapter.bosses[kind==='intro'?3:stage]);
    state.dialogueLines=CampaignStory.lines(C.chapter,stage,kind);state.dialogueAt=performance.now();state.dialogueRevealed=false;
    afterDialogue=done;show('dialogue');
  }
  function updateDialogue(now){
    if(state.screen!=='dialogue')return;
    const text=state.dialogueLines[state.dialogueIndex]?.text||'',el=root.querySelector('#dialogue-typed');
    const count=state.dialogueRevealed||matchMedia('(prefers-reduced-motion: reduce)').matches?text.length:Math.floor((now-state.dialogueAt)/19);
    if(el){const value=text.slice(0,Math.max(0,count));if(el.textContent!==value)el.textContent=value;}
    root.querySelectorAll('[data-choice]').forEach(b=>b.disabled=count<text.length);
  }
  function finishDialogue(){const done=afterDialogue;afterDialogue=null;if(done)done();}
  function advanceDialogue(){
    const text=state.dialogueLines[state.dialogueIndex].text;
    if(!state.dialogueRevealed&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&(performance.now()-state.dialogueAt)/19<text.length){state.dialogueRevealed=true;updateDialogue(performance.now());return;}
    if(state.dialogueLines[state.dialogueIndex].choices){chooseDialogue(state.choiceIndex||0);return;}
    if(++state.dialogueIndex>=state.dialogueLines.length){finishDialogue();return;}
    state.dialogueAt=performance.now();state.dialogueRevealed=false;render();
  }
  function chooseDialogue(index){
    if(SceneTransition.active)return;
    const l=state.dialogueLines[state.dialogueIndex],choice=l?.choices?.[index];if(!choice)return;
    AudioDirector.nav();
    // Resolve once; going back never adds another branch or repeats indefinitely.
    state.dialogueLines[state.dialogueIndex]={speaker:'hero',text:choice.label};
    state.dialogueLines.splice(state.dialogueIndex+1,0,{speaker:'boss',text:choice.response});
    state.dialogueIndex++;state.choiceIndex=0;state.dialogueAt=performance.now();state.dialogueRevealed=false;render();
  }
  function startCredits(){state.creditY=0;state.creditFinished=false;state.creditsPaused=matchMedia('(prefers-reduced-motion: reduce)').matches;show('credits');}
  function creditControl(){const b=root.querySelector('[data-action="credits-pause"]');if(b)b.textContent=state.creditFinished?'FINALIZAR · A / ENTER':state.creditsPaused?'CONTINUAR · A / ESPACIO':'PAUSAR · A / ESPACIO';}
  function nextCredit(){if(state.creditFinished){home();return;}state.creditsPaused=!state.creditsPaused;creditControl();}
  function scrollCredits(elapsed){
    const viewport=root.querySelector('.credits-viewport');if(!viewport)return;
    if(!state.creditsPaused&&!state.creditFinished){state.creditY+=Math.min(100,elapsed)*.035;viewport.scrollTop=state.creditY;}
    else state.creditY=viewport.scrollTop;
    if(!state.creditFinished&&viewport.scrollHeight>viewport.clientHeight&&viewport.scrollTop>=viewport.scrollHeight-viewport.clientHeight-2){
      state.creditFinished=true;ProteinCampaign.endingSeen();creditControl();
    }
  }
  function nextIntro(){if(++state.bootIndex>=Presentation.introCount){show('title');return;}const delay=SceneTransition.run(root,()=>{render(false);screenEvent();});state.due=performance.now()+delay+3600;state.revision++;}
  function highlight(el){if(!el)return;
    if(el.dataset.index!==undefined)state.index=+el.dataset.index;
    else if(el.dataset.art!==undefined)state.art=+el.dataset.art;
    else if(el.dataset.home!==undefined)state.homeIndex=+el.dataset.home;
    else if(el.dataset.mode!==undefined)state.modeIndex=+el.dataset.mode;
    else if(el.dataset.chapter!==undefined)state.campaignIndex=+el.dataset.chapter;
    else if(el.dataset.hero!==undefined)state.heroIndex=+el.dataset.hero;
    else return;
    render();
  }
  function campaignScreen(screen){
    const C=ProteinCampaign,p=C.progress,ch=C.chapter,chosen=C.chapters[state.campaignIndex];
    const note='<p class="campaign-note">Los combates son ficción educativa. Solo el jefe final es la diana directa del anticuerpo; los otros encuentros exploran su vía biológica.</p>';
    if(screen==='campaign')return `${header('CAMPAÑA · 5 CAPÍTULOS')}<div class="campaign-layout"><div class="chapter-list">${C.chapters.map((c,i)=>`<button data-chapter="${i}" class="chapter-card ${i===state.campaignIndex?'selected':''}"><b>0${i+1}</b><span>${esc(c.name)}<small>${esc(c.topic)} ${p.completed.includes(c.id)?' · COMPLETADO':''}</small></span></button>`).join('')}</div><div class="campaign-detail">${portrait(C.actor(chosen.heroes[0]),'campaign-portrait')}<h2>${esc(chosen.name)}</h2><p>${esc(chosen.intro)}</p><p>3 JEFES + JEFE FINAL · ${p.completed.length}/5 CAPÍTULOS</p>${note}</div></div><div class="campaign-actions"><button data-action="back">REGRESAR</button>${p.active||p.stage===4?'<button data-action="resume-campaign">REANUDAR / VER DESENLACE</button>':''}<button data-action="confirm">ELEGIR CAPÍTULO</button></div>`;
    if(screen==='chapter-brief')return `${header('EXPEDICIÓN · '+ch.topic)}<article class="chapter-research"><small>CAPÍTULO ${p.chapter+1}</small><h1>${esc(ch.name)}</h1><p>${esc(ch.context)}</p><h2>UNA INVESTIGACIÓN REAL</h2><p>${esc(ch.research.summary)}</p><a href="https://doi.org/${esc(ch.research.doi)}" target="_blank" rel="noopener noreferrer">${esc(ch.research.citation)} · DOI ${esc(ch.research.doi)} ↗</a><small>${esc(ch.lesson)}</small></article><div class="campaign-actions"><button data-action="back">REGRESAR</button><button data-action="confirm">VER LA RUTA</button></div>`;
    if(screen==='campaign-hero')return `${header('ELIGE TU ANTICUERPO')}${selectedPanel(C.actor(ch.heroes[state.heroIndex]),0)}<div class="hero-choices">${ch.heroes.map((id,i)=>`<button data-hero="${i}" class="chapter-card ${i===state.heroIndex?'selected':''}">${portrait(C.actor(id))}<strong>${esc(C.actor(id).name)}</strong></button>`).join('')}</div><div class="campaign-actions"><button data-action="back">REGRESAR</button><button data-action="confirm">ELEGIR SUPER ART</button></div>`;
    if(screen==='campaign-map'){
      const boss=C.actor(ch.bosses[p.stage]);
      return `${header(`CAPÍTULO ${p.chapter+1} · ${ch.topic}`)}<div class="campaign-brief"><h2>${p.stage===3?'FINAL BOSS':'JEFE '+(p.stage+1)} · ${esc(boss.name)}</h2><div class="campaign-path">${ch.bosses.map((id,i)=>`<div class="path-node ${i===p.stage?'current':''} ${i<p.stage?'cleared':''}">${portrait(C.actor(id))}<b>${i===3?'FINAL':String(i+1).padStart(2,'0')}</b><span>${esc(C.actor(id).name)}</span></div>`).join('')}</div><p>${esc(boss.overview)}</p><p>${esc(boss.application)}</p><a href="https://doi.org/${esc(boss.doi)}" target="_blank" rel="noopener noreferrer">DOI ${esc(boss.doi)}</a>${note}</div><div class="campaign-actions"><button data-action="back">REGRESAR</button><button data-action="confirm">COMBATIR</button></div>`;
    }
    return `${header(screen==='campaign-complete'?'CAMPAÑA COMPLETA':'CAPÍTULO COMPLETADO')}<div class="campaign-finale"><small>${p.completed.length}/5 CAPÍTULOS COMPLETADOS</small><h2>${screen==='campaign-complete'?'MOLECULAR CHAMPION':esc(ch.name)}</h2>${portrait(C.actor(p.hero),'campaign-portrait')}<p>${esc(ch.lesson)}</p><p>Progreso guardado en este navegador.</p></div><div class="campaign-actions"><button data-action="back">CAPÍTULOS</button><button data-action="confirm">${screen==='campaign-complete'?'VER CRÉDITOS':'SIGUIENTE CAPÍTULO'}</button></div>`;
  }
  function campaignMap(){
    const C=ProteinCampaign,p=C.progress;if(!p.hero)return show('campaign');
    if(p.stage>=4){if(p.completed.length===5){startCredits();return;}return show('chapter-clear');}
    document.documentElement.classList.toggle('final-boss',p.stage===3);
    state.mode=5;state.selected=C.selection();state.player=0;game().beginSelection();
    show('campaign-map'); // Arena changes only through the player's settings.
  }
  function campaignConfirm(){
    const C=ProteinCampaign;
    if(state.screen==='campaign'){C.start(state.campaignIndex);state.heroIndex=0;state.player=0;show('campaign-hero');return true;}
    if(state.screen==='campaign-hero'){state.selected[0]={row:C.actor(C.chapter.heroes[state.heroIndex]),art:0};state.player=0;state.art=0;show('arts',20);return true;}
    if(state.screen==='chapter-brief'){campaignMap();return true;}
    if(state.screen==='campaign-map'){state.selected=C.selection();state.battleStage=C.progress.stage;startDialogue('pre',prepareBattle);return true;}
    if(state.screen==='chapter-clear'){state.campaignIndex=(C.progress.chapter+1)%5;C.start(state.campaignIndex);state.heroIndex=0;show('campaign-hero');return true;}
    if(state.screen==='campaign-complete'){startCredits();return true;}
    return false;
  }
  function advanceWinner(){continueAfterResults();}
  function viewStatistics(){state.resultsReturn=state.screen;show('results');}
  function continueAfterResults(){
    if(SwissTournament.active){game().beginSelection();show('swiss-board');return;}
    if(state.mode===2&&Tournament.state){if(Tournament.state.finished)show('tournament');else prepareBattle();return;}
    if(state.mode===5){if(state.result.winner===0)startDialogue('post',()=>{if(ProteinCampaign.progress.completed.length===5&&ProteinCampaign.progress.stage===4)startCredits();else campaignMap();});else show('continue',10);return;}
    if(state.mode===1&&state.result.winner===0&&!game().net.guest){game().beginSelection();state.player=1;state.index=(state.rows.findIndex(r=>r.id===rowOf(1).id)+1)%20;show('opponent',30);}
    else if(game().net.guest)show('waiting');else show('continue',10);
  }
  function begin(){document.documentElement.classList.remove('final-boss');game().beginSelection();state.player=game().net.guest?1:0;state.index=0;show('select',30);}
  async function acceptArt(){
      state.selected[state.player].art=state.art;
      if(state.mode===5){ProteinCampaign.choose(state.selected[0].row.id,state.art);show('chapter-brief');return;}
      if(game().net.guest){await guestReady();return;}
      if(state.player===0){state.player=1;state.index=(state.rows.indexOf(state.selected[0].row)+1)%20;show('opponent',30);return;}
      if(state.mode===3&&!LocalControls.active){show('lan');try{await LocalControls.create();if(state.screen==='lan')render();}catch(e){state.error=e.message;root.innerHTML=header('REMOTE')+'<div class=flow-error>'+esc(e.message)+'<button data-action=back>REGRESAR</button></div>';}return;}
      await prepareBattle();return;
  }
  async function confirm() {
    if(state.busy||SceneTransition.active)return;
    if(state.screen==='dialogue')AudioDirector.nav();else AudioDirector.sfx('select');
    if(state.screen!=='boot'&&state.rows.length!==20)return;
    if(game().net.guest&&state.screen==='results'){home();return;}
    if(game().net.guest&&state.screen==='continue'){if(!game().net.watch)game().requestRematch();show('waiting');return;}
    if(state.screen==='boot'){show('title');return;}
    if(state.screen==='lan'){if(LocalControls.connected.some(Boolean))await prepareBattle();return;}
    if(state.screen==='dialogue'){advanceDialogue();return;}
    if(state.screen==='credits'){nextCredit();return;}
    if(state.screen==='title'){
      if(state.homeIndex===0)show('arcade');
      else if(state.homeIndex===1){state.mode=5;Tournament.reset();state.tutorial=false;await ProteinCampaign.ready;state.campaignIndex=ProteinCampaign.progress.chapter;show('campaign');}
      else if(state.homeIndex===2)ArcadeSettings.open();else startCredits();return;
    }
    if(state.screen==='arcade'){SwissTournament.suspend();GameOptions.set('tournament',false);if(modes[state.modeIndex].swiss){Tournament.reset();state.mode=2;state.tutorial=false;show('swiss-setup');return;}state.mode=modes[state.modeIndex].id;state.tutorial=!!modes[state.modeIndex].tutorial;state.history=[];state.continues=0;Tournament.reset();window.TrainingGuide?.stop();begin();return;}
    if(state.screen==='tournament'){Tournament.reset();show('arcade');return;}
    if(campaignConfirm())return;
    if(['select','opponent'].includes(state.screen)){
      if(state.index===21){state.index=Math.floor(Math.random()*20);state.art=Math.floor(Math.random()*3);state.selected[state.player]={row:current(),art:state.art};await acceptArt();return;}
      if(state.index===20){state.customReturn=state.screen;state.screen='custom';root.hidden=true;document.documentElement.removeAttribute('data-arcade-screen');game().openCustom(state.player);return;}
      state.selected[state.player]={row:current(),art:0};state.art=0;show('arts',20);return;
    }
    if(state.screen==='arts'){await acceptArt();return;}
    if(state.screen==='versus'){if(!state.busy&&!game().net.guest)launch();return;}
    if(state.screen==='continue'){state.continues++;if(state.mode===5)state.selected=ProteinCampaign.selection();await prepareBattle();return;}
    if(state.screen==='results'){continueAfterResults();return;}
    if(state.screen==='winner'){advanceWinner();return;}
  }
  function back() {
    if(state.busy||SceneTransition.active)return;
    if(state.screen==='dialogue')AudioDirector.nav();else AudioDirector.sfx('select');
    if(state.screen.startsWith('swiss-')){SwissTournament.suspend();show('arcade');return;}
    if(SwissTournament.active&&state.screen==='versus'){state.due=0;show('swiss-board');return;}
    if(state.screen==='lan'){LocalControls.stop();state.player=1;show('opponent',30);return;}
    if(state.screen==='dialogue'){
      if(state.dialogueIndex>0){state.dialogueIndex--;state.dialogueAt=performance.now();state.dialogueRevealed=true;render();}
      else if(state.dialogueKind==='pre'){afterDialogue=null;campaignMap();}else finishDialogue();return;
    }
    if(['credits','arcade','tournament'].includes(state.screen)){home();return;}
    if(state.mode===5&&state.screen==='arts'){show('campaign-hero');return;}
    if(['campaign-hero','campaign-map','chapter-brief','chapter-clear','campaign-complete'].includes(state.screen)){show('campaign');return;}
    if(['campaign','remote','waiting'].includes(state.screen)){home();return;}
    if(state.screen==='arts'){state.index=Math.max(0,state.rows.indexOf(state.selected[state.player]?.row));show(state.player===0||game().net.guest?'select':'opponent',30);}
    else if(state.screen==='opponent'){state.player=0;state.art=state.selected[0]?.art||0;show('arts',20);}
    else if(state.screen==='select')show('arcade');
    else if(state.screen==='winner')continueAfterResults();
    else if(state.screen==='continue')show('results');
    else if(state.screen==='results'){if(['winner','tournament'].includes(state.resultsReturn))show(state.resultsReturn);else home();}
  }
  async function selectionSpec(i) {
    const selected=state.selected[i],art=ProteinRoster.artsFor(selected.row)[selected.art];
    if(selected.spec)return {...selected.spec,meta:{...selected.row,art:selected.art,superMove:art.move,superLabel:selected.row.name+' / '+art.name,speed:selected.row.speed||1,power:selected.row.power||1}};
    return ProteinRoster.load(selected.row,selected.art);
  }
  async function prepareBattle() {
    state.busy=true;show('versus');
    try{
      await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));
      const specs=await Promise.all([selectionSpec(0),selectionSpec(1)]);
      if(state.mode===5){const boss=ProteinCampaign.bossMeta();specs[1].meta={...specs[1].meta,cpuLevel:boss.cpuLevel,power:specs[1].meta.power*boss.powerScale};}
      if(SwissTournament.active){const event=SwissTournament.state,pair=event.rounds.at(-1)[event.current];specs.forEach((s,i)=>s.meta={...s.meta,competitor:event.players[i?pair.b:pair.a].name});}
      game().selectPair(specs);
      state.busy=false;state.due=performance.now()+SceneTransition.remaining+2200;render();
    }catch(error){state.busy=false;state.error=error.message;state.due=0;render();}
  }
  function launch(){if(state.busy)return;Tournament.begin(state.mode);hide();if(!game().net.guest)game().startMatch(state.mode===3&&LocalControls.active?2:state.mode);if(state.tutorial)window.TrainingGuide?.start();}
  function home(){SwissTournament.suspend();window.TrainingGuide?.stop();Tournament.reset();window.LocalControls?.stop();document.documentElement.classList.remove('final-boss');afterDialogue=null;if(game().net.guest){location.href=location.pathname;return;}game().leaveMatch();state.busy=false;state.result=null;show('title');}
  async function hostReady(){state.busy=true;show('versus');try{game().selectPlayer(0,await selectionSpec(0));state.busy=false;show('remote');game().startMatch(3);}catch(e){state.busy=false;state.error=e.message;render();}}
  async function guestReady(){state.busy=true;show('waiting');try{game().selectPlayer(1,await selectionSpec(1));state.guestConfirmed=true;game().remoteConfirm();state.busy=false;}catch(e){state.busy=false;state.error=e.message;render();}}
  function syncSelections(){for(let i=0;i<2;i++){const s=game().selections[i];if(s)state.selected[i]={spec:s,row:s.meta||{id:'custom'+i,name:s.name,portrait:ProteinRoster.customPortrait(s)},art:s.meta?.art||0};}}
  function navigate(dx,dy) {
    if(state.screen==='credits'&&!SceneTransition.active){const v=root.querySelector('.credits-viewport');if(v){state.creditsPaused=true;v.scrollTop+=(dy||dx)*160;state.creditY=v.scrollTop;creditControl();}return;}
    if(state.busy||SceneTransition.active)return;
    AudioDirector.nav();
    if(state.screen==='dialogue'){const el=MenuInput.move(root.querySelector('.dialogue-box'),dx,dy);if(el?.dataset.choice!==undefined){state.choiceIndex=+el.dataset.choice;root.querySelectorAll('[data-choice]').forEach(b=>b.classList.toggle('selected',b===el));}return;}
    if(state.screen==='title'){state.homeIndex=(state.homeIndex+(dx||dy)+homeItems.length)%homeItems.length;render();}
    else if(state.screen==='arcade'){state.modeIndex=(state.modeIndex+(dx||dy)+modes.length)%modes.length;render();}
    else if(['select','opponent'].includes(state.screen)){state.index=Math.max(0,Math.min(21,state.index+dx+dy*4));render();}
    else if(state.screen==='campaign'){state.campaignIndex=(state.campaignIndex+(dx||dy)+5)%5;render();}
    else if(state.screen==='campaign-hero'){const n=ProteinCampaign.chapter.heroes.length;state.heroIndex=(state.heroIndex+(dx||dy)+n)%n;render();}
    else if(state.screen==='arts'){state.art=(state.art+(dx||dy)+3)%3;render();}
  }
  function tick(now) {
    const elapsed=Math.max(0,now-state.lastNow);state.lastNow=now;
    if(SceneTransition.active)return;
    if(document.hidden||window.AttractMode?.active||document.querySelector('dialog[open]')){if(state.due)state.due+=elapsed;return;}
    if(!state.screen||state.screen==='custom')return;
    updateDialogue(now);if(state.screen==='credits')scrollCredits(elapsed);
    const left=Math.max(0,Math.ceil((state.due-now)/1000));
    const timer=document.getElementById('flow-countdown');if(timer)timer.textContent=state.due?String(left).padStart(2,'0'):'';
    const number=document.getElementById('continue-number');if(number)number.textContent=String(left).padStart(2,'0');
    if(game().net.guest&&['versus','winner','continue','gameover','results'].includes(state.screen))return;
    if(!state.due||now<state.due||state.busy)return;
    state.due=0;
    if(state.screen==='boot')nextIntro();
    else if(state.screen==='credits')nextCredit();
    else if(['select','opponent','arts'].includes(state.screen))confirm();
    else if(state.screen==='versus')launch();
    else if(state.screen==='winner')continueAfterResults();
    else if(state.screen==='continue')show('gameover',1.5);
    else if(state.screen==='gameover')show('results');
  }
  root.addEventListener('click',event=>{
    if(SceneTransition.active)return;
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.choice!==undefined){chooseDialogue(+b.dataset.choice);return;}
    if(['chapter','hero','index','art','mode','home'].some(k=>b.dataset[k]!==undefined))AudioDirector.nav();
    if(b.dataset.chapter!==undefined){state.campaignIndex=+b.dataset.chapter;render();return;}
    if(b.dataset.hero!==undefined){state.heroIndex=+b.dataset.hero;render();return;}
    if(b.dataset.index!==undefined){state.index=+b.dataset.index;if(state.index===21){confirm();return;}render();return;}
    if(b.dataset.art!==undefined){state.art=+b.dataset.art;render();return;}
    if(b.dataset.home!==undefined){state.homeIndex=+b.dataset.home;confirm();return;}
    if(b.dataset.mode!==undefined){state.modeIndex=+b.dataset.mode;confirm();return;}
    const action=b.dataset.action;
    if(action&&!['confirm','back','skip-story'].includes(action)){if(state.screen==='dialogue')AudioDirector.nav();else AudioDirector.sfx('select');}
    if(action==='confirm')confirm();else if(action==='back')back();
    else if(action==='home')home();
    else if(action==='arcade'){Tournament.reset();show('arcade');}
    else if(action==='credits')startCredits();
    else if(action==='credits-pause')nextCredit();
    else if(action==='skip-story'){AudioDirector.nav();finishDialogue();}
    else if(action==='statistics')viewStatistics();
    else if(action==='sources')Presentation.sources();
    else if(action==='dossier')dossier();
    else if(action==='resume-campaign'){state.mode=5;campaignMap();}
    else if(action==='settings')ArcadeSettings.open();
    else if(action==='help')document.getElementById('arcade-manual').showModal();
    else if(action==='retry')prepareBattle();else if(action==='reload')location.reload();
  });
  root.addEventListener('pointerover',event=>{const b=event.target.closest('[data-index]');if(b&&state.index!==+b.dataset.index&&!state.busy){AudioDirector.nav();state.index=+b.dataset.index;render();}});
  root.addEventListener('wheel',()=>{if(state.screen==='credits'){state.creditsPaused=true;creditControl();}},{passive:true});
  root.addEventListener('touchstart',()=>{if(state.screen==='credits'){state.creditsPaused=true;creditControl();}},{passive:true});
  root.addEventListener('dblclick',event=>{if(event.target.closest('[data-index]'))confirm();});
  addEventListener('keydown',event=>{
    if(!state.screen||state.screen==='custom'||state.screen==='remote'||document.querySelector('dialog[open]'))return;
    const key=event.key.toLowerCase();
    if(state.screen.startsWith('swiss-')&&/^(INPUT|SELECT)$/.test(event.target.tagName))return;
    if(SceneTransition.active){event.preventDefault();event.stopImmediatePropagation();return;}
    if(state.screen==='dialogue'&&['1','2','3','4'].includes(key)&&!event.repeat){event.preventDefault();chooseDialogue(+key-1);return;}
    if(!['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','enter',' ','escape','backspace'].includes(key))return;
    event.preventDefault();event.stopImmediatePropagation();
    if(['enter',' '].includes(key)){if(!event.repeat){const focused=MenuInput.current(root);if(focused?.tagName==='A'||focused?.dataset.choice!==undefined)focused.click();else if(focused?.dataset.swiss||(focused?.dataset.action&&focused.dataset.action!=='confirm'))focused.click();else confirm();}}
    else if(['escape','backspace'].includes(key)){if(!event.repeat)back();}
    else if(state.screen.startsWith('swiss-'))MenuInput.move(root,['a','arrowleft'].includes(key)?-1:['d','arrowright'].includes(key)?1:0,['w','arrowup'].includes(key)?-1:['s','arrowdown'].includes(key)?1:0);
    else navigate(['a','arrowleft'].includes(key)?-1:['d','arrowright'].includes(key)?1:0,['w','arrowup'].includes(key)?-1:['s','arrowdown'].includes(key)?1:0);
  },true);
  addEventListener('protein-custom-close',()=>{setTimeout(()=>{if(state.screen==='custom')show(state.customReturn,30);},0);});
  addEventListener('protein-custom-ready',event=>{
    const {player,spec}=event.detail;
    const row={id:'custom'+player,name:spec.name,description:'ESTRUCTURA PERSONALIZADA',portrait:ProteinRoster.customPortrait(spec)};
    state.player=player;state.selected[player]={spec,row,art:0};state.art=0;show('arts',20);
  });
  addEventListener('protein-match-result',event=>{
    const result=event.detail;
    if(state.result?.id===result.id)return;
    syncSelections();state.result=result;state.resultsReturn=null;state.mode=LocalControls.active?3:result.mode;state.history.push(result);if(state.mode===2){Tournament.record(result);SwissTournament.record(result);}if(state.mode===5&&result.winner===0)ProteinCampaign.win();show('winner',6);
  });
  window.ArcadeFlow={
    tick,active:()=>!!state.screen,blocksSimulation:()=>!!state.screen,
    openArcade(){home();show('arcade');},get screen(){return state.screen;},get state(){return state;},confirm,back,navigate,home,
    pad(slot,action,down){
      if(!down||state.busy||SceneTransition.active)return;
      if(state.screen.startsWith('swiss-')){if(['kick','back'].includes(action))back();else MenuInput.pad(root,action);return;}
      if(state.screen==='dialogue'&&state.dialogueLines[state.dialogueIndex]?.choices&&MenuInput.current(root)?.dataset.choice!==undefined){const choice={lkick:0,kick:1,lpunch:2,punch:3}[action];if(choice!==undefined){chooseDialogue(choice);return;}}
      if(state.screen==='credits'&&['up','down'].includes(action)){navigate(0,action==='up'?-1:1);return;}
      if(state.screen==='dialogue'&&['left','right','up','down'].includes(action)){navigate(action==='left'?-1:action==='right'?1:0,action==='up'?-1:action==='down'?1:0);return;}
      if(['kick','back'].includes(action)){back();return;}
      // Either controller can operate menus; player ownership applies only in combat.
      if(['left','right','up','down'].includes(action)){
        AudioDirector.nav();
        const el=MenuInput.move(root,action==='left'?-1:action==='right'?1:0,action==='up'?-1:action==='down'?1:0);highlight(el);return;
      }
      if(action==='lpunch'){dossier();return;}
      if(['lkick','start'].includes(action)){
        const el=MenuInput.current(root)||MenuInput.initial(root);
        if(!el){confirm();return;}
        if(['index','art','mode','home','chapter','hero'].some(k=>el.dataset[k]!==undefined)){highlight(el);confirm();}
        else el.click();
      }
    },
    padStatus(count){state.pads=count;},
    remoteReady(){if(state.screen==='versus')return;syncSelections();state.mode=3;state.busy=false;show('versus',1.4);},
    networkState(){return ['versus','winner','continue','gameover','results'].includes(state.screen)?{revision:state.revision,screen:state.screen,left:state.due?Math.max(0,(state.due-performance.now())/1000):0,result:state.result}:null;},
    receive(packet){if(!game().net.guest)return;
      if(packet&&packet.revision!==state.remoteRevision){state.remoteRevision=packet.revision;syncSelections();if(packet.result)state.result=packet.result;show(packet.screen,packet.left);}
      else if(!packet&&['intro','playing','between','ko','paused'].includes(game().phase)){state.guestConfirmed=true;syncSelections();hide();}
    },
  };
  if(new URLSearchParams(location.search).has('legacy')){hide();document.documentElement.classList.remove('boot-pending');return;}
  render();screenEvent();requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.remove('boot-pending')));
  ProteinRoster.ready.then(rows=>{state.rows=rows;if(game()?.net.guest){state.mode=3;if(game().net.watch)show('waiting');else begin();}else render();}).catch(error=>{show('error');state.error=error.message;render();});
})();
