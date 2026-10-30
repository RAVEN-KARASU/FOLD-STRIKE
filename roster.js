(function () {
  const cache=new Map();
  const profiles={BALANCED:{speed:1,power:1},SPEED:{speed:1.12,power:.92},POWER:{speed:.9,power:1.1},TECHNICAL:{speed:1.04,power:.98}};
  const arts=[
    {roman:'I',move:'super_roll',name:'FOLD BREAKER',description:'Rodada de barril: gira acostado, avanza y derriba.',type:'RUSH'},
    {roman:'II',move:'super_spin',name:'HELIX TEMPEST',description:'Giro erguido: brazos extendidos y tres impactos.',type:'MULTI HIT'},
    {roman:'III',move:'super_special',name:'THERMAL BURST',description:'Onda baja que recorre el escenario.',type:'WAVE'},
  ];
  const ready=fetch('assets/roster/roster.json').then(r=>{if(!r.ok)throw new Error('No se pudo cargar el plantel');return r.json();})
    .then(rows=>{if(rows.length!==20||new Set(rows.map(r=>r.pdb)).size!==20)throw new Error('Plantel incompleto');return rows;});
  function artsFor(row){const s=window.SignatureMoves?.get(row?.id);return s?[{roman:'I',move:s.superMove,name:s.name,description:s.description+' Técnica exclusiva de '+row.name+'.',type:'EXCLUSIVO'},...arts.slice(0,2).map((a,i)=>({...a,roman:['II','III'][i]}))]:arts;}
  async function load(row,art=0) {
    if(!cache.has(row.id)) cache.set(row.id,fetch(row.rig).then(r=>{if(!r.ok)throw new Error('No se pudo cargar '+row.name);return r.json();}).catch(e=>{cache.delete(row.id);throw e;}));
    const spec=await cache.get(row.id), chosen=artsFor(row)[art]||artsFor(row)[0];
    return {...spec,meta:{...row,...profiles[row.style],art,superMove:chosen.move,superLabel:row.name+' / '+chosen.name}};
  }
  function customPortrait(spec) {
    const xyz=spec.rigData.ca_xyz, lo=[0,1].map(k=>Math.min(...xyz.map(p=>p[k]))),hi=[0,1].map(k=>Math.max(...xyz.map(p=>p[k])));
    const scale=Math.min(380/Math.max(1,hi[0]-lo[0]),500/Math.max(1,hi[1]-lo[1]));
    const points=xyz.map(p=>`${(240+(p[0]-(lo[0]+hi[0])/2)*scale).toFixed(1)},${(300-(p[1]-(lo[1]+hi[1])/2)*scale).toFixed(1)}`).join(' ');
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 600"><polyline points="${points}" fill="none" stroke="#171833" stroke-width="7"/><polyline points="${points}" fill="none" stroke="#76e9ff" stroke-width="4" stroke-linejoin="round"/></svg>`;
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }
  window.ProteinRoster={ready,load,arts,artsFor,customPortrait};
})();
