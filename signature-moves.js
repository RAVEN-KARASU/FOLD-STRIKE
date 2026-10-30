// Fictional combat mechanics inspired by each protein, not biological effects.
(function(){
 const families={
  barrel:{base:'roll',description:'Rodada corporal que avanza y derriba.',rollSpeed:210,turns:2},
  cyclone:{base:'spin',description:'Giro erguido de brazos con varios impactos.',multi:2},
  pulse:{base:'special',description:'Onda baja a distancia; se puede saltar.',reach:240},
  lunge:{base:'straight',description:'Paso explosivo y golpe frontal.',contact:true,drive:145},
  vault:{base:'airkick',description:'Salto hacia delante y patada descendente.',contact:true,vault:500,drive:65},
  rising:{base:'airpunch',description:'Golpe ascendente que levanta al rival.',contact:true,launch:210},
  recoil:{base:'special',description:'Onda a distancia mientras retrocede.',reach:180,drive:-75},
 };
 // id, name, family, startup frames, active frames, damage, trajectory modifier.
 const rows=[
 ['1ubq','ETIQUETA FINAL','lunge',9,17,12,1.10],['1gfl','DESTELLO VERDE','pulse',13,25,9,1.22],
 ['1mbn','RESERVA DE OXÍGENO','vault',8,22,10,1.12],['4hhb','CUARTETO ROJO','cyclone',15,45,5,1.04],
 ['1lyz','CORTE DE MURALLA','rising',9,18,13,1.12],['1bpi','CIERRE PROTECTOR','recoil',8,23,8,1.20],
 ['7rsa','TIJERA DE ARN','lunge',7,13,10,1.34],['1tim','CARRUSEL TIM','barrel',12,35,10,1.18],
 ['1ca2','PULSO CARBONATO','pulse',8,18,8,1.05],['1ake','CAMBIO DE ENERGÍA','rising',10,23,11,1.02],
 ['1cyo','RELEVO ELECTRÓNICO','vault',7,24,8,1.35],['1pgb','ANCLA G','recoil',11,30,10,.92],
 ['1pin','GIRO DE PROLINA','cyclone',8,33,6,1.24],['1enh','SALTO AL ADN','vault',12,29,12,.91],
 ['2ptc','CORTE PRECISO','lunge',13,12,15,.95],['1sod','BARRIDO RADICAL','cyclone',10,38,7,.98],
 ['1stp','ENLACE TENAZ','rising',16,25,15,.85],['1qys','DISEÑO CERO','barrel',8,43,8,1.36],
 ['2ci2','ESCAPE COMPACTO','recoil',6,19,7,1.40],['1bta','SELLO BARSTAR','pulse',16,32,12,.85],
 ['trastuzumab','CERCO HER2','lunge',12,21,13,1.02],['pertuzumab','SEGUNDO EPÍTOPO','vault',11,27,11,1.10],
 ['egfr','IMPULSO ERBB','pulse',9,24,10,1.10],['her3','ALIANZA DE ANTENAS','cyclone',14,41,6,1.13],
 ['her2kinase','ASCENSO QUINASA','rising',10,28,14,1.15],['her2','TORRE HER2','barrel',18,48,16,.94],
 ['adalimumab','SILENCIO DE ALARMA','recoil',9,28,10,1.07],['infliximab','BLOQUEO TNF','lunge',15,26,15,.88],
 ['il6','AVISO SEIS','pulse',7,22,8,1.37],['il1b','CHISPA BETA','rising',8,19,12,1.22],
 ['tnfr1','PUERTA TNFR1','cyclone',17,46,8,.91],['tnf','TRÍADA DE ALARMA','cyclone',12,51,7,1.19],
 ['pembrolizumab','LLAVE DEL CONTROL','rising',12,25,12,1.08],['pdl1','TARJETA UNO','recoil',10,29,9,1.17],
 ['pdl2','TARJETA DOS','vault',9,31,10,1.23],['ctla4','FRENO ALTERNO','lunge',16,30,14,.82],
 ['pd1','ÚLTIMO CONTROL','pulse',19,38,15,1.32],['ranibizumab','TRAZO DE RETINA','vault',7,26,9,1.41],
 ['vegfr1','PRIMER CAUCE','barrel',14,37,12,1.07],['vegfc','CORRIENTE C','recoil',8,35,10,1.28],
 ['vegfr2','SEGUNDO CAUCE','rising',15,27,14,.97],['vegfa','MAREA VASCULAR','pulse',17,42,16,1.46],
 ['omalizumab','LAZO IGE','lunge',10,24,12,1.16],['il4','NOTA CUATRO','vault',8,21,9,1.17],
 ['il13','ECO TRECE','recoil',13,33,11,1.11],['fceri','ANCLA ÉPSILON','barrel',17,40,14,.89],
 ['ige','ESTALLIDO SENSIBLE','cyclone',18,49,9,1.07],
 ];
 const catalog=Object.fromEntries(rows.map(([id,name,family,start,live,damage,scale])=>[id,{id,move:'signature_'+id,superMove:'super_signature_'+id,ultimate:'ultimate_'+id,name,family,start,live,damage,scale,description:families[family].description}]));
 function register(moves){let index=0;for(const s of Object.values(catalog)){
  const variant=index++;s.variant=variant;s.ultimateName=s.name+' · CLÍMAX';
  const f=families[s.family],base=moves[f.base];
  moves[s.move]={...base,...f,pose:f.base,variant,air:false,signature:true,wave:true,super:false,rank:3,cancel:false,
   active:s.start/60,window:s.live/60,duration:(s.start+s.live+22)/60,damage:s.damage,stun:.28+s.start/100,
   push:160+s.damage*9,hitstopFrames:5,blockFrames:12+s.start,again:1.25+s.live/100,text:s.name,
   reach:f.contact?base.reach:(f.reach||base.reach)*s.scale,drive:(f.drive||0)*s.scale,
   rollSpeed:(f.rollSpeed||210)*s.scale,turns:f.turns||2,vault:(f.vault||0)*s.scale,launch:(f.launch||0)*s.scale,
   multi:s.id==='4hhb'?4:s.id==='tnf'?3:(f.multi||base.multi)};
  moves[s.superMove]={...moves[s.move],super:true,cost:100,damage:s.damage*1.8,rank:4,text:s.name,cancel:false};
  const sequences=[['straight','roundhouse','airpunch'],['special','spin','special'],['airkick','roundhouse','roll'],['spin','straight','spin'],['lowpunch','straight','airpunch'],['special','lowkick','special'],['straight','airkick','roundhouse']];
  moves[s.ultimate]={...moves[s.superMove],ultimate:true,cost:300,pose:f.base,choreography:sequences[variant%7],
   roll:false,spin:false,contact:true,vault:0,drive:0,active:.22,window:1.72,duration:2.3,
   beats:[.3+variant%4*.025,.91+variant%5*.02,1.56+variant%3*.035],multi:3,
   damage:11+s.damage*.48,launch:260,hitstopFrames:8,text:s.ultimateName};
 }
 moves.ultimate_custom={...moves.ultimate_1gfl,text:'PDB · REACCIÓN FINAL'};
 Object.assign(moves.super_roll,{pose:'roll',roll:true,spin:false,active:.18,window:.78,duration:1.2,rollSpeed:300,turns:3,reach:30});
 Object.assign(moves.super_spin,{pose:'spin',spin:true,roll:false,multi:3});
 }
 // Individually parameterized trajectories change the actual articulated pose,
 // not only the move label. The profile is deterministic for both remote peers.
 function pose(move,f,T){
  if(!move.signature||f.stun>0||f.hp<=0)return;
  const k=move.variant||0,u=Math.max(0,Math.min(1,f.t/move.duration)),pulse=Math.sin(Math.PI*u);
  const side=k%2?'l':'r',other=side==='r'?'l':'r',curve=Math.sin(Math.PI*u*(1+k%3));
  T.head+=pulse*(k%5-2)*.13;
  T.pitch+=pulse*(k%7-3)*.065;
  T.fwd+=curve*(3+k%6)*.65;
  T[side+'armU']+=pulse*(k%4-1.5)*.19;
  T[other+'armL']+=curve*(.15+(k%5)*.08);
  if(move.ultimate){T.fwd+=pulse*10;T.head-=pulse*.2;}
 }
 window.SignatureMoves={catalog,register,pose,get:id=>catalog[id]||null,families};
})();
