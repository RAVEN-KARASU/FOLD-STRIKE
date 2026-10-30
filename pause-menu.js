(function(){
 const panel=document.createElement('section');panel.id='pause-menu';panel.hidden=true;panel.setAttribute('aria-label','Pausa');
 panel.innerHTML='<div><h2>PAUSE</h2><nav><button data-pause="resume">CONTINUAR <span>Volver al combate</span></button><button data-pause="settings">AJUSTES <span>Sonido · arenas · imagen · controles</span></button><button data-pause="controls">GUÍA DE CONTROLES <span>Golpes, bloqueo y movimientos especiales</span></button><button data-pause="home">VOLVER AL MENÚ <span>Salir de este combate</span></button></nav><p class="pause-note">Las reglas de ronda se aplican al siguiente combate.</p></div>';
 document.querySelector('.arena').appendChild(panel);
 let shown=false;
 panel.addEventListener('click',e=>{const action=e.target.closest('[data-pause]')?.dataset.pause;if(!action)return;AudioDirector?.sfx('select');
  if(action==='resume')proteinFighter.pause();
  if(action==='settings')ArcadeSettings.open();
  if(action==='controls')document.getElementById('controls-help').click();
  if(action==='home')ArcadeFlow.home();
  sync(proteinFighter.phase);
 });
 function sync(phase){const visible=phase==='paused'&&!ArcadeFlow.active();const changed=visible!==shown;shown=visible;panel.hidden=!visible;document.documentElement.classList.toggle('pause-menu-open',visible);if(visible)document.getElementById('overlay').hidden=true;if(visible&&changed)MenuInput.focus(panel.querySelector('button'));}
 function pad(action){MenuInput.pad(panel,action);}
 addEventListener('keydown',e=>{if(!shown||document.querySelector('dialog[open]'))return;
  const action={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'lkick',' ':'lkick'}[e.key];
  if(action){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat||action!=='lkick')pad(action);}
 },true);
 addEventListener('protein-screen',()=>sync(proteinFighter.phase));
 window.PauseMenu={sync,pad};
})();
