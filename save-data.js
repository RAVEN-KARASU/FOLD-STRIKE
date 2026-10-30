// Portable game progress for the dedicated desktop profile and browser edition.
(function(){
 const validKey=k=>/^protein-fighter-[a-z0-9-]+$/.test(k)||['foldstrike-stage-v11','foldstrike-swiss-v1'].includes(k);
 function exportSave(){const values={};for(const k of Object.keys(localStorage))if(validKey(k))values[k]=localStorage.getItem(k);return {format:'protein-fighter-save',version:1,values};}
 function importSave(data){
  if(data?.format!=='protein-fighter-save'||data.version!==1||!data.values||typeof data.values!=='object'||Array.isArray(data.values))throw new Error('Archivo de progreso no válido.');
  const items=Object.entries(data.values);
  if(items.length>60||items.some(([k,v])=>!validKey(k)||typeof v!=='string'||v.length>100000))throw new Error('El archivo contiene datos no válidos.');
  const old=new Map(items.map(([k])=>[k,localStorage.getItem(k)]));
  try{for(const [k,v] of items)localStorage.setItem(k,v);}catch(error){for(const [k,v] of old)if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);throw error;}
 }
 const box=document.createElement('section');box.className='save-controls';
 box.innerHTML='<h3>PROGRESO</h3><button data-save="export">EXPORTAR PROGRESO</button> <button data-save="import">IMPORTAR PROGRESO</button><input type="file" accept="application/json,.json" hidden><p role="status"></p>';
 document.querySelector('#arcade-settings .settings-options').appendChild(box);
 box.querySelector('[data-save=export]').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(exportSave(),null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='foldstrike-progreso.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 const input=box.querySelector('input');box.querySelector('[data-save=import]').onclick=()=>input.click();
 input.onchange=async()=>{const file=input.files[0];if(!file)return;try{if(file.size>1000000)throw new Error('El archivo es demasiado grande.');importSave(JSON.parse(await file.text()));box.querySelector('[role=status]').textContent='Progreso importado. Recargando…';setTimeout(()=>location.reload(),400);}catch(e){box.querySelector('[role=status]').textContent=e.message;}input.value='';};
 window.GameSave={exportSave,importSave};
})();
