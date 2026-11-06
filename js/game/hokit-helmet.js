// Josh Hokit's Helmet Charge (Joe, 2026-11-06). A few times a fight, at random:
//   suit    a football helmet drops onto his head (gold, 67 on the sides)
//   set     he gets down in a three-point stance while a red path shows
//           where he's going: from him, through where they are, all the way
//           across the ring to the cage
//   charge  he runs the path like a linebacker; whoever's still in it gets
//           run over (helmetCharge.damage and a knockback into the cage)
//   bonk    he runs into the cage, then pulls the helmet off
// As he puts the helmet on, the jumbotron (a banner in the test arena)
// plays an ad for the San Francisco 67'ers, a 49ers parody: "Watch them
// this Sunday". It goes through queueJumboAd like every fighter ad, so it
// never overlaps another ad and waits out any special (truckees-ad.js);
// his own charge doesn't hold it up (`adOwn`).
// Runs on b.igbb (move "helmetcharge"). Config: char.helmetCharge.
"use strict";

var HC_SUIT = 0.55, HC_BONK = 0.7;
var NINERS_SHOW = 5.0;
var ninersShow = 0, ninersId = 0;
var sf67LogoImg = new Image(); sf67LogoImg.src = SF67_LOGO_SRC;

function helmetChargeOn(b) { return !!(b && b.igbb && b.igbb.move === "helmetcharge"); }
function hcRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }

// From makeBall.
function initHelmetCharge(b) {
  var cfg = b.char.helmetCharge;
  b.helmetN = 0;
  b.helmetT = cfg ? hcRand(cfg.first) : Infinity;
}

function hcPutOn(b, on) {
  var cfg = b.char.helmetCharge;
  if (on) {
    if (!b.hcLookOff) b.hcLookOff = b.char.look;
    b.char = Object.assign({}, b.char, { look: Object.assign({}, b.hcLookOff, cfg.helmet, { helmetLogo: SF67_LOGO_SRC }) });
  } else if (b.hcLookOff) {
    b.char = Object.assign({}, b.char, { look: b.hcLookOff });
    b.hcLookOff = null;
  }
}

// From the abilities loop, before the special. True while it's running.
function updateHelmetCharge(self, other, dt) {
  var cfg = self.char.helmetCharge;
  if (!cfg) return false;
  if (!self.igbb) {
    if (!started || over || self.helmetN >= cfg.max) return false;
    self.helmetT -= dt;
    if (self.helmetT > 0 || !canStartIgbb(self, other) || swordDuelActive()) return false;
    clearActions(self);
    self.helmetN++;
    self.helmetT = hcRand(cfg.every);
    self.igbb = { move: "helmetcharge", phase: "suit", t: 0, adOwn: true, hit: false };
    floater(self.x, self.y - self.r - 30, "HELMET ON!", "note");
    startNinersAd(self);
  }
  var m = self.igbb;
  if (m.move !== "helmetcharge") return false;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (over) { endHelmetCharge(self); return false; }

  if (m.phase === "suit") {
    if (m.t >= HC_SUIT * 0.7 && !m.on) { // it lands on his head
      m.on = true; hcPutOn(self, true);
      self.squash = { t: 0.18, max: 0.18, nx: 0, ny: 1 };
      playPunch(8);
    }
    if (m.t >= HC_SUIT) {
      m.phase = "set"; m.t = 0;
      // The path: from him, through where they are, to the cage.
      var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      m.dx = dx / d; m.dy = dy / d; m.sx = self.x; m.sy = self.y;
      m.len = hcRayToWall(self.x, self.y, m.dx, m.dy, self.r);
      floater(self.x, self.y - self.r - 30, "HUT! HUT!", "crit");
      crowdReact(0.7);
    }
    return true;
  }
  if (m.phase === "set") {
    if (m.t >= cfg.warn) { m.phase = "charge"; m.t = 0; m.run = 0; self.invincible = true; playBullCharge(0.6, BULL_LEAD_IN); floater(self.x, self.y - self.r - 30, "HIKE!", "crit"); }
    return true;
  }
  if (m.phase === "charge") {
    self.immuneCd = 1;
    var step = cfg.speed * dt;
    m.run = Math.min(m.len, m.run + step);
    self.x = m.sx + m.dx * m.run; self.y = m.sy + m.dy * m.run;
    if (!reduceMotion && Math.random() < 0.6) {
      particles.push({ x: self.x - m.dx * self.r, y: self.y + self.r * 0.6, vx: -m.dx * 80 + (Math.random() - 0.5) * 60, vy: -m.dy * 80 - 30, life: 0.35, max: 0.35, size: 3 + Math.random() * 3, color: "#d8cdb5" });
    }
    // Running them over.
    var ox = other.x - self.x, oy = other.y - self.y;
    if (!m.hit && other.alive && !other.invincible && ox * ox + oy * oy < (self.r + other.r) * (self.r + other.r)) {
      m.hit = true;
      var dealt = hurt(other, cfg.damage, "igbb", self.id); // can't be slipped or blocked, only got out of the way of
      if (dealt > 0) {
        floater(other.x, other.y - other.r - 30, "RUN OVER!", "crit");
        other.flash = 0.16;
        if (!reduceMotion) { shake = Math.max(shake, 18); hitStop = Math.max(hitStop, 0.1); }
        playPunch(cfg.damage);
        impacts.push({ x: (self.x + other.x) / 2, y: (self.y + other.y) / 2, nx: m.dx, ny: m.dy, life: 0.35, max: 0.35, color: "#ffffff" });
        // Knocked off to the side of the path, and into the cage.
        var side = (-m.dy * ox + m.dx * oy) >= 0 ? 1 : -1;
        var kx = m.dx * 0.7 - m.dy * side * 0.7, ky = m.dy * 0.7 + m.dx * side * 0.7, kl = Math.sqrt(kx * kx + ky * ky);
        if (other.alive) beginWallSlam(other, kx / kl, ky / kl, { knockback: cfg.knockback, wallSlams: cfg.wallSlams, slamDamage: cfg.slamDamage });
        checkEnd();
      }
    }
    if (m.run >= m.len) { // into the cage
      m.phase = "bonk"; m.t = 0; self.invincible = false;
      self.squash = { t: 0.25, max: 0.25, nx: m.dx, ny: m.dy };
      if (!reduceMotion) shake = Math.max(shake, 12);
      playSlam();
      if (!m.hit && other.alive) floater(other.x, other.y - other.r - 30, "MISSED!", "dodge");
    }
    return true;
  }
  // Bonked into the cage, then the helmet comes off.
  self.immuneCd = 0;
  if (m.t >= HC_BONK) { endHelmetCharge(self); return false; }
  return true;
}

