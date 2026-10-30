(function(){
  class MolecularAnalysis {
    constructor(receive){
      this.generation=0;this.pending=false;this.worker=null;this.completed=0;
      try{
        this.worker=new Worker('analysis-worker.js');
        this.worker.onmessage=({data})=>{
          if(data.generation!==this.generation)return;
          this.pending=false;this.completed++;receive(data.i,data);
        };
        this.worker.onerror=()=>{this.worker?.terminate();this.worker=null;this.pending=false;};
      }catch{}
    }
    get status(){return {worker:!!this.worker,pending:this.pending,completed:this.completed,generation:this.generation};}
    reset(fighters){
      this.generation++;this.pending=false;
      if(!this.worker)return;
      this.worker.postMessage({type:'reset',generation:this.generation,fighters:fighters.map(f=>({
        form:Object.fromEntries(['n','pb','paeBin','stride','paeCount','paeBase','breakAt'].map(k=>[k,f.form[k]])),
        pairs:f.pairs,lddt:f.lddt,shown:f.shown,basePlddt:f.basePlddt,initUnfold:f.initUnfold,
      }))});
    }
    request(i,f,maps){
      if(!this.worker)return false;
      if(!this.pending){this.pending=true;this.worker.postMessage({type:'analyze',generation:this.generation,i,maps,
        snapshot:{coords:f.coords,poseRef:f.poseRef,settle:f.settle}});}
      return true;
    }
  }
  window.MolecularAnalysis=MolecularAnalysis;
})();
