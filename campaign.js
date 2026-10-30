(function(){
  const KEY='protein-fighter-campaign-v1';
  let actors=[],chapters=[],progress={chapter:0,stage:0,hero:null,art:0,completed:[],active:false,endingPending:false};
  const ready=Promise.all(['actors','chapters'].map(name=>fetch(`assets/campaign/${name}.json`).then(r=>{if(!r.ok)throw new Error('No se pudo cargar la campaña');return r.json();}))).then(([a,c])=>{
    actors=a;chapters=c;
    try{const saved=JSON.parse(localStorage.getItem(KEY));
      if(saved&&Number.isInteger(saved.chapter)&&saved.chapter>=0&&saved.chapter<c.length&&Number.isInteger(saved.stage)&&saved.stage>=0&&saved.stage<=4){
        progress={...progress,...saved,art:[0,1,2].includes(saved.art)?saved.art:0,completed:(saved.completed||[]).filter(id=>c.some(ch=>ch.id===id))};
        if(!c[progress.chapter].heroes.includes(progress.hero))progress.active=false;
      }
    }catch{}
    return c;
  });
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(progress));}catch{}};
  const actor=id=>actors.find(r=>r.id===id);
  window.ProteinCampaign={ready,actor,
    get chapters(){return chapters;},get progress(){return {...progress,completed:[...progress.completed]};},
    get chapter(){return chapters[progress.chapter];},
    start(index){if(!chapters[index])return;progress={...progress,chapter:index,stage:0,hero:null,art:0,active:false};save();},
    choose(hero,art){if(!chapters[progress.chapter].heroes.includes(hero))throw new Error('Anticuerpo no válido');progress.hero=hero;progress.art=art;progress.active=true;save();},
    win(){if(!progress.active||progress.stage>=4)return;progress.stage++;
      if(progress.stage===4){const id=chapters[progress.chapter].id;if(!progress.completed.includes(id))progress.completed.push(id);progress.active=false;if(progress.completed.length===5)progress.endingPending=true;}save();},
    endingSeen(){progress.endingPending=false;save();},
    selection(){const ch=chapters[progress.chapter];return [{row:actor(progress.hero),art:progress.art},{row:actor(ch.bosses[Math.min(progress.stage,3)]),art:progress.stage%3}];},
    bossMeta(){return {cpuLevel:['normal','hard','hard','realistic'][progress.stage],powerScale:[.92,1,1.08,1.18][progress.stage]||1.18};},
  };
})();
