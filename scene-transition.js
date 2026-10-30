// A black interval separates scenes; input is locked until the reveal finishes.
(function(){
  const veil=document.createElement('div');veil.id='scene-transition';veil.hidden=true;veil.setAttribute('aria-hidden','true');document.body.appendChild(veil);
  let until=0,timers=[],atBlack=null;
  function run(source,change){
    timers.forEach(clearTimeout);timers=[];
    veil.getAnimations().forEach(a=>a.cancel());
    // If a transition is superseded (e.g. a disconnect), its old callback must not run.
    atBlack=change||null;
    // Keep the live source DOM until black: cloning loses ID-scoped styles and canvas pixels.
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const out=reduced?80:320,hold=300,inside=reduced?120:500,total=out+hold+inside;
    until=performance.now()+total;veil.hidden=false;veil.style.opacity='0';
    veil.animate([{opacity:0},{opacity:1}],{duration:out,fill:'forwards',easing:'ease-in'});
    timers.push(setTimeout(()=>{veil.getAnimations().forEach(a=>a.cancel());veil.style.opacity='1';const f=atBlack;atBlack=null;f?.();},out));
    timers.push(setTimeout(()=>{veil.getAnimations().forEach(a=>a.cancel());veil.animate([{opacity:1},{opacity:0}],{duration:inside,fill:'forwards',easing:'ease-out'});},out+hold));
    timers.push(setTimeout(()=>{veil.hidden=true;until=0;},total));return total;
  }
  window.SceneTransition={run,get active(){return performance.now()<until;},get remaining(){return Math.max(0,until-performance.now());}};
})();
