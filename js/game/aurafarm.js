// Ilia Topuria's special move, Aura Farm (special.move "aurafarm").
//
// The fight stops and the whole arena goes dark. Ilia strolls to the middle
// of the cage, a spotlight drops on him and the music starts (Joe's track
// goes in SOUND_CLIPS.auraFarm; until then a flamenco clap and strum
// stands in). He breaks into a Spanish dance, stomping, twirling and
// throwing roses everywhere, and the arena lights back up with the crowd
// going wild. A bull charges in through the crowd and over the fence (like
// Herb Dean), Ilia pulls out a red cape and, like a matador, olés the bull
// straight past him into his opponent. The bull turns round and comes for
// Ilia, he knocks it out cold, lifts it over his head and throws it into his
// opponent for more damage, then takes a bow.
"use strict";

var AF_DARK_TIME = 0.6;    // the lights going out
var AF_WALK = 230;         // strolling to the middle
var AF_SPOT_TIME = 0.7;    // the spotlight dropping on him
var AF_DANCE = 5.2;        // the dance (runs on until the bull is in)
var AF_LIGHTS_AT = 2.2;    // seconds into the dance the arena lights back up
var AF_BULL_AT = 3.0;      // ... and the bull starts charging through the crowd
var AF_BEAT = 0.3;         // one beat of the dance (200 bpm)
var AF_ROSE_EVERY = 0.24;
var AF_BULL_R = 48;
var AF_BULL_RUN = 520;     // through the crowd
var AF_BULL_LEAP = 0.6;    // over the fence
var AF_BULL_PAW = 1.0;     // pawing the ground before each charge
var AF_BULL_CHARGE = 720;
var AF_STEP = 0.18;        // Ilia's sidestep as the bull goes by
var AF_TURN = 1.1;         // the bull pulling up and turning round
var AF_KO_TIME = 0.7;
var AF_LIFT = 0.45, AF_HOLD = 0.45;
var AF_THROW_SPEED = 950;
var AF_BOW = 1.8;

var aura = null; // the scene while it's on: lights, roses, the bull

function resetAuraFarm() { aura = null; stopAuraFarmMusic(0); }
function auraFarmOn() { return !!aura; }

