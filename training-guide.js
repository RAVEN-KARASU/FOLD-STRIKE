// Guided practice reads real fighter movement and match statistics; no scripted wins.
(function(){
 const pane=document.createElement('aside');pane.id='training-guide';pane.hidden=true;document.querySelector('.arena').appendChild(pane);
 let active=false,index=0,baseline=null,completed=false,nextAt=0,attackAt=0,completedAt=0;
 const lessons=[
  ['TOMA DISTANCIA','Camina hacia delante o hacia atrás. La distancia decide qué golpes alcanzan al rival.','left / right',g=>Math.abs(g.fighters[0].x-baseline.x)>=30],
  ['CAMBIA DE ALTURA','Salta una vez. Puedes atacar en el aire y pasar sobre una onda baja.','up',g=>g.statistics[0].jumps>baseline.stats.jumps],
  ['ENCUENTRA TU ALCANCE','Conecta tres impactos con tus golpes. Acércate primero: pulsar un ataque fuera de alcance no cuenta.','lpunch / punch / lkick',g=>g.statistics[0].hits-baseline.stats.hits>=3],
  ['PROTEÍNA, PODER PROPIO','Lanza tu especial. Cada estructura tiene una técnica característica.','special',g=>g.statistics[0].specials>baseline.stats.specials],
  ['DEFIENDE TU ESTRUCTURA','Bloquea una onda de práctica del rival. Mantener la guardia consume energía, incluso sin recibir impactos.','block',g=>g.statistics[0].blocks>baseline.stats.blocks],
  ['RESPONDE AL CONTACTO','Tras bloquear, mantén el bloqueo y pulsa especial enseguida. El contraataque cuesta media carga; la ventana dura 0,22 s.','block + special',g=>g.statistics[0].counters>baseline.stats.counters],
  ['TU CLÍMAX','Con tres cargas completas, activa tu Super Art. En entrenamiento la energía se repone para practicar.','super',g=>g.statistics[0].supers>baseline.stats.supers],
 ];
 const padNames={0:'A',1:'B',2:'X',3:'Y',4:'LB',5:'RB',6:'LT',7:'RT',10:'LS',11:'RS',chord:'LT + RT'};
 function hint(text){const b=InputBindings.values;return text.replace(/[a-z]+/g,a=>{const p=padNames[b.pads[0][a]];return (b.keys[0][a]||a).toUpperCase()+(p?' / '+p:'');});}
 function render(){const l=lessons[index];pane.hidden=!active;if(!active)return;pane.innerHTML=`<small>TUTORIAL · ${index+1} / ${lessons.length}</small><h3>${l[0]}</h3><p>${l[1]}</p><strong>${hint(l[2])}</strong><span role="status">${completed?'OBJETIVO CUMPLIDO · Avanzando…':'PRUÉBALO EN LA ARENA'}</span><div><button data-guide="repeat">REPETIR</button><button data-guide="skip">${index===lessons.length-1?'TERMINAR':'SALTAR PASO'}</button><button data-guide="exit">SALIR</button></div>`;}
 function setup(){const g=proteinFighter;if(!active||!g)return;completed=false;nextAt=0;attackAt=0;baseline={x:g.fighters[0].x,stats:g.statistics[0]};
  if(index>=2){const [a,b]=g.fighters;a.x=-26;b.x=26;a.facing=1;b.facing=-1;}
  render();}
 function stop(){active=false;pane.hidden=true;nextAt=0;}
 function advance(){if(++index>=lessons.length){stop();const note=document.createElement('div');note.className='tutorial-complete';note.textContent='TUTORIAL COMPLETADO · Sigue practicando. R reinicia la arena.';document.querySelector('.arena').appendChild(note);setTimeout(()=>note.remove(),5000);return;}proteinFighter.resetTraining();setup();}
 pane.onclick=e=>{const a=e.target.closest('[data-guide]')?.dataset.guide;if(a==='exit'){stop();ArcadeFlow.openArcade();}else if(a==='repeat'){proteinFighter.resetTraining();setup();}else if(a==='skip')advance();};
 addEventListener('keydown',e=>{if(active&&completed&&e.key==='Enter'){e.preventDefault();advance();}},true);
 function observe(now){if(active){const g=proteinFighter;if(!ArcadeFlow.active()&&g.phase==='playing'){
   if(!completed&&lessons[index][3](g)){completed=true;completedAt=now;render();}
   if(completed&&now-completedAt>=1800)advance();
  }else if(g.phase==='ko'||g.phase==='over'){g.resetTraining();setup();}}
  requestAnimationFrame(observe);
 }
 window.TrainingGuide={get active(){return active;},get index(){return index;},get completed(){return completed;},start(){active=true;index=0;setup();},stop,
  control(c,p,dt){
    let behavior=GameOptions.dummy;if(active)behavior=index===4||index===5?'attack':'idle';
    if(behavior==='guard'){c.blockHold=.2;return;}
    if(behavior!=='attack')return;attackAt-=dt;
    const gap=Math.abs(c.x-p.x);if(gap>60&&!proteinFighter.MOVES[c.action])c.x+=Math.sign(p.x-c.x)*70*dt;
    if(attackAt<=0&&gap<80){if(proteinFighter.attack(c,active?'practice_pulse':'punch'))attackAt=1.35;}
  }};
 requestAnimationFrame(observe);
})();
