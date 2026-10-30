// Translate device-specific inputs into the standard physical layout used by the game.
(function(root){
 const KEY='foldstrike-controller-profiles-v1';let profiles={};
 try{const data=JSON.parse(localStorage.getItem(KEY)||'{}');if(data&&typeof data==='object'&&!Array.isArray(data))profiles=data;}catch{}
 const value=b=>typeof b==='number'?b:Number(b?.value??(b?.pressed?1:0));
 const key=p=>JSON.stringify([p.id,p.mapping||'',p.buttons.length,p.axes.length]);
 const valid=s=>s&&(s.kind==='button'||s.kind==='axis')&&Number.isInteger(s.index)&&s.index>=0&&s.index<128&&(s.kind==='button'||(Number.isFinite(s.neutral)&&Number.isFinite(s.target)&&Math.abs(s.target-s.neutral)>.35));
 function family(p){const id=p.id||'';return /dualsense|dualshock|playstation|054c|sony|wireless controller/i.test(id)?'PlayStation':/xbox|xinput|x-box/i.test(id)?'Xbox':/nintendo|switch|057e|pro controller|joy-con/i.test(id)?'Nintendo':/8bitdo/i.test(id)?'8BitDo':/hori|arcade|fightstick|mayflash/i.test(id)?'Arcade':'Genérico';}
 function read(p,s){
  if(!valid(s))return 0;
  if(s.kind==='button')return Math.min(1,Math.max(0,value(p.buttons[s.index])||0));
  const v=p.axes[s.index];if(!Number.isFinite(v))return 0;
  // A POV hat is discrete, often with a neutral value outside [-1, 1].
  if(s.hat)return Math.abs(v-s.target)<.12?1:0;
  return Math.max(0,Math.min(1,(v-s.neutral)/(s.target-s.neutral)));
 }
 function map(p){
  if(p.profileApplied)return p;
  const profile=profiles[key(p)];if(!profile||!Array.isArray(profile.buttons))return p;
  const buttons=Array.from({length:16},(_,i)=>{const v=read(p,profile.buttons[i]);return {value:v,pressed:v>.55};});
  const a=profile.stick||[];return {...p,profileApplied:true,mapping:'standard',buttons,axes:[read(p,a[1])-read(p,a[0]),read(p,a[3])-read(p,a[2])]};
 }
 function save(p,profile){
  if(!Array.isArray(profile.buttons)||profile.buttons.length!==16||!profile.buttons.every(s=>s===null||valid(s))||!Array.isArray(profile.stick)||profile.stick.length!==4||!profile.stick.every(s=>s===null||valid(s)))throw Error('Perfil no válido');
  const next={...profiles,[key(p)]:structuredClone(profile)};
  localStorage.setItem(KEY,JSON.stringify(next));profiles=next;root.dispatchEvent(new Event('protein-controller-profile'));
 }
 function remove(p){const next={...profiles};delete next[key(p)];localStorage.setItem(KEY,JSON.stringify(next));profiles=next;root.dispatchEvent(new Event('protein-controller-profile'));}
 function capture(p,neutral){
  for(let i=0;i<p.buttons.length;i++)if(value(p.buttons[i])>.65&&value(neutral.buttons[i])<.3)return {kind:'button',index:i};
  let candidate=null,best=.6;
  p.axes.forEach((v,i)=>{const n=neutral.axes[i],delta=Math.abs(v-n);if(Number.isFinite(n)&&delta>best){best=delta;candidate={kind:'axis',index:i,neutral:n,target:v,hat:Math.abs(n)>1.05};}});
  return candidate;
 }
 root.ControllerProfiles={key,family,map,save,remove,capture,read,has:p=>!!profiles[key(p)]};
})(window);