function updateAuraFarm(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other)) return false;
    clearActions(self); clearActions(other);
    self.igbb = { move: "aurafarm", phase: "dark", t: 0, beatN: -1, roseT: 0, raised: 1, blend: 1 };
    aura = { ownerId: self.id, dark: 0, lit: 0, spot: 0, roses: [], bull: null, fade: 1, sweep: 0, steam: [] };
    other.dazed = "held"; other.vx = 0; other.vy = 0;
    other.holdAtOne = true; // nobody goes down before the bull is thrown
    var side = other.x >= W / 2 ? 1 : -1;
    self.igbb.ox0 = other.x; self.igbb.oy0 = other.y;
    self.igbb.otx = W / 2 + side * (40 + Math.random() * 50); self.igbb.oty = other.r + 52;
    floater(self.x, self.y - self.r - 26, "AURA FARM", "crit");
    auraCrowdHush();
    playWhoosh();
  }
  var m = self.igbb, a = aura;
  m.t += dt;
  a.sweep += dt;
  tickAuraRoses(dt);
  tickAuraVictim(other, m, dt);
  if (over) { endAuraFarm(self, other, true); return false; }
  self.vx = 0; self.vy = 0;

  if (m.phase === "dark") {
    a.dark = Math.min(1, m.t / AF_DARK_TIME);
    auraSlideVictim(other, m, Math.min(1, m.t / (AF_DARK_TIME + 0.8)));
    if (m.t >= AF_DARK_TIME) { m.phase = "walk"; m.t = 0; }
    return true;
  }
  if (m.phase === "walk") {
    auraSlideVictim(other, m, Math.min(1, (m.t + AF_DARK_TIME) / (AF_DARK_TIME + 0.8)));
    var cx = W / 2 - self.x, cy = H / 2 + 20 - self.y, cd = Math.sqrt(cx * cx + cy * cy);
    if (cd < 4 && m.t > 0.8) {
      self.x = W / 2; self.y = H / 2 + 20;
      m.phase = "spot"; m.t = 0;
      playSpotlightDrop();
      playAuraFarmMusic(); // Joe's track goes here (audio.js)
      return true;
    }
    if (cd >= 4) { var st = Math.min(cd, AF_WALK * dt); self.x += cx / cd * st; self.y += cy / cd * st; }
    return true;
  }
  if (m.phase === "spot") {
    a.spot = Math.min(1, m.t / 0.18);
    if (m.t >= AF_SPOT_TIME) { m.phase = "dance"; m.t = 0; }
    return true;
  }
  if (m.phase === "dance") {
    tickAuraDance(self, m, dt);
    if (m.t >= AF_LIGHTS_AT && !a.litOn) {
      a.litOn = true;
      // (the crowd stays under the music until the bow)
      startChairFrenzy(); // the whole crowd on its feet (chairshot.js)
      floater(W / 2, 60, "OLÉ!", "crit");
    }
    if (a.litOn) { a.lit = Math.min(1, a.lit + dt / 0.7); a.dark = Math.max(0, 1 - a.lit); }
    if (m.t >= AF_BULL_AT && !a.bull) auraBullEnters(self, other);
    if (a.bull) tickAuraBull(self, other, dt);
    if (m.t >= AF_DANCE && a.bull && a.bull.phase === "paw") {
      // Out comes the cape: he plants himself between the bull and his opponent.
      var bx = a.bull.x - other.x, by = a.bull.y - other.y, bd = Math.sqrt(bx * bx + by * by) || 1;
      m.px = other.x + bx / bd * Math.min(bd * 0.55, other.r + self.r + 70);
      m.py = other.y + by / bd * Math.min(bd * 0.55, other.r + self.r + 70);
      m.phase = "cape"; m.t = 0; m.cape = 0;
      floater(self.x, self.y - self.r - 40, "TORO!", "crit");
      playWhoosh();
    }
    return true;
  }
  if (a.bull) tickAuraBull(self, other, dt);
  var bull = a.bull;
  if (m.phase === "cape") {
    m.cape = Math.min(1, m.t / 0.4);
    var mx = m.px - self.x, my = m.py - self.y, md = Math.sqrt(mx * mx + my * my);
    if (md > 2) { var s2 = Math.min(md, 320 * dt); self.x += mx / md * s2; self.y += my / md * s2; }
    // The roar starts while it's pawing, getting ready, and runs on into the charge.
    if (!m.roared && m.t >= AF_BULL_PAW - 0.6) { m.roared = true; playBullCharge(); }
    if (m.t >= AF_BULL_PAW && md <= 2) {
      // Charges him, aimed through him at the opponent behind.
      var ax = other.x - bull.x, ay = other.y - bull.y, ad = Math.sqrt(ax * ax + ay * ay) || 1;
      bull.phase = "charge"; bull.t = 0; bull.dx = ax / ad; bull.dy = ay / ad; bull.target = "victim";
      bull.face = bull.dx >= 0 ? 1 : -1;
      m.phase = "charge1"; m.t = 0; m.step = 0;
    }
    return true;
  }
  if (m.phase === "charge1") {
    // As it gets to him he sweeps the cape and steps out of its way.
    var gx = self.x - bull.x, gy = self.y - bull.y;
    var along = gx * bull.dx + gy * bull.dy;
    if (!m.oleT && along < self.r + AF_BULL_R + 60) {
      m.oleT = 0.0001;
      var side = (-bull.dy * gx + bull.dx * gy) >= 0 ? 1 : -1; // away from the line it's on
      m.sx = -bull.dy * side; m.sy = bull.dx * side;
      floater(self.x, self.y - self.r - 50, "OLÉ!", "crit");
      crowdReact(1);
      playWhoosh();
    }
    if (m.oleT) {
      var k0 = Math.min(1, m.oleT / AF_STEP);
      m.oleT += dt;
      var k1 = Math.min(1, m.oleT / AF_STEP), step = (self.r + AF_BULL_R) * 1.1;
      self.x += m.sx * step * (k1 - k0); self.y += m.sy * step * (k1 - k0);
    }
    if (bull.phase === "skid") { m.phase = "turn"; m.t = 0; }
    return true;
  }
  if (m.phase === "turn") {
    if (bull.phase === "charge" && bull.target === "ilia") { m.phase = "charge2"; m.t = 0; }
    return true;
  }
  if (m.phase === "charge2") {
    var hx = bull.x - self.x, hy = bull.y - self.y, hd = Math.sqrt(hx * hx + hy * hy) || 1;
    m.fx = hx / hd; m.fy = hy / hd;
    if (hd < self.r + AF_BULL_R + 14) {
      // One punch, right on the nose.
      bull.phase = "ko"; bull.t = 0; bull.ko = true;
      // Knocked off to the side, away from the opponent behind it.
      var kpx = -hy / hd, kpy = hx / hd;
      if (kpx * (other.x - bull.x) + kpy * (other.y - bull.y) > 0) { kpx = -kpx; kpy = -kpy; }
      bull.vx = (kpx * 0.8 + hx / hd * 0.6) * 560; bull.vy = (kpy * 0.8 + hy / hd * 0.6) * 560;
      m.phase = "ko"; m.t = 0; m.punchT = 0;
      floater(bull.x, bull.y - AF_BULL_R - 30, "KO!", "crit");
      floater(bull.x + 40, bull.y - AF_BULL_R - 62, "CRACK!", "crit");
      playKoPunch(); playBullThrown(0.85); // Joe's bull sound, pitched a little lower
      screenFlash = Math.max(screenFlash, 0.5);
      hitStop = Math.max(hitStop, 0.18);
      if (!reduceMotion) shake = Math.max(shake, 26);
      impacts.push({ x: bull.x - m.fx * AF_BULL_R, y: bull.y - m.fy * AF_BULL_R, nx: m.fx, ny: m.fy, life: 0.5, max: 0.5, color: "#ffd23f" });
      igbbSparks(bull.x, bull.y, m.fx, m.fy, "#ffd23f", 20, 480);
      crowdReact(1);
    }
    return true;
  }
  if (m.phase === "ko") {
    m.punchT += dt;
    if (m.t >= AF_KO_TIME) { m.phase = "lift"; m.t = 0; m.liftT = 0; }
    return true;
  }
  if (m.phase === "lift") {
    // Walks over, gets under it and hoists it up over his head.
    var lx = bull.x - self.x, ly = bull.y - self.y, ld = Math.sqrt(lx * lx + ly * ly) || 1;
    if (!bull.held) {
      if (ld > self.r + AF_BULL_R + 6 && m.t < 1.5) { var s3 = Math.min(ld - self.r - AF_BULL_R - 6, 380 * dt); self.x += lx / ld * s3; self.y += ly / ld * s3; }
      else { bull.held = true; bull.phase = "held"; bull.vx = 0; bull.vy = 0; m.liftT = 0; playWhoosh(); }
      return true;
    }
    m.liftT += dt;
    var lk = Math.min(1, m.liftT / AF_LIFT);
    bull.x += (self.x - bull.x) * Math.min(1, dt * 14); bull.y += (self.y - bull.y) * Math.min(1, dt * 14);
    bull.z = lk * lk * (3 - 2 * lk) * (self.r + AF_BULL_R * 2.3);
    bull.spin = Math.PI; // still upside down, out cold
    // Backs off from the opponent to get a proper throw in.
    var qx = self.x - other.x, qy = self.y - other.y, qd = Math.sqrt(qx * qx + qy * qy) || 1;
    if (qd < 210) { self.x += qx / qd * 260 * dt; self.y += qy / qd * 260 * dt; self.x = Math.max(self.r, Math.min(W - self.r, self.x)); self.y = Math.max(self.r, Math.min(H - self.r, self.y)); }
    if (m.liftT >= AF_LIFT + AF_HOLD) {
      var tx = other.x - self.x, ty = other.y - self.y, td = Math.sqrt(tx * tx + ty * ty) || 1;
      bull.phase = "thrown"; bull.t = 0; bull.held = false;
      bull.vx = tx / td * AF_THROW_SPEED; bull.vy = ty / td * AF_THROW_SPEED;
      bull.z0 = bull.z; bull.flight = td / AF_THROW_SPEED;
      m.phase = "throw"; m.t = 0; m.tx = tx / td; m.ty = ty / td;
      playWhoosh(); playBullThrown();
    }
    return true;
  }
  if (m.phase === "throw") {
    if (bull.phase !== "thrown") {
      if (m.t > 0.25 && !m.bowed) { m.bowed = true; m.phase = "bow"; m.t = 0; }
    }
    if (m.t > 3) { m.phase = "bow"; m.t = 0; }
    return true;
  }
  if (m.phase === "bow") {
    if (m.t >= AF_BOW && (!a.bull || m.t >= AF_BOW + 1.2)) { endAuraFarm(self, other, true); return false; }
    return true;
  }
  return true;
}

