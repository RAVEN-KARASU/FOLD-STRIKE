// Shared camera for dialogue and smooth 2D-to-3D roster previews.
(function(){
 const cache=new Map();let scene=null,selection=null,generation=0,frame=0,last=0,previewTimer=0;
 async function geometry(row){
  if(!cache.has(row.id))cache.set(row.id,ProteinRoster.load(row).then(spec=>{
   const model=proteinFighter.createDialogueModel(spec),points=model.sample(0),lo=[0,1,2].map(k=>Math.min(...points.map(p=>p[k]))),hi=[0,1,2].map(k=>Math.max(...points.map(p=>p[k])));
   return {model,points,center:[(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2],breaks:model.breaks||new Set(),height:hi[1]-lo[1],width:hi[0]-lo[0],depth:hi[2]-lo[2],hue:row.hue??190};
  }).catch(e=>{cache.delete(row.id);throw e;}));return cache.get(row.id);
 }
 function size(canvas){const box=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5),w=Math.round(box.width*ratio),h=Math.round(box.height*ratio);if(!w||!h)return null;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}return {w,h,ctx:canvas.getContext('2d')};}
 function protein(ctx,data,t,side,scale,originX,floor,alpha=1,portrait=false){
  const angle=(side?-.28:.28)+Math.sin(t*.65)*.10,ca=Math.cos(angle),sa=Math.sin(angle),facing=side?-1:1;
  // Dialogue uses a cached pose with depth rotation and breathing. No combat
  // solver or camera zoom runs while reading; each actor stays inside its frame.
  const pts=(portrait?data.points:data.model.sample(t)).map(p=>p.map((v,k)=>v-data.center[k])).map(([x,y,z])=>{const rx=(x*ca+z*sa)*facing,rz=z*ca-x*sa,perspective=portrait?1:600/(600-rz),breath=portrait?1+Math.sin(t*1.8)*.006:1;return [originX+rx*scale*perspective,floor-y*scale*perspective*breath,rz];});
  ctx.globalAlpha=alpha;ctx.fillStyle='#03040b55';ctx.beginPath();ctx.ellipse(originX,floor+3,40*scale,4*scale,0,0,Math.PI*2);ctx.fill();
  const segments=[];for(let i=0;i<pts.length-1;i++)if(!data.breaks.has(i))segments.push(i);
  segments.sort((a,b)=>pts[a][2]+pts[a+1][2]-pts[b][2]-pts[b+1][2]);ctx.lineCap='round';ctx.lineJoin='round';
  for(const i of segments){const p=pts[i],q=pts[i+1],light=49+Math.max(-12,Math.min(18,(p[2]+q[2])*.22));
   ctx.strokeStyle=`hsl(${data.hue+i/pts.length*70} 65% ${light}%)`;ctx.lineWidth=Math.max(2,scale*2.5);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();
   ctx.strokeStyle='#ffffff35';ctx.lineWidth=Math.max(.6,scale*.55);ctx.beginPath();ctx.moveTo(p[0]-.5,p[1]-.7);ctx.lineTo(q[0]-.5,q[1]-.7);ctx.stroke();}ctx.globalAlpha=1;
 }
 function draw(now){
  const quiet=matchMedia('(prefers-reduced-motion: reduce)').matches,t=quiet?0:now/1000;
  if(scene?.root.isConnected&&scene.models)scene.canvases.forEach((canvas,i)=>{
   const view=size(canvas);if(!view)return;const {w,h,ctx}=view,m=scene.models[i];
   const line=scene.state.dialogueLines[scene.state.dialogueIndex],speaking=line?.speaker===(i?'hero':'boss'),age=(now-scene.since)/1000;
   const pulse=quiet||line?.choices||!speaking?0:Math.min(1,age/.65)*Math.max(0,Math.min(1,(3.8-age)/1.3));
   scene.zoom[i]+=((line?.choices?.length ? .68 : 1)+.30*pulse-scene.zoom[i])*.12;canvas.dataset.zoom=scene.zoom[i].toFixed(3);
   scene.raise[i]+=((line?.choices?.length ? .28 : .5)-scene.raise[i])*.12;
   const scale=Math.min(w*.84/Math.max(1,m.width+m.depth*.4),h*.88/Math.max(1,m.height))*.76*scene.zoom[i];
   ctx.clearRect(0,0,w,h);protein(ctx,m,t,i,scale,w*.5,h*scene.raise[i]+m.height*scale*.5,1,true);
   canvas.dataset.frames=String((+canvas.dataset.frames||0)+1);
  });
  if(selection?.canvas.isConnected&&selection.data){const view=size(selection.canvas);if(view){const {w,h,ctx}=view,d=selection.data;ctx.clearRect(0,0,w,h);protein(ctx,d,t,0,Math.min(w*.8/Math.max(1,d.width),h*.88/d.height),w*.5,h*.95);selection.canvas.dataset.frames=String((+selection.canvas.dataset.frames||0)+1);}}
 }
 function tick(now){if(!scene?.root.isConnected&&!selection?.canvas.isConnected){frame=0;return;}if(!document.hidden&&now-last>=1000/30){draw(now);last=now;}frame=requestAnimationFrame(tick);}
 function run(){if(!frame)frame=requestAnimationFrame(tick);}
 function mount(state,row){
  const id=++generation;clearTimeout(previewTimer);
  if(state.screen==='dialogue'){
   selection=null;const root=document.querySelector('.dialogue-stage');if(!root)return;
   if(scene?.root===root){scene.state=state;if(scene.line!==state.dialogueIndex){scene.line=state.dialogueIndex;scene.since=performance.now();}run();return;}
   const current={root,state,line:state.dialogueIndex,since:performance.now(),zoom:[1,1],raise:[.5,.5],models:null,canvases:[...root.querySelectorAll('.story-fighter')].map((host,i)=>{
    const canvas=document.createElement('canvas');canvas.className='dialogue-model';canvas.setAttribute('aria-hidden','true');canvas.dataset.facing=i?'left':'right';host.append(canvas);return canvas;
   })};scene=current;
   Promise.all([geometry(state.dialogueBoss),geometry(state.dialogueHero)]).then(models=>{
    if(scene!==current||!root.isConnected)return;current.models=models;draw(performance.now());
    current.canvases.forEach(c=>{c.dataset.ready='true';c.parentElement.classList.add('model-ready');});run();
   }).catch(()=>{});return;
  }
  scene=null;const canvas=document.querySelector('.selection-model');if(!canvas||!row?.rig){selection=null;return;}
  if(selection?.id===row.id&&selection.data){canvas.replaceWith(selection.canvas);selection.canvas.parentElement.classList.add('model-ready');run();return;}
  selection={id:row.id,canvas,data:null};previewTimer=setTimeout(async()=>{try{const data=await geometry(row);if(id!==generation||!canvas.isConnected)return;selection.data=data;canvas.dataset.ready='true';draw(performance.now());requestAnimationFrame(()=>{if(canvas.isConnected)canvas.parentElement.classList.add('model-ready');});run();}catch{}},450);
 }
 window.DialogueModels={mount,stop(){generation++;clearTimeout(previewTimer);cancelAnimationFrame(frame);frame=0;scene=null;selection=null;}};
 addEventListener('protein-screen',e=>{if(!['dialogue','select','opponent','arts','campaign-hero'].includes(e.detail.screen))DialogueModels.stop();});
})();