// How far he can run from (x, y) along (dx, dy) before the cage stops him.
function hcRayToWall(x, y, dx, dy, r) {
  var t = Infinity;
  if (dx > 1e-6) t = Math.min(t, (W - r - x) / dx); else if (dx < -1e-6) t = Math.min(t, (r - x) / dx);
  if (dy > 1e-6) t = Math.min(t, (H - r - y) / dy); else if (dy < -1e-6) t = Math.min(t, (r - y) / dy);
  return Math.max(0, t);
}

function endHelmetCharge(self) {
  self.igbb = null;
  self.invincible = false;
  self.immuneCd = 0;
  hcPutOn(self, false);
}

// Every frame from update().
function tickHelmetCharge(dt) {
  if (ninersShow > 0) ninersShow = Math.max(0, ninersShow - dt);
}

// ---------------------------------------------------------------- the ad

function startNinersAd(b) {
  queueJumboAd(NINERS_SHOW, function () {
    ninersShow = NINERS_SHOW; ninersId = b.id;
    playNinersAd();
  }, b);
}

function drawNinersJumbo(x, y, w, h) {
  if (ninersShow <= 0 || !balls || !balls[ninersId]) return;
  var b = balls[ninersId], t = NINERS_SHOW - ninersShow, a = Math.min(1, t / 0.25, ninersShow / 0.3), k = h / 250;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  // The field: mowed stripes, yard lines and numbers scrolling past.
  ctx.fillStyle = "#2f7a33"; ctx.fillRect(x, y, w, h);
  var yd = w / 8, off = (t * 90) % (yd * 2);
  for (var i = -2; i < 10; i++) {
    var lx = x + i * yd - off;
    if (i % 2 === 0) { ctx.fillStyle = "#378a3b"; ctx.fillRect(lx, y, yd, h); }
    ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.fillRect(lx - 1.5, y, 3, h);
    ctx.font = "900 " + (26 * k) + "px Impact, 'Arial Black', sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillText(String(10 * (1 + ((i + 40) % 5))), lx, y + h * 0.88);
  }
  // Team colors across the top and bottom.
  ctx.fillStyle = "#aa0000"; ctx.fillRect(x, y, w, h * 0.07); ctx.fillRect(x, y + h * 0.93, w, h * 0.07);
  ctx.fillStyle = "#b3995d"; ctx.fillRect(x, y + h * 0.07, w, h * 0.02); ctx.fillRect(x, y + h * 0.91, w, h * 0.02);
  // The logo, spinning in.
  if (sf67LogoImg.complete && sf67LogoImg.naturalWidth) {
    var lp = Math.min(1, t / 0.5), lh = h * 0.5 * (0.6 + 0.4 * easeOut(lp)), lw = lh * SF67_LOGO_SIZE[0] / SF67_LOGO_SIZE[1];
    ctx.save();
    ctx.translate(x + w * 0.16, y + h * 0.42); ctx.rotate((1 - easeOut(lp)) * -Math.PI);
    ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 10 * k;
    ctx.drawImage(sf67LogoImg, -lw / 2, -lh / 2, lw, lh);
    ctx.restore();
  }
  // Hokit in his helmet, ball tucked, charging through the right of the ad.
  var look = Object.assign({}, b.hcLookOff || b.char.look, b.char.helmetCharge.helmet, { helmetLogo: SF67_LOGO_SRC });
  var r = h * 0.24, run = Math.min(1, t / 0.8), cx = x + w * (1.15 - 0.3 * easeOut(run)), cy = y + h * 0.56 + Math.abs(Math.sin(t * 9)) * -r * 0.08;
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(-0.12); ctx.translate(-cx, -cy);
  drawFighterArt(ctx, cx, cy, r, look, "#0b0f12", { layout: "contained", name: b.char.name });
  ctx.lineWidth = 3; ctx.strokeStyle = "#0b0f12"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  drawNinersFootball(cx + r * 0.95, cy + r * 0.25, r * 0.42);
  drawGlove(ctx, cx + r * 0.9, cy + r * 0.45, r * 0.34, look, "#0b0f12", 0.4);
  drawGlove(ctx, cx - r * 1.1, cy - r * 0.1, r * 0.34, look, "#0b0f12", Math.PI + 0.3); // stiff arm
  ctx.restore();
  // The words.
  var tx = x + w * 0.31, tw = w * 0.42, flash = Math.sin(t * 9) > 0;
  var ol = ["#2a0000", "#b3995d", "#ffffff"];
  adText("SAN FRANCISCO", tx + tw / 2, y + h * 0.2, 34 * k, ["#ffffff", "#e8e8e8"], tw, 1, ol);
  adText("67'ERS", tx + tw / 2, y + h * 0.45, 92 * k, ["#d11a1a", "#8a0000"], tw * 0.8, 1 + Math.max(0, 0.3 - t) * 1.2, ol);
  adText("WATCH THEM THIS SUNDAY", tx + tw / 2, y + h * 0.74, 30 * k, flash ? ["#ffe9a8", "#d8b964"] : ["#ffffff", "#e6e6e6"], tw, 1, ["#2a0000", "#aa0000", "#ffffff"]);
  ctx.strokeStyle = flash ? "#b3995d" : "#aa0000"; ctx.lineWidth = 6; ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
  ctx.restore();
}
function drawNinersFootball(x, y, s) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(-0.5);
  ctx.fillStyle = "#7a3e1d"; ctx.strokeStyle = "#2a140a"; ctx.lineWidth = Math.max(1.5, s * 0.08);
  ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = Math.max(1, s * 0.07);
  ctx.beginPath(); ctx.moveTo(-s * 0.35, 0); ctx.lineTo(s * 0.35, 0); ctx.stroke();
  for (var i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * s * 0.14, -s * 0.12); ctx.lineTo(i * s * 0.14, s * 0.12); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-s * 0.78, -s * 0.3); ctx.lineTo(-s * 0.78, s * 0.3); ctx.moveTo(s * 0.78, -s * 0.3); ctx.lineTo(s * 0.78, s * 0.3); ctx.stroke();
  ctx.restore();
}
function drawNinersBanner() {
  if (ninersShow <= 0 || stadiumOn()) return;
  drawNinersJumbo(10, 10, W - 20, 110);
}

