// Expensive molecular analysis never blocks the fight's animation thread.
self.window=self;
importScripts('lddt.js','science-core.js');
let generation=0, fighters=[];
self.onmessage=({data:m})=>{
  if(m.type==='reset'){
    generation=m.generation;
    fighters=m.fighters.map(f=>{
      const {n,pb,stride}=f.form;
      f.form.paeSum=new Float32Array(pb*pb);
      f.form.paeFrames=new Float64Array(n*12);f.form.refFrames=new Float64Array(n*12);
      f.paeLocal=new Float32Array(Math.ceil(n/stride)*n*3);f.pae=new Float32Array(pb*pb);
      return f;
    });return;
  }
  if(m.generation!==generation)return;
  const f=fighters[m.i];if(!f)return;
  Object.assign(f,m.snapshot);
  ProteinScience.updateConfidence(f);
  if(m.maps&&f.mapKind!==m.maps){f.pae.fill(0);f.mapKind=m.maps;}
  if(m.maps==='contacts')ProteinScience.updateContacts(f);else if(m.maps)ProteinScience.updatePAE(f);
  self.postMessage({generation,i:m.i,shown:f.shown,lddt:f.lddt,pae:m.maps?f.pae:null,mapKind:m.maps===true?'deformation':m.maps});
};
