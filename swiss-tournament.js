// Local Swiss event: no elimination, no repeated opponents, score-based pairings.
(function(){
 const KEY='foldstrike-swiss-v1';let event=null,active=false;
 const clone=v=>structuredClone(v);
 const maxRounds=n=>Math.min(n-1,Math.ceil(Math.log2(n)));
 function save(){try{localStorage.setItem(KEY,JSON.stringify(event));}catch{}}
 function standings(e=event){if(!e)return [];return e.players.map(p=>({...p,buchholz:p.results.reduce((s,r)=>s+(r.opponent===null?0:e.players[r.opponent].score),0),sonneborn:p.results.reduce((s,r)=>s+(r.opponent===null?0:e.players[r.opponent].score*r.points),0)})).sort((a,b)=>b.score-a.score||b.buchholz-a.buchholz||b.sonneborn-a.sonneborn||a.seed-b.seed);}
 function matching(players,e){
  const memo=new Map();function solve(mask){if(!mask)return {cost:0,pairs:[]};if(memo.has(mask))return memo.get(mask);
   let i=0;while(!(mask&(1<<i)))i++;const a=players[i];let best=null;
   for(let j=i+1;j<players.length;j++){if(!(mask&(1<<j)))continue;const b=players[j];if(a.results.some(r=>r.opponent===b.id))continue;
    const rest=solve(mask^(1<<i)^(1<<j));if(!rest)continue;
    const cost=rest.cost+Math.abs(a.score-b.score)*10000+Math.abs(a.sides+b.sides)*10+Math.abs(a.seed-b.seed)/100;
    if(!best||cost<best.cost)best={cost,pairs:[[a.id,b.id],...rest.pairs]};
   }memo.set(mask,best);return best;
  }return solve((1<<players.length)-1);
 }
 function pairRound(e){
  const ordered=standings(e),byes=e.players.length%2?ordered.slice().reverse().filter(p=>!p.results.some(r=>r.opponent===null)):[null];
  for(const bye of byes){const matched=matching(ordered.filter(p=>p.id!==bye?.id),e);if(!matched)continue;
   const pairs=matched.pairs.map(([a,b])=>{if(e.players[a].sides>e.players[b].sides)[a,b]=[b,a];return {a,b,result:null};});
   if(bye){e.players[bye.id].score++;e.players[bye.id].results.push({opponent:null,points:1});pairs.push({a:bye.id,b:null,result:'bye'});}
   e.round++;e.rounds.push(pairs);save();return pairs;
  }throw new Error('No se encontraron cruces sin repetir rivales.');
 }
 function create(entries,rules){
  const n=entries.length;if(n<2||n>16)throw new Error('Elige entre 2 y 16 participantes.');
  const names=entries.map(p=>String(p.name).trim());if(names.some(n=>!n||n.length>28)||new Set(names.map(n=>n.toLowerCase())).size!==n)throw new Error('Escribe nombres distintos, de 1 a 28 caracteres.');
  if(entries.some(p=>typeof p.protein!=='string'||!p.protein||![0,1,2].includes(p.art)))throw new Error('Selecciona una proteína y su Super Art para cada participante.');
  if(!Number.isInteger(rules.swissRounds)||rules.swissRounds<1||rules.swissRounds>maxRounds(n)||![1,2,3].includes(rules.rounds)||![30,60,99,120,0].includes(rules.seconds))throw new Error('Reglas de torneo no válidas.');
  const seeds=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[seeds[i],seeds[j]]=[seeds[j],seeds[i]];}
  event={version:1,players:entries.map((p,i)=>({id:i,name:names[i],protein:p.protein,art:p.art,seed:seeds[i],score:0,sides:0,results:[]})),rules:{...rules,clashes:!!rules.clashes},round:0,rounds:[],finished:false,current:null,ids:[]};
  active=true;pairRound(event);save();return clone(event);
 }
 function pending(){return event?.rounds.at(-1)?.findIndex(p=>p.result===null)??-1;}
 function record(result){if(!active||!event||event.current===null||event.ids.includes(result.id))return false;const pair=event.rounds.at(-1)[event.current];if(!pair||pair.result!==null||![-1,0,1].includes(result.winner))return false;
  const points=result.winner<0?[.5,.5]:result.winner===0?[1,0]:[0,1];pair.result=result.winner;pair.matchId=result.id;
  [pair.a,pair.b].forEach((id,i)=>{const p=event.players[id];p.score+=points[i];p.sides+=i?-1:1;p.results.push({opponent:i?pair.a:pair.b,points:points[i]});});
  event.ids.push(result.id);event.current=null;if(pending()<0&&event.round>=event.rules.swissRounds)event.finished=true;save();return true;
 }
 try{const e=JSON.parse(localStorage.getItem(KEY));if(e?.version===1&&Array.isArray(e.players)&&e.players.length>=2&&e.players.length<=16&&e.players.every((p,i)=>p.id===i&&typeof p.name==='string'&&p.name.length<=28&&typeof p.protein==='string'&&Number.isFinite(p.score)&&Array.isArray(p.results)&&p.results.every(r=>r.opponent===null||Number.isInteger(r.opponent)&&r.opponent>=0&&r.opponent<e.players.length))&&Array.isArray(e.rounds)&&e.rounds.length===e.round&&e.rounds.every(r=>Array.isArray(r)&&r.every(p=>e.players[p.a]&&(p.b===null||e.players[p.b])))&&Array.isArray(e.ids)&&e.rules?.swissRounds<=maxRounds(e.players.length)){event=e;event.current=null;}}catch{}
 window.SwissTournament={create,record,standings,maxRounds,get active(){return active&&!!event;},get state(){return event?clone(event):null;},suspend(){active=false;},resume(){if(event){active=true;event.current=null;}},
  startPair(index){const pair=event?.rounds.at(-1)?.[index];if(!active||!pair||pair.result!==null)throw new Error('Este encuentro ya terminó.');event.current=index;save();return [event.players[pair.a],event.players[pair.b]].map(clone);},
  nextRound(){if(!event||pending()>=0||event.finished)return false;pairRound(event);save();return true;},pending,
  rules(){return active&&event?{rounds:event.rules.rounds,seconds:event.rules.seconds,clashes:event.rules.clashes}:null;}};
})();