// The opponent: frozen in the dark (moved up out of the way while nobody can
// see), trembling when the bull's about, then knocked about by it.
function auraSlideVictim(o, m, k) {
  var e = k * k * (3 - 2 * k);
  o.x = m.ox0 + (m.otx - m.ox0) * e; o.y = m.oy0 + (m.oty - m.oy0) * e;
}
function tickAuraVictim(o, m, dt) {
  if (!o.alive) return;
  o.vx = 0; o.vy = 0;
  if (m.kb) {
    o.x += m.kb.vx * dt; o.y += m.kb.vy * dt;
    var dk = Math.exp(-4.5 * dt); m.kb.vx *= dk; m.kb.vy *= dk;
    if (o.x < o.r) { o.x = o.r; m.kb.vx = Math.abs(m.kb.vx) * 0.6; }
    if (o.x > W - o.r) { o.x = W - o.r; m.kb.vx = -Math.abs(m.kb.vx) * 0.6; }
    if (o.y < o.r) { o.y = o.r; m.kb.vy = Math.abs(m.kb.vy) * 0.6; }
    if (o.y > H - o.r) { o.y = H - o.r; m.kb.vy = -Math.abs(m.kb.vy) * 0.6; }
    if (Math.abs(m.kb.vx) + Math.abs(m.kb.vy) < 8) m.kb = null;
  }
}
function auraVictim(b) {
  var o = balls[1 - b.id];
  return !!(aura && o.igbb && o.igbb.move === "aurafarm" && b.alive);
}

// ---------------------------------------------------------------- the dance
function tickAuraDance(self, m, dt) {
  var beat = Math.floor(m.t / AF_BEAT);
  if (beat !== m.beatN) {
    m.beatN = beat;
    if (beat % 2 === 0) {
      // Stomp: dust off his heel.
      m.raised = -m.raised;
      if (!reduceMotion) for (var i = 0; i < 6; i++) {
        var aa = Math.PI * (0.1 + 0.8 * Math.random());
        particles.push({ x: self.x + (Math.random() - 0.5) * self.r, y: self.y + self.r * 0.95, vx: Math.cos(aa) * 120 * (Math.random() < 0.5 ? -1 : 1), vy: -Math.sin(aa) * 60, life: 0.35, max: 0.35, size: 4, color: "rgba(180,160,130,0.7)" });
      }
      playStomp();
    }
  }
  m.blend = Math.min(1, (m.t - beat * AF_BEAT) / 0.15);
  m.roseT += dt;
  if (m.t > 0.6 && m.roseT >= AF_ROSE_EVERY) { m.roseT = 0; throwRose(self, m); }
}
// Twirls: twice through the dance he spins round on the spot.
function auraTwirl(m) {
  if (!m || m.phase !== "dance") return null;
  var spans = [[1.2, 0.6], [3.4, 0.6]];
  for (var i = 0; i < spans.length; i++) {
    var k = (m.t - spans[i][0]) / spans[i][1];
    if (k >= 0 && k <= 1) return k;
  }
  return null;
}
function throwRose(self, m) {
  var h = auraRaisedHand(self, m);
  var ang = Math.random() * Math.PI * 2, sp = 180 + Math.random() * 260;
  aura.roses.push({ x: h.x, y: h.y, z: 10, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * 0.8 - 40, vz: 260 + Math.random() * 160,
    rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 14, landed: false });
  if (aura.roses.length > 60) aura.roses.shift();
}
function tickAuraRoses(dt) {
  var a = aura;
  a.roses.forEach(function (r) {
    if (r.landed) return;
    r.x += r.vx * dt; r.y += r.vy * dt; r.z += r.vz * dt; r.vz -= 900 * dt; r.rot += r.vr * dt;
    if (r.z <= 0) { r.z = 0; r.landed = true; }
  });
  (a.steam || []).forEach(function (s) { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; });
  a.steam = (a.steam || []).filter(function (s) { return s.t < s.life; });
}

// ---------------------------------------------------------------- the bull
function afFenceY() { return stadiumOn() ? H + ST.CAGE / 2 * W / ST.A : H; }
function afOffY() { return stadiumOn() ? (STAGE_H + 80 - ST.AY) * W / ST.A : H + AF_BULL_R * 3; }

function auraBullEnters(self, other) {
  // Up through the stands on the far side from the opponent, aimed so it
  // lines up on Ilia and the opponent behind him.
  var lx = Math.max(90, Math.min(W - 90, W / 2 - (other.x - W / 2) * 0.6));
  aura.bull = { x: lx + (Math.random() - 0.5) * 60, y: afOffY(), z: 0, t: 0, phase: "run", gx: lx, face: other.x >= lx ? 1 : -1,
    spin: 0, ko: false, alpha: 1, hoof: 0 };
  floater(W / 2, H - 60, "A BULL?!", "note"); // (silent until it charges: Joe wants the roar first)
}

