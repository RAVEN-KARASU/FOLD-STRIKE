// Scene music uses local supplied recordings; fighting effects remain independent.
(function(){
  const KEY='protein-fighter-audio-v1';
  let prefs={enabled:true,music:.20,effects:.45,revision:2};try{const old=JSON.parse(localStorage.getItem(KEY)||'{}');prefs={...prefs,...old};if(old.revision!==2){prefs.music=Math.min(prefs.music,.20);prefs.effects=Math.min(prefs.effects,.45);prefs.revision=2;}}catch{}
  for(const k of ['music','effects'])prefs[k]=Math.max(0,Math.min(1,Number(prefs[k])||0));
  let manifest={tracks:{},sfx:{}},requested=null,current=null,serial=0,unlocked=false,duck=1,paused=false,attract=false;
  let currentSlot=0,fade=0,bag=[],lastBattle=null,battleId=null,pending=null,bannerTimer=0,bannerGeneration=0;
  let combatMusic=false,titleMusic=false,poolKind='normal';const failedTracks=new Set();
  const shouldLoop=()=>!titleMusic&&(!combatMusic||poolKind!=='normal');
  const channels=[new Audio(),new Audio()],effects=new Map();
  channels.forEach(a=>{a.loop=true;a.preload='metadata';a.volume=0;});
  const banner=document.createElement('aside');banner.id='now-playing';banner.hidden=true;banner.setAttribute('aria-live','polite');
  banner.innerHTML='<span class="music-icon" aria-hidden="true">♫</span><div><small>AHORA SUENA</small><strong></strong><span class="music-artist"></span></div>';
  document.body.appendChild(banner);
  // Browser gesture restrictions are handled by the next normal click/key press.
  // No activation prompt interrupts the introduction.
  const unlockButton=document.createElement('button');unlockButton.id='audio-unlock';unlockButton.hidden=true;unlockButton.style.display='none';
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch{}};
  const targetVolume=()=>prefs.enabled&&!paused&&!attract?Math.min(1,prefs.music*duck*(manifest.tracks[current]?.gain??1)):0;
  function volumes(){if(!fade)channels[currentSlot].volume=targetVolume();}
  function display(track){
    clearTimeout(bannerTimer);const generation=++bannerGeneration;
    banner.hidden=!track||!prefs.enabled||prefs.music===0;
    if(!track)return;
    banner.querySelector('strong').textContent=track.title;
    banner.querySelector('.music-artist').textContent=track.artist;
    banner.dataset.track=track.id;banner.dataset.arrival=String(generation);
    banner.getAnimations().forEach(a=>a.cancel());banner.style.opacity='1';
    banner.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)',offset:.08},{opacity:1,offset:.82},{opacity:0,transform:'translateY(0)'}],{duration:5000,fill:'forwards'});
    bannerTimer=setTimeout(()=>{if(generation===bannerGeneration)banner.hidden=true;},5000);
    dispatchEvent(new CustomEvent('protein-track-change',{detail:{id:track.id,title:track.title}}));
  }
  function resolve(id){const fallback={'final-win':'early-win'};const t=manifest.tracks[id];return t?.src?t:manifest.tracks[fallback[id]];}
  async function play(id){
    requested=id;
    if(attract)return;
    const track=resolve(id);
    if(!track?.src){if(!id)stop();return;}
    if(pending===id)return;
    if(current===track.id&&!pending){channels[currentSlot].loop=shouldLoop();volumes();if(channels[currentSlot].paused)unlock();return;}
    const token=++serial;cancelAnimationFrame(fade);fade=0;
    pending=id;
    const old=channels[currentSlot],nextSlot=1-currentSlot,next=channels[nextSlot];
    next.pause();next.loop=shouldLoop();next.src=track.src;next.volume=0;next.currentTime=0;
    if(!prefs.enabled||document.hidden){pending=null;return;}
    try{await next.play();}catch(error){
      if(token!==serial)return;
      pending=null;
      if(error.name==='NotAllowedError'){unlocked=false;unlockButton.hidden=false;}
      else {next.pause();banner.hidden=true;if(combatMusic||titleMusic){failedTracks.add(id);setTimeout(nextBattle,0);}}
      return;
    }
    if(token!==serial)return;
    pending=null;unlocked=true;unlockButton.hidden=true;current=track.id;currentSlot=nextSlot;display(track);
    const from=old.volume,start=performance.now();
    const tick=now=>{
      if(token!==serial)return;
      // RAF timestamps can precede performance.now() sampled in a play() microtask.
      const p=Math.max(0,Math.min(1,(now-start)/700));old.volume=from*(1-p);next.volume=targetVolume()*p;
      if(p<1)fade=requestAnimationFrame(tick);else{old.pause();old.volume=0;fade=0;}
    };fade=requestAnimationFrame(tick);
  }
  function stop(){serial++;combatMusic=false;titleMusic=false;pending=null;cancelAnimationFrame(fade);fade=0;channels.forEach(a=>{a.pause();a.volume=0;});current=null;requested=null;clearTimeout(bannerTimer);banner.hidden=true;unlockButton.hidden=true;}
  function unlock(){
    if(!prefs.enabled||attract)return;
    const c=context();if(c?.state==='suspended')c.resume().catch(()=>{});
    if(manifest.sfx.nav&&!loading.size)for(const id of Object.keys(manifest.sfx))if(manifest.sfx[id])decode(id);
    if(pending)return;
    if(requested&&requested!==current){play(requested);return;}
    if(!unlocked||channels[currentSlot].paused){
      // Normal keyboard/pointer gestures satisfy browser autoplay policy;
      // gamepad polling alone may not. No extra prompt interrupts the intro.
      if(current){channels[currentSlot].play().then(()=>{unlocked=true;unlockButton.hidden=true;volumes();}).catch(()=>{unlockButton.hidden=false;});}
      else if(requested)play(requested);
    }
  }
  let ctx=null,uiVoice=null;const buffers=new Map(),loading=new Map(),offsets=new Map(),voices=new Set(),lastEffect=new Map();
  function context(){if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(C)ctx=new C();}return ctx;}
  function decode(id){
    if(buffers.has(id))return Promise.resolve(buffers.get(id));if(loading.has(id))return loading.get(id);
    const src=manifest.sfx[id],c=context();if(!src||!c)return Promise.resolve(null);
    const p=fetch(src).then(r=>r.arrayBuffer()).then(b=>c.decodeAudioData(b)).then(b=>{
      // Supplied interface recordings begin with ~250–280 ms of silence.
      // Remove that latency before applying the short click envelope.
      if(['nav','select','pause'].includes(id)){
        let first=b.length;
        for(let ch=0;ch<b.numberOfChannels;ch++){const data=b.getChannelData(ch);for(let i=0;i<first;i++)if(Math.abs(data[i])>.001){first=i;break;}}
        offsets.set(id,first===b.length?0:Math.max(0,first/b.sampleRate-.004));
      }
      buffers.set(id,b);return b;
    }).catch(()=>null);loading.set(id,p);return p;
  }
  function silence(v){try{v.gain.gain.cancelScheduledValues(ctx.currentTime);v.gain.gain.setTargetAtTime(0,ctx.currentTime,.004);v.source.stop(ctx.currentTime+.02);}catch{}}
  function sfx(id){
    if(attract)return true;if(!manifest.sfx[id])return false;if(!prefs.enabled||!prefs.effects||document.hidden)return true;
    const now=performance.now(),gap=id==='nav'?110:id==='select'?160:55;
    if(now-(lastEffect.get(id)??-Infinity)<gap)return true;lastEffect.set(id,now);
    const c=context();if(!c)return true;if(c.state==='suspended')c.resume().catch(()=>{});
    decode(id).then(buffer=>{
      if(!buffer||!prefs.enabled||document.hidden||performance.now()-now>180||c.state!=='running')return;
      const ui=['nav','pause'].includes(id);if(ui&&uiVoice)silence(uiVoice);
      // Finish confirmation sounds; rapid repeated clicks don't stack recordings.
      if(id==='select'&&[...voices].some(v=>v.id==='select'))return;
      if(voices.size>=8){const disposable=[...voices].find(v=>v.id!=='select');if(disposable)silence(disposable);else return;}
      const source=c.createBufferSource(),gain=c.createGain(),v={source,gain,id};source.buffer=buffer;source.connect(gain);gain.connect(c.destination);
      const offset=offsets.get(id)||0,duration=id==='select'?buffer.duration-offset:Math.min(buffer.duration-offset,({nav:.13,pause:.45})[id]||4),t=c.currentTime,volume=prefs.effects*(['nav','select','pause'].includes(id)?.65:1);
      gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.006);gain.gain.setValueAtTime(volume,t+Math.max(.007,duration-.025));gain.gain.linearRampToValueAtTime(0,t+duration);
      voices.add(v);if(ui)uiVoice=v;source.onended=()=>{voices.delete(v);source.disconnect();gain.disconnect();if(uiVoice===v)uiVoice=null;};source.start(t,offset,duration);
    });return true;
  }
  function shuffle(){
    bag=Object.values(manifest.tracks).filter(t=>t.id.startsWith('fight-')&&t.src&&!failedTracks.has(t.id)).map(t=>t.id);
    for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
    if(bag.length>1&&bag.at(-1)===lastBattle)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];
  }
  function battle(fresh=false){
    titleMusic=false;
    const mode=window.ArcadeFlow?.state.mode||window.proteinFighter?.mode||1,choice=GameOptions.values.music[mode]||'random';
    const kind=mode===5&&ArcadeFlow.state.battleStage===3?'final':mode!==5&&choice!=='random'?'selected':'normal';
    if(kind!==poolKind){poolKind=kind;bag=[];battleId=null;}
    if(kind!=='normal'){combatMusic=true;battleId=kind==='final'?'final':choice;paused=false;duck=1;play(battleId);return;}
    combatMusic=true;if(fresh)failedTracks.clear();
    if(fresh||!battleId){if(!bag.length)shuffle();battleId=bag.pop()||'select';lastBattle=battleId;}
    paused=false;duck=1;play(battleId);
  }
  function nextBattle(){
    if((!titleMusic&&(!combatMusic||poolKind!=='normal'))||pending||paused||attract||document.hidden||!prefs.enabled)return;
    bag=bag.filter(id=>!failedTracks.has(id));if(!bag.length)shuffle();
    if(!bag.length)return;
    battleId=bag.pop();lastBattle=battleId;play(battleId);
  }
  channels.forEach((a,index)=>{
    a.addEventListener('timeupdate',()=>{if(index===currentSlot&&(titleMusic||combatMusic&&poolKind==='normal')&&!a.paused&&Number.isFinite(a.duration)&&a.duration-a.currentTime<=.85)nextBattle();});
    a.addEventListener('ended',()=>{if(index===currentSlot&&(combatMusic||titleMusic))nextBattle();});
    a.addEventListener('error',()=>{if(index===currentSlot&&(combatMusic||titleMusic)&&!pending){failedTracks.add(current);nextBattle();}});
  });
  function chapterTrack(stage,post=false){return (stage>=3?'final':stage>=1?'middle':'early')+(post?'-win':'');}
  function scene(state){
    paused=false;duck=1;
    const s=state.screen;
    banner.dataset.scene=s||'fight';
    if(!s){if(window.proteinFighter?.net.guest)battle();return;}
    combatMusic=false;titleMusic=s==='title';
    if(s==='boot'){stop();return;}
    if(s==='title'){battleId=null;bag=[];failedTracks.clear();play('title');return;}
    if(s==='credits'){play('credits');return;}
    if(s==='dialogue'){play(state.dialogueKind==='intro'?'chapters':chapterTrack(state.dialogueStage,state.dialogueKind==='post'));return;}
    if(['campaign','campaign-hero','campaign-map','chapter-brief'].includes(s)||(s==='arts'&&state.mode===5)){play('chapters');return;}
    if(['chapter-clear','campaign-complete'].includes(s)){play('final-win');return;}
    if(['winner','continue','gameover','results'].includes(s)){
      play(state.mode===5?chapterTrack(state.battleStage||0,state.result?.winner===0):'early-win');return;
    }
    if(s==='versus'&&state.mode===5){play(chapterTrack(state.battleStage||0));return;}
    play('select');
  }
  function setAttractMode(value){
    attract=!!value;
    if(attract){serial++;pending=null;cancelAnimationFrame(fade);fade=0;channels.forEach(a=>{a.pause();a.volume=0;});voices.forEach(silence);banner.hidden=true;}
    else if(!document.hidden&&!paused)unlock();
  }
  function setEnabled(value){prefs.enabled=!!value;save();voices.forEach(silence);
    if(!value){serial++;pending=null;cancelAnimationFrame(fade);fade=0;channels.forEach((a,i)=>{a.pause();if(i!==currentSlot)a.volume=0;});banner.hidden=true;unlockButton.hidden=true;}
    else{if(current){unlock();display(manifest.tracks[current]);}else if(requested)play(requested);}
    dispatchEvent(new CustomEvent('protein-audio-enabled',{detail:prefs.enabled}));
  }
  const ready=fetch('assets/audio/manifest.json').then(r=>{if(!r.ok)throw new Error('Audio manifest');return r.json();}).then(data=>{manifest=data;if(requested)play(requested);return data;}).catch(()=>manifest);
  addEventListener('pointerdown',unlock,{capture:true});addEventListener('keydown',unlock,{capture:true});unlockButton.onclick=unlock;
  document.addEventListener('click',event=>{if(event.target.closest('dialog button'))sfx('select');});
  document.addEventListener('cancel',event=>{if(event.target.tagName==='DIALOG')sfx('select');},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){serial++;pending=null;cancelAnimationFrame(fade);fade=0;channels.forEach((a,i)=>{a.pause();if(i!==currentSlot)a.volume=0;});voices.forEach(silence);}else unlock();});
  addEventListener('protein-music-choice',e=>{if(combatMusic&&e.detail.mode===(window.ArcadeFlow?.state.mode||window.proteinFighter?.mode||1)){const wasPaused=paused;battle(true);paused=wasPaused;volumes();}});
  addEventListener('protein-screen',e=>scene(e.detail));
  let lastNav=-Infinity;
  function nav(){const now=performance.now();if(now-lastNav>70){lastNav=now;sfx('nav');}}
  window.AudioDirector={ready,scene,play,stop,unlock,sfx,nav,battle,chapterTrack,setEnabled,setAttractMode,
    pause(value){paused=!!value;volumes();if(!paused&&channels[currentSlot].ended)nextBattle();},duck(level){duck=level;volumes();},
    setVolume(kind,value){if(!['music','effects'].includes(kind))return;prefs[kind]=Math.max(0,Math.min(1,value));save();volumes();if(!prefs.music)banner.hidden=true;},
    get preferences(){return {...prefs};},get status(){return {requested,current,pending,unlocked,attract,enabled:prefs.enabled,playing:channels.filter(a=>!a.paused).length,trackTime:channels[currentSlot].currentTime,battleId,combatMusic,poolKind,voices:voices.size,volume:channels[currentSlot].volume};},
    get manifest(){return manifest;},
  };
})();
