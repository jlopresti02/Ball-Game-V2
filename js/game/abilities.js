// Every attack's logic: projectile, punch, kick, grapple, power punch, rage, corner watch.
"use strict";

// ---------------------------------------------------------------
// Kick checks: a fighter with the kick ability that gets kicked has a
// chance (checkChance) to check it, raising its shin to take it with no
// damage or knockback, then kicking right back. It can check even while
// throwing its own kick (it pulls the kick to check). The kick back can't be
// checked, so exchanges can't loop.
// ---------------------------------------------------------------
var CHECK_TIME = 0.22; // the shin stays up this long before the kick back

function canCheck(b) {
  return b.char.hasKick && b.alive && !b.checkAnim && !(b.kick && b.kick.counter) && !b.grappled && !b.grapple && !b.slam &&
    !b.combo && !b.taunt && !b.flow && !b.sprawl && !b.sprawled && !b.invincible;
}

function tryCheckKick(defender, attacker) {
  if (attacker.kick && attacker.kick.counter) return false; // kick backs can't be checked
  if (!canCheck(defender) || Math.random() >= defender.char.kick.checkChance / 100) return false;
  defender.checkAnim = { t: 0, towardId: attacker.id };
  // Pulls its own kick (if it was throwing one) to check instead.
  defender.kick = null; defender.punch = null; defender.swing = null; defender.throwAnim = null;
  // The kicker whose kick got checked is stuck planted on that leg until the
  // kick back lands, so it always connects.
  attacker.checkStun = CHECK_TIME + defender.char.kick.speed * 0.35 + 0.08;
  attacker.vx = 0; attacker.vy = 0; defender.vx = 0; defender.vy = 0;
  floater(defender.x, defender.y - defender.r - 8, "CHECKED", "dodge");
  playPunch(14);
  if (!reduceMotion) shake = Math.max(shake, 6);
  return true;
}

// Through the check and the kick back windup, the checker closes in on the
// planted kicker so the kick back's leg physically reaches.
var KICKBACK_RANGE = 26;     // gap it closes to before kicking back
var KICKBACK_STEP = 650;     // how fast it steps in

function stepInForKickBack(b, atk) {
  var dx = atk.x - b.x, dy = atk.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var gap = d - b.r - atk.r;
  if (gap > KICKBACK_RANGE) {
    var sp = Math.min(KICKBACK_STEP, (gap - KICKBACK_RANGE) * 30);
    b.vx = dx / d * sp; b.vy = dy / d * sp;
  } else { b.vx = 0; b.vy = 0; }
}

// Runs every frame: once the shin comes down, the kick back starts.
function updateCheck(b, dt) {
  var ca = b.checkAnim;
  if (!ca) return;
  ca.t += dt;
  if (ca.t < CHECK_TIME) return;
  b.checkAnim = null;
  var atk = balls[ca.towardId];
  if (b.alive && atk && atk.alive && !b.grappled && !b.slam && !b.sprawl && !b.sprawled) {
    b.kick = { t: 0, hit: false, counter: true };
    b.kickCd = b.char.kick.cooldown;
  }
}

// ---------------------------------------------------------------
// Power punch wall slam: the victim is launched at high speed and
// pinballs off the walls, taking damage on every impact, then drops
// back to normal speed after the last one. While it's flying it's
// stunned: anything it was doing is cancelled and it can't attack.
// ---------------------------------------------------------------
var SLAM_MAX_TIME = 5; // safety net in case it somehow stops hitting walls

function beginWallSlam(target, dirX, dirY, pp) {
  target.slam = {
    hitsLeft: Math.max(1, Math.round(pp.wallSlams)),
    damage: pp.slamDamage,
    speed: Math.max(pp.knockback, SPEED),
    attackerId: 1 - target.id,
    t: 0
  };
  target.vx = dirX * target.slam.speed;
  target.vy = dirY * target.slam.speed;
  // Getting launched interrupts whatever the victim was in the middle of.
  target.punch = null; target.kick = null; target.throwAnim = null; target.jabAnim = null; target.swing = null; target.flow = null; target.checkAnim = null;
  if (target.powerState) target.powerState = null;
  if (target.rageState) target.rageState = null;
  if (target.watcherState && target.watcherState.phase === "travel") {
    target.watcherState = null;
    target.watcherCd = target.char.watcher.restDur;
  }
}