function tickAuraBull(self, other, dt) {
  var b = aura.bull;
  if (!b) return;
  b.t += dt;
  var inY = H - AF_BULL_R - 8, outY = afFenceY() + AF_BULL_R + 6;
  if (b.phase === "run") {
    b.y -= AF_BULL_RUN * dt;
    b.x += (b.gx - b.x) * Math.min(1, dt * 2);
    auraHooves(b, dt);
    if (b.y <= outY) { b.y = outY; b.phase = "leap"; b.t = 0; b.ly0 = outY; playWhoosh(); }
  } else if (b.phase === "leap") {
    var k = Math.min(1, b.t / AF_BULL_LEAP);
    b.y = b.ly0 + (inY - b.ly0) * k;
    b.z = Math.sin(Math.PI * k) * AF_BULL_R * 1.6;
    if (k >= 1) {
      b.z = 0; b.phase = "paw"; b.t = 0;
      playSlam();
      if (!reduceMotion) shake = Math.max(shake, 10);
      auraDust(b.x, b.y + AF_BULL_R * 0.8, 10);
    }
  } else if (b.phase === "paw") {
    // Scrapes the ground and snorts steam, facing them.
    b.face = (self.x >= b.x) ? 1 : -1;
    if (Math.floor(b.t / 0.35) !== Math.floor((b.t - dt) / 0.35)) {
      auraDust(b.x - b.face * AF_BULL_R * 0.5, b.y + AF_BULL_R * 0.85, 4);
      auraSteam(b);
    }
  } else if (b.phase === "charge") {
    b.x += b.dx * AF_BULL_CHARGE * dt; b.y += b.dy * AF_BULL_CHARGE * dt;
    auraHooves(b, dt);
    if (b.target === "victim") {
      var vx = other.x - b.x, vy = other.y - b.y;
      if (Math.sqrt(vx * vx + vy * vy) < other.r + AF_BULL_R - 4) {
        // Straight into the opponent.
        hurt(other, self.char.special.bullDamage, "igbb", self.id);
        violentHit(self, other, 1.2);
        self.igbb.kb = { vx: b.dx * 520 + (Math.random() - 0.5) * 200, vy: b.dy * 520 };
        if (self.igbb.kb.vy < 0 && other.y < other.r + 30) self.igbb.kb.vy = -self.igbb.kb.vy * 0.4; // off the fence
        other.dazed = true;
        floater(other.x, other.y - other.r - 40, "GORED!", "crit");
        playSlam(); playPunch(36);
        hitStop = Math.max(hitStop, 0.12);
        if (!reduceMotion) shake = Math.max(shake, 22);
        impacts.push({ x: other.x - b.dx * other.r, y: other.y - b.dy * other.r, nx: b.dx, ny: b.dy, life: 0.5, max: 0.5, color: "#c41a1e" });
        crowdReact(1);
        checkEnd();
        b.phase = "skid"; b.t = 0; b.vx = b.dx * 300; b.vy = b.dy * 300;
      }
    } else {
      // (the KO punch is caught by Ilia's side, updateAuraFarm)
    }
    auraKeepIn(b);
  } else if (b.phase === "skid") {
    // Pulls up, turns round and paws again, now looking at Ilia.
    b.x += b.vx * dt; b.y += b.vy * dt;
    var dk = Math.exp(-6 * dt); b.vx *= dk; b.vy *= dk;
    auraKeepIn(b);
    if (!reduceMotion && Math.random() < 0.5) auraDust(b.x, b.y + AF_BULL_R * 0.8, 1);
    var want = self.x >= b.x ? 1 : -1;
    if (b.t > 0.45 && b.face !== want) b.face = want;
    if (b.t > 0.6 && Math.floor(b.t / 0.35) !== Math.floor((b.t - dt) / 0.35)) { auraDust(b.x - b.face * AF_BULL_R * 0.5, b.y + AF_BULL_R * 0.85, 4); auraSteam(b); }
    if (!b.roared2 && b.t >= AF_TURN - 0.6) { b.roared2 = true; playBullCharge(); } // same again before it comes for Ilia
    if (b.t >= AF_TURN) {
      var ix = self.x - b.x, iy = self.y - b.y, id = Math.sqrt(ix * ix + iy * iy) || 1;
      b.phase = "charge"; b.t = 0; b.dx = ix / id; b.dy = iy / id; b.target = "ilia"; b.face = b.dx >= 0 ? 1 : -1;
    }
  } else if (b.phase === "ko") {
    // Knocked flying onto its back.
    b.x += b.vx * dt; b.y += b.vy * dt;
    var dk2 = Math.exp(-5 * dt); b.vx *= dk2; b.vy *= dk2;
    var kk = Math.min(1, b.t / 0.4);
    b.spin = Math.PI * kk; b.z = Math.sin(Math.PI * kk) * AF_BULL_R * 0.8;
    auraKeepIn(b);
    auraOffOf(b, other);
  } else if (b.phase === "thrown") {
    b.x += b.vx * dt; b.y += b.vy * dt;
    var fk = Math.min(1, b.t / b.flight);
    b.z = b.z0 * (1 - fk) + Math.sin(Math.PI * fk) * 30;
    b.spin += dt * 12;
    var ox = other.x - b.x, oy = other.y - b.y;
    if (other.alive && Math.sqrt(ox * ox + oy * oy) < other.r + AF_BULL_R) {
      other.holdAtOne = false; // this one can finish it
      var m = self.igbb;
      hurt(other, self.char.special.throwDamage, "igbb", self.id);
      violentHit(self, other, 1.5);
      m.kb = { vx: m.tx * 700, vy: m.ty * 700 };
      floater(other.x, other.y - other.r - 40, "MATADOR!", "crit");
      playSlam(); playPunch(45);
      cameraFlash();
      hitStop = Math.max(hitStop, 0.16);
      if (!reduceMotion) shake = Math.max(shake, 32);
      impacts.push({ x: other.x, y: other.y, nx: m.tx, ny: m.ty, life: 0.6, max: 0.6, color: "#ffd23f" });
      crowdReact(1);
      // Bounces back off them, up over the fence and into the big stands
      // below the cage (the opponent's up the top end by now).
      var ux = -m.tx * 0.6 + (b.x < W / 2 ? -0.35 : 0.35), uy = Math.abs(m.ty) * 0.6 + 0.8, ul = Math.sqrt(ux * ux + uy * uy) || 1;
      b.phase = "gone"; b.t = 0; b.vx = ux / ul * 560; b.vy = uy / ul * 560; b.z0 = b.z; b.spinV = (Math.random() < 0.5 ? -1 : 1) * 9;
      checkEnd();
    } else if (fk >= 1.4) { b.phase = "gone"; b.t = 0; b.vx = 0; b.vy = 0; }
  } else if (b.phase === "gone") {
    // Tumbling away in a big arc over the fence, then crashing through the
    // stands, scattering fans, and gone.
    b.x += b.vx * dt; b.y += b.vy * dt;
    var inside = b.x > -AF_BULL_R * 0.3 && b.x < W + AF_BULL_R * 0.3 && b.y > -AF_BULL_R * 0.3 && b.y < H + AF_BULL_R * 0.3;
    var arc = Math.min(1, b.t / 0.8);
    b.z = (b.z0 || 0) * (1 - arc) + Math.sin(Math.PI * arc) * AF_BULL_R * 1.8;
    b.spin += (b.spinV || 9) * dt * (arc < 1 ? 1 : 0.4);
    if (arc >= 1) {
      b.vx *= Math.exp(-1.6 * dt); b.vy *= Math.exp(-1.6 * dt);
      if (!b.landed) { b.landed = true; playSlam(); crowdReact(1); if (!reduceMotion) shake = Math.max(shake, 8); }
    }
    if (!inside && arc >= 1 && Math.random() < 0.5) auraDust(b.x, b.y + AF_BULL_R * 0.6, 1);
    if (inside && arc >= 1) { b.vx *= Math.exp(-3 * dt); b.vy *= Math.exp(-3 * dt); } // (only if it fell short)
    var stageOut = stadiumOn() ? (b.x < -ST.AX * W / ST.A - AF_BULL_R || b.x > (STAGE_W - ST.AX) * W / ST.A + AF_BULL_R ||
      b.y < -ST.AY * W / ST.A - AF_BULL_R || b.y > (STAGE_H - ST.AY) * W / ST.A + AF_BULL_R) : !inside;
    if (b.t > 1.4) b.alpha = Math.max(0, 1 - (b.t - 1.4) / 0.5);
    if (stageOut || b.alpha <= 0) aura.bull = null;
  }
}
function auraOffOf(b, f) {
  var dx = b.x - f.x, dy = b.y - f.y, d = Math.sqrt(dx * dx + dy * dy) || 1, min = f.r + AF_BULL_R + 6;
  if (d < min) { b.x = f.x + dx / d * min; b.y = f.y + dy / d * min; auraKeepIn(b); }
}
function auraKeepIn(b) {
  b.x = Math.max(AF_BULL_R, Math.min(W - AF_BULL_R, b.x));
  b.y = Math.max(AF_BULL_R, Math.min(H - AF_BULL_R, b.y));
}
function auraHooves(b, dt) {
  b.hoof += dt;
  if (b.hoof >= 0.12) {
    b.hoof = 0;
    playHoof();
    if (!reduceMotion) auraDust(b.x - (b.dx || 0) * AF_BULL_R, b.y + AF_BULL_R * 0.8, 2);
  }
}
function auraDust(x, y, n) {
  if (reduceMotion) return;
  for (var i = 0; i < n; i++) {
    var a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 140;
    particles.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.5 - 30, life: 0.5, max: 0.5, size: 5 + Math.random() * 4, color: "rgba(170,150,120,0.6)" });
  }
}
function auraSteam(b) {
  if (reduceMotion) return;
  [-1, 1].forEach(function (k) {
    aura.steam.push({ x: b.x + b.face * AF_BULL_R * 0.55 + k * 6, y: b.y + AF_BULL_R * 0.25, vx: b.face * 60 + k * 20, vy: 10, t: 0, life: 0.5 });
  });
}

