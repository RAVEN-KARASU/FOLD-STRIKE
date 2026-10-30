(function(){
  let session=null,cursor=0,timer=0,generation=0,lastContext='',connected=[false,false],held=[new Set(),new Set()];
  let transport='local',internet={state:'idle',url:'',error:''},internetTimer=0;
  const directions=new Set(['up','down','left','right','block']);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const notice=document.createElement('div');notice.id='local-link-status';notice.hidden=true;document.body.appendChild(notice);
  function deliver(slot,action,down){
    if(down)held[slot].add(action);else held[slot].delete(action);
    const g=window.proteinFighter,flow=window.ArcadeFlow;
    if(!g)return;
    const dialog=document.querySelector('dialog[open]');
    if(dialog){if(down){if(['kick','back'].includes(action))dialog.close();else MenuInput.pad(dialog,action);}if(!down)ControlInput.send('phone:'+slot,slot,action,false);return;}
    if(flow?.active()){flow.pad(slot,action,down,false);if(!down)ControlInput.send('phone:'+slot,slot,action,false);return;}
    if(g.phase==='paused'){if(down){if(['start','kick','back'].includes(action))g.pause();else (window.PauseMenu?PauseMenu.pad(action):MenuInput.pad(document.querySelector('.arena'),action));}if(!down)ControlInput.send('phone:'+slot,slot,action,false);return;}
    ControlInput.send('phone:'+slot,slot,action,down);
  }
  function release(){for(let i=0;i<2;i++){for(const a of held[i])ControlInput.send('phone:'+i,i,a,false);held[i].clear();}}
  async function stop(){const old=session;session=null;generation++;clearTimeout(timer);clearTimeout(internetTimer);internet={state:'idle',url:'',error:''};release();connected=[false,false];notice.hidden=true;if(old)fetch('/api/local/stop?owner='+old.owner,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).catch(()=>{});}
  async function create(){await stop();const id=generation;const r=await fetch('/api/local/create',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!r.ok)throw Error('Abre FOLD-STRIKE.exe para usar los mandos remotos.');const data=await r.json();if(id!==generation)return;session=data;transport=data.internet?'internet':'local';cursor=0;lastContext='';poll(id);if(transport==='internet')startInternet();return data;}
  async function startInternet(){
    if(!session)return;const id=generation;internet={state:'starting',url:'',error:''};updateTransport();
    try{const r=await fetch('/api/local/internet-start?owner='+session.owner,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!r.ok)throw Error('Abre el ejecutable actualizado para usar datos móviles.');const data=await r.json();if(id!==generation)return;internet=data;updateTransport();checkInternet(id);}
    catch(e){if(id!==generation)return;internet={state:'error',url:'',error:e.message};updateTransport();}
  }
  async function checkInternet(id){
    if(!session||id!==generation||transport!=='internet')return;
    try{const r=await fetch('/api/local/internet-status?owner='+session.owner);if(!r.ok)throw Error('La sala se cerró. Vuelve a REMOTE.');const next=await r.json();if(id!==generation)return;const changed=next.state!==internet.state||next.url!==internet.url;internet=next;if(changed)updateTransport();}
    catch(e){if(id!==generation||transport!=='internet')return;internet={state:'error',url:'',error:e.message};updateTransport();}
    if(internet.state!=='error')internetTimer=setTimeout(()=>checkInternet(id),internet.state==='ready'?4000:1000);
  }
  function panel(){
    if(!session)return '<div class="lan-panel"><h1>MANDOS REMOTOS</h1><p>Preparando la conexión…</p></div>';
    const addresses=session.addresses.length?session.addresses:['127.0.0.1'];
    return `<div class="lan-panel"><h1>LA ARENA EN TU PC.<br>EL MANDO EN TU TELÉFONO.</h1><p>Escanea un QR por jugador. INTERNET permite usar datos móviles o un Wi-Fi distinto; RED LOCAL funciona sin Internet. USB usa la red del cable.</p><div class="remote-transports"><button data-transport="internet" ${session.internet?'':'disabled'}>INTERNET</button><button data-transport="local">RED LOCAL</button><button data-transport="usb">USB</button></div><div class="usb-guide" hidden><b>EL CABLE DEBE COMPARTIR CONEXIÓN, NO SOLO CARGAR.</b><p>Android: conecta el cable y activa «Compartir conexión por USB» en Ajustes. iPhone: activa «Punto de acceso personal», conecta el cable y acepta «Confiar»; Windows necesita Apple Devices o iTunes.</p><p>Pulsa ACTUALIZAR REDES, elige el adaptador del cable de cada teléfono y escanea su QR. Puedes usar dos cables y una dirección distinta por jugador. La etiqueta USB es una pista del nombre del adaptador; comprueba que corresponde a tu teléfono.</p><a href="https://support.google.com/android/answer/9059108" target="_blank" rel="noopener noreferrer">Ayuda Android ↗</a> · <a href="https://support.apple.com/en-gb/111785" target="_blank" rel="noopener noreferrer">Ayuda iPhone ↗</a><button id="usb-refresh">ACTUALIZAR REDES</button><p id="usb-feedback" role="status">El juego transmite los controles directamente por la red del cable. La disponibilidad de compartir conexión depende del teléfono y su configuración.</p></div><p id="internet-status" role="status"></p><button id="internet-retry" hidden>REINTENTAR CONEXIÓN</button><label id="lan-address-label">RED LOCAL <select id="lan-address">${addresses.map(ip=>`<option>${esc(ip)}</option>`).join('')}</select></label><div class="lan-players">${session.tokens.map((token,i)=>`<section><h2>JUGADOR ${i+1}</h2><label class="usb-player-address" hidden>RED DEL CABLE <select data-usb-player="${i}"><option value="">Elige el adaptador USB</option></select></label><div id="lan-qr-${i}"></div><b data-lan-player="${i}">ESPERANDO TELÉFONO</b><a id="lan-url-${i}" target="_blank" rel="noopener noreferrer">ABRIR MANDO</a></section>`).join('')}</div><p class="lan-help">${session.addresses.length?'En Internet, mantén el PC conectado y el juego abierto. El enlace es temporal. En red local, permite el juego en la red privada si Windows lo solicita.':'No se detectó una dirección Wi-Fi local. Conecta la computadora a una red o activa un punto de acceso.'}</p><div class="campaign-actions"><button data-action="back">REGRESAR</button><button data-action="confirm" id="lan-start" disabled>INICIAR COMBATE</button></div></div>`;
  }
  function updateTransport(){
    if(!session)return;const select=document.getElementById('lan-address');if(!select)return;
    document.getElementById('lan-address-label').hidden=transport!=='local';
    document.querySelector('.usb-guide').hidden=transport!=='usb';document.querySelectorAll('.usb-player-address').forEach(el=>el.hidden=transport!=='usb');
    document.querySelectorAll('[data-transport]').forEach(b=>{b.classList.toggle('selected',b.dataset.transport===transport);b.setAttribute('aria-pressed',String(b.dataset.transport===transport));});
    const label=document.getElementById('internet-status'),retry=document.getElementById('internet-retry');
    label.textContent=transport==='usb'?'USB · Activa la red del cable antes de elegir el adaptador.':transport==='local'?'PC y teléfono deben compartir red Wi-Fi o punto de acceso.':internet.state==='ready'?'ENLACE HTTPS LISTO · Puedes usar datos móviles.':internet.state==='error'?internet.error:'Preparando y comprobando el enlace de Internet… Puede tardar hasta dos minutos.';
    retry.hidden=transport!=='internet'||internet.state!=='error';
    session.tokens.forEach((token,i)=>{
      const ip=transport==='usb'?document.querySelector(`[data-usb-player="${i}"]`).value:select.value;
      const ready=transport==='internet'?internet.state==='ready':!!ip,base=transport==='internet'?internet.url:`http://${ip}:${session.port}`;
      const target=document.getElementById('lan-qr-'+i),link=document.getElementById('lan-url-'+i);
      if(!ready){target.innerHTML='<div class="qr-pending">'+(transport==='usb'?'SELECCIONA LA RED USB':internet.state==='error'?'SIN CONEXIÓN':'PREPARANDO QR…')+'</div>';link.removeAttribute('href');link.textContent='';return;}
      const url=base+'/controller.html#token='+token+(transport==='usb'?'&via=usb':''),q=qrcode(0,'M');q.addData(url);q.make();target.innerHTML=q.createSvgTag({cellSize:3,margin:12,scalable:true});link.href=url;link.textContent=transport==='internet'?'ABRIR MANDO HTTPS':(transport==='usb'?'USB · ':'')+ip+':'+session.port+' · ABRIR MANDO';
    });status();
  }
  function adapterOptions(){
    const adapters=session.adapters||session.addresses.map(ip=>({ip,name:'Red local',usbHint:false}));
    for(const select of document.querySelectorAll('[data-usb-player]')){const previous=select.value;
      select.innerHTML='<option value="">Elige el adaptador USB</option>'+adapters.map(a=>`<option value="${esc(a.ip)}">${a.usbHint?'USB · ':''}${esc(a.ip)} · ${esc(a.name)}</option>`).join('');
      if(adapters.some(a=>a.ip===previous))select.value=previous;
      select.onchange=updateTransport;
    }
  }
  async function refreshAdapters(){
    if(!session)return;const id=generation,feedback=document.getElementById('usb-feedback');feedback.textContent='Buscando adaptadores de red…';
    try{const r=await fetch('/api/local/adapters?owner='+session.owner,{cache:'no-store'});if(!r.ok)throw Error('No se pudieron actualizar las redes. Abre el ejecutable actualizado.');const data=await r.json();if(id!==generation)return;
      session.addresses=data.addresses;session.adapters=data.adapters;adapterOptions();
      const select=document.getElementById('lan-address'),previous=select.value;select.innerHTML=data.addresses.map(ip=>`<option>${esc(ip)}</option>`).join('');if(data.addresses.includes(previous))select.value=previous;
      feedback.textContent=data.adapters.length?'Redes actualizadas. Selecciona la que apareció al activar la conexión USB del teléfono.':'No se detectaron redes privadas. Activa la conexión USB compartida y vuelve a actualizar.';updateTransport();
    }catch(e){if(id===generation)feedback.textContent=e.message;}
  }
  function qr(){if(!session)return;const select=document.getElementById('lan-address');if(!select)return;select.onchange=updateTransport;
    document.querySelectorAll('[data-transport]').forEach(b=>b.onclick=()=>{if(b.dataset.transport===transport)return;transport=b.dataset.transport;clearTimeout(internetTimer);if(transport==='internet')startInternet();else{fetch('/api/local/internet-stop?owner='+session.owner,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).catch(()=>{});internet={state:'idle',url:'',error:''};updateTransport();}});
    document.getElementById('internet-retry').onclick=startInternet;document.getElementById('usb-refresh').onclick=refreshAdapters;adapterOptions();updateTransport();
  }
  function status(){connected.forEach((v,i)=>{const el=document.querySelector(`[data-lan-player="${i}"]`);if(el){el.textContent=v?'CONECTADO':'ESPERANDO TELÉFONO';el.classList.toggle('connected',v);}});const b=document.getElementById('lan-start');if(b)b.disabled=!connected.some(Boolean);}
  async function poll(id){
    if(!session||id!==generation)return;const before=performance.now(),abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),1500);
    try{
      const g=proteinFighter,flow=ArcadeFlow,context=flow.screen||g.phase;
      const labels={playing:'COMBATE',intro:'PREPÁRATE',paused:'PAUSA · pulsa PAUSA para continuar',between:'SIGUIENTE RONDA',lan:'LISTO · pulsa A o inicia desde la computadora',select:'ELIGE TU PROTEÍNA',opponent:'ELIGE AL RIVAL'};
      const r=await fetch(`/api/local/poll?owner=${session.owner}&since=${cursor}&phase=${encodeURIComponent(labels[context]||'Mira la computadora')}`,{signal:abort.signal,cache:'no-store'});if(!r.ok)throw Error('Sala local cerrada');const packet=await r.json();if(id!==generation)return;
      for(const e of packet.events)deliver(e.slot,e.action,e.down);cursor=packet.cursor;
      for(let i=0;i<2;i++){
        const next=new Set(packet.slots[i].buttons);
        for(const a of [...held[i]])if(!next.has(a))deliver(i,a,false);
        for(const a of next)if(!held[i].has(a))deliver(i,a,true);
        if(connected[i]&&!packet.slots[i].connected&&g.phase==='playing'&&!flow.active()){g.pause();notice.textContent=`TELÉFONO ${i+1} DESCONECTADO · Vuelve a conectar y pulsa PAUSA para continuar.`;notice.hidden=false;}
      }
      connected=packet.slots.map(s=>s.connected);status();
      if(context!==lastContext){for(let i=0;i<2;i++)for(const a of held[i])if(directions.has(a))ControlInput.send('phone:'+i,i,a,true);lastContext=context;}
      if(g.phase!=='paused')notice.hidden=true;
    }catch(e){if(id!==generation)return;release();if(proteinFighter.phase==='playing')proteinFighter.pause();connected=[false,false];status();notice.textContent='CONEXIÓN LOCAL INTERRUMPIDA · Comprueba la red y el servidor del juego.';notice.hidden=false;}
    finally{clearTimeout(timeout);if(session&&id===generation)timer=setTimeout(()=>poll(id),Math.max(0,33-(performance.now()-before)));}
  }
  window.LocalControls={create,stop,panel,mount:qr,get connected(){return connected.slice();},get active(){return !!session;},get transport(){return transport;},get internet(){return {...internet};}};
})();