// Called by the physics step each time a ball bounces off a wall. (nx, ny)
// is the wall's direction pointing back into the arena (a corner combines both).
function onWallImpact(b, nx, ny) {
  var sl = b.slam;
  if (!sl || !b.alive) return;
  hurt(b, sl.damage, "slam", sl.attackerId);
  playSlam();
  var nl = Math.sqrt(nx * nx + ny * ny) || 1;
  nx /= nl; ny /= nl;
  var cx = b.x - nx * b.r, cy = b.y - ny * b.r; // where the ball meets the wall
  var attackerColor = balls[sl.attackerId].char.color;

  if (!reduceMotion) {
    shake = Math.max(shake, 18);
    hitStop = Math.max(hitStop, 0.06); // a split-second freeze sells the crunch
  }
  impacts.push({ x: cx, y: cy, nx: nx, ny: ny, life: 0.4, max: 0.4, color: attackerColor });
  b.squash = { t: 0.14, max: 0.14, nx: nx, ny: ny };

  // Debris sprays back off the wall: chunks of the ball plus dark wall chips.
  var baseAngle = Math.atan2(ny, nx);
  for (var i = 0; i < 26; i++) {
    var a = baseAngle + (Math.random() - 0.5) * 2.4, s = 140 + Math.random() * 360;
    var chip = i % 3 === 0;
    particles.push({
      x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 0.35 + Math.random() * 0.3, max: 0.65,
      size: chip ? 1.5 + Math.random() * 2.5 : 2.5 + Math.random() * 4.5,
      color: chip ? theme.wall : b.char.color
    });
  }

  sl.hitsLeft--;
  if (sl.hitsLeft <= 0 || !b.alive) {
    endWallSlam(b);
  } else {
    sl.speed *= 1.1; // each rebound comes off the wall even harder
    setSpeed(b, sl.speed);
  }
  checkEnd();
}

function endWallSlam(b) {
  b.slam = null;
  setSpeed(b, SPEED);
}

function setSpeed(b, speed) {
  var s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (s < 0.001) {
    var a = Math.random() * Math.PI * 2;
    b.vx = Math.cos(a) * speed; b.vy = Math.sin(a) * speed;
  } else {
    b.vx = b.vx / s * speed; b.vy = b.vy / s * speed;
  }
}