// Fans shoved aside as the bull barges up through the stands (stadium.js,
// via herbShove).
function auraBullPush(f) {
  var b = aura && aura.bull;
  if (!b || (b.x > 0 && b.x < W && b.y > 0 && b.y < H)) return null;
  var k = ST.A / W, bx = ST.AX + b.x * k, by = ST.AY + b.y * k;
  var dx = f.x - bx, dy = f.y - by, d = Math.sqrt(dx * dx + dy * dy) || 1, reach = f.r * 0.85 + AF_BULL_R * k * 1.2;
  if (d >= reach) return null;
  var push = reach - d;
  return { x: (dx < 0 ? -1 : 1) * push * 1.2, y: dy / d * push * 0.25 };
}

function endAuraFarm(self, other, landed) {
  if (other.dazed === "held" || other.dazed === true) other.dazed = false;
  other.holdAtOne = false;
  self.igbb = null;
  if (landed) self.specialT = 0;
  endChairFrenzy();
  stopAuraFarmMusic(1.6);
  auraCrowdBack();
  aura = null;
  setSpeed(self, self.baseSpeed || SPEED);
}

// The crowd goes quiet in the dark, and comes back when the lights do.
function auraCrowdHush() {
  try {
    var c = crowd;
    if (!c || !c.gain || !audioCtx) return;
    var now = audioCtx.currentTime;
    c.duckUntil = now + 60;
    c.gain.gain.cancelScheduledValues(now);
    c.gain.gain.setTargetAtTime(0.0001, now, 0.15);
  } catch (e) { /* never let audio break the game */ }
}
function auraCrowdBack() {
  try { if (crowd) crowd.duckUntil = 0; } catch (e) { /* never let audio break the game */ }
}

// ---------------------------------------------------------------- drawing hooks

// Bobbing and bowing (draw.js adds it to his spot).
function auraOffset(b) {
  var m = b.igbb;
  if (!m || m.move !== "aurafarm" || reduceMotion) {
    if (aura && auraVictim(b) && aura.bull && aura.bull.phase !== "gone" && b.dazed !== true) {
      return { x: (Math.random() - 0.5) * 2.4, y: (Math.random() - 0.5) * 2.4 }; // shaking
    }
    return { x: 0, y: 0 };
  }
  if (m.phase === "dance") {
    var k = (m.t % (AF_BEAT * 2)) / (AF_BEAT * 2);
    return { x: Math.sin(m.t * Math.PI / AF_BEAT) * 3, y: -Math.abs(Math.sin(k * Math.PI)) * b.r * 0.12 };
  }
  if (m.phase === "walk") return { x: 0, y: -Math.abs(Math.sin(m.t * 9)) * 3 };
  if (m.phase === "bow") { var bk = Math.sin(Math.PI * Math.min(1, m.t / AF_BOW)); return { x: 0, y: bk * b.r * 0.18 }; }
  return { x: 0, y: 0 };
}
function auraSpin(b) {
  var m = b.igbb;
  if (!m || m.move !== "aurafarm" || reduceMotion) return 0;
  var k = auraTwirl(m);
  return k == null ? 0 : Math.PI * 2 * (k * k * (3 - 2 * k));
}
function auraHandsBusy(b) {
  var m = b.igbb;
  return !!(m && m.move === "aurafarm" && m.phase !== "dark");
}

// Where his raised hand is (roses come out of it).
function auraRaisedHand(b, m) {
  var k = m.raised, r = b.r;
  return { x: b.x + k * r * 0.25, y: b.y - r * 1.45 };
}

