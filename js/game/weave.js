// Weave (the BMF's defense): a chance to slip any attack completely. Some
// weaves are critical: the fighter dodges, chases the opponent down with a
// punch combo that ends in a launching blow, then celebrates.
"use strict";

var COMBO_CHASE_SPEED = 640;  // how fast it hunts the opponent during a combo
var COMBO_REACH = 26;          // gap between the two balls a combo punch can land from
var COMBO_PUNCH_GAP = 0.14;    // seconds between combo punches
var COMBO_TIMEOUT = 3;         // gives up if it can't finish the combo in time
var KNOCK_FLY_TIME = 0.8;      // how long a launched fighter flies before slowing to normal

// Rolls the weave for `b` against an attack from `attackerId`. Returns true
// if the attack was dodged (and kicks off a critical combo if that rolls too).
function tryWeave(b, attackerId, mult) {
  if (!b || !b.alive || !b.char.hasWeave) return false;
  // Can't slip anything while held, being slammed around, or mid-celebration.
  if (b.grappled || b.slam || b.taunt) return false;
  var wv = b.char.weave;
  // In a flow counter: every attack is slipped until the combo is over.
  if (b.flow && b.flow.phase === "slip") {
    b.weaveAnim = { t: 0, dur: 0.2, sign: Math.random() < 0.5 ? -1 : 1 };
    floater(b.x, b.y - b.r - 8, "FLOW", "dodge");
    return true;
  }
  if (Math.random() >= Math.min(95, wv.dodgeChance * (mult || 1)) / 100) return false;

  b.weaveAnim = { t: 0, dur: 0.26, sign: Math.random() < 0.5 ? -1 : 1 };
  var atk = attackerId != null ? balls[attackerId] : null;
  var canCrit = atk && atk.alive && !atk.invincible && !b.combo && !b.grapple;
  if (canCrit && Math.random() < wv.critChance / 100) {
    if (atk.combo && atk.combo.targetId === b.id) {
      // Weaver vs weaver (e.g. BMF vs BMF): a critical weave in the middle of
      // the other one's combo. Usually it's a reversal, taking over with a
      // combo of its own; sometimes it's a flow counter, which slips the
      // rest of the combo and ends the exchange with one clean strike.
      if (Math.random() < wv.flowChance / 100) {
        floater(b.x, b.y - b.r - 8, "FLOW COUNTER", "crit");
        b.flow = { attackerId: atk.id, phase: "slip", t: 0 };
      } else {
        floater(b.x, b.y - b.r - 8, "REVERSAL", "crit");
        atk.combo = null; // its combo is broken off
        beginCombo(b, atk);
      }
    } else {
      floater(b.x, b.y - b.r - 8, "CRITICAL WEAVE", "crit");
      beginCombo(b, atk);
    }
  } else {
    floater(b.x, b.y - b.r - 8, "WEAVE", "dodge");
  }
  return true;
}

function beginCombo(b, target) {
  // A weave can happen in the middle of the fighter's own attack code (e.g.
  // slipping a counter-grab), so the attack it was doing is dropped at the
  // start of its next turn in updateWeave, not right here.
  b.combo = { targetId: target.id, thrown: 0, timer: 0, t: 0, fresh: true };
  if (!reduceMotion) shake = Math.max(shake, 6);
}

// Launches `b` at `speed` along (nx, ny); it slows back to normal speed
// after KNOCK_FLY_TIME instead of keeping that speed forever.
function launch(b, nx, ny, speed) {
  b.vx = nx * speed; b.vy = ny * speed;
  b.knockFly = KNOCK_FLY_TIME;
}