// ---------------------------------------------------------------- the path

// Under the fighters: the red path he's about to run, the helmet dropping in.
function drawHelmetChargeUnder() {
  var now = performance.now() / 1000;
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!helmetChargeOn(b) || !b.alive || (m.phase !== "set" && m.phase !== "charge")) return;
    var wdt = b.char.helmetCharge.width * 2, len = m.len + b.r;
    var show = m.phase === "set" ? Math.min(1, m.t / 0.15) : Math.max(0, 1 - m.t / 0.6);
    if (show <= 0) return;
    var pulse = 0.7 + 0.3 * Math.sin(now * 18);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    ctx.translate(m.sx, m.sy); ctx.rotate(Math.atan2(m.dy, m.dx));
    ctx.globalAlpha = show;
    ctx.fillStyle = "rgba(220,20,20," + (0.22 * pulse) + ")";
    ctx.fillRect(0, -wdt / 2, len, wdt);
    ctx.strokeStyle = "rgba(220,20,20," + (0.85 * pulse) + ")"; ctx.lineWidth = 3; ctx.setLineDash([14, 10]);
    ctx.beginPath(); ctx.moveTo(0, -wdt / 2); ctx.lineTo(len, -wdt / 2); ctx.moveTo(0, wdt / 2); ctx.lineTo(len, wdt / 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(235,30,30," + (0.75 * pulse) + ")";
    var o = (now * 220) % 46;
    for (var xx = o; xx < len - 10; xx += 46) {
      ctx.beginPath(); ctx.moveTo(xx, -wdt * 0.28); ctx.lineTo(xx + 14, 0); ctx.lineTo(xx, wdt * 0.28); ctx.lineTo(xx + 6, 0); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  });
}
// Over the fighters: the helmet dropping onto his head.
function drawHelmetChargeOver() {
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!helmetChargeOn(b) || !b.alive || m.phase !== "suit" || m.on) return;
    var k = Math.min(1, m.t / (HC_SUIT * 0.7)), r = b.r;
    var look = Object.assign({}, b.hcLookOff || b.char.look, b.char.helmetCharge.helmet, { helmetLogo: SF67_LOGO_SRC });
    // Just the helmet, falling from above his head.
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 3);
    ctx.translate(b.x, b.y - (1 - k * k) * r * 2.2);
    drawFootballHelmet(ctx, r, look, theme.wall);
    ctx.restore();
  });
}
