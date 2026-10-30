(function(){
  let colors=[];
  function hsl(h,s,l){
    h=((h%360)+360)%360/360;s/=100;l/=100;
    const a=s*Math.min(l,1-l),f=n=>{const k=(n+h*12)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))));};
    return {r:f(0),g:f(8),b:f(4)};
  }
  window.py2dmol_customColors['fighter-palette']=i=>colors[i]||{r:70,g:150,b:230};
  window.FighterPalette={hsl,configure(viewer,fighters,mode){
    colors=[];
    for(const f of fighters)for(let i=0;i<f.form.n;i++)colors.push(hsl((f.form.meta?.hue||0)+i/f.form.n*85,78,61));
    // The viewer's confidence fast path ignores per-chain color *modes*, but
    // respects literal residue overrides. Apply these once, outside the draw loop.
    const position={};let offset=0;
    for(const f of fighters){
      if(Number.isFinite(f.form.meta?.hue))for(let i=0;i<f.form.n;i++)position[offset+i]=colors[offset+i];
      offset+=f.form.n;
    }
    viewer.objectsData.arena.color={type:'advanced',value:{position}};
    // Fixed palettes need no confidence-color recomputation on every new frame.
    const fixed=fighters.every(f=>Number.isFinite(f.form.meta?.hue));
    viewer.setColor(fixed?'fighter-palette':({rainbow:'rainbow',ss:'ss'}[mode]||'deepmind'));
  }};
})();