function updateAbilities(dt) {
  // Which fighter acts first flips randomly every frame, so neither side
  // always wins ties (like two identical fighters swinging at the same moment).
  var order = Math.random() < 0.5 ? [0, 1] : [1, 0];
  // Two Brawlers trading in the middle after both opened with a KO Rush.
  tickKoEnd(dt);
  if (updateSlugfest(dt)) return;
  // Grappler vs Grappler: if both could grab this frame, only one may.
  resolveGrabInitiative(dt);
  for (var oi = 0; oi < 2; oi++) {
    var i = order[oi];
    var self = balls[i], other = balls[1 - i];
    if (!self.alive || self.grappled || self.sprawled) continue;
    if (self.shocked || self.koOut || self.shelled) continue; // frozen by a KO Rush, knocked out, or shelled up under IGBB
    if (updateSpecial(self, other, dt)) continue; // a created character's special move
    if (updateKoRush(self, other, dt)) continue;
    if (self.sprawl) { updateSprawl(self, dt); continue; }
    if (self.checkStun > 0) continue; // planted after getting its kick checked
    if (self.slam) {
      self.slam.t += dt;
      if (self.slam.t > SLAM_MAX_TIME) endWallSlam(self);
      continue; // stunned while flying
    }
    // A critical-weave combo or the celebration after it takes over completely.
    if (updateWeave(self, other, dt)) continue;
    var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;

    if (self.throwAnim) {
      var ta = self.throwAnim;
      ta.t += dt;
      var tp = Math.min(1, ta.t / ta.dur);
      if (!ta.fired && tp >= ta.relEnd) {
        ta.fired = true;
        if (other.alive) {
          var pr2 = self.char.proj;
          var tdx = other.x - self.x, tdy = other.y - self.y, tdd = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
          projectiles.push({
            x: self.x + tdx / tdd * (self.r + 8), y: self.y + tdy / tdd * (self.r + 8),
            vx: tdx / tdd * pr2.speed, vy: tdy / tdd * pr2.speed,
            r: pr2.size, damage: pr2.damage, color: self.char.color, imgData: pr2.imgData,
            ownerId: self.id
          });
        }
      }
      if (tp >= 1) self.throwAnim = null;
    }

    if (self.char.hasProjectile) {
      self.shotTimer -= dt;
      if (self.shotTimer <= 0 && other.alive && !self.throwAnim) {
        self.shotTimer += self.char.proj.cooldown;
        // Windup, then a fast whip-forward release (projectile fires at
        // relEnd), then a short follow-through back to guard.
        self.throwAnim = { t: 0, dur: 0.5, wEnd: 0.55, relEnd: 0.72, fired: false };
      }
    }

    if (self.char.hasPunch) {
      self.punchCd = Math.max(0, self.punchCd - dt);
      var pu = self.char.punch;
      if (!self.punch && self.punchCd === 0 && other.alive && d < self.r + other.r + pu.reach) {
        self.punch = { t: 0, hit: false };
        self.punchCd = pu.cooldown;
      }
      if (self.punch) {
        self.punch.t += dt;
        var windup = pu.speed * 0.35;
        if (!self.punch.hit && self.punch.t >= windup) {
          self.punch.hit = true;
          if (other.alive) {
            var punchDealt = hurt(other, pu.damage, "punch", self.id);
            if (punchDealt > 0) playPunch(punchDealt);
            if (pu.knockback > 0 && !other.justDodged) {
              var kx = other.x - self.x, ky = other.y - self.y, kd = Math.sqrt(kx * kx + ky * ky) || 1;
              other.vx += kx / kd * pu.knockback;
              other.vy += ky / kd * pu.knockback;
            }
            // Light, rapid jabs (like the BMF's) only rattle the screen a little.
            if (!reduceMotion) shake = Math.max(shake, Math.min(10, 2 + pu.damage * 0.4));
            checkEnd();
          }
        }
        if (self.punch.t >= pu.speed) self.punch = null;
      }
    }

    if (self.char.hasSwing) updateSwing(self, other, dt);

    if (self.char.hasKick) {
      self.kickCd = Math.max(0, self.kickCd - dt);
      var ki = self.char.kick;
      if (!self.kick && self.kickCd === 0 && other.alive && d < self.r + other.r + ki.reach) {
        self.kick = { t: 0, hit: false };
        self.kickCd = ki.cooldown;
      }
      if (self.kick && self.kick.counter && !self.kick.hit) stepInForKickBack(self, other);
      if (self.kick) {
        self.kick.t += dt;
        var kwindup = ki.speed * 0.35;
        if (!self.kick.hit && self.kick.t >= kwindup) {
          self.kick.hit = true;
          if (other.alive && tryCheckKick(other, self)) {
            // Checked: no damage, no knockback; the defender kicks back.
          } else if (other.alive) {
            hurt(other, ki.damage, self.kick.counter ? "kickback" : "kick", self.id);
            if (ki.knockback > 0 && !other.justDodged) {
              var kkx = other.x - self.x, kky = other.y - self.y, kkd = Math.sqrt(kkx * kkx + kky * kky) || 1;
              other.vx += kkx / kkd * ki.knockback;
              other.vy += kky / kkd * ki.knockback;
            }
            if (!reduceMotion) shake = 12;
            checkEnd();
          }
        }
        if (self.kick.t >= ki.speed) self.kick = null;
      }
    }

    if (self.char.hasGrapple) {
      self.grappleCd = Math.max(0, self.grappleCd - dt);
      var gr = self.char.grapple;
      if (!self.grapple && !self.grabHold && self.grappleCd === 0 && other.alive && !other.grappled && !other.sprawl && !other.sprawled && !other.invincible && !grabBlockedByImpunity(self, other) && d < self.r + other.r + gr.reach) {
        // (attemptGrab handles the grab being weaved or blocked: an escape.)
        if (attemptGrab(self, other)) {
          if (self.initiativeReason) {
            // Shows why this Grappler won the race to the grab.
            floater((self.x + other.x) / 2, Math.min(self.y, other.y) - self.r - 30, self.initiativeReason, "note");
            self.initiativeReason = null;
          }
        } else {
          self.initiativeReason = null; // sprawled
        }
      }
      if (self.grapple && self.grapple.phase === "iowa") {
        updateIowaStyle(self, self.grapple, dt);
      } else if (self.grapple && self.grapple.finisher) {
        updateFinisher(self, self.grapple, dt);
      } else if (self.grapple) {
        var g = self.grapple;
        g.t += dt;
        var pt = Math.min(1, g.t / g.dur);
        g.pt = pt;
        // Brief hold while both hands grab on, then a hard, fast throw into the wall.
        var holdFrac = 0.22;
        var ease;
        if (pt < holdFrac) {
          ease = 0;
        } else {
          var tt = (pt - holdFrac) / (1 - holdFrac);
          ease = 1 - Math.pow(1 - tt, 3);
        }
        var tgt = balls[g.targetId];
        if (tgt.alive) {
          tgt.x = g.startX + (g.endX - g.startX) * ease;
          tgt.y = g.startY + (g.endY - g.startY) * ease;
          // The grappler itself follows the throw, staying attached right
          // behind the ball it's slamming instead of standing still.
          var dx0 = g.endX - g.startX, dy0 = g.endY - g.startY, dlen0 = Math.sqrt(dx0 * dx0 + dy0 * dy0) || 1;
          self.x = tgt.x - (dx0 / dlen0) * (self.r + tgt.r - 2);
          self.y = tgt.y - (dy0 / dlen0) * (self.r + tgt.r - 2);
        }
        if (!g.dealt && pt >= 1) {
          g.dealt = true;
          var iowa = false;
          if (tgt.alive) {
            hurt(tgt, gr.damage, "grapple", self.id);
            if (!reduceMotion) shake = 14;
            burst(tgt);
            checkEnd();
            if (tgt.alive && isGrapplerDuel(self, tgt)) {
              // Grappler vs Grappler: keeps pressing them into the wall,
              // then disengages (Iowa Style, see grapple-duel.js).
              beginIowaStyle(self, tgt, g);
              iowa = true;
            } else if (tgt.alive) {
              // Launch angle is randomized every time (within a spread off
              // the wall's own direction) so the pair doesn't fly off in the
              // exact same straight line on every slam.
              var wallAngle = Math.atan2(g.ny, g.nx);
              var spread = 65 * Math.PI / 180;
              var tgtAngle = wallAngle + (Math.random() * 2 - 1) * spread;
              var selfAngle = wallAngle + Math.PI + (Math.random() * 2 - 1) * spread;
              tgt.vx = Math.cos(tgtAngle) * 260; tgt.vy = Math.sin(tgtAngle) * 260;
              // The grappler never takes damage from its own slam, and
              // launches off with real speed of its own once it lets go,
              // rather than drifting away at a crawl.
              self.vx = Math.cos(selfAngle) * 320; self.vy = Math.sin(selfAngle) * 320;
              self.slamSafe = SLAM_SAFE_TIME; // landed the slam: can't be punished for it
            }
          }
          if (!iowa) { tgt.grappled = false; self.grapple = null; }
        } else if (pt >= 1 && !g.dealt) {
          self.grapple = null;
        }
      }
    }

    if (self.char.hasPowerPunch) {
      var pp = self.char.powerPunch;
      if (!self.powerState) {
        self.powerCd -= dt;
        if (self.powerCd <= 0) {
          self.powerCd += pp.cooldown;
          var spd0 = Math.sqrt(self.vx * self.vx + self.vy * self.vy);
          self.powerState = {
            phase: "charge", t: 0,
            preVX: self.vx, preVY: self.vy,
            crawlSpeed: Math.max(spd0 * 0.12, 12)
          };
        }
      } else if (self.powerState.phase === "charge") {
        var ps = self.powerState;
        ps.t += dt;
        var spd = Math.sqrt(self.vx * self.vx + self.vy * self.vy);
        if (spd > 0.001) {
          self.vx = self.vx / spd * ps.crawlSpeed;
          self.vy = self.vy / spd * ps.crawlSpeed;
        }
        if (ps.t >= pp.chargeDur) {
          ps.phase = "attack";
          ps.t = 0;
          ps.dmg = Math.round(pp.damageMin + Math.random() * (pp.damageMax - pp.damageMin));
          ps.hitCd = 0;
          self.vx = 0; self.vy = 0;
        }
      } else if (self.powerState.phase === "attack") {
        var ps2 = self.powerState;
        ps2.t += dt;
        ps2.hitCd = Math.max(0, ps2.hitCd - dt);
        // The hitbox tracks the actual swinging fist (same math as its
        // drawing) rather than a static ring around the body, so contact
        // lines up with what's on screen. Stays live for the whole spin.
        if (ps2.hitCd === 0 && other.alive) {
          var spinAngle = (ps2.t / pp.spinDur) * Math.PI * 2 * 3;
          var armLen = self.r * POWER_ARM_LEN_MULT;
          var fistX = self.x + Math.cos(spinAngle) * (self.r + armLen);
          var fistY = self.y + Math.sin(spinAngle) * (self.r + armLen);
          var pdx = other.x - fistX, pdy = other.y - fistY, pdd = Math.sqrt(pdx * pdx + pdy * pdy);
          var fistR = self.r * POWER_FIST_R_MULT;
          var reach = other.r + fistR + self.r * 0.35;
          // A fighter already being slammed around the walls can't be hit again
          // by the same spin, so one haymaker = one combo.
          if (pdd < reach && !other.slam) {
            ps2.hitCd = 0.2;
            var dealt = hurt(other, ps2.dmg, "power", self.id);
            var kx = other.x - self.x, ky = other.y - self.y, kdd = Math.sqrt(kx * kx + ky * ky) || 1;
            if (dealt > 0 && other.alive && !other.grappled && !other.grapple && pp.wallSlams > 0) {
              beginWallSlam(other, kx / kdd, ky / kdd, pp);
            } else if (!other.justDodged) {
              // Blocked, or slams turned off: just a regular shove.
              other.vx += kx / kdd * pp.knockback;
              other.vy += ky / kdd * pp.knockback;
            }
            if (!reduceMotion) shake = 16;
            checkEnd();
          }
        }
        if (ps2.t >= pp.spinDur) {
          self.vx = self.powerState.preVX;
          self.vy = self.powerState.preVY;
          self.powerState = null;
        }
      }
    }

    if (self.char.hasRage) {
      var rg = self.char.rage;
      var jabInterval = 0.13;
      if (!self.rageState) {
        self.rageCd -= dt;
        if (self.rageCd <= 0) {
          self.rageCd += rg.cooldown;
          var rspd0 = Math.sqrt(self.vx * self.vx + self.vy * self.vy);
          self.rageState = {
            phase: "charge", t: 0,
            crawlSpeed: Math.max(rspd0 * 0.12, 12)
          };
        }
      } else if (self.rageState.phase === "charge") {
        var rs = self.rageState;
        rs.t += dt;
        var rspd = Math.sqrt(self.vx * self.vx + self.vy * self.vy);
        if (rspd > 0.001) {
          self.vx = self.vx / rspd * rs.crawlSpeed;
          self.vy = self.vy / rspd * rs.crawlSpeed;
        }
        if (rs.t >= rg.chargeDur) {
          rs.phase = "attack";
          rs.t = 0;
          rs.hitTimer = 0;
          rs.thrown = 0;
          // Always launches straight at wherever the opponent currently
          // is, rather than a random heading — only falls back to random
          // if there's no one left to aim at.
          var rAngle;
          if (other.alive) {
            rAngle = Math.atan2(other.y - self.y, other.x - self.x);
          } else {
            rAngle = Math.random() * Math.PI * 2;
          }
          self.vx = Math.cos(rAngle) * rg.speed;
          self.vy = Math.sin(rAngle) * rg.speed;
        }
      } else if (self.rageState.phase === "attack") {
        var rs2 = self.rageState;
        rs2.t += dt;
        rs2.hitTimer -= dt;
        if (rs2.hitTimer <= 0 && rs2.thrown < rg.punchCount) {
          rs2.hitTimer += jabInterval;
          rs2.thrown++;
          self.jabAnim = { t: 0, dur: 0.11, sign: (rs2.thrown % 2 === 0) ? 1 : -1 };
          if (other.alive) {
            var rdx = other.x - self.x, rdy = other.y - self.y, rdd = Math.sqrt(rdx * rdx + rdy * rdy);
            if (rdd < self.r + other.r + rg.reach) {
              hurt(other, rg.punchDamage, "punch", self.id);
              if (!reduceMotion) shake = Math.max(shake, 4);
            }
          }
        }
        if (rs2.thrown >= rg.punchCount) {
          self.rageState = null;
        }
      }
    }

    if (self.char.hasWatcher) {
      var wc = self.char.watcher;
      var wst = self.watcherState;
      if (!wst) {
        // Up and about between sits.
        self.watcherCd -= dt;
        if (self.watcherCd <= 0) {
          // Picks a corner the other fighter isn't already sitting in or heading
          // to (matters when two Watchers are in the same match).
          var takenSpot = other.watcherState && other.watcherState.spot;
          var freeSpots = SIT_SPOTS.filter(function (sp) { return sp !== takenSpot; });
          self.watcherState = { phase: "travel", t: 0, spot: freeSpots[Math.floor(Math.random() * freeSpots.length)] };
        }
      } else if (wst.phase === "travel") {
        // Heading for one of the four corner seats.
        wst.t += dt;
        var wdx = wst.spot.x - self.x, wdy = wst.spot.y - self.y, wdd = Math.sqrt(wdx * wdx + wdy * wdy);
        if (wdd < 10) {
          // Arrived: plant in the corner, sit down, and become invincible.
          self.x = wst.spot.x; self.y = wst.spot.y;
          self.vx = 0; self.vy = 0;
          wst.phase = "charge"; wst.t = 0; wst.tickTimer = 0;
          self.invincible = true;
        } else if (wst.t > 6) {
          // Couldn't get there (something's in the way): give up and rest.
          self.watcherState = null;
          self.watcherCd = wc.restDur;
        } else {
          self.vx = wdx / wdd * wc.approachSpeed;
          self.vy = wdy / wdd * wc.approachSpeed;
        }
      } else {
        // Seated ("charge" then "laser"): rooted to the seat, invincible.
        self.x = wst.spot.x; self.y = wst.spot.y;
        self.vx = 0; self.vy = 0;
        self.invincible = true;
        wst.t += dt;
        if (wst.phase === "charge") {
          // The charge starts preDelay seconds after sitting and takes chargeDur.
          if (wst.t >= wc.preDelay + wc.chargeDur) {
            wst.phase = "laser"; wst.t = 0; wst.tickTimer = 0;
          }
        } else {
          // Lasers are up: each laser ticks on its own for tickDamage, and
          // every single tick pops its own small number right away — a
          // flurry of tiny hits rather than one lumped total per second.
          if (other.alive) {
            wst.tickTimer -= dt;
            while (wst.tickTimer <= 0 && other.alive) {
              wst.tickTimer += wc.tickInterval;
              var lasersN = Math.max(1, Math.round(wc.lasers));
              for (var li = 0; li < lasersN && other.alive; li++) {
                var dealtAmt = hurt(other, wc.tickDamage, "laser", self.id);
                if (dealtAmt > 0) {
                  var jx = (Math.random() - 0.5) * other.r * 1.3;
                  var jy = -other.r - 6 - Math.random() * 10;
                  var amtStr = (Math.round(dealtAmt * 100) / 100).toString();
                  floater(other.x + jx, other.y + jy, "-" + amtStr, "tick");
                }
              }
            }
            if (!other.alive) checkEnd();
          }
          if (wst.t >= wc.fireDur) {
            // Stand up and head back out toward the middle of the arena.
            var wang = Math.atan2(H / 2 - self.y, W / 2 - self.x) + (Math.random() - 0.5) * (Math.PI / 2);
            self.vx = Math.cos(wang) * SPEED; self.vy = Math.sin(wang) * SPEED;
            self.watcherState = null;
            self.invincible = false;
            self.watcherCd = wc.restDur;
          }
        }
      }
    }
  }

  projectiles = projectiles.filter(function (p) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) return false;
    var target = balls[1 - p.ownerId];
    if (target.alive && !p.weaved) {
      var px = p.x - target.x, py = p.y - target.y;
      if (px * px + py * py < (target.r + p.r) * (target.r + p.r)) {
        hurt(target, p.damage, "proj", p.ownerId);
        if (target.justDodged && !target.invincible) {
          p.weaved = true; // slipped: the shot flies on past
          return true;
        }
        for (var i = 0; i < 6; i++) {
          var a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 120;
          particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.3, max: 0.3, size: 2.5, color: p.color });
        }
        checkEnd();
        return false;
      }
    }
    return true;
  });
}