// Ilia's arms: flamenco, the cape, the punch, the lift, the bow.
function drawAuraFarm(b) {
  var m = b.igbb;
  if (!m || m.move !== "aurafarm" || !b.alive || m.phase === "dark") return;
  var ch = b.char, r = b.r, arm = (ch.punch.size || 15) * 0.6, gr = r * 0.3;
  var spin = auraSpin(b), cs = Math.cos(spin), sn = Math.sin(spin);
  function P(lx, ly) { return { x: b.x + lx * cs - ly * sn, y: b.y + lx * sn + ly * cs }; }
  function limb(s, e, h) {
    strokeLimb(arm, armColor(ch), function () { ctx.moveTo(s.x, s.y); ctx.quadraticCurveTo(e.x, e.y, h.x, h.y); });
    drawGloveAt(h.x, h.y, gr, ch, Math.atan2(h.y - e.y, h.x - e.x));
  }
  var raised = function (k) { return [P(k * r * 0.62, -r * 0.35), P(k * r * 1.05, -r * 1.05), P(k * r * 0.25, -r * 1.45)]; };
  var hip = function (k) { return [P(k * r * 0.62, -r * 0.2), P(k * r * 1.2, r * 0.15), P(k * r * 0.72, r * 0.55)]; };
  if (m.phase === "walk") {
    [-1, 1].forEach(function (k) {
      var sw = Math.sin(m.t * 9 + (k > 0 ? 0 : Math.PI)) * r * 0.2;
      limb(P(k * r * 0.62, -r * 0.2), P(k * r * 0.95, r * 0.2 + sw * 0.3), P(k * r * 0.85, r * 0.62 + sw));
    });
    return;
  }
  if (m.phase === "spot" || m.phase === "dance") {
    var tw = auraTwirl(m);
    if (m.phase === "spot" || tw != null) { [-1, 1].forEach(function (k) { var p = raised(k); limb(p[0], p[1], p[2]); }); return; }
    // One arm arched over his head, the other hand on his hip, swapping on
    // every stomp (eased so they glide between the two).
    var e = m.blend * m.blend * (3 - 2 * m.blend);
    [-1, 1].forEach(function (k) {
      var up = k === m.raised, from = up ? hip(k) : raised(k), to = up ? raised(k) : hip(k);
      var pts = [0, 1, 2].map(function (i) { return { x: from[i].x + (to[i].x - from[i].x) * e, y: from[i].y + (to[i].y - from[i].y) * e }; });
      limb(pts[0], pts[1], pts[2]);
    });
    return;
  }
  var bull = aura && aura.bull;
  if (m.phase === "cape" || m.phase === "charge1" || m.phase === "turn" || m.phase === "charge2") {
    // The cape held out toward the bull in his near hand; the other on his hip.
    var tb = bull || { x: b.x + 100, y: b.y };
    var fx = tb.x - b.x, fy = tb.y - b.y, fd = Math.sqrt(fx * fx + fy * fy) || 1; fx /= fd; fy /= fd;
    var cside = fx >= 0 ? 1 : -1;
    var sweep = 0;
    if (m.phase === "charge1" && m.oleT) { var sk = Math.min(1, m.oleT / 0.35); sweep = sk * sk * (3 - 2 * sk); }
    var hh = hip(-cside); limb(hh[0], hh[1], hh[2]);
    if (m.phase === "charge2") {
      // Cape dropped: fists up, waiting for it.
      var g1 = P(cside * r * 0.62, -r * 0.3);
      limb(g1, { x: b.x + fx * r * 0.9 + cside * 4, y: b.y + fy * r * 0.9 - r * 0.25 }, { x: b.x + fx * r * 1.1, y: b.y + fy * r * 1.1 - r * 0.35 });
      return;
    }
    var out = m.cape == null ? 1 : Math.max(m.cape, 0.0001);
    // Sweeps from in front of him round to his side as the bull goes by.
    var ang0 = Math.atan2(fy, fx), ang = ang0 + (m.sx != null ? sweepSign(m, fx, fy) : 1) * sweep * 1.9;
    var hx = b.x + Math.cos(ang) * r * (0.9 + 0.5 * out), hy = b.y + Math.sin(ang) * r * (0.9 + 0.5 * out) - r * 0.3;
    var sh = P(cside * r * 0.62, -r * 0.3);
    limb(sh, { x: (sh.x + hx) / 2 + cside * 6, y: (sh.y + hy) / 2 + 6 }, { x: hx, y: hy });
    // The stick held out level on the bull's side, swinging across as it passes.
    var stick = sweep > 0 ? (cside > 0 ? 0 : Math.PI) + (cside > 0 ? 1 : -1) * Math.PI * sweep : (cside > 0 ? -0.15 : Math.PI + 0.15);
    drawCape(hx, hy, stick, r * 1.5 * out, m.t);
    return;
  }
  if (m.phase === "ko") {
    // The straight right, held out where the bull's face was.
    var pk = Math.min(1, m.punchT / 0.12), back = Math.max(0, (m.punchT - 0.3) / 0.4);
    var reach = r * (0.7 + 1.0 * pk * (1 - Math.min(1, back) * 0.6));
    var px = -m.fy, py = m.fx, sd = 1;
    var s0 = { x: b.x + px * r * 0.45 * sd, y: b.y + py * r * 0.45 * sd };
    var hd = { x: b.x + m.fx * reach + px * r * 0.2 * sd, y: b.y + m.fy * reach + py * r * 0.2 * sd };
    strokeLimb(arm, armColor(ch), function () { ctx.moveTo(s0.x, s0.y); ctx.lineTo(hd.x, hd.y); });
    drawGloveAt(hd.x, hd.y, gr * 1.15, ch, Math.atan2(m.fy, m.fx));
    var o0 = { x: b.x - px * r * 0.62, y: b.y - py * r * 0.62 };
    drawGloveAt(o0.x + m.fx * r * 0.5, o0.y + m.fy * r * 0.5, gr, ch, Math.atan2(m.fy, m.fx));
    return;
  }
  if (m.phase === "lift" || m.phase === "throw") {
    var lifting = m.phase === "lift" && bull && bull.held;
    var thrown = m.phase === "throw" ? Math.min(1, m.t / 0.25) : 0;
    [-1, 1].forEach(function (k) {
      var top = lifting ? (bull.z || 0) : 0;
      var hand = thrown > 0 ? P(k * r * 0.35 + m.tx * r * 0.9 * thrown, -r * 1.2 + m.ty * r * 0.9 * thrown)
        : (lifting ? P(k * r * 0.5, -Math.max(r * 0.5, Math.min(r * 1.5, top * 0.6))) : P(k * r * 0.8, r * 0.2));
      limb(P(k * r * 0.62, -r * 0.3), P(k * r * 1.05, (hand.y - b.y) * 0.5 - r * 0.2), hand);
    });
    return;
  }
  if (m.phase === "bow") {
    // Hand to his chest, the other arm swept out with the cape.
    var k2 = Math.min(1, m.t / 0.4);
    var cs2 = W / 2 > b.x ? 1 : -1;
    limb(P(-cs2 * r * 0.62, -r * 0.2), P(-cs2 * r * 0.4, r * 0.2), P(cs2 * r * 0.05, r * 0.05));
    var hx2 = b.x + cs2 * r * (0.9 + 0.6 * k2), hy2 = b.y - r * 0.1 + r * 0.2 * k2;
    limb(P(cs2 * r * 0.62, -r * 0.3), { x: b.x + cs2 * r * 1.1, y: b.y - r * 0.45 }, { x: hx2, y: hy2 });
    drawCape(hx2, hy2, cs2 > 0 ? 0.2 : Math.PI - 0.2, r * 1.4, m.t);
  }
}
function sweepSign(m, fx, fy) {
  // Turns the cape the opposite way to his sidestep, out across the bull's path.
  return (fx * m.sy - fy * m.sx) >= 0 ? -1 : 1;
}

