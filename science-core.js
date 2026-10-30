// Shared molecular analysis used by the arena and its worker.
(function(root){
const PAE_MAX=30;
  function localFrames(coords, F) {
    const N = coords.length;
    for (let i = 0; i < N; i++) {
      const c = Math.min(N - 2, Math.max(1, i));   // the two chain ends borrow their neighbour's frame
      const a = coords[c - 1], o = coords[c], b = coords[c + 1];
      let x1 = b[0] - o[0], y1 = b[1] - o[1], z1 = b[2] - o[2];
      let l = Math.hypot(x1, y1, z1) || 1; x1 /= l; y1 /= l; z1 /= l;
      let x2 = a[0] - o[0], y2 = a[1] - o[1], z2 = a[2] - o[2];
      const d = x2 * x1 + y2 * y1 + z2 * z1; x2 -= d * x1; y2 -= d * y1; z2 -= d * z1;
      l = Math.hypot(x2, y2, z2) || 1; x2 /= l; y2 /= l; z2 /= l;
      const k = i * 12;
      F[k] = o[0]; F[k + 1] = o[1]; F[k + 2] = o[2];
      F[k + 3] = x1; F[k + 4] = y1; F[k + 5] = z1;
      F[k + 6] = x2; F[k + 7] = y2; F[k + 8] = z2;
      F[k + 9] = y1 * z2 - z1 * y2; F[k + 10] = z1 * x2 - x1 * z2; F[k + 11] = x1 * y2 - y1 * x2;
    }
    return F;
  }
  // Every residue's position in every sampled residue's frame, rows x N x 3, into L.
  function localPositions(coords, stride = 1, L, F0) {
    const N = coords.length, F = localFrames(coords, F0 || new Float64Array(N * 12)), rows = Math.ceil(N / stride);
    L = L || new Float32Array(rows * N * 3);
    for (let r = 0; r < rows; r++) {
      const i = r * stride, k = i * 12;
      for (let j = 0, m = r * N * 3; j < N; j++, m += 3) {
        const q = coords[j], vx = q[0] - F[k], vy = q[1] - F[k + 1], vz = q[2] - F[k + 2];
        L[m] = F[k + 3] * vx + F[k + 4] * vy + F[k + 5] * vz;
        L[m + 1] = F[k + 6] * vx + F[k + 7] * vy + F[k + 8] * vz;
        L[m + 2] = F[k + 9] * vx + F[k + 10] * vy + F[k + 11] * vz;
      }
    }
    return L;
  }
  const LDDT_EASE = 0.3;   // per update: about a third of the way each time, a few updates to settle
  function updatePAE(f) {
    if (!f.paeLocal) return;
    const { n: N, pb: PB, paeBin, stride, paeCount: PAE_COUNT, paeSum, paeFrames, paeBase } = f.form;
    // The reference is the body's undamaged pose this frame: a limb that swung, a loop
    // that bent with it, score nothing; what a blow moved off the pose is the error.
    const P = f.coords, F = localFrames(P, paeFrames), L = localPositions(f.poseRef || P, stride, f.paeLocal, f.form.refFrames);
    paeSum.fill(0);
    for (let i = 0, r = 0; i < N; i += stride, r++) {
      const k = i * 12, row = (i / paeBin | 0) * PB;
      const ox = F[k], oy = F[k + 1], oz = F[k + 2];
      const ax = F[k + 3], ay = F[k + 4], az = F[k + 5];
      const bx = F[k + 6], by = F[k + 7], bz = F[k + 8];
      const cx = F[k + 9], cy = F[k + 10], cz = F[k + 11];
      for (let j = 0, m = r * N * 3; j < N; j++, m += 3) {
        const q = P[j], vx = q[0] - ox, vy = q[1] - oy, vz = q[2] - oz;
        const dx = ax * vx + ay * vy + az * vz - L[m];
        const dy = bx * vx + by * vy + bz * vz - L[m + 1];
        const dz = cx * vx + cy * vy + cz * vz - L[m + 2];
        paeSum[row + (j / paeBin | 0)] += Math.sqrt(dx * dx + dy * dy + dz * dz);
      }
    }
    for (let b = 0; b < PB * PB; b++) {
      const live = PAE_COUNT[b] ? paeSum[b] / PAE_COUNT[b] : 0;   // a pixel no sampled row falls in (the last, on a big protein) shows the model's own error alone
      const e = Math.min(PAE_MAX, Math.max(live, paeBase ? paeBase[b] : 0));   // the model's own error is the floor
      f.pae[b] = f.pae[b] * 0.5 + e * 0.5;   // barely smoothed, so one frame's twitch does not flicker
    }
  }
  // 🔴 THE CONFIDENCE IS NOT THE MAP'S PASSENGER. What each residue's surroundings within
  // its rigid part still measure as they did at the bell, and from it the pLDDT shown -
  // the colours on the bodies and the number on the HUD. This stood inside updatePAE,
  // which a SHORT SCREEN SKIPS ENTIRELY to spare a phone the map's row-by-column work,
  // so a phone on its side - and any window under 520 pixels tall - fought in colours
  // frozen at the bell that never darkened where a blow landed, with the two panels
  // beside it dead. It is one pass over the pairs, a fraction of the map's cost, and it
  // runs whatever the screen is.
  function updateConfidence(f) {
    if (!f.pairs) return;
    const N = f.form.n, P = f.coords;
    // Scored raw, then smoothed two ways so the colours do not flicker: along the
    // chain (1-2-1 over a residue and its bonded neighbours, never across a break),
    // since a residue in a few pairs steps in quarters as one pair crosses a
    // threshold; and over time, each residue's shown score easing toward the raw one.
    const raw = f.lddtRaw || (f.lddtRaw = new Float32Array(N)), sm = f.lddtSmooth || (f.lddtSmooth = new Float32Array(N)), BREAK = f.form.breakAt;
    window.LDDT.score(f.pairs, P, raw, f.poseRef);
    for (let i = 0; i < N; i++) {
      let v = 2 * raw[i], w = 2;
      if (i > 0 && !BREAK[i - 1]) { v += raw[i - 1]; w++; }
      if (i < N - 1 && !BREAK[i]) { v += raw[i + 1]; w++; }
      sm[i] = v / w;
    }
    for (let i = 0; i < N; i++) f.lddt[i] += (sm[i] - f.lddt[i]) * LDDT_EASE;
    // A residue the model itself had loose (low pLDDT) hangs off the pose by nature,
    // which its base already says: it shows its base, and only a folded residue is
    // marked down by what has come away from the pose. A body still gathering itself
    // up at a round's start (f.settle, held loosely in body()) is not damaged either,
    // so what it lags the pose by while it gathers is excused the same way.
    const base = f.basePlddt, u0 = f.initUnfold, gather = 0.96 * Math.sqrt(f.settle || 0);
    for (let i = 0; i < N; i++) { const loose = Math.max(gather, u0 ? u0[i] : 0); f.shown[i] = (base ? base[i] : 100) * (f.lddt[i] * (1 - loose) + loose); }
  }

  function updateContacts(f){
    const {n,pb,paeBin}=f.form,P=f.coords;
    const counts=f.contactCounts||(f.contactCounts=new Float32Array(pb*pb));counts.fill(0);f.pae.fill(0);
    // Density of current C-alpha contacts within 8 Angstrom, binned like the
    // deformation map. Rigid translation/rotation does not change the result.
    for(let i=0;i<n;i++)for(let j=i;j<n;j++){
      const x=P[i][0]-P[j][0],y=P[i][1]-P[j][1],z=P[i][2]-P[j][2];
      const a=Math.floor(i/paeBin),b=Math.floor(j/paeBin),k=a*pb+b,l=b*pb+a,v=x*x+y*y+z*z<=64?30:0;
      counts[k]++;f.pae[k]+=v;if(i!==j){counts[l]++;f.pae[l]+=v;}
    }
    for(let k=0;k<f.pae.length;k++)f.pae[k]=counts[k]?f.pae[k]/counts[k]:0;
  }
root.ProteinScience={localFrames,localPositions,updatePAE,updateConfidence,updateContacts};
})(typeof self!=="undefined"?self:window);
