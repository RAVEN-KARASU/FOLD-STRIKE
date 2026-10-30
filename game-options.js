// Persistent player preferences. Match rules are copied at the start, never changed mid-round.
(function(){
 const KEY='protein-fighter-options-v1';
 const defaults={rounds:2,seconds:99,clashes:true,tournament:false,series:2,dummy:'idle',shake:true,cinematics:true,
   music:{1:'random',2:'random',3:'random',4:'random'},deadzone:.35};
 let prefs=structuredClone(defaults);try{const s=JSON.parse(localStorage.getItem(KEY)||'{}');prefs={...prefs,...s,music:{...prefs.music,...s.music}};}catch{}
 const choices={rounds:[1,2,3],seconds:[30,60,99,120,0],clashes:[true,false],tournament:[true,false],series:[2,3],dummy:['idle','guard','attack'],shake:[true,false],cinematics:[true,false],deadzone:[.2,.35,.5]};
 for(const [k,values] of Object.entries(choices))if(!values.includes(prefs[k]))prefs[k]=defaults[k];
 for(const k of [1,2,3,4])if(!/^(random|fight-([1-9]|1[0-4]))$/.test(prefs.music[k]))prefs.music[k]='random';
 function save(){try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch{}dispatchEvent(new Event('protein-options'));}
 window.GameOptions={get values(){return structuredClone(prefs);},get shake(){return prefs.shake;},get cinematics(){return prefs.cinematics;},get deadzone(){return prefs.deadzone;},get dummy(){return prefs.dummy;},set(k,v){if(choices[k]?.includes(v)){prefs[k]=v;save();}},music(mode,id){if([1,2,3,4].includes(+mode)&&/^(random|fight-([1-9]|1[0-4]))$/.test(id)){prefs.music[mode]=id;save();dispatchEvent(new CustomEvent('protein-music-choice',{detail:{mode:+mode}}));}},
   rules(mode){return mode===5?{rounds:2,seconds:99,clashes:true}:{rounds:prefs.rounds,seconds:mode===4?0:prefs.seconds,clashes:prefs.clashes};}};
 const ACTIONS=['up','down','left','right','lpunch','punch','hpunch','lkick','kick','hkick','special','super','block','start'];
 const keys=[['w','s','a','d','u','i','o','j','k','l','q','e','b','p'],['arrowup','arrowdown','arrowleft','arrowright','1','2','3','4','5','6','7','8',',','0']];
 const pads={lpunch:2,punch:3,hpunch:5,lkick:0,kick:1,hkick:7,special:4,super:6,block:'chord'};
 let bindings={keys:keys.map(k=>Object.fromEntries(ACTIONS.map((a,i)=>[a,k[i]]))),pads:[{...pads},{...pads}]};
 try{const s=JSON.parse(localStorage.getItem('protein-fighter-bindings-v1')||'null');if(s&&s.keys?.length===2&&s.pads?.length===2){
   const all=s.keys.flatMap(k=>ACTIONS.map(a=>k[a]));
   if(all.every(k=>typeof k==='string'&&k.length>0&&k.length<24&&!['escape','tab','backspace','r','enter',' '].includes(k))&&new Set(all).size===all.length)bindings.keys=s.keys;
   for(let i=0;i<2;i++){const values=Object.keys(pads).map(a=>s.pads[i][a]);if(values.every(v=>[0,1,2,3,4,5,6,7,10,11,'chord'].includes(v))&&new Set(values).size===values.length&&Object.keys(pads).every(a=>s.pads[i][a]!=='chord'||a==='block'))bindings.pads[i]=s.pads[i];}
 }}catch{}
 function saveBindings(){try{localStorage.setItem('protein-fighter-bindings-v1',JSON.stringify(bindings));}catch{}if(!document.querySelector('dialog[open]'))window.GamepadControls?.hub.releaseAll();window.proteinFighter?.releaseInputs();dispatchEvent(new Event('protein-bindings'));}
 window.InputBindings={ACTIONS,get values(){return structuredClone(bindings);},padMap(player){return {...bindings.pads[player]};},
   route(key,mode){for(let i=0;i<2;i++){const a=ACTIONS.find(a=>bindings.keys[i][a]===key);if(a)return [mode===2?i:0,a];}if(key==='h'&&bindings.keys[0].block==='b')return [0,'block'];return null;},
   key(player,action,key){key=key.toLowerCase();if(!ACTIONS.includes(action)||!bindings.keys[player])return 'Acción no válida.';
     if(key.length>23||['escape','tab','backspace','r','enter',' ','unidentified','dead','shift','control','alt','meta'].includes(key))return 'Esa tecla está reservada para navegación o entrenamiento.';
     for(let i=0;i<2;i++)for(const a of ACTIONS)if(bindings.keys[i][a]===key&&(i!==player||a!==action))return 'Esa tecla ya está asignada. Elige otra.';
     bindings.keys[player][action]=key;saveBindings();return '';},
   pad(player,action,value){if(!(action in pads)||![0,1,2,3,4,5,6,7,10,11,'chord'].includes(value)||(value==='chord'&&action!=='block'))return;
     const current=bindings.pads[player],other=Object.keys(current).find(a=>current[a]===value);
     if(other)current[other]=current[action]==='chord'?[0,1,2,3,4,5,6,7,10,11].find(b=>!Object.values(current).includes(b)):current[action];current[action]=value;saveBindings();},
   reset(){bindings={keys:keys.map(k=>Object.fromEntries(ACTIONS.map((a,i)=>[a,k[i]]))),pads:[{...pads},{...pads}]};saveBindings();}};
 let series=null;
 window.Tournament={get state(){return series?structuredClone(series):null;},reset(){series=null;},
   begin(mode){if(window.SwissTournament?.active)return;if(mode===2&&prefs.tournament&&!series)series={wins:[0,0],target:prefs.series,rules:GameOptions.rules(2),ids:[],finished:false};},
   record(r){if(!series||series.finished||series.ids.includes(r.id))return;series.ids.push(r.id);if(r.winner>=0)series.wins[r.winner]++;series.finished=series.wins.some(w=>w>=series.target);},
   rules(mode){if(mode===2&&window.SwissTournament?.active)return SwissTournament.rules();return mode===2&&series?{...series.rules}:GameOptions.rules(mode);}};
 // A clash ties within three simulation frames; otherwise the earlier launch wins.
 window.ClashRules={winner(ageA,ageB){return Math.abs(ageA-ageB)<=3/60+1e-9?-1:ageA>ageB?0:1;}};
})();