// The red cape: a stick in his hand with the cloth hanging off it.
function drawCape(hx, hy, ang, len, t) {
  var ux = Math.cos(ang), uy = Math.sin(ang);
  var ex = hx + ux * len, ey = hy + uy * len;
  var drop = len * 0.85, wave = Math.sin(t * 9) * len * 0.08;
  ctx.save();
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(ex, ey);
  ctx.quadraticCurveTo(ex + ux * 8 + wave, ey + drop * 0.6, ex - ux * len * 0.1 + wave, ey + drop);
  ctx.quadraticCurveTo(hx + (ex - hx) * 0.5, hy + (ey - hy) * 0.5 + drop * 1.15 - wave, hx - ux * 4, hy + drop * 0.7);
  ctx.closePath();
  ctx.fillStyle = "#c41a1e"; ctx.fill();
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5; ctx.stroke();
  // Gold lining showing along the bottom edge.
  ctx.strokeStyle = "#f0a63c"; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ex - ux * len * 0.1 + wave, ey + drop - 3);
  ctx.quadraticCurveTo(hx + (ex - hx) * 0.5, hy + (ey - hy) * 0.5 + drop * 1.15 - wave - 3, hx - ux * 4, hy + drop * 0.7 - 3);
  ctx.stroke();
  // The stick.
  ctx.strokeStyle = "#5b3a1e"; ctx.lineWidth = 4; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(hx - ux * 6, hy - uy * 6); ctx.lineTo(ex + ux * 4, ey + uy * 4); ctx.stroke();
  ctx.restore();
}

