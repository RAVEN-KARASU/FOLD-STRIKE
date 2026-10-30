(function(){
  const KEY='protein-fighter-science-v1';let prefs={visible:true,kind:'deformation',size:64,opacity:.65,revision:2};
  try{prefs={...prefs,...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{}
  if(prefs.revision!==2){prefs.size=64;prefs.opacity=.65;prefs.revision=2;}
  if(!['deformation','contacts'].includes(prefs.kind))prefs.kind='deformation';
  if(![48,64,80].includes(prefs.size))prefs.size=64;
  if(![.65,.88,1].includes(prefs.opacity))prefs.opacity=.88;
  const box=document.createElement('section');box.className='map-settings';box.innerHTML='<h3>MAPA ESTRUCTURAL</h3><div class="setting-row"><span>Mostrar durante el combate</span><button data-map="visible"></button></div><div class="setting-row"><span>Información</span><button data-map="kind"></button></div><div class="setting-row"><span>Tamaño</span><button data-map="size"></button></div><div class="setting-row"><span>Opacidad</span><button data-map="opacity"></button></div><small class="map-explanation"></small>';
  document.querySelector('#arcade-settings .settings-options').appendChild(box);
  function apply(){
    const html=document.documentElement;html.classList.toggle('show-science',!!prefs.visible);html.dataset.mapKind=prefs.kind;
    html.style.setProperty('--map-size',prefs.size+'px');html.style.setProperty('--map-opacity',prefs.opacity);
    document.getElementById('science-toggle').setAttribute('aria-pressed',String(!!prefs.visible));
    const labels={visible:prefs.visible?'ACTIVO':'OCULTO',kind:prefs.kind==='contacts'?'CONTACTOS · 8 Å':'DEFORMACIÓN',size:({48:'MÍNIMO',64:'COMPACTO',80:'MEDIO'})[prefs.size],opacity:Math.round(prefs.opacity*100)+' %'};
    box.querySelectorAll('[data-map]').forEach(b=>{b.textContent=labels[b.dataset.map];if(b.dataset.map==='visible')b.setAttribute('aria-pressed',String(!!prefs.visible));});
    box.querySelector('.map-explanation').textContent=prefs.kind==='contacts'?'Contactos actuales entre carbonos alfa a 8 Å o menos. Cian: más contactos.':'Desviación geométrica respecto de la estructura de referencia. Verde: menor desviación; blanco: mayor. Es una medida del juego, no el PAE predicho por AlphaFold.';
    for(let i=0;i<2;i++){const c=document.getElementById('pae'+i);c.title=prefs.kind==='contacts'?'Densidad de contactos Cα ≤ 8 Å':'Desviación estructural · 0–30 Å';c.setAttribute('aria-label',`P${i+1}: ${c.title}`);}
    try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch{}
  }
  function set(key,value){if(!(key in prefs))return;prefs[key]=value;apply();}
  box.onclick=e=>{const key=e.target.closest('[data-map]')?.dataset.map;if(!key)return;
    if(key==='visible')prefs.visible=!prefs.visible;
    else if(key==='kind')prefs.kind=prefs.kind==='contacts'?'deformation':'contacts';
    else{const values=key==='size'?[48,64,80]:[.65,.88,1];prefs[key]=values[(values.indexOf(prefs[key])+1)%values.length];}apply();};
  document.getElementById('science-toggle').onclick=()=>{prefs.visible=!prefs.visible;apply();};
  window.ScienceDisplay={set,get preferences(){return {...prefs};}};apply();
  const audio=document.createElement('section');audio.className='audio-settings';
  audio.innerHTML='<h3>SONIDO</h3><div class="setting-row"><span>Audio general</span><button data-audio-master></button></div>'+['music','effects'].map(k=>`<div class="setting-row"><span>${k==='music'?'Música':'Efectos'}</span><button data-audio="${k}" data-step="-0.1" aria-label="Bajar ${k==='music'?'música':'efectos'}">−</button><output data-volume="${k}"></output><button data-audio="${k}" data-step="0.1" aria-label="Subir ${k==='music'?'música':'efectos'}">＋</button></div>`).join('');
  document.querySelector('#arcade-settings .settings-options').appendChild(audio);
  const refresh=()=>{audio.querySelectorAll('[data-volume]').forEach(o=>o.textContent=Math.round(AudioDirector.preferences[o.dataset.volume]*100)+' %');const b=audio.querySelector('[data-audio-master]');b.textContent=AudioDirector.preferences.enabled?'ACTIVO':'SILENCIADO';b.setAttribute('aria-pressed',String(AudioDirector.preferences.enabled));};
  audio.onclick=e=>{if(e.target.closest('[data-audio-master]')){AudioDirector.setEnabled(!AudioDirector.preferences.enabled);refresh();return;}const b=e.target.closest('[data-audio]');if(!b)return;AudioDirector.setVolume(b.dataset.audio,AudioDirector.preferences[b.dataset.audio]+ +b.dataset.step);refresh();};refresh();
  addEventListener('protein-audio-enabled',refresh);
  const graphics=document.createElement('section');graphics.className='map-settings';graphics.innerHTML='<h3>ANIMACIÓN</h3><div class="setting-row"><span>Dibujo de las proteínas</span><button id="renderer-choice"></button></div><small>Fluido simplifica las cintas del combate. Detallado conserva el visor molecular original.</small>';document.querySelector('#arcade-settings .settings-options').appendChild(graphics);
  const rendererButton=graphics.querySelector('button'),rendererLabel=()=>rendererButton.textContent=CombatRenderer.enabled?'FLUIDO':'DETALLADO';rendererLabel();rendererButton.onclick=()=>{CombatRenderer.set(!CombatRenderer.enabled);rendererLabel();};
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&!b.closest('#arcade-flow')&&!b.classList.contains('cap'))AudioDirector.sfx('select');});
})();
