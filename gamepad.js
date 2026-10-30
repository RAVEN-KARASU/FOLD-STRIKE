// Standard physical layout plus saved profiles for PlayStation, Xbox and generic devices.
(function (root) {
  const BUTTONS = {0:'lkick',1:'kick',2:'lpunch',3:'punch',4:'special',5:'hpunch',8:'back',9:'start',12:'up',13:'down',14:'left',15:'right'};
  const button=b=>typeof b==='number'?b>.55:!!(b?.pressed||b?.value>.55);
  function normalize(p){
    if(!p||p.connected===false||!p.buttons||p.buttons.length<4)return null;
    const mapped=root.ControllerProfiles?.map(p)||p;
    return {...mapped,index:p.index,id:p.id||'Mando',mapping:mapped.mapping||'generic',connected:true,buttons:Array.from(mapped.buttons),axes:Array.from(mapped.axes||[])};
  }
  const DIRECTIONS = new Set(['up','down','left','right']);
  class PadHub {
    constructor(send) { this.send=send; this.slots=new Map(); this.previous=new Map(); this.repeat=new Map();this.triggers=new Map(); }
    release(index) {
      const slot=this.slots.get(index);
      for(const action of this.previous.get(index)||[]) this.send(slot,action,false,false);
      this.previous.delete(index);this.repeat.delete(index);this.slots.delete(index);this.triggers.delete(index);
    }
    releaseAll() { for(const i of [...this.slots.keys()])this.release(i); }
    update(pads,now,menu=false) {
      const resumed=this.lastMenu===true&&!menu;this.lastMenu=menu;const live=new Set();
      for(const raw of pads||[]) {
        const pad=normalize(raw);if(!pad)continue;
        live.add(pad.index);
        if(!this.slots.has(pad.index)) {
          const taken=new Set(this.slots.values());const slot=[0,1].find(i=>!taken.has(i));
          if(slot===undefined)continue;this.slots.set(pad.index,slot);
        }
        const slot=this.slots.get(pad.index), next=new Set(), old=this.previous.get(pad.index)||new Set();
        const custom=!menu&&root.InputBindings?.padMap(root.proteinFighter?.mode===2?slot:0),mapping=custom?{8:'back',9:'start',12:'up',13:'down',14:'left',15:'right',...Object.fromEntries(Object.entries(custom).filter(([a,b])=>b!=='chord').map(([a,b])=>[b,a]))}:BUTTONS;
        const chordEnabled=!custom||custom.block==='chord',mapped=b=>custom?mapping[b]:(b===6?'super':'hkick');
        for(const [n,action] of Object.entries(mapping))if(!(chordEnabled&&[6,7].includes(+n))&&button(pad.buttons[n]))next.add(action);
        const lt=button(pad.buttons[6]),rt=button(pad.buttons[7]);
        const tr=this.triggers.get(pad.index)||{lt:false,rt:false,at:now,latch:false,fired:false};
        if(chordEnabled&&lt&&rt){tr.latch=true;next.add('block');}
        else if(chordEnabled&&!tr.latch){
          // A short chord window prevents the first trigger firing a super before the second arrives.
          if((lt||rt)&&!(tr.lt||tr.rt)){tr.at=now;tr.fired=false;}
          if((lt||rt)&&now-tr.at>=80){if(mapped(lt?6:7))next.add(mapped(lt?6:7));tr.fired=true;}
          if(!lt&&!rt&&(tr.lt||tr.rt)&&!tr.fired){const action=mapped(tr.lt?6:7);if(action){this.send(slot,action,true,false);this.send(slot,action,false,false);}}
        }
        if(!lt&&!rt){tr.latch=false;tr.fired=false;}
        tr.lt=lt;tr.rt=rt;this.triggers.set(pad.index,tr);
        const dz=root.GameOptions?.deadzone||.35;
        if(pad.axes[0]<-dz)next.add('left');if(pad.axes[0]>dz)next.add('right');
        if(pad.axes[1]<-dz)next.add('up');if(pad.axes[1]>dz)next.add('down');
        if(next.has('left')&&next.has('right')){next.delete('left');next.delete('right');}
        if(next.has('up')&&next.has('down')){next.delete('up');next.delete('down');}
        const repeat=this.repeat.get(pad.index)||{};
        for(const action of old)if(!next.has(action)){this.send(slot,action,false,false);delete repeat[action];}
        for(const action of next) {
          if(!old.has(action)||(resumed&&DIRECTIONS.has(action))){this.send(slot,action,true,false);repeat[action]=now+350;}
          else if(menu&&DIRECTIONS.has(action)&&now>=repeat[action]){this.send(slot,action,true,true);repeat[action]=now+120;}
        }
        this.previous.set(pad.index,next);this.repeat.set(pad.index,repeat);
      }
      for(const i of [...this.slots.keys()])if(!live.has(i))this.release(i);
    }
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={PadHub,BUTTONS};return;}
  const hub=new PadHub((slot,action,down,repeat)=>{
    const game=root.proteinFighter;if(!game)return;
    const player=game.mode===2?slot:0;
    if(!down){root.ControlInput?.send('pad:'+slot,player,action,false);return;}
    if(down)root.AudioDirector?.unlock();
    if(!document.getElementById('custom-modal').hidden){if(down){if(['kick','back'].includes(action))game.closeCustom();else MenuInput.pad(document.getElementById('custom-modal'),action);}return;}
    const dialog=document.querySelector('dialog[open]');
    if(dialog){if(down){if(['kick','back'].includes(action)){window.AudioDirector?.sfx('select');dialog.close();}else MenuInput.pad(dialog,action);}return;}
    if(root.ArcadeFlow?.screen==='remote'){if(down){if(['kick','back'].includes(action))ArcadeFlow.home();else MenuInput.pad(document.getElementById('overlay'),action);}return;}
    if(root.ArcadeFlow?.active()){root.ArcadeFlow.pad(slot,action,down,repeat);return;}
    if(game.phase==='paused'){
      if(down){if(['kick','back','start'].includes(action))game.pause();else (root.PauseMenu?PauseMenu.pad(action):MenuInput.pad(document.querySelector('.arena'),action));}return;
    }
    if(!repeat)root.ControlInput.send('pad:'+slot,player,action,down);
  });
  let enabled=true,native=[],nativeAt=0,nativeAvailable=true,lastError='',seen='';
  const feedback=document.createElement('p');feedback.id='gamepad-status';feedback.setAttribute('role','status');
  feedback.style.cssText='font:14px/1.5 system-ui;padding:12px;border:1px solid #bcb0c055;border-radius:4px;background:#111a2c;color:#f5ecd8;white-space:pre-line';
  let deviceState=[];
  function describe(pads){
    deviceState=pads.map(p=>({index:p.index,name:p.id,mapping:p.mapping,player:hub.slots.get(p.index)}));
    const host=document.querySelector('#arcade-settings .settings-options');
    if(host&&!feedback.isConnected){feedback.dataset.group='controls';host.prepend(feedback);feedback.hidden=!document.querySelector('[data-settings-tab=controls]')?.classList.contains('selected');}
    const label=pads.length?pads.map((p,i)=>'MANDO '+(i+1)+': '+p.id+(p.mapping==='generic'?' · revisa la asignación de botones':'')).join('\n'):'Sin mando detectado. Conecta por USB o Bluetooth y pulsa A / ?. Si persiste, comprueba el mando en Windows (joy.cpl).';
    feedback.textContent=label+(lastError?'\n'+lastError:'')+(!document.hasFocus()?'\nHaz clic en la ventana del juego para recuperar el control.':'');
  }
  async function nativePoll(){
    const start=performance.now();
    if(enabled&&nativeAvailable&&!document.hidden){
      const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),800);
      try{const r=await fetch('/api/gamepads',{cache:'no-store',signal:abort.signal});
        if(r.status===404||r.status===403){nativeAvailable=false;native=[];}
        else if(r.ok){const data=await r.json();native=(data.pads||[]).filter(p=>p&&p.connected!==false);nativeAt=performance.now();}
      }catch{if(performance.now()-nativeAt>1000)native=[];}finally{clearTimeout(timeout);}
    }
    setTimeout(nativePoll,Math.max(8,(native.length?33:700)-(performance.now()-start)));
  }
  const frame=now=>{
    try{
      if(!enabled||document.hidden){hub.releaseAll();return;}
      let browserPads=[];try{browserPads=Array.from(navigator.getGamepads?.()||[]).filter(p=>p&&p.connected!==false&&p.buttons?.length>=4);}catch{lastError='La lectura del navegador no está disponible; se intentará la conexión de Windows.';}
      const windowsPads=now-nativeAt<1000?native:[];
      const rawPads=windowsPads.length?[...windowsPads,...browserPads.filter(p=>!/xbox|xinput|x-box|045e/i.test(p.id))]:browserPads;
      root.ControllerSetup?.update(rawPads,now);
      if(root.ControllerSetup?.active){hub.releaseAll();return;}
      const pads=rawPads.map(normalize).filter(Boolean);
      if(document.hasFocus()){
        const live=new Set(pads.map(p=>p.index));
        const lost=[...hub.slots.keys()].some(i=>!live.has(i));
        if(root.AttractMode?.gamepads(pads)){hub.releaseAll();return;}
        hub.update(pads,now,!!root.ArcadeFlow?.active()||root.proteinFighter?.phase==='paused'||!!document.querySelector('dialog[open]'));
        if(lost&&root.proteinFighter?.phase==='playing'&&!root.ArcadeFlow?.active())root.proteinFighter.pause();
      }else hub.releaseAll();
      root.ArcadeFlow?.padStatus(pads.length);
      const signature=JSON.stringify(pads.map(p=>[p.index,p.id,p.mapping]))+document.hasFocus()+lastError;
      if(signature!==seen||document.querySelector('#arcade-settings[open]')){describe(pads);seen=signature;}
      lastError='';
    }catch(error){
      lastError='Se recuperó la lectura del mando. Desconéctalo y vuelve a conectarlo si no responde.';
      try{hub.releaseAll();}catch{}describe([]);
    }finally{requestAnimationFrame(frame);}
  };
  addEventListener('protein-controller-profile',()=>{hub.releaseAll();root.ControlInput?.clear();seen='';});
  addEventListener('blur',()=>hub.releaseAll());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hub.releaseAll();});
  addEventListener('gamepadconnected',()=>{seen='';nativeAvailable=true;});
  addEventListener('gamepaddisconnected',()=>{seen='';});
  root.GamepadControls={hub,PadHub,normalize,get devices(){return deviceState.map(p=>({...p}));},get status(){return {nativeAvailable,nativeCount:native.length,error:lastError};},setEnabled(value){enabled=value;if(!value)hub.releaseAll();}};
  requestAnimationFrame(frame);nativePoll();
})(typeof window!=='undefined'?window:globalThis);
