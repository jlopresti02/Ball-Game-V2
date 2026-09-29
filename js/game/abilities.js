// Every attack's logic: projectile, punch, kick, grapple, power punch, rage, corner watch.
"use strict";

function updateAbilities(dt) {
  for (var i = 0; i < 2; i++) {
    var self = balls[i], other = balls[1 - i];
    if (!self.alive || self.grappled) continue;
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
            hurt(other, pu.damage, "punch", self.id);
            if (pu.knockback > 0) {
              var kx = other.x - self.x, ky = other.y - self.y, kd = Math.sqrt(kx * kx + ky * ky) || 1;
              other.vx += kx / kd * pu.knockback;
              other.vy += ky / kd * pu.knockback;
            }
            if (!reduceMotion) shake = 10;
            checkEnd();
          }
        }
        if (self.punch.t >= pu.speed) self.punch = null;
      }
    }

    if (self.char.hasKick) {
      self.kickCd = Math.max(0, self.kickCd - dt);
      var ki = self.char.kick;
      if (!self.kick && self.kickCd === 0 && other.alive && d < self.r + other.r + ki.reach) {
        self.kick = { t: 0, hit: false };
        self.kickCd = ki.cooldown;
      }
      if (self.kick) {
        self.kick.t += dt;
        var kwindup = ki.speed * 0.35;
        if (!self.kick.hit && self.kick.t >= kwindup) {
          self.kick.hit = true;
          if (other.alive) {
            hurt(other, ki.damage, "kick", self.id);
            if (ki.knockback > 0) {
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
      if (!self.grapple && self.grappleCd === 0 && other.alive && !other.grappled && !other.invincible && d < self.r + other.r + gr.reach) {
        beginGrapple(self, other);
      }
      if (self.grapple) {
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
          if (tgt.alive) {
            hurt(tgt, gr.damage, "grapple", self.id);
            if (!reduceMotion) shake = 14;
            burst(tgt);
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
            checkEnd();
          }
          tgt.grappled = false;
        }
        if (pt >= 1) self.grapple = null;
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
          if (pdd < reach) {
            ps2.hitCd = 0.2;
            hurt(other, ps2.dmg, "power", self.id);
            var kx = other.x - self.x, ky = other.y - self.y, kdd = Math.sqrt(kx * kx + ky * ky) || 1;
            other.vx += kx / kdd * pp.knockback;
            other.vy += ky / kdd * pp.knockback;
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
          self.watcherState = { phase: "travel", t: 0, spot: SIT_SPOTS[Math.floor(Math.random() * SIT_SPOTS.length)] };
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
    if (target.alive) {
      var px = p.x - target.x, py = p.y - target.y;
      if (px * px + py * py < (target.r + p.r) * (target.r + p.r)) {
        hurt(target, p.damage, "proj", p.ownerId);
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
