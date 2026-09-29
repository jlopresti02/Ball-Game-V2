// Grappler finisher: when a grab would be the killing blow, the Grappler
// drives the opponent straight down into the bottom wall, pins them there
// and hammers them with heavy punches. The opponent can't drop below 1
// health until the last punch, so the full sequence always plays out.
"use strict";

var FIN_PUNCH_GAP = 0.55;  // seconds per punch (raise the fist, then drive it down)
var FIN_WINDUP = 0.38;     // how far into each punch the fist lands
var FIN_AFTER = 0.5;       // pause on the knockout before letting go

function updateFinisher(self, g, dt) {
  var gr = self.char.grapple, tgt = balls[g.targetId];
  g.t += dt;

  if (g.phase === "carry") {
    // Same grab-and-drag as the normal slam, but always to the bottom wall.
    var pt = Math.min(1, g.t / g.dur);
    g.pt = pt;
    var holdFrac = 0.22, ease = 0;
    if (pt >= holdFrac) {
      var tt = (pt - holdFrac) / (1 - holdFrac);
      ease = 1 - Math.pow(1 - tt, 3);
    }
    tgt.x = g.startX + (g.endX - g.startX) * ease;
    tgt.y = g.startY + (g.endY - g.startY) * ease;
    var dx0 = g.endX - g.startX, dy0 = g.endY - g.startY, dl = Math.sqrt(dx0 * dx0 + dy0 * dy0) || 1;
    self.x = tgt.x - (dx0 / dl) * (self.r + tgt.r - 2);
    self.y = tgt.y - (dy0 / dl) * (self.r + tgt.r - 2);
    if (pt >= 1) {
      // The slam into the floor.
      tgt.x = g.endX; tgt.y = g.endY;
      hurt(tgt, gr.finSlamDamage, "finisher", self.id);
      playSlam();
      if (!reduceMotion) { shake = Math.max(shake, 18); hitStop = Math.max(hitStop, 0.08); }
      impacts.push({ x: tgt.x, y: H, nx: 0, ny: -1, life: 0.4, max: 0.4, color: self.char.color });
      tgt.squash = { t: 0.18, max: 0.18, nx: 0, ny: -1 };
      burst(tgt);
      g.phase = "pin"; g.t = 0; g.thrown = 0; g.punchT = 0; g.landed = false;
      if (gr.finPunches < 1) finishOff(self, tgt); // no punches set: the slam is the finish
      checkEnd();
    }
    return;
  }

  // Pinned: the opponent is held flat against the bottom wall with the
  // Grappler on top of it.
  tgt.x = g.endX; tgt.y = g.endY;
  self.x = tgt.x; self.y = tgt.y - (self.r + tgt.r - 2);
  self.vx = 0; self.vy = 0;

  if (g.phase === "done") {
    if (g.t >= FIN_AFTER) endFinisher(self, g, tgt);
    return;
  }

  var total = Math.max(1, Math.round(gr.finPunches));
  g.punchT += dt;
  if (!g.landed && g.punchT >= FIN_WINDUP) {
    g.landed = true;
    var last = g.thrown === total - 1;
    var amount = gr.finPunchDamage;
    if (last) {
      // The last punch always finishes it, even if something (like a
      // celebration's damage bonus wearing off) changed the math mid-way.
      tgt.holdAtOne = false;
      amount = Math.max(amount, Math.ceil(tgt.hp / incomingMultiplier(tgt)));
    }
    hurt(tgt, amount, "finisher", self.id);
    playPunch(40);
    if (last) playSlam();
    if (!reduceMotion) {
      shake = Math.max(shake, last ? 22 : 15);
      hitStop = Math.max(hitStop, last ? 0.14 : 0.06);
    }
    tgt.squash = { t: 0.14, max: 0.14, nx: 0, ny: -1 };
    var cx = tgt.x, cy = tgt.y - tgt.r * 0.6;
    for (var i = 0; i < (last ? 26 : 14); i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, sp = 120 + Math.random() * 300;
      particles.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.3 + Math.random() * 0.3, max: 0.6, size: 2.5 + Math.random() * 4, color: tgt.char.color });
    }
    if (last) impacts.push({ x: cx, y: cy, nx: 0, ny: -1, life: 0.45, max: 0.45, color: self.char.color });
    checkEnd();
  }
  if (g.punchT >= FIN_PUNCH_GAP) {
    g.thrown++;
    g.punchT = 0;
    g.landed = false;
    if (g.thrown >= total || !tgt.alive) { g.phase = "done"; g.t = 0; }
  }
}

