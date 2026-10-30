// Combat always advances at 60 Hz. Presentation may draw less often when expensive.
// Kept independent of the DOM so display rates and stalls can be tested directly.
(function (root) {
  const STEP = 1 / 60;
  // Keep a periodic deadline's phase across slightly late frames; never burst after
  // a long suspension. Resetting to now + interval each time slowly loses updates.
  const nextDeadline = (previous, now, interval) =>
    previous === null || now - previous > interval ? now + interval : previous + interval;
  class FixedClock {
    constructor() { this.reset(); }
    reset() { this.accumulator = 0; }
    advance(seconds, tick) {
      this.accumulator += Math.max(0, Math.min(0.1, seconds));
      let count = 0;
      while (this.accumulator + 1e-9 >= STEP && count < 3) {
        this.accumulator = Math.max(0, this.accumulator - STEP);
        count++;
        if (tick(STEP) === false) { this.reset(); break; }
      }
      // Bound catch-up work, but retain the fractional tick to avoid uneven pacing.
      if (this.accumulator + 1e-9 >= STEP) {
        const skipped = Math.floor((this.accumulator + 1e-9) / STEP);
        this.accumulator = Math.max(0, this.accumulator - skipped * STEP);
      }
      return count;
    }
  }

  class RenderBudget {
    constructor(mode = 'auto') {
      this.mode = ['30', '60'].includes(mode) ? mode : 'auto';
      this.reset();
    }
    reset() {
      this.hz = this.mode === '30' ? 30 : 60;
      this.next = null; this.average = null; this.slow = 0; this.fast = 0;
    }
    // The caller already draws only after a simulation tick. At 60, a second
    // deadline would alias with non-multiple display rates (notably 90/144 Hz).
    due(now) { return this.hz === 60 || this.next === null || now + 0.5 >= this.next; }
    mark(now) {
      const interval = 1000 / this.hz;
      this.next = nextDeadline(this.next, now, interval);
    }
    observe(costMs) {
      if (this.mode !== 'auto') return;
      this.average = this.average === null ? costMs : this.average * 0.9 + costMs * 0.1;
      this.slow = this.average > 18 ? this.slow + 1 : 0;
      this.fast = this.average < 11 ? this.fast + 1 : 0;
      // Hysteresis: sustained overload, then a much longer cheap run before retrying.
      if ((this.hz === 60 && this.slow >= 30) || (this.hz === 30 && this.fast >= 120)) {
        this.hz = this.hz === 60 ? 30 : 60;
        this.next = null; this.slow = this.fast = 0;
      }
    }
  }
  const api = { STEP, FixedClock, RenderBudget, nextDeadline };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FightTiming = api;
})(typeof window !== 'undefined' ? window : globalThis);
