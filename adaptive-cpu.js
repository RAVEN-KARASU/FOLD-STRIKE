// Observes visible actions, not player inputs. The same moves, meter and collision rules apply.
(function(root){
  class Brain {
    constructor(){this.elapsed=0;this.sense=0;this.decide=0;this.observed=null;this.previous=null;this.sequence=[];this.recent=[];this.plan=0;this.saveForClimax=true;this.habits={attacks:0,low:0,wave:0,jumps:0,guard:0,retreat:0,approach:0,samples:0};this.intent='approach';this.used={};this.performance={};this.trial=null;this.tactic='pressure';this.tacticUntil=0;this.tactics=[];this.retreatSeconds=0;}
    sample(p,m,gap,dt){
      const h=this.habits,old=this.previous;
      h.samples+=dt;h.guard+=p.guard?dt:0;
      h.retreat+=old&&p.action==='walk'&&(p.x-old.x)*p.facing<-.3?dt:0;
      h.approach+=old&&p.action==='walk'&&(p.x-old.x)*p.facing>.3?dt:0;
      if(p.y>8&&(!old||old.y<=8)&&!p.stun&&!['hurt','thrown'].includes(p.action))h.jumps++;
      if(m&&(!old||old.action!==p.action||p.t<old.t)){h.attacks++;h.low+=!!m.low;h.wave+=!!m.wave;}
      // A rolling window gradually forgets old habits; no permanent difficulty escalation.
      if(h.samples>18)for(const k of Object.keys(h))h[k]*=.72;
      const seen={action:p.action,t:p.t,x:p.x,y:p.y,guard:p.guard,crouch:p.crouch,gap,attacking:!!m,low:!!m?.low,wave:!!m?.wave,recovery:!!m&&p.t>m.active+m.window};
      this.observed=old;this.previous=seen;
    }
    weighted(options){
      const sum=options.reduce((n,o)=>n+Math.max(.01,o.weight),0);let value=Math.random()*sum;
      for(const o of options){value-=Math.max(.01,o.weight);if(value<=0)return o.value;}return options.at(-1).value;
    }
    outcome(c,p,final=false){
      const t=this.trial;if(!t)return;t.hit ||= c.connected==='hit';t.block ||= c.connected==='block';
      if(!final&&c.action===t.move&&c.stun<=0)return;
      const r=this.performance[t.move]||{tries:0,value:0,hits:0};
      const score=(t.hit?2:t.block?.1:-1)+Math.max(0,t.hp-p.hp)/12-Math.max(0,t.self-c.hp)/8;
      r.value=r.value*.7+score*.3;r.tries++;r.hits+=t.hit?1:0;this.performance[t.move]=r;this.trial=null;
    }
    chooseTactic(c,seen,gap){
      const h=this.habits,aggression=h.approach/Math.max(1,h.samples),danger=seen?.attacking&&!seen.recovery;
      const candidates=[{value:'pressure',weight:gap<100?3:1.5},
        {value:'retreat',weight:gap<100?2+(danger?3:0)+(c.hp<35?1.7:0):.08},
        {value:'bait',weight:gap<150?1.5+aggression*4:.1},
        {value:'spacing',weight:gap<150?1.4:.4},
        {value:'pursue',weight:gap>140?5:gap>90?1:.08}];
      for(const o of candidates)o.weight/=1+this.tactics.slice(-3).filter(t=>t===o.value).length*1.5;
      this.tactic=this.weighted(candidates);this.tactics.push(this.tactic);if(this.tactics.length>12)this.tactics.shift();
      this.tacticUntil=this.elapsed+.35+Math.random()*.55;
    }
    combo(seen,gap,special){
      const options=[['lpunch','punch','hpunch',special],['lkick','kick','hkick',special],
        ['lowlkick','lowkick','lowhkick',special],['lpunch','kick','hpunch',special],
        ['punch','hkick',special],['lowlpunch','lowpunch','hpunch',special],['hkick',special]];
      return this.weighted(options.map((value,i)=>{
        const first=value[0],recent=this.recent.filter(m=>m===first).length;
        let weight=1.2+Math.max(-.8,Math.min(2,this.performance[first]?.value||0));
        if(gap>57)weight*=first.includes('kick')?1.7:.55;
        if(seen.guard&&!seen.crouch&&first.startsWith('low'))weight*=2.4;
        if(seen.recovery&&['punch','hkick'].includes(first))weight*=2;
        return {value:value.slice(),weight:weight/(1+recent*2)};
      }));
    }
    step(c,p,dt,api){
      this.elapsed+=dt;this.sense-=dt;this.decide-=dt;this.outcome(c,p);
      const gap=api.gap(),toward=Math.sign(p.x-c.x)||c.facing,M=api.moves,current=M[c.action];
      if(this.sense<=0){this.sample(p,M[p.action],gap,.14);this.sense=.14;}
      const seen=this.observed,h=this.habits;
      const special=api.special,ultimate=api.ultimate;
      if(this.decide<=0&&c.counterLeft>0&&c.meter>=50&&seen?.attacking&&Math.random()<.55&&api.counter?.()){this.intent='guard-counter';this.decide=.25;this.sequence=[];return;}
      const play=move=>{if(!move)return false;const previous=this.trial;if(!api.attack(move))return false;if(previous){this.trial=previous;this.outcome(c,p,true);}this.trial={move,hp:p.hp,self:c.hp,hit:false,block:false};this.used[move]=(this.used[move]||0)+1;this.recent.push(move);if(this.recent.length>5)this.recent.shift();this.decide=.09+Math.random()*.06;return true;};
      // Confirm a hit before continuing the planned light -> medium -> heavy -> special chain.
      if(current&&c.connected){
        let next=this.sequence[0];
        if(c.meter>=300&&current.cancel)next=ultimate;
        if(c.connected==='block'&&next&&!M[next]?.wave){this.sequence=[];next=null;}
        if(next&&api.canCancel(current,M[next])&&play(next)){this.sequence.shift();if(M[next]?.ultimate){this.sequence=[];this.saveForClimax=false;}return;}
      }
      if(c.stun>0||c.blockStun>0||c.dashLeft>0||c.action==='thrown'){this.sequence=[];return;}
      if(c.y>0){if(!current&&gap<110&&this.decide<=0)play(this.plan%2?'airhpunch':'airhkick');return;}
      if(current||c.cooldown>0)return;
      if(this.sequence.length){this.sequence=[];} // A whiff does not turn into an automatic combo.
      if(c.blockHold>0){this.intent='guard';return;}
      c.crouch=false;
      if(this.decide<=0&&seen){
        this.decide=.16+Math.random()*.09;
        if(c.meter>=300&&gap<120&&!seen.guard){this.intent='climax';if(play(ultimate)){this.saveForClimax=false;return;}}
        if(seen.attacking&&!seen.recovery&&seen.gap<105&&c.meter>24&&!c.guardLock&&Math.random()<.7){c.blockHold=.18+Math.random()*.12;c.crouch=seen.low;this.intent='guard';return;}
        if(seen.y>18&&gap<90){this.intent='anti-air';if(play('hpunch'))return;}
        if(seen.wave&&seen.gap>105&&Math.random()<.65){api.jump(toward);this.intent='jump-wave';return;}
        const guarding=h.guard/Math.max(1,h.samples),jumping=h.jumps/Math.max(1,h.samples);
        if(seen.guard&&guarding>.12&&this.plan%2===0){
          this.intent='throw-guard';
          if(gap<33){if(play('throw')){this.plan++;return;}}
          else {api.walk(toward,dt,1);return;}
        }
        if(seen.guard&&seen.crouch&&guarding>.15&&gap<100&&this.plan%3===1){api.jump(toward);this.plan++;this.intent='overhead-guard';return;}
        if(this.elapsed>=this.tacticUntil)this.chooseTactic(c,seen,gap);
        // Voluntary footwork lasts long enough to read, but a visible recovery can be punished.
        if(['retreat','bait'].includes(this.tactic)&&!seen.recovery&&gap<145){
          this.intent=this.tactic;this.retreatSeconds+=dt;api.walk(gap<(this.tactic==='retreat'?135:105)?-toward:0,dt,1);return;
        }
        if(this.tactic==='spacing'&&!seen.recovery&&gap<65){this.intent='spacing';this.retreatSeconds+=dt;api.walk(-toward,dt,1);return;}
        if(gap<82){
          let combo=this.combo(seen,gap,special);this.plan++;
          this.intent=seen.recovery?'punish':'mixup';
          if(!this.saveForClimax&&c.meter>=100&&seen.recovery){combo.push(api.super);this.saveForClimax=true;}
          else if(c.hp<24&&c.meter>=100&&c.meter<200&&seen.recovery&&Math.random()<.4)combo.push(api.super);
          const first=combo.shift();if(play(first)){this.sequence=combo;return;}
        }
        if(gap>=78&&gap<210){
          const ranged=M[special]?.reach||M[special]?.roll||M[special]?.drive>80;
          if(ranged&&this.recent.slice(-2).every(m=>m!==special)&&Math.random()<.32){this.intent='range-special';if(play(special))return;}
          if(gap>100&&jumping<.15&&Math.random()<.22){api.jump(toward);this.intent='jump-in';return;}
        }
        if(gap>(h.retreat/Math.max(1,h.samples)>.35?125:145)){c.dashDir=toward;c.dashLeft=.18;c.action='dash';this.intent='close-distance';return;}
      }
      const defensive=this.elapsed<this.tacticUntil&&['retreat','bait','spacing'].includes(this.tactic)&&!seen?.recovery;
      const goal=this.tactic==='retreat'?135:this.tactic==='bait'?105:78;
      if(defensive&&gap<goal){this.intent=this.tactic;this.retreatSeconds+=dt;api.walk(-toward,dt,1);return;}
      if(defensive&&gap<goal+12){api.walk(0,dt,1);return;}
      const target=seen?.guard&&h.guard/Math.max(1,h.samples)>.12&&this.plan%2===0?28:50;
      api.walk(gap>target?toward:0,dt,1);

    }
  }
  root.AdaptiveCPU={Brain};
})(typeof window==='undefined'?globalThis:window);