function finishOff(self, tgt) {
  tgt.holdAtOne = false;
  if (tgt.alive) hurt(tgt, Math.ceil(tgt.hp / incomingMultiplier(tgt)), "finisher", self.id);
  self.grapple.phase = "done";
  self.grapple.t = 0;
}

function endFinisher(self, g, tgt) {
  self.grapple = null;
  tgt.grappled = false;
  tgt.holdAtOne = false;
  // Hops off the pinned opponent and gets moving again.
  var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
  self.vx = Math.cos(a) * SPEED; self.vy = Math.sin(a) * SPEED;
  if (tgt.alive) {
    var b = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
    tgt.vx = Math.cos(b) * SPEED; tgt.vy = Math.sin(b) * SPEED;
  }
}

// Drawn after both fighters so the punching arm sits on top of everything.
function drawFinishers() {
  balls.forEach(function (self) {
    var g = self.grapple;
    if (!g || !g.finisher || g.phase === "carry") return;
    var tgt = balls[g.targetId];
    var r = self.r;
    ctx.save();
    ctx.lineCap = "round";

    // Pinning hand pressing the opponent down.
    var px = self.x - r * 0.95, py = tgt.y - tgt.r * 0.35;
    ctx.fillStyle = self.char.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(px, py, r * 0.36, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // Punching fist: raised high, then driven down onto the opponent.
    var up = { x: self.x + r * 0.9, y: self.y - r * 1.7 };
    var down = { x: tgt.x + r * 0.25, y: tgt.y - tgt.r * 0.45 };
    var k;
    if (g.phase === "done") {
      k = 1; // stays planted on the knockout
    } else if (g.punchT < FIN_WINDUP - 0.07) {
      var w = g.punchT / (FIN_WINDUP - 0.07);
      k = -0.15 * Math.sin(Math.PI * w); // pulls back up
    } else if (g.punchT < FIN_WINDUP) {
      k = (g.punchT - (FIN_WINDUP - 0.07)) / 0.07; // drives down fast
    } else {
      k = 1 - (g.punchT - FIN_WINDUP) / (FIN_PUNCH_GAP - FIN_WINDUP); // lifts back up
    }
    var fx = up.x + (down.x - up.x) * k, fy = up.y + (down.y - up.y) * k;
    var sx = self.x + r * 0.55, sy = self.y - r * 0.3;
    ctx.strokeStyle = theme.wall; ctx.lineWidth = r * 0.42;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.strokeStyle = self.char.color; ctx.lineWidth = r * 0.26;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(fx, fy); ctx.stroke();
    // Motion lines while it's coming down.
    if (k > 0.2 && k < 0.99 && g.punchT >= FIN_WINDUP - 0.07 && g.punchT < FIN_WINDUP) {
      ctx.globalAlpha = 0.4; ctx.lineWidth = 3; ctx.strokeStyle = self.char.color;
      for (var m = 1; m <= 3; m++) {
        ctx.beginPath(); ctx.moveTo(fx - r * 0.5 + m * r * 0.25, fy - r * 0.9); ctx.lineTo(fx - r * 0.5 + m * r * 0.25, fy - r * 0.4); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = self.char.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(fx, fy, r * 0.52, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  });
}
