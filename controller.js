(function(){
  // Safari ignores user-scalable=no. Cancel its gestures as well as double taps,
  // without rejecting simultaneous PointerEvents used for movement + attacks.
  for(const type of ['gesturestart','gesturechange','gestureend','dblclick'])document.addEventListener(type,e=>e.preventDefault(),{passive:false});
  for(const type of ['touchstart','touchmove','touchend'])document.addEventListener(type,e=>{e.preventDefault();},{passive:false});
  document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault();},{passive:false});
  const token=new URLSearchParams(location.hash.slice(1)).get('token')||new URLSearchParams(location.search).get('token'),status=document.getElementById('status'),phase=document.getElementById('phase'),internet=location.protocol==='https:';
  let client;try{client=sessionStorage.getItem('protein-controller-id');}catch{}
  if(!client){client=window.crypto?.getRandomValues?Array.from(crypto.getRandomValues(new Uint8Array(16)),v=>v.toString(16).padStart(2,'0')).join(''):'phone-'+Date.now()+'-'+Math.random().toString(36).slice(2);try{sessionStorage.setItem('protein-controller-id',client);}catch{}}
  const pointers=new Map();let sequence=Date.now()*1000,queue=[],sending=0,connected=false,lastAck=-1;
  const nextSequence=()=>sequence=Math.max(sequence,lastAck)+1;
  const buttons=()=>[...new Set([...pointers.values()].flat())];
  function paint(){const held=buttons();for(const b of document.querySelectorAll('[data-action]'))b.classList.toggle('held',held.includes(b.dataset.action));}
  function enqueue(){if(!token)return;queue.push({seq:nextSequence(),buttons:buttons()});if(queue.length>12){release(false);queue=[{seq:nextSequence(),buttons:[]}];status.textContent='Conexión lenta: se soltaron los controles.';}send();}
  async function send(){
    if(sending>=(internet?2:1)||!queue.length)return;
    sending++;const frames=queue.map(f=>({...f})),packet={token,client,...frames.at(-1),frames},abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),internet?2600:1400),at=performance.now();
    try{const response=await fetch('/api/local/input',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(packet),signal:abort.signal});if(!response.headers.get('Content-Type')?.includes('application/json'))throw Error('El servidor no está disponible ('+response.status+'). Vuelve a escanear el QR.');const data=await response.json();if(!response.ok)throw Error(data.error||'No se pudo conectar. Vuelve a escanear el QR.');lastAck=Math.max(lastAck,data.accepted);queue=queue.filter(f=>f.seq>lastAck);connected=true;document.body.classList.add('connected');status.textContent='JUGADOR '+(data.slot+1)+' · '+(internet?'INTERNET':new URLSearchParams(location.hash.slice(1)).get('via')==='usb'?'USB':'LOCAL')+' · '+Math.round(performance.now()-at)+' ms';phase.textContent=data.phase||'Mira el combate en la computadora';}
    catch(e){if(packet.seq<=lastAck)return;connected=false;document.body.classList.remove('connected');status.textContent=e.name==='AbortError'?'Sin respuesta. Comprueba la conexión y que el PC siga abierto.':e.message;release(false);queue=[];}
    finally{clearTimeout(timeout);sending--;if(queue.length&&!document.hidden)send();}
  }
  function release(notify=true){pointers.clear();stickPointer=null;paint();document.querySelector('#stick i').style.transform='';if(notify)enqueue();}
  for(const b of document.querySelectorAll('[data-action]')){
    b.onpointerdown=e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId);}catch{}pointers.set(e.pointerId,[b.dataset.action]);paint();enqueue();};
    b.onpointerup=b.onpointercancel=b.onlostpointercapture=e=>{if(pointers.delete(e.pointerId)){paint();enqueue();}};
  }
  const stick=document.getElementById('stick');let stickPointer=null;
  function move(e){const r=stick.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*2-1,y=(e.clientY-r.top)/r.height*2-1,a=[];if(x<-.23)a.push('left');if(x>.23)a.push('right');if(y<-.23)a.push('up');if(y>.23)a.push('down');if(JSON.stringify(pointers.get(e.pointerId))!==JSON.stringify(a)){pointers.set(e.pointerId,a);enqueue();}stick.querySelector('i').style.transform=`translate(${Math.max(-1,Math.min(1,x))*70}%,${Math.max(-1,Math.min(1,y))*70}%)`;}
  stick.onpointerdown=e=>{if(stickPointer!==null)return;e.preventDefault();stickPointer=e.pointerId;try{stick.setPointerCapture(e.pointerId);}catch{}move(e);};
  stick.onpointermove=e=>{if(e.pointerId===stickPointer)move(e);};
  stick.onpointerup=stick.onpointercancel=stick.onlostpointercapture=e=>{if(e.pointerId===stickPointer){stickPointer=null;pointers.delete(e.pointerId);stick.querySelector('i').style.transform='';enqueue();}};
  document.getElementById('fullscreen').onpointerup=()=>document.documentElement.requestFullscreen?.().catch(()=>{});
  document.getElementById('fullscreen').onclick=()=>document.documentElement.requestFullscreen?.().catch(()=>{});
  document.addEventListener('contextmenu',e=>e.preventDefault());
  addEventListener('blur',()=>release());
  addEventListener('pagehide',()=>{release(false);if(token)navigator.sendBeacon('/api/local/input',new Blob([JSON.stringify({token,client,seq:nextSequence(),buttons:[]})],{type:'application/json'}));});
  document.addEventListener('visibilitychange',()=>{release();if(document.hidden&&token){navigator.sendBeacon('/api/local/input',new Blob([JSON.stringify({token,client,seq:nextSequence(),buttons:[]})],{type:'application/json'}));}});
  setInterval(()=>{if(!document.hidden&&sending<(internet?2:1))enqueue();},150);
  if(token)enqueue();else status.textContent='Falta la invitación. Escanea otra vez el QR de REMOTE; abre el enlace completo en Chrome o Safari.';
})();