// Runs the combo and the taunt. Returns true while either is going, which
// means the fighter's other abilities sit this frame out.
function updateWeave(self, other, dt) {
  if (self.taunt) {
    self.taunt.t += dt;
    self.vx = 0; self.vy = 0; // stands and celebrates
    if (self.taunt.t >= self.taunt.dur) {
      self.taunt = null;
      var a = Math.random() * Math.PI * 2;
      self.vx = Math.cos(a) * SPEED; self.vy = Math.sin(a) * SPEED;
    }
    return true;
  }
  if (self.flow) return updateFlow(self, dt);
  if (!self.combo) return false;

  var cb = self.combo, wv = self.char.weave;
  if (cb.fresh) {
    // Drop whatever else it was doing and go.
    cb.fresh = false;
    self.punch = null; self.kick = null; self.throwAnim = null; self.swing = null;
    if (self.powerState && self.powerState.phase === "attack") { self.vx = self.powerState.preVX; self.vy = self.powerState.preVY; }
    self.powerState = null; self.rageState = null;
    if (self.watcherState && self.watcherState.phase === "travel") {
      self.watcherState = null;
      self.watcherCd = self.char.watcher.restDur;
    }
  }
  cb.t += dt;
  if (!other.alive || other.grappled || cb.t > COMBO_TIMEOUT) {
    self.combo = null;
    setSpeed(self, SPEED);
    return false;
  }

  // Chase: close in fast, then stick to the opponent while swinging.
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var nx = dx / d, ny = dy / d;
  var inReach = d < self.r + other.r + COMBO_REACH;
  var chase = inReach ? Math.max(Math.sqrt(other.vx * other.vx + other.vy * other.vy), 160) : COMBO_CHASE_SPEED;
  self.vx = nx * chase; self.vy = ny * chase;

  cb.timer -= dt;
  if (cb.timer <= 0 && inReach) {
    cb.timer = COMBO_PUNCH_GAP;
    cb.thrown++;
    var last = cb.thrown >= Math.max(1, Math.round(wv.comboHits));
    self.jabAnim = { t: 0, dur: last ? 0.24 : 0.11, sign: cb.thrown % 2 ? 1 : -1, big: last, dx: nx, dy: ny };
    hurt(other, last ? wv.finalDamage : wv.comboDamage, "combo", self.id);
    if (self.combo !== cb) { checkEnd(); return true; } // reversed by the opponent mid-combo
    if (last) {
      if (!other.justDodged && other.alive) launch(other, nx, ny, Math.max(wv.finalKnockback, SPEED));
      if (!reduceMotion) shake = Math.max(shake, 14);
      self.combo = null;
      if (other.char.hasWeave) {
        // Against another weaver there's no celebrating after a combo.
        setSpeed(self, SPEED);
      } else {
        self.taunt = { t: 0, dur: wv.tauntDur };
        self.vx = 0; self.vy = 0;
      }
    } else if (!reduceMotion) {
      shake = Math.max(shake, 4);
    }
    checkEnd();
  }
  return true;
}

// Flow counter: slips every punch of the opponent's combo ("slip"), then as
// soon as the combo ends darts in ("strike") and lands one clean strike for
// flowDamage that knocks the opponent away, then celebrates.
var FLOW_STRIKE_TIMEOUT = 1.2; // gives up if it can't reach them in time

function updateFlow(self, dt) {
  var fl = self.flow, wv = self.char.weave, atk = balls[fl.attackerId];
  fl.t += dt;
  if (!atk || !atk.alive) { self.flow = null; return false; }

  if (fl.phase === "slip") {
    // Waits out the combo, slipping everything (handled in tryWeave).
    if (!atk.combo || atk.combo.targetId !== self.id) { fl.phase = "strike"; fl.t = 0; }
    return true;
  }

  var dx = atk.x - self.x, dy = atk.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var nx = dx / d, ny = dy / d;
  self.vx = nx * COMBO_CHASE_SPEED; self.vy = ny * COMBO_CHASE_SPEED;
  if (d < self.r + atk.r + COMBO_REACH) {
    self.jabAnim = { t: 0, dur: 0.24, sign: 1, big: true, dx: nx, dy: ny };
    var dealt = hurt(atk, wv.flowDamage, "flow", self.id);
    if (dealt > 0) {
      playPunch(dealt + 15); // lands heavy
      if (atk.alive) launch(atk, nx, ny, Math.max(wv.finalKnockback, SPEED));
    }
    if (!reduceMotion) { shake = Math.max(shake, 16); hitStop = Math.max(hitStop, 0.08); }
    self.flow = null;
    self.taunt = { t: 0, dur: wv.tauntDur };
    self.vx = 0; self.vy = 0;
    checkEnd();
    return true;
  }
  if (fl.t > FLOW_STRIKE_TIMEOUT) { self.flow = null; setSpeed(self, SPEED); return false; }
  return true;
}
