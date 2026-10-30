// Decorative motifs share Membrane's world camera, translucency and simulation clock.
// They never add render loops, physics objects or full-screen opaque backgrounds.
(function(){
 const TAU=Math.PI*2;
 const items=Array.from({length:6},(_,i)=>({x:140+i*265,y:.24+(i%3)*.22,d:.28+(i%2)*.12,phase:i*1.7}));
 function draw(ctx,{arena,camX,scale,W,zone,t,P,dark,repeats}){
  if(arena==='membrane')return;
  for(const m of items)repeats(m.x,m.d,camX,scale,W,x=>{
   const size=scale*m.d,y=zone(m.y)+Math.sin(t*.3+m.phase)*6*size;
   ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.rotate(Math.sin(t*.13+m.phase)*.025);
   const color=arena==='reactor'?P.warm:arena==='nucleus'?P.vesicle:P.tubule;
   ctx.strokeStyle=`rgba(${color},${dark?.24:.3})`;ctx.fillStyle=`rgba(${color},.035)`;ctx.lineWidth=2.6;
   if(arena==='synapse'){
    ctx.beginPath();ctx.arc(0,0,26+Math.sin(t*.6+m.phase),0,TAU);ctx.fill();ctx.stroke();
    for(let k=0;k<5;k++){ctx.save();ctx.rotate(k*TAU/5);ctx.beginPath();ctx.moveTo(24,0);ctx.bezierCurveTo(65,-25,80,20,125,-5);ctx.moveTo(78,5);ctx.lineTo(115,42);ctx.moveTo(100,-4);ctx.lineTo(126,-35);ctx.stroke();ctx.restore();}
   }else if(arena==='cryo'){
    const h=100+(m.phase%3)*13;
    ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(45,-h*.6);ctx.lineTo(40,h*.6);ctx.lineTo(0,h);ctx.lineTo(-40,h*.6);ctx.lineTo(-45,-h*.6);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(0,h);ctx.moveTo(-45,-h*.6);ctx.lineTo(0,-h*.25);ctx.lineTo(45,-h*.6);ctx.stroke();
   }else if(arena==='reactor'){
    ctx.beginPath();ctx.ellipse(0,0,85,65,0,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,64,48,0,0,TAU);ctx.stroke();
    ctx.rotate(t*.035+m.phase);for(let k=0;k<8;k++){ctx.rotate(TAU/8);ctx.beginPath();ctx.moveTo(65,0);ctx.lineTo(84,0);ctx.stroke();}
   }else if(arena==='nucleus'){
    for(let side=0;side<2;side++){ctx.beginPath();for(let j=0;j<=36;j++){const yy=j*6-108,xx=Math.sin(j*.19+side*Math.PI+t*.08)*33;j?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();}
    ctx.globalAlpha=.6;for(let j=0;j<=36;j+=3){const xx=Math.sin(j*.19+t*.08)*33;ctx.beginPath();ctx.moveTo(-xx,j*6-108);ctx.lineTo(xx,j*6-108);ctx.stroke();}
   }
   ctx.restore();
  });
 }
 window.ArenaAtmosphere={draw};
})();
