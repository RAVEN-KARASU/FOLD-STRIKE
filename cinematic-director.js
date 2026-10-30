// Directs the existing rig, renderer and hit timeline: no second scene or damage shortcut.
(function(){
 const panel=document.createElement('div');panel.id='ultimate-direction';panel.hidden=true;panel.setAttribute('aria-hidden','true');
 panel.innerHTML='<div class="cinema-top"></div><div class="cinema-bottom"><small>CLÍMAX</small><strong></strong></div><div class="cinema-lines"></div>';
 document.querySelector('.arena').appendChild(panel);
 let active=null;
 const quiet=matchMedia('(prefers-reduced-motion: reduce)');
 function clear(){active=null;panel.hidden=true;document.documentElement.classList.remove('ultimate-shot');}
 function update(fighters,camera,dt,phase){
  const f=phase==='playing'&&GameOptions.cinematics&&!quiet.matches?fighters.find(f=>f.hp>0&&f.stun<=0&&f.t>=.12&&proteinFighter.MOVES[f.action]?.ultimate):null;
  const ease=1-Math.exp(-dt*10);
  let height=100,center=70,pitch=.5;
  if(f){
   const move=proteinFighter.MOVES[f.action],other=fighters.find(x=>x!==f),variant=move.variant||0,t=f.t;
   const shot=t<.45?'charge':t<1.35?'rush':t<1.95?'finish':'release';
   if(!active||active.f!==f||active.move!==f.action){active={f,move:f.action};panel.querySelector('strong').textContent=move.text;panel.style.setProperty('--cinema-hue',String(f.form.meta?.hue??(variant*47)%360));}
   panel.hidden=false;panel.dataset.shot=shot;panel.dataset.variant=String(variant%7);document.documentElement.classList.add('ultimate-shot');
   const face=f.facing||1,gap=Math.abs(f.x-other.x),mid=(f.x+other.x)/2;
   // Three authored views: wind-up, tracking exchange, then a low/high finisher.
   let x=mid,width=Math.max(92,gap*.5+65);
   if(shot==='charge'){x=f.x+face*(6+variant%4*3);height=65;center=78+f.y*.55;pitch=.24+(variant%3)*.07;width=100;}
   else if(shot==='rush'){x=mid+face*Math.sin(t*4+variant)*8;height=82;center=69+(f.y+other.y)*.22;pitch=.36;}
   else if(shot==='finish'){x=mid+face*8;height=72+(variant%3)*3;center=76+(f.y+other.y)*.25;pitch=.19+(variant%4)*.08;}
   else {height=94;center=70;pitch=.5;}
   camera.x+=(x-camera.x)*ease;camera.halfW+=(width-camera.halfW)*ease;
  }else clear();
  camera.halfH+=(height-camera.halfH)*ease;camera.centerY+=(center-camera.centerY)*ease;camera.pitch+=(pitch-camera.pitch)*ease;
 }
 addEventListener('protein-screen',clear);
 window.UltimateDirector={update,clear,get active(){return active?{move:active.move,shot:panel.dataset.shot}:null;}};
})();
