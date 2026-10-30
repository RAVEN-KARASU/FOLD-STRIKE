// Arcade attract reel. Runs only in browsing screens, never over a match or story.
(function(){
  const IDLE_MS=40000;
  const menus=new Set(['title','arcade','select','opponent','arts','campaign','campaign-hero','campaign-map','chapter-brief','swiss-setup','swiss-board']);
  const layer=document.createElement('dialog');layer.id='attract-reel';layer.tabIndex=-1;
  layer.setAttribute('aria-label','Presentación de FOLD//STRIKE. Mueve un control para volver.');
  const video=document.createElement('video');video.preload='none';video.playsInline=true;
  video.disablePictureInPicture=true;video.setAttribute('aria-label','Tráiler de FOLD//STRIKE');
  layer.appendChild(video);document.body.appendChild(layer);
  let active=false,lastInput=performance.now(),generation=0,wakeUntil=0,padLatch=false,focus=null;
  const heldKeys=new Set();
  function eligible(){
    return !document.hidden&&!window.SceneTransition?.active&&!window.ArcadeFlow?.state.busy&&
      menus.has(window.ArcadeFlow?.screen)&&!window.LocalControls?.active&&
      !['intro','playing','between','ko','paused'].includes(window.proteinFighter?.phase);
  }
  function stop(){
    lastInput=performance.now();if(!active)return;
    active=false;generation++;video.pause();layer.classList.remove('playing');layer.close();
    document.documentElement.classList.remove('attract-playing');
    window.AudioDirector?.setAttractMode(false);
    if(focus?.isConnected)focus.focus({preventScroll:true});focus=null;
  }
  async function start(){
    if(active||!eligible())return;
    active=true;const token=++generation;focus=document.activeElement;
    document.documentElement.classList.add('attract-playing');
    window.AudioDirector?.setAttractMode(true);
    const audio=window.AudioDirector?.preferences;
    video.volume=audio?.music??.2;video.muted=audio?.enabled===false||video.volume===0;
    if(!video.getAttribute('src'))video.src='assets/video/spot_foldstrike.mp4';
    video.currentTime=0;layer.showModal();layer.focus({preventScroll:true});
    try{await video.play();}
    catch(error){
      if(!active||token!==generation)return;
      // Standard browsers may forbid audible autoplay before a user gesture.
      if(error.name==='NotAllowedError'){
        video.muted=true;
        try{await video.play();}catch{if(token===generation)stop();}
      }else stop();
    }
    if(token!==generation&&!active)video.pause();
  }
  function tick(now=performance.now()){
    if(!eligible()){if(active)stop();lastInput=now;return;}
    if(heldKeys.size){lastInput=now;return;}
    if(!active&&now-lastInput>=IDLE_MS)start();
  }
  function input(event){
    if(event.type==='keydown')heldKeys.add(event.code||event.key);
    if(event.type==='keyup')heldKeys.delete(event.code||event.key);
    lastInput=performance.now();
    const waking=active;
    if(waking){stop();wakeUntil=lastInput+450;}
    // A wake-up click/confirm must not also launch a match or change a selection.
    if(waking||lastInput<wakeUntil){if(event.cancelable)event.preventDefault();event.stopImmediatePropagation();}
  }
  function gamepads(pads){
    const held=[...pads].some(p=>p?.connected!==false&&p&&
      ((p.buttons||[]).some(b=>typeof b==='number'?b>.55:b?.pressed||b?.value>.55)||(p.axes||[]).some(a=>Math.abs(a)>(window.GameOptions?.deadzone||.35))));
    if(held){lastInput=performance.now();if(active){stop();padLatch=true;}}
    if(padLatch){if(!held)padLatch=false;return true;}
    return false;
  }
  for(const name of ['pointermove','pointerdown','pointerup','click','dblclick','wheel','keydown','keyup','touchstart','touchmove'])
    addEventListener(name,input,{capture:true,passive:false});
  addEventListener('blur',()=>{heldKeys.clear();stop();});
  document.addEventListener('visibilitychange',()=>{heldKeys.clear();stop();});
  addEventListener('protein-screen',stop);
  layer.addEventListener('cancel',event=>{event.preventDefault();stop();});
  video.addEventListener('playing',()=>{if(active)layer.classList.add('playing');});
  video.addEventListener('ended',stop);video.addEventListener('error',stop);
  // Opening settings/another modal is interaction too; preserve the exact underlying screen.
  document.addEventListener('toggle',()=>{lastInput=performance.now();},true);
  window.AttractMode={tick,gamepads,stop,get active(){return active;},get idleMs(){return IDLE_MS;},get lastInput(){return lastInput;}};
  setInterval(tick,250);
})();