// Roses on the mat (under the fighters) or in the air (over them).
function drawAuraRoses(flying) {
  if (!aura) return;
  aura.roses.forEach(function (r) {
    if (r.landed === flying) return;
    var s = 1 + r.z / 260;
    drawRose(r.x, r.y - r.z, r.rot, s);
  });
}
function drawRose(x, y, rot, s) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.strokeStyle = "#2f7a2a"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, 15); ctx.stroke();
  ctx.fillStyle = "#3d9a35";
  ctx.beginPath(); ctx.ellipse(3, 9, 3.2, 1.6, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#b5121b"; ctx.strokeStyle = "#5c0a0e"; ctx.lineWidth = 1;
  [[-2.6, 0], [2.6, 0], [0, -2.8]].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
  ctx.fillStyle = "#e0303a";
  ctx.beginPath(); ctx.arc(0, -0.4, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// The bull, its steam and (while Ilia holds it) up over his head.
function drawAuraActors() {
  if (!aura) return;
  aura.steam.forEach(function (s) {
    var k = s.t / s.life;
    ctx.fillStyle = "rgba(255,255,255," + (0.55 * (1 - k)) + ")";
    ctx.beginPath(); ctx.arc(s.x, s.y, 4 + 10 * k, 0, Math.PI * 2); ctx.fill();
  });
  var b = aura.bull;
  if (!b || b.alpha <= 0) return;
  var hidden = stadiumOn() ? false : (b.y > H + AF_BULL_R);
  if (hidden) return;
  ctx.save();
  ctx.globalAlpha = b.alpha;
  // Shadow on the ground (shrinks as it gets higher).
  if (b.y < H + AF_BULL_R) {
    var sh = 1 - Math.min(0.6, (b.z || 0) / 200);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath(); ctx.ellipse(b.x, b.y + AF_BULL_R * 0.85, AF_BULL_R * 0.95 * sh, AF_BULL_R * 0.3 * sh, 0, 0, Math.PI * 2); ctx.fill();
  }
  var running = b.phase === "run" || b.phase === "charge";
  var bob = running && !reduceMotion ? Math.abs(Math.sin(b.t * 22)) * 5 : 0;
  var lift = b.phase === "leap" ? 1 + (b.z / (AF_BULL_R * 1.6)) * 0.2 : 1;
  drawBull(b.x, b.y - (b.z || 0) - bob, AF_BULL_R * lift, b.face, b.spin || 0, b.ko, b.t, b.phase === "charge" || b.phase === "paw" || b.phase === "skid");
  ctx.restore();
}

// A bull in the same style as the fighters: a big dark ball with horns,
// ears, a pale muzzle with a nose ring, and angry eyes (X'd out once he's KO'd).
var afBullImg = null;
function bullImage() {
  if (!afBullImg && typeof AF_BULL_SRC !== "undefined") { afBullImg = new Image(); afBullImg.src = AF_BULL_SRC; }
  return afBullImg && afBullImg.complete && afBullImg.naturalWidth ? afBullImg : null;
}
function drawBull(x, y, r, face, spin, ko, t, angry) {
  var im = bullImage();
  if (im) {
    // Joe's picture: it faces right, so it's flipped to face the other way.
    var w = r * 2.4, h = w * AF_BULL_ASPECT;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(spin); ctx.scale(face, 1);
    ctx.drawImage(im, -w / 2, r * 0.95 - h, w, h);
    if (ko) {
      // X'd-out eyes over its face.
      var hx = w * (300 / 440 - 0.5), hy = r * 0.95 - h + h * (100 / 493);
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.lineCap = "round";
      [-1, 1].forEach(function (k) {
        var ex = hx + k * w * 0.07, ey = hy;
        ctx.beginPath(); ctx.moveTo(ex - 5, ey - 5); ctx.lineTo(ex + 5, ey + 5); ctx.moveTo(ex + 5, ey - 5); ctx.lineTo(ex - 5, ey + 5); ctx.stroke();
      });
    }
    ctx.restore();
    if (ko) {
      var tt0 = performance.now() / 1000, sy0 = spin > Math.PI / 2 ? y + r * 0.9 : y - r * 1.4;
      for (var i0 = 0; i0 < 3; i0++) {
        var a0 = tt0 * 5 + i0 * Math.PI * 2 / 3;
        drawAuraStar(x + Math.cos(a0) * r * 0.8, sy0 + Math.sin(a0) * r * 0.2, 7);
      }
    }
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  var ink = theme.wall, fo = face * r * 0.18;
  // Tail on the back side.
  ctx.strokeStyle = ink; ctx.lineWidth = 4; ctx.lineCap = "round";
  var tw = Math.sin(t * 10) * 0.3;
  ctx.beginPath(); ctx.moveTo(-face * r * 0.85, r * 0.1); ctx.quadraticCurveTo(-face * r * 1.25, r * (0.1 + tw), -face * r * 1.15, r * 0.55); ctx.stroke();
  ctx.fillStyle = "#2a1d17";
  ctx.beginPath(); ctx.arc(-face * r * 1.15, r * 0.6, r * 0.09, 0, Math.PI * 2); ctx.fill();
  // Horns (behind the head).
  [-1, 1].forEach(function (k) {
    var bx = k * r * 0.55 + fo * 0.5, by = -r * 0.62;
    ctx.fillStyle = "#efe3c4"; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx - k * r * 0.14, by + r * 0.12);
    ctx.quadraticCurveTo(bx + k * r * 0.55, by + r * 0.05, bx + k * r * 0.62, by - r * 0.55);
    ctx.quadraticCurveTo(bx + k * r * 0.3, by - r * 0.1, bx + k * r * 0.05, by - r * 0.1);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  });
  // Body/head.
  ctx.fillStyle = "#3a2a21"; ctx.strokeStyle = ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Shading on the far side.
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.arc(-face * r * 0.55, r * 0.15, r * 0.9, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Ears.
  [-1, 1].forEach(function (k) {
    ctx.fillStyle = "#3a2a21"; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(k * r * 0.95 + fo * 0.4, -r * 0.3, r * 0.26, r * 0.13, k * -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#8a5a48";
    ctx.beginPath(); ctx.ellipse(k * r * 0.98 + fo * 0.4, -r * 0.3, r * 0.15, r * 0.06, k * -0.4, 0, Math.PI * 2); ctx.fill();
  });
  // Muzzle.
  ctx.fillStyle = "#b98b73"; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(fo, r * 0.42, r * 0.5, r * 0.34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#3a2420";
  [-1, 1].forEach(function (k) { ctx.beginPath(); ctx.ellipse(fo + k * r * 0.2, r * 0.42, r * 0.07, r * 0.1, 0, 0, Math.PI * 2); ctx.fill(); });
  // Nose ring.
  ctx.strokeStyle = "#e3b52a"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(fo, r * 0.62, r * 0.13, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // Eyes.
  [-1, 1].forEach(function (k) {
    var ex = fo + k * r * 0.32, ey = -r * 0.08;
    if (ko) {
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ex - 6, ey - 6); ctx.lineTo(ex + 6, ey + 6); ctx.moveTo(ex + 6, ey - 6); ctx.lineTo(ex - 6, ey + 6); ctx.stroke();
      return;
    }
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(ex, ey, r * 0.13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = angry ? "#c41a1e" : "#111111";
    ctx.beginPath(); ctx.arc(ex + face * r * 0.03, ey + r * 0.02, r * 0.07, 0, Math.PI * 2); ctx.fill();
    // Angry brows slanting in.
    ctx.strokeStyle = ink; ctx.lineWidth = 3.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(ex - k * r * 0.17, ey - r * 0.22); ctx.lineTo(ex + k * r * 0.12, ey - r * 0.12); ctx.stroke();
  });
  ctx.restore();
  if (ko) {
    // Stars round its head.
    var tt = performance.now() / 1000;
    for (var i = 0; i < 3; i++) {
      var a = tt * 5 + i * Math.PI * 2 / 3;
      drawAuraStar(x + Math.cos(a) * r * 0.8, y - r * 1.1 + Math.sin(a) * r * 0.2, 7);
    }
  }
}
function drawAuraStar(x, y, s) {
  ctx.save(); ctx.fillStyle = "#ffd23f"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? s * 0.45 : s; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}

// The lights: the whole arena (stands, jumbotron and all) dark except the
// spotlight on Ilia; then the house lights back up with sweeping coloured
// beams. Drawn over everything but the floating text, in screen pixels.
function drawAuraLights(s, ox, oy) {
  if (!aura) return;
  var a = aura, owner = balls[a.ownerId];
  var cw = canvas.width, chh = canvas.height;
  var sx = ox + owner.x * s, sy = oy + owner.y * s, sr = owner.r * s * 2.1;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (a.dark > 0.001) {
    var spot = a.spot;
    var g = ctx.createRadialGradient(sx, sy, sr * 0.75 * spot, sx, sy, Math.max(1, sr * 1.25 * spot) + 1);
    var dk = 0.88 * a.dark;
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(4,3,8," + dk + ")");
    ctx.fillStyle = spot > 0 ? g : "rgba(4,3,8," + dk + ")";
    ctx.fillRect(0, 0, cw, chh);
    if (spot > 0) {
      // The beam coming down from the roof.
      ctx.globalCompositeOperation = "lighter";
      var bg = ctx.createLinearGradient(0, 0, 0, sy);
      bg.addColorStop(0, "rgba(255,236,190,0.02)");
      bg.addColorStop(1, "rgba(255,236,190," + (0.16 * a.dark) + ")");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(sx - sr * 0.25, 0); ctx.lineTo(sx + sr * 0.25, 0);
      ctx.lineTo(sx + sr * spot, sy); ctx.lineTo(sx - sr * spot, sy);
      ctx.closePath(); ctx.fill();
      // A flash as it slams on.
      if (spot < 1) { ctx.fillStyle = "rgba(255,245,220," + (0.5 * (1 - spot)) + ")"; ctx.beginPath(); ctx.arc(sx, sy, sr * 1.2, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalCompositeOperation = "source-over";
    }
  }
  if (a.lit > 0.001) {
    // Sweeping beams from the corners, gold and red.
    ctx.globalCompositeOperation = "lighter";
    var beams = [[0, 0, "255,210,90"], [cw, 0, "255,80,60"], [0, chh, "255,80,60"], [cw, chh, "255,210,90"]];
    beams.forEach(function (bm, i) {
      var base = Math.atan2(chh / 2 - bm[1], cw / 2 - bm[0]);
      var ang = base + Math.sin(a.sweep * 1.3 + i * 1.7) * 0.45, len = Math.sqrt(cw * cw + chh * chh), wd = 0.06;
      var lg = ctx.createLinearGradient(bm[0], bm[1], bm[0] + Math.cos(ang) * len, bm[1] + Math.sin(ang) * len);
      lg.addColorStop(0, "rgba(" + bm[2] + "," + (0.13 * a.lit) + ")");
      lg.addColorStop(1, "rgba(" + bm[2] + ",0)");
      ctx.fillStyle = lg;
      ctx.beginPath(); ctx.moveTo(bm[0], bm[1]);
      ctx.lineTo(bm[0] + Math.cos(ang - wd) * len, bm[1] + Math.sin(ang - wd) * len);
      ctx.lineTo(bm[0] + Math.cos(ang + wd) * len, bm[1] + Math.sin(ang + wd) * len);
      ctx.closePath(); ctx.fill();
    });
    // And the spotlight stays on him, softer.
    var m = owner.igbb;
    if (m && (m.phase === "dance" || m.phase === "spot")) {
      var sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 1.3);
      sg.addColorStop(0, "rgba(255,236,190," + (0.18 * a.lit) + ")"); sg.addColorStop(1, "rgba(255,236,190,0)");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, sy, sr * 1.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.restore();
  ctx.setTransform(s, 0, 0, s, ox, oy);
}
