(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safe=p=>typeof p==='string'&&/^(assets\/(campaign|roster)\/|data:image\/svg\+xml;charset=utf-8,)/.test(p)?p:'assets/roster/1UBQ.svg';
  const ravenUrl='https://raven-karasu.github.io/page/';
  const raven='<img class="raven-logo" src="assets/lab/raven.png" alt="RAVEN | プログラム">';
  const intros=[
    {name:'SB²CS',html:'<img class="intro-lab" src="assets/lab/sbbcs-white.png" alt="SB²CS">',link:'https://sbbcs-ufro.github.io/page/'},
    {name:'Universidad de La Frontera',html:'<img class="intro-ufro" src="assets/lab/ufro-white.png" alt="Universidad de La Frontera">',link:'https://www.ufro.cl/'},
    {name:'Protein Fighter',html:'<h1>PROTEIN FIGHTER</h1>',link:'https://github.com/sokrypton/protein_fighter'},
    {name:'RAVEN',html:raven,link:ravenUrl},
  ];
  [intros[2],intros[3]]=[intros[3],intros[2]]; // Original engine credit closes the institutional sequence.
  const credits=[
    {eyebrow:'EL ORIGEN DE ESTA AVENTURA',title:'PROTEIN FIGHTER',lines:['Proyecto original de Sergey Ovchinnikov · sokrypton','Ovchinnikov Lab y su comunidad · MIT Biology','Personajes originales inspirados por Hannes Stark y Alex Waldherr'],link:'https://github.com/sokrypton/protein_fighter'},
    {eyebrow:'GRACIAS AL EQUIPO',title:'SB²CS',lines:['Dr. Alejandro Castro-Álvarez','Abdiel Barra Sandoval · Brian Fell Salinas','Carolyn Mayer · Daniel Ulloa','También a quienes formaron parte del laboratorio:','Valentina Rojas · Carlos Arias Fuentes · Constanza Alarcón Molina'],image:'assets/lab/sbbcs-white.png',link:'https://sbbcs-ufro.github.io/page/people.html'},
    {eyebrow:'COMUNIDADES ACADÉMICAS',title:'DOS HORIZONTES',lines:['Universidad de La Frontera','Massachusetts Institute of Technology · MIT','A sus comunidades de investigación, aprendizaje y colaboración.'],image:'assets/lab/ufro-white.png'},
    {eyebrow:'LA CIENCIA DETRÁS DE CADA LUCHADOR',title:'ESTRUCTURAS QUE INSPIRAN',lines:['A los equipos que determinaron y publicaron las estructuras y modelos.','Protein Data Bank · wwPDB · RCSB PDB','Cada depósito y publicación conserva su referencia y DOI.'],sources:true},
    {eyebrow:'HERRAMIENTAS DE CREACIÓN',title:'DEL CÓDIGO A LA ARENA',lines:['Visual Studio Code · entorno de desarrollo','py2Dmol · representación molecular','A las herramientas y comunidades de software del proyecto base.','Tipografías Barlow · Jeremy Tribby']},
    {eyebrow:'INSPIRACIÓN',title:'EL LENGUAJE DEL COMBATE',lines:['CAPCOM · Street Fighter III','Bandai Namco / Arc System Works · Dragon Ball FighterZ','ATLUS · Persona 5','Por inspirar el ritmo, la presentación y la fuerza de una aventura.']},
    {eyebrow:'LA BANDA SONORA DE ESTA EDICIÓN',title:'MÚSICA PARA EL VIAJE',lines:['10-FEET · mabanua · Takeshi Abo','SLAM DUNK OST · Anime de Japón','Fuji Kaze · Sophie Sanz · Killswitch Engage','Street Fighter III: 3rd Strike','A los compositores, intérpretes y equipos de las grabaciones utilizadas.']},
    {eyebrow:'UNA FIRMA CREATIVA',title:'RAVEN | プログラム',lines:['Ciencia, juego y una nueva forma de contar esta aventura.'],raven:true,link:ravenUrl},
    {eyebrow:'CREACIÓN DE ESTA EDICIÓN',title:'FELIPE LIZAMA',lines:['Concepto, dirección y adaptación de esta aventura molecular.','Gracias por jugar.','Cada estructura guarda una historia. Sigue explorando.'],final:true},
  ];
  let references=[];
  const ready=fetch('assets/campaign/references.json').then(r=>r.ok?r.json():[]).then(r=>references=r).catch(()=>[]);
  function boot(index){const c=intros[index]||intros[0];return `<div class="intro-sequence" data-card="${index}"><div class="intro-rays" aria-hidden="true"></div><div class="intro-logo">${c.link?`<a href="${c.link}" target="_blank" rel="noopener noreferrer">${c.html}</a>`:c.html}</div></div>`;}
  function dialogue(state){
    const l=state.dialogueLines[state.dialogueIndex],hero=state.dialogueHero,boss=state.dialogueBoss;
    const who=l.speaker==='hero'?hero.name:l.speaker==='boss'?boss.name:'BITÁCORA DE LA EXPEDICIÓN';
    return `<div class="dialogue-stage" data-speaker="${l.speaker}"><div class="story-orbit" aria-hidden="true"></div><div class="comic-backdrop" aria-hidden="true"></div><div class="story-place"><small>CAPÍTULO ${ProteinCampaign.progress.chapter+1} · ${state.dialogueKind==='post'?'DESPUÉS DEL ENCUENTRO':'EXPEDICIÓN MOLECULAR'}</small><h2>${esc(CampaignStory.chapters[ProteinCampaign.chapter.id].place)}</h2></div><div class="story-fighter story-left ${l.speaker==='boss'?'speaking':''}" data-actor="boss"><img src="${esc(safe(boss.portrait))}" alt="${esc(boss.name)}"><span>${esc(boss.name)}</span></div><div class="story-fighter story-right ${l.speaker==='hero'?'speaking':''}" data-actor="hero"><img src="${esc(safe(hero.portrait))}" alt="${esc(hero.name)}"><span>${esc(hero.name)}</span></div><section class="dialogue-box" aria-label="Diálogo"><h3>${esc(who)}</h3><p id="dialogue-typed" aria-hidden="true"></p><p class="sr-only">${esc(l.text)}</p><div class="dialogue-choices" ${l.choices?'':'hidden'} role="group" aria-label="Elige tu respuesta">${(l.choices||[]).map((c,i)=>`<button data-choice="${i}" class="${i===(state.choiceIndex||0)?'selected':''}"><i class="choice-key choice-${i}" aria-hidden="true"></i> ${esc(c.label)}</button>`).join('')}</div><footer><span>ELIGE O CONTINÚA</span><button data-action="skip-story">SALTAR ESCENA</button><button data-action="confirm">CONTINUAR <b>▶</b></button></footer></section></div>`;
  }
  function credit(){return `<div class="credits-roll"><div class="credits-viewport" tabindex="0" aria-label="Agradecimientos"><div class="credits-stream"><section class="credits-opening"><div class="title-emblem"><small>FIGHT FOR THE FOLD</small><h1 class="fold-title"><img class="fold-wordmark" src="assets/brand/foldstrike-wordmark.png" alt="FOLD//STRIKE" width="2172" height="724"></h1><p>GRACIAS POR FORMAR PARTE DE ESTA AVENTURA</p></div></section>${credits.map((c,i)=>`<section class="credit-block ${c.final?'credits-final':''}"><small>${esc(c.eyebrow)}</small>${i===0?'<img class="credit-logo" src="assets/lab/solab.png" alt="Ovchinnikov Lab">':''}${c.raven?`<a class="raven-logo-link" href="${ravenUrl}" target="_blank" rel="noopener noreferrer" aria-label="Visitar RAVEN">${raven}</a>`:''}${c.image?`<img src="${c.image}" class="credit-logo" alt="${esc(c.title)}">`:''}${i===2?'<img class="credit-logo" src="assets/lab/mit.png" alt="MIT Biology">':''}<h1>${esc(c.title)}</h1>${c.lines.map(t=>`<p>${esc(t)}</p>`).join('')}${c.link?`<a href="${c.link}" target="_blank" rel="noopener noreferrer">CONOCER EL PROYECTO ↗</a>`:''}</section>`).join('')}</div></div><footer class="credits-controls"><button data-action="credits-pause">${matchMedia('(prefers-reduced-motion: reduce)').matches?'CONTINUAR':'PAUSAR'} · A / ESPACIO</button><button data-action="sources">INVESTIGACIONES Y DOI</button><button data-action="home">VOLVER AL INICIO · B</button></footer></div>`;}
  function sources(){
    let d=document.getElementById('research-credits');if(!d){d=document.createElement('dialog');d.id='research-credits';d.addEventListener('keydown',e=>e.stopPropagation());document.body.appendChild(d);}
    d.innerHTML='<button class="dossier-close">VOLVER · B</button><small>CRÉDITOS CIENTÍFICOS</small><h2>ESTRUCTURAS Y PUBLICACIONES</h2>'+references.map(r=>`<article><h3>${esc(r.pdb)} · ${esc(r.title)}</h3><p>${esc(r.authors?.join(', ')||'Autores del depósito PDB')}</p><a href="https://doi.org/${esc(r.doi)}" target="_blank" rel="noopener noreferrer">DOI PDB · ${esc(r.doi)}</a>${r.articleDoi?`<a href="https://doi.org/${esc(r.articleDoi)}" target="_blank" rel="noopener noreferrer">PUBLICACIÓN · ${esc(r.articleDoi)}</a>`:''}</article>`).join('');
    d.querySelector('button').onclick=()=>d.close();d.showModal();
  }
  const cutin=document.createElement('div');cutin.id='special-cutin';cutin.hidden=true;cutin.setAttribute('aria-hidden','true');document.body.appendChild(cutin);let cutTimer=0;
  function special({player,move}){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||window.ArcadeFlow?.active())return;
    const f=proteinFighter.fighters[player];if(!f)return;
    const definition=proteinFighter.MOVES[move],ultimate=!!definition?.ultimate,superMove=!!definition?.super,label=ultimate?definition.text:superMove?f.superLabel:definition?.text;
    if(ultimate)return; // The live combat camera directs the articulated model.
    cutin.dataset.side=player;cutin.className=ultimate?'cinematic-ultimate':superMove?'cinematic-super':'cinematic-special';
    cutin.innerHTML=`<div class="cutin-streaks"></div><img src="${esc(safe(f.form.meta?.portrait))}" alt=""><div><small>${ultimate?'TRES CARGAS · CLÍMAX':superMove?'SUPER ART':'SPECIAL MOVE'}</small><strong>${esc(label||'MOLECULAR STRIKE')}</strong></div>`;
    cutin.hidden=false;cutin.getAnimations().forEach(a=>a.cancel());cutin.animate(ultimate?[{opacity:0,height:'70%',top:'12%'},{opacity:1,height:'70%',top:'12%',offset:.08},{opacity:1,height:'70%',top:'12%',offset:.22},{opacity:.92,height:'14%',top:'15%',offset:.36},{opacity:.92,height:'14%',top:'15%',offset:.87},{opacity:0,height:'14%',top:'15%'}]:[{opacity:0,transform:'translateX(-8%) scale(.96)'},{opacity:1,transform:'translateX(0) scale(1)',offset:.18},{opacity:1,offset:.74},{opacity:0,transform:'translateX(6%) scale(1.03)'}],{duration:ultimate?2600:superMove?620:420,easing:'ease-out',fill:'forwards'});
    clearTimeout(cutTimer);cutTimer=setTimeout(()=>cutin.hidden=true,ultimate?2600:superMove?620:420);
  }
  addEventListener('protein-special',e=>special(e.detail));addEventListener('protein-screen',()=>{cutin.hidden=true;clearTimeout(cutTimer);});
  window.Presentation={ready,boot,dialogue,credit,sources,special,introCount:intros.length,creditCount:credits.length,credits};
})();
