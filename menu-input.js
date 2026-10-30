// Spatial controller navigation shared by screens, dialogs, pause and remote lobby.
(function(){
  const visible=el=>!el.disabled&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden';
  const controls=root=>[...root.querySelectorAll('button,a[href],input:not([type=file]),select')].filter(visible);
  const token=el=>el?.id?'#'+el.id:el?.dataset.action?'action:'+el.dataset.action:
    ['index','art','mode','home','chapter','hero'].map(k=>el?.dataset[k]!==undefined?k+':'+el.dataset[k]:null).find(Boolean);
  function focus(el){if(!el)return;document.querySelectorAll('.pad-focus').forEach(e=>e.classList.remove('pad-focus'));el.classList.add('pad-focus');el.focus({preventScroll:true});el.scrollIntoView({block:'nearest',inline:'nearest'});}
  function current(root){return controls(root).find(e=>e===document.activeElement)||controls(root).find(e=>e.classList.contains('pad-focus'));}
  function initial(root){const list=controls(root);return list.find(e=>e.id==='go')||list.find(e=>e.classList.contains('selected'))||list.find(e=>e.dataset.action==='confirm')||list[0];}
  function move(root,dx,dy){
    window.AudioDirector?.nav();
    const list=controls(root),at=current(root)||initial(root);if(!at)return null;
    const r=at.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
    const candidates=list.filter(el=>el!==at).map(el=>{const b=el.getBoundingClientRect();const vx=b.x+b.width/2-x,vy=b.y+b.height/2-y;const forward=dx?vx*dx:vy*dy,side=dx?Math.abs(vy):Math.abs(vx);return {el,forward,cost:forward+side*2.5};}).filter(t=>t.forward>3).sort((a,b)=>a.cost-b.cost);
    const chosen=candidates[0]?.el||at;focus(chosen);return chosen;
  }
  function restore(root,key){if(!key)return;focus(controls(root).find(el=>token(el)===key));}
  function pad(root,action){
    const at=current(root)||initial(root);
    if(at?.tagName==='SELECT'&&['left','right','lkick','start'].includes(action)){at.selectedIndex=(at.selectedIndex+(action==='left'?-1:1)+at.options.length)%at.options.length;at.dispatchEvent(new Event('change',{bubbles:true}));window.AudioDirector?.nav();return;}

    if(['left','right','up','down'].includes(action)){move(root,action==='left'?-1:action==='right'?1:0,action==='up'?-1:action==='down'?1:0);return;}
    if(['lkick','start'].includes(action))(current(root)||initial(root))?.click();
  }
  window.MenuInput={controls,token,focus,current,initial,move,restore,pad};
})();
