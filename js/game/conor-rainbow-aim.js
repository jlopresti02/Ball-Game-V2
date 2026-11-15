// Where Conor McGregor's Pot o' Gold rainbow aims (Christian, 2026-11-14),
// on top of Joe's beam (rainbow-beam.js). Joe's path tracks them until a
// second before it fires, then locks on where they were, and they kept
// rolling out of it. Now he reads where they're heading: the path points
// `lead` seconds ahead of them along the way they're rolling (off the cage
// walls the way they'll bounce, and never past him: rolling into him, they
// stop there), and it swings round smoothly as they change course instead of
// jumping. It still locks `lock` seconds before he tips the pot and flashes,
// so a fighter that changes course, gets knocked off line or bounces off him
// in that last second gets out of it.
// Config under potOfGold in his character file: `lock` (seconds before the
// tip that the path stops moving) and `lead` (seconds of rolling it aims
// ahead of them). Leave them out and it's Joe's aim: a 1 second lock
// (RB_LOCK), right at them. The beam's width is potOfGold.width.
// A beam clash with Charles still aims straight at him.
"use strict";

var RBA_STEP = 0.05;  // the look-ahead rolls them on in steps this long
var RBA_EASE = 0.15;  // how quickly the path swings round to a new heading (seconds)

// How long before it fires the path locks (rainbow-beam.js, conor-pot-of-gold.js).
function rbLock(b) {
  var cfg = b && b.char && b.char.potOfGold;
  return cfg && cfg.lock != null ? cfg.lock : RB_LOCK;
}

// A point to aim at (rbAim, rainbow-beam.js, once a tick while it tracks).
function rbAimAt(self, other) {
  var cfg = self.char.potOfGold, lead = (cfg && cfg.lead) || 0, m = self.igbb;
  if (lead <= 0 || !m || m.pair) return other;
  // Not moving (held, pinned, in a shell): where they are.
  var moving = m.aimX != null && (other.x !== m.aimX || other.y !== m.aimY);
  m.aimX = other.x; m.aimY = other.y;
  var p = moving ? rbaAhead(self, other, lead) : other;
  var a = Math.atan2(p.y - self.y, p.x - self.x);
  if (m.aimA != null) a = m.aimA + rbaWrap(a - m.aimA) * (1 - Math.exp(-TICK / RBA_EASE));
  m.aimA = a;
  return { x: self.x + Math.cos(a) * 100, y: self.y + Math.sin(a) * 100 };
}

// Where they'll be `lead` seconds from now, rolling on as they are.
function rbaAhead(self, other, lead) {
  var x = other.x, y = other.y, vx = other.vx || 0, vy = other.vy || 0, r = other.r, R = self.r + other.r;
  var n = Math.max(1, Math.ceil(lead / RBA_STEP - 1e-9)), h = lead / n;
  for (var i = 0; i < n; i++) {
    var nx = x + vx * h, ny = y + vy * h;
    if (nx < r) { nx = 2 * r - nx; vx = -vx; } else if (nx > W - r) { nx = 2 * (W - r) - nx; vx = -vx; } // off the cage
    if (ny < r) { ny = 2 * r - ny; vy = -vy; } else if (ny > H - r) { ny = 2 * (H - r) - ny; vy = -vy; }
    if ((nx - self.x) * (nx - self.x) + (ny - self.y) * (ny - self.y) < R * R) break; // they'd run into him: they stop there
    x = nx; y = ny;
  }
  return { x: x, y: y };
}

function rbaWrap(d) { return d - Math.PI * 2 * Math.floor((d + Math.PI) / (Math.PI * 2)); }
