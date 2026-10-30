(function(){
 const settings=document.querySelector('#arcade-settings .settings-options');
 const section=document.createElement('section');section.className='preference-section';section.dataset.group='controls';section.hidden=true;
 section.innerHTML='<h3>MANDOS CONECTADOS</h3><p>Xbox, PlayStation y otros mandos reconocidos por Windows y el navegador. Si los botones no coinciden, configura su distribución con el ratón. Se guarda por modelo y conexión.</p><div class="controller-device-list"></div><p role="status" class="controller-setup-status"></p>';
 settings.append(section);
 const modal=document.createElement('dialog');modal.id='controller-setup';modal.style.cssText='width:min(620px,90vw);padding:28px;color:#fff4de;background:#1c2033;border:2px solid #ebd89c;border-radius:8px';
 modal.innerHTML='<h2>CONFIGURAR MANDO</h2><p data-device></p><p data-step aria-live="polite"></p><p data-hint></p><div style="display:flex;gap:12px;flex-wrap:wrap"><button data-neutral>COMENZAR · TODO SUELTO</button><button data-skip hidden>OMITIR</button><button data-cancel>CANCELAR</button></div>';
 document.body.append(modal);
 const names=['Botón inferior · A / ✕ / B','Botón derecho · B / ○ / A','Botón izquierdo · X / □ / Y','Botón superior · Y / △ / X','Hombro izquierdo · LB / L1 / L','Hombro derecho · RB / R1 / R','Gatillo izquierdo · LT / L2 / ZL','Gatillo derecho · RT / R2 / ZR','Volver · View / Share / −','Pausa · Menu / Options / +','Pulsar stick izquierdo · L3','Pulsar stick derecho · R3','Cruceta ARRIBA','Cruceta ABAJO','Cruceta IZQUIERDA','Cruceta DERECHA','Stick IZQUIERDA (opcional)','Stick DERECHA (opcional)','Stick ARRIBA (opcional)','Stick ABAJO (opcional)'];
 let session=null,latest=[],signature='';
 const text=(selector,value)=>modal.querySelector(selector).textContent=value;
 const status=section.querySelector('.controller-setup-status');
 function start(p){
  session={key:ControllerProfiles.key(p),pad:structuredClone(p),step:0,profile:{buttons:Array(16).fill(null),stick:Array(4).fill(null)},neutral:null,waiting:false,releaseAt:0};
  GamepadControls.hub.releaseAll();ControlInput.clear();
  text('[data-device]',ControllerProfiles.family(p)+' · '+p.id);text('[data-step]','Suelta todos los botones y deja los sticks en el centro.');text('[data-hint]','Pulsa COMENZAR con el ratón. Los gatillos también deben estar sueltos.');
  modal.querySelector('[data-neutral]').hidden=false;modal.querySelector('[data-skip]').hidden=true;modal.showModal();
 }
 function step(){
  const s=session;if(!s)return;
  if(s.step===20){
   try{ControllerProfiles.save(s.pad,s.profile);status.textContent='Distribución guardada. Puedes probarla ahora y ajustar las acciones de combate debajo.';modal.close();}
   catch{status.textContent='No se pudo guardar. Comprueba que el almacenamiento del navegador esté disponible.';modal.close();}return;
  }
  text('[data-step]',(s.step+1)+' / 20 — '+names[s.step]);text('[data-hint]','Pulsa o mueve solo ese control. Después suéltalo. Puedes omitir controles que tu mando no tenga.');
 }
 modal.querySelector('[data-neutral]').onclick=()=>{
  const p=latest.find(p=>ControllerProfiles.key(p)===session?.key);if(!p)return;
  session.neutral=structuredClone(p);modal.querySelector('[data-neutral]').hidden=true;modal.querySelector('[data-skip]').hidden=false;step();
 };
 modal.querySelector('[data-skip]').onclick=()=>{if(!session?.neutral)return;session.step++;session.waiting=true;session.releaseAt=0;step();};
 modal.querySelector('[data-cancel]').onclick=()=>modal.close();
 modal.addEventListener('close',()=>{session=null;GamepadControls.hub.releaseAll();ControlInput.clear();});
 addEventListener('keydown',e=>{if(modal.open){e.stopImmediatePropagation();if(e.key==='Escape'){e.preventDefault();modal.close();}}},true);
 function update(pads,now){
  latest=pads;
  if(session){
   const p=pads.find(p=>ControllerProfiles.key(p)===session.key);
   if(!p){status.textContent='Mando desconectado. La configuración anterior se conserva.';modal.close();return;}
   if(session.neutral){
    const s=session,source=ControllerProfiles.capture(p,s.neutral);
    if(s.waiting){if(!source){if(!s.releaseAt)s.releaseAt=now;if(now-s.releaseAt>=200){s.waiting=false;s.releaseAt=0;step();}}else s.releaseAt=0;}
    else if(source){if(s.step<16)s.profile.buttons[s.step]=source;else s.profile.stick[s.step-16]=source;s.step++;s.waiting=true;s.releaseAt=0;text('[data-hint]','Registrado. Suelta el control para continuar…');}
   }return;
  }
  const sig=JSON.stringify(pads.map(p=>[ControllerProfiles.key(p),ControllerProfiles.has(p)]));if(sig===signature)return;signature=sig;
  const list=section.querySelector('.controller-device-list');list.replaceChildren();
  if(!pads.length){list.textContent='Conecta el mando, activa esta ventana y pulsa un botón.';return;}
  pads.forEach(p=>{const row=document.createElement('div');row.style.cssText='padding:12px 0;display:flex;gap:10px;flex-wrap:wrap;align-items:center';const name=document.createElement('span');name.textContent=ControllerProfiles.family(p)+' · '+p.id+(ControllerProfiles.has(p)?' · Personalizado':p.mapping==='standard'?' · Automático':' · Revisa la distribución');const edit=document.createElement('button');edit.textContent='CONFIGURAR';edit.onclick=()=>start(p);const reset=document.createElement('button');reset.textContent='AUTOMÁTICO';reset.onclick=()=>{try{ControllerProfiles.remove(p);status.textContent='Restablecido el mapeo del navegador.';}catch{status.textContent='No se pudo guardar el cambio.';}};row.append(name,edit,reset);list.append(row);});
 }
 window.ControllerSetup={update,get active(){return !!session;}};
})();
