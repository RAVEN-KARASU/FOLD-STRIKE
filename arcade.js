// Molecular arcade rules, expressed in 60 Hz frames. These are authored for these
// rigs, not a claim of byte-for-byte or frame-data parity with the CPS-3 game.
(function (root) {
  const FPS = 60, seconds = frames => frames / FPS;
  const INPUT_BUFFER = seconds(6), DOUBLE_TAP = seconds(14);
  const ATTACKS = new Set(['lpunch', 'punch', 'hpunch', 'lkick', 'kick', 'hkick', 'special', 'super']);
  function configure(moves) {
    const data = {
      lpunch: [3, 3, 8, 4, 15, 0], punch: [5, 4, 12, 7, 20, 1], hpunch: [9, 5, 20, 12, 27, 2],
      lkick: [5, 4, 12, 6, 18, 0], kick: [8, 5, 17, 10, 24, 1], hkick: [12, 6, 23, 15, 30, 2],
    };
    // Snapshot the original pose definitions before replacing the medium attacks.
    const original = Object.fromEntries(Object.entries(moves).map(([k, v]) => [k, { ...v }]));
    for (const [kind, [startup, active, recovery, damage, stun, rank]] of Object.entries(data)) {
      const family = kind.endsWith('punch') ? 'punch' : 'kick';
      for (const prefix of ['', 'low', 'air']) {
        const pose = prefix + family, air = prefix === 'air';
        const start = Math.max(3, startup - (prefix === 'low' ? 1 : 0));
        const live = air ? active + 4 : active;
        const animation = !prefix && rank === 2 ? (family === 'punch' ? 'straight' : 'roundhouse') : pose;
        moves[prefix + kind] = { ...original[pose], pose: animation, family, rank,
          startup: start, activeFrames: live, recovery,
          active: seconds(start), window: seconds(live), duration: seconds(start + live + recovery),
          damage: damage * (air ? 1.1 : 1), stun: seconds(stun),
          blockFrames: Math.max(8, stun - 6), hitstopFrames: rank + 4,
          text: ['LIGHT', 'MEDIUM', 'HEAVY'][rank], cancel: !air };
      }
    }
    for (const name of ['straight', 'roundhouse']) Object.assign(moves[name], {
      pose: name, rank: 2, cancel: true, family: name === 'straight' ? 'punch' : 'kick',
      blockFrames: 18, hitstopFrames: 6,
    });
    for (const name of ['roll', 'spin', 'special']) {
      const m = moves[name];
      Object.assign(m, { pose: name, rank: 3, cancel: true, again: 0.65, hitstopFrames: 6, blockFrames: 18 });
      moves['super_' + name] = { ...m, super: true, rank: 4, cancel: false,
        damage: m.damage * 2.2, stun: seconds(32), push: m.push * 1.15,
        multi: m.spin ? 3 : m.multi, hitstopFrames: 9, blockFrames: 23,
        text: { roll: 'BARREL OVERDRIVE', spin: 'HELIX CYCLONE', special: 'THERMAL BURST' }[name] };
    }
    return moves;
  }
  const freshCommands = () => ({ history: [], taps: {}, lastCode: 5 });
  function code(held, facing) {
    const forward = held.has(facing > 0 ? 'right' : 'left');
    const back = held.has(facing > 0 ? 'left' : 'right');
    const horizontal = Number(forward) - Number(back);
    return (held.has('down') ? 2 : held.has('up') ? 8 : 5) + horizontal;
  }
  function record(f, held, now) {
    const c = f.commands ||= freshCommands(), current = code(held, f.facing);
    c.history = c.history.filter(e => now - e.time < 1);
    if (current !== c.lastCode) c.history.push({ code: current, time: now });
    c.lastCode = current;
  }
  function motion(f, now) {
    const h = (f.commands?.history || []).filter(e => e.code !== 5);
    if (!h.length || now - h[h.length - 1].time > seconds(12)) return null;
    const matches = pattern => {
      if (h.length < pattern.length) return false;
      const part = h.slice(-pattern.length);
      return part.every((e, i) => e.code === pattern[i]) && now - part[0].time < (pattern.length > 3 ? 0.85 : 0.4);
    };
    return matches([2, 3, 6, 2, 3, 6]) ? 'super' : matches([2, 3, 6]) ? 'special' : null;
  }
  function tap(f, act, held, now, free) {
    const c = f.commands ||= freshCommands();
    record(f, held, now);
    if (!free || f.hp <= 0) return null;
    const dir = act === 'left' ? -1 : act === 'right' ? 1 : 0;
    if (dir && f.y === 0 && !held.has('down')) {
      const last = c.taps[act]; c.taps[act] = now;
      if (last !== undefined && now - last <= DOUBLE_TAP) {
        delete c.taps[act]; f.parryLeft = 0;
        f.dashDir = dir; f.dashLeft = seconds(dir === f.facing ? 16 : 19);
        f.action = 'dash'; f.crouch = false; f.vx = 0;
        return 'dash';
      }
    }
    if (f.parryLock > 0) return null;
    if (dir === f.facing || (act === 'down' && f.y === 0)) {
      f.parryKind = act === 'down' ? 'low' : f.y > 0 ? 'air' : 'high';
      f.parryLeft = seconds(f.y > 0 ? 4 : act === 'down' ? 5 : 6);
      f.parryLock = seconds(18);
      return 'parry-window';
    }
    return null;
  }
  function canParry(f, move) {
    if (!(f.parryLeft > 0) || f.stun > 0 || f.blockStun > 0 || f.dashLeft > 0 || f.hp <= 0 || move.throw) return false;
    return f.y > 0 ? f.parryKind === 'air' : move.low ? f.parryKind === 'low' : f.parryKind === 'high';
  }
  function canCancel(f, current, next) {
    if (!current?.cancel || !next || !f.connected || f.t > current.active + current.window + seconds(8)) return false;
    if (next.super) return true;
    if (next.wave) return !current.wave;
    return f.connected === 'hit' && !current.wave && !next.air && next.rank > current.rank;
  }
  function gain(f, amount) { f.meter = Math.max(0, Math.min(300, (f.meter || 0) + amount)); }
  const api = { FPS, seconds, INPUT_BUFFER, ATTACKS, configure, freshCommands, record, motion, tap, canParry, canCancel, gain };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Arcade = api;
})(typeof window !== 'undefined' ? window : globalThis);
