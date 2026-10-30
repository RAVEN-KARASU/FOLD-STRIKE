// Continuous controls belong to their input source, not to whichever device released last.
(function(){
 const directions=new Set(['left','right','up','down','block']),sources=new Map();let context='';
 const any=(slot,action)=>[...sources.values()].some(s=>s.has(slot+':'+action));
 function send(source,slot,action,down){
  const game=window.proteinFighter;if(!game)return;
  if(!directions.has(action)){game.input(slot,action,down);return;}
  const key=slot+':'+action,before=any(slot,action),set=sources.get(source)||new Set();
  if(down)set.add(key);else set.delete(key);
  if(set.size)sources.set(source,set);else sources.delete(source);
  const after=any(slot,action);if(before!==after)game.input(slot,action,after);
 }
 function release(source){for(const key of [...(sources.get(source)||[])]){const [slot,action]=key.split(':');send(source,+slot,action,false);}}
 function clear(){for(const source of [...sources.keys()])release(source);}
 function sync(){
  const g=window.proteinFighter,next=g?[g.phase,g.round,window.ArcadeFlow?.screen,g.fighters?.some(f=>g.MOVES[f.action]?.ultimate)].join(':'):'';
  if(next!==context){context=next;if(g&&!window.ArcadeFlow?.active()&&['intro','playing'].includes(g.phase)){
   const all=new Set([...sources.values()].flatMap(s=>[...s]));for(const key of all){const [slot,a]=key.split(':');g.input(+slot,a,true);}
  }}requestAnimationFrame(sync);
 }
 addEventListener('blur',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
 addEventListener('protein-bindings',clear);addEventListener('protein-screen',clear);
 window.ControlInput={send,release,clear};requestAnimationFrame(sync);
})();
