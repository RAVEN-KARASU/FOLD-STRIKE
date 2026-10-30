// Fixed-topology ribbons: physics and residue coordinates are unchanged. Only the
// presentation mesh differs from the detailed scientific viewer, which remains available.
(function(){
  const KEY='protein-fighter-renderer';let enabled=localStorage.getItem(KEY)!=='detail',canvas,gl,program,meshes=[],failed=false,draws=0,lastMs=0;
  const SIDES=6,STRIDE=9;
  const angles=Array.from({length:SIDES},(_,i)=>[Math.cos(i*Math.PI*2/SIDES),Math.sin(i*Math.PI*2/SIDES)]);
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  function init(){
    canvas=document.createElement('canvas');canvas.id='combat-ribbons';canvas.setAttribute('aria-hidden','true');document.getElementById('stage').appendChild(canvas);
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();failed=true;document.documentElement.classList.remove('fast-arena');});
    gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)throw Error('WebGL unavailable');
    program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,`
      attribute vec3 position;attribute vec3 normal;attribute vec3 color;
      uniform vec4 camera;uniform vec4 screen;varying vec3 tint;varying float shade;
      void main(){float cp=cos(camera.w),sp=sin(camera.w);vec3 p=position-vec3(camera.xy,0.0);
        float y=cp*p.y-sp*p.z,z=sp*p.y+cp*p.z;float perspective=screen.w/(screen.w-z);
        gl_Position=vec4(p.x*screen.z*2.0/screen.x*perspective,y*screen.z*2.0/screen.y*perspective,-z/2000.0,1.0);
        vec3 n=vec3(normal.x,cp*normal.y-sp*normal.z,sp*normal.y+cp*normal.z);
        shade=.43+.57*abs(dot(normalize(n),normalize(vec3(-.3,.7,1.0))));tint=color;
      }`));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec3 tint;varying float shade;void main(){gl_FragColor=vec4(tint*shade,1.0);}'));
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
    program.attributes=['position','normal','color'].map(n=>gl.getAttribLocation(program,n));program.camera=gl.getUniformLocation(program,'camera');program.screen=gl.getUniformLocation(program,'screen');
    gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  }
  function mesh(form){
    const n=form.n,data=new Float32Array(n*SIDES*STRIDE),indices=[];
    for(let i=0;i<n-1;i++)if(!form.breakAt[i])for(let j=0;j<SIDES;j++){const a=i*SIDES+j,b=i*SIDES+(j+1)%SIDES,c=a+SIDES,d=b+SIDES;indices.push(a,b,c,b,d,c);}
    const v=gl.createBuffer(),e=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,v);gl.bufferData(gl.ARRAY_BUFFER,data.byteLength,gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,e);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
    return {form,data,v,e,count:indices.length,colorMode:null,colors:null};
  }
  function update(m,f,mode){
    const P=f.coords,n=P.length,d=m.data;let nx=1,ny=0,nz=0;
    const fixed=Number.isFinite(f.form.meta?.hue);
    if(!m.colors||m.colorMode!==mode){m.colors=Array.from({length:n},(_,i)=>FighterPalette.hsl(fixed?f.form.meta.hue+i/n*85:i/n*280,78,61));m.colorMode=mode;}
    for(let i=0;i<n;i++){
      const prev=P[i>0&&!f.form.breakAt[i-1]?i-1:i],next=P[i<n-1&&!f.form.breakAt[i]?i+1:i],p=P[i];
      let tx=next[0]-prev[0],ty=next[1]-prev[1],tz=next[2]-prev[2],len=Math.sqrt(tx*tx+ty*ty+tz*tz)||1;tx/=len;ty/=len;tz/=len;
      if(i===0||f.form.breakAt[i-1]){nx=Math.abs(tx)<.8?1:0;ny=Math.abs(tx)<.8?0:1;nz=0;}
      // Parallel transport gives a stable orientation without rebuilding secondary structure.
      const dot=nx*tx+ny*ty+nz*tz;nx-=dot*tx;ny-=dot*ty;nz-=dot*tz;len=Math.sqrt(nx*nx+ny*ny+nz*nz);
      if(len<.001){nx=Math.abs(tz)>.8?tz:-ty;ny=Math.abs(tz)>.8?0:tx;nz=Math.abs(tz)>.8?-tx:0;len=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;}nx/=len;ny/=len;nz/=len;
      const bx=ty*nz-tz*ny,by=tz*nx-tx*nz,bz=tx*ny-ty*nx;
      let color;
      if(fixed||mode==='rainbow')color=m.colors[i];
      else{const confidence=f.shown[i];color=confidence>=90?{r:65,g:135,b:240}:confidence>=70?{r:90,g:205,b:225}:confidence>=50?{r:240,g:205,b:75}:{r:239,g:135,b:70};}
      // Narrow strands preserve space between adjacent turns of the C-alpha trace.
      const width=1.25,thickness=.42;
      for(let j=0;j<SIDES;j++){
        const c=angles[j][0],s=angles[j][1],k=(i*SIDES+j)*STRIDE;
        d[k]=p[0]+nx*c*width+bx*s*thickness;d[k+1]=p[1]+ny*c*width+by*s*thickness;d[k+2]=p[2]+nz*c*width+bz*s*thickness;
        d[k+3]=nx*c+bx*s;d[k+4]=ny*c+by*s;d[k+5]=nz*c+bz*s;d[k+6]=color.r/255;d[k+7]=color.g/255;d[k+8]=color.b/255;
      }
    }
  }
  function draw(fighters,camera,view,mode,focal){
    if(!enabled||failed||fighters.some(f=>f.form.n*SIDES>65535)){document.documentElement.classList.remove('fast-arena');return false;}
    const start=performance.now();
    try{
      if(!gl)init();
      // The detailed viewer can recreate its children when forms change.
      if(!canvas.isConnected)document.getElementById('stage').appendChild(canvas);
      const ratio=Math.min(devicePixelRatio||1,1.25),w=Math.round(view.W*ratio),h=Math.round(view.H*ratio);
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
      gl.useProgram(program);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.uniform4f(program.camera,camera.x+camera.bx,camera.centerY+camera.by,0,camera.pitch);gl.uniform4f(program.screen,view.W,view.H,view.scale,focal||200);
      fighters.forEach((f,i)=>{let m=meshes[i];if(!m||m.form!==f.form){if(m){gl.deleteBuffer(m.v);gl.deleteBuffer(m.e);}m=meshes[i]=mesh(f.form);}
        update(m,f,mode);gl.bindBuffer(gl.ARRAY_BUFFER,m.v);gl.bufferSubData(gl.ARRAY_BUFFER,0,m.data);
        program.attributes.forEach((a,k)=>{gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,STRIDE*4,k*12);});
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.e);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0);
      });document.documentElement.classList.add('fast-arena');draws++;lastMs=performance.now()-start;return true;
    }catch(error){failed=true;document.documentElement.classList.remove('fast-arena');console.warn('Using detailed renderer:',error.message);return false;}
  }
  window.CombatRenderer={draw,set(value){enabled=!!value;try{localStorage.setItem(KEY,enabled?'fluid':'detail');}catch{}document.documentElement.classList.toggle('fast-arena',enabled&&!failed);},get enabled(){return enabled;},get status(){return {enabled,failed,draws,lastMs};}};
})();
