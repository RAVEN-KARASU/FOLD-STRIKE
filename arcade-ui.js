(function () {
  const manual = document.getElementById('arcade-manual');
  document.getElementById('controls-help').onclick = () => {
    if (window.proteinFighter?.phase === 'playing') {
      dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    }
    manual.showModal();
  };
  document.getElementById('close-manual').onclick = () => manual.close();
  manual.addEventListener('keydown', event => event.stopPropagation());
  const chooseStage = (stage,manual=true) => {
    document.documentElement.dataset.stage = stage;
    for (const button of document.querySelectorAll('[data-stage]')) {
      if (button === document.documentElement) continue;
      button.classList.toggle('on', button.dataset.stage === stage);
      button.setAttribute('aria-pressed', String(button.dataset.stage === stage));
    }
    if(manual)try { localStorage.setItem('foldstrike-stage-v11', stage); } catch {}
  };
  let stage = 'membrane';
  try { const stored = localStorage.getItem('foldstrike-stage-v11'); if (['membrane', 'synapse', 'cryo', 'reactor', 'nucleus'].includes(stored)) stage = stored; } catch {}
  for (const button of document.querySelectorAll('button[data-stage]')) button.onclick = () => chooseStage(button.dataset.stage);
  chooseStage(stage,false);
  // Use the same world renderer as combat, even while the settings tab is hidden.
  for(const button of document.querySelectorAll('button[data-stage]')){
    const label=document.createElement('span');label.textContent=button.textContent;button.replaceChildren(label);
    const canvas=document.createElement('canvas');canvas.className='arena-thumbnail';canvas.setAttribute('aria-hidden','true');button.prepend(canvas);
    Cell.draw(canvas,null,{arena:button.dataset.stage,viewport:{width:320,height:180},camX:0,scale:.8,project:()=>[0,0],floorFar:139,floorDepth:17,theme:'dark',t:2,dt:0,bodies:[]});
  }
  const settings = document.createElement('dialog');
  settings.id = 'arcade-settings';
  settings.innerHTML = '<button class="close-settings" aria-label="Cerrar ajustes">×</button><small>MOLECULAR ARCADE</small><h2>AJUSTES</h2><div class="settings-options"></div><p>Los mapas muestran la desviación estructural durante la pelea.</p>';
  document.body.appendChild(settings);
  for (const selector of ['.levels','.look','.stages']) settings.querySelector('.settings-options').appendChild(document.querySelector('.setup '+selector));
  settings.querySelector('.levels').hidden = false;
  settings.querySelector('.close-settings').onclick = () => settings.close();
  settings.addEventListener('keydown', event => event.stopPropagation());
  window.ArcadeSettings = {open(){if(window.proteinFighter?.phase==='playing')proteinFighter.pause();settings.showModal();}};
  const footer=document.querySelector('.foot');
  for(const [id,label,click] of [
    ['science-toggle','MAPAS',()=>{const on=document.documentElement.classList.toggle('show-science');document.getElementById('science-toggle').setAttribute('aria-pressed',String(on));}],
    ['keys-toggle','TECLAS',()=>document.documentElement.classList.toggle('show-keys')],
    ['settings-open','AJUSTES',()=>ArcadeSettings.open()],
    ['menu-open','MENÚ',()=>window.ArcadeFlow?.home()],
  ]){footer.append(' · ');const b=document.createElement('button');b.className='link';b.id=id;b.textContent=label;b.onclick=click;footer.appendChild(b);}
  document.getElementById('science-toggle').setAttribute('aria-pressed','false');
  for(let i=0;i<2;i++){const img=document.createElement('img');img.className='hud-portrait';img.id='portrait'+i;img.alt='';img.src='assets/roster/'+(i?'1GFL':'1UBQ')+'.svg';document.querySelectorAll('.hud .player')[i].prepend(img);}
  addEventListener('protein-fighters-change',()=>{
    for(let i=0;i<2;i++){
      const spec=window.proteinFighter?.selections[i];if(!spec)continue;
      const path=spec.meta?.portrait;
      document.getElementById('portrait'+i).src=path?.startsWith('assets/roster/')||path?.startsWith('assets/campaign/')||path?.startsWith('data:image/svg+xml;charset=utf-8,')?path:window.ProteinRoster?.customPortrait(spec)||'assets/roster/1UBQ.svg';
    }
  });
  addEventListener('keydown', event => {
    if (event.repeat || event.key.toLowerCase() !== 'r' || manual.open || !document.getElementById('custom-modal').hidden) return;
    if (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    const game = window.proteinFighter;
    if (game?.mode === 4 && ['playing', 'ko', 'over'].includes(game.phase)) { event.preventDefault(); game.resetTraining(); }
  });
})();
