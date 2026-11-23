// Islam Makhachev's beard (Joe, 2026-11-22): a clean vector outline traced from
// Joe's front-on photo (seg.py -> vec.py in project-files/previews/islam-makhachev: the side facing the camera, smoothed,
// simplified and mirrored), fitted inside the face: sideburns from the
// hairline in front of the ears, his cheek line, bare upper lip, the soul
// patch under the lip with bare patches either side, chin down to the jaw.
var ISLAM_PTS = [[36.0,206.0],[-39.0,205.0],[-63.1,187.0],[-86.4,143.0],[-106.0,137.2],[-108.3,85.0],[-99.1,65.0],[-106.3,54.0],[-102.6,34.0],[-117.1,6.0],[-115.1,1.0],[-101.0,3.0],[-97.3,28.0],[-74.4,60.0],[-72.1,73.0],[-44.4,100.0],[-35.0,117.0],[-24.0,122.4],[-10.0,116.1],[-8.1,97.0],[-1.0,91.5],[7.6,96.0],[11.9,118.0],[24.0,122.4],[34.0,118.0],[44.4,100.0],[72.7,72.0],[74.4,60.0],[97.3,28.0],[101.0,3.0],[116.3,2.0],[103.0,32.0],[106.5,53.0],[99.2,64.0],[108.3,85.0],[106.6,136.0],[86.4,143.0],[63.0,187.1],[36.0,206.0]];  // photo px: x from the centre line, y from the top row
var ISLAM_FIT = { sx: 0.64 / 119, top: -0.65, bottom: -0.22, rows: 206 };
function islamBeardPath(c, r) {
  var f = ISLAM_FIT, sy = (f.bottom - f.top) / f.rows, P = ISLAM_PTS, n = P.length;
  var X = function (i) { return P[(i + n) % n][0] * f.sx * r; }, Y = function (i) { return (f.top + P[(i + n) % n][1] * sy) * r; };
  c.beginPath();
  c.moveTo((X(0) + X(1)) / 2, (Y(0) + Y(1)) / 2);
  for (var i = 1; i <= n; i++) c.quadraticCurveTo(X(i), Y(i), (X(i) + X(i + 1)) / 2, (Y(i) + Y(i + 1)) / 2);
  c.closePath();
}
// Lower cheeks and chin: fills from under the soul patch down over the jaw
// line, so the beard covers the whole bottom of the face (added to the
// traced outline as a second subpath).
function islamJawPath(c, r) {
  // top edge stays under the bare patches beside the soul patch (they end at -0.42r)
  c.moveTo(-0.62 * r, -0.47 * r);
  c.lineTo(-0.68 * r, -0.42 * r);
  c.quadraticCurveTo(-0.54 * r, -0.15 * r, 0, -0.14 * r);
  c.quadraticCurveTo(0.54 * r, -0.15 * r, 0.68 * r, -0.42 * r);
  c.lineTo(0.62 * r, -0.47 * r);
  c.quadraticCurveTo(0.35 * r, -0.32 * r, 0, -0.31 * r);
  c.quadraticCurveTo(-0.35 * r, -0.32 * r, -0.62 * r, -0.47 * r);
  c.closePath();
}
// Next to the ears: a strip of sideburn that runs down right in front of
// each ear to the jaw (nothing over, behind or under the ear; the ears are
// drawn again on top so their front edge sits cleanly on it).
function islamEarPath(c, r, side) {
  c.beginPath();
  c.moveTo(side * 0.52 * r, -0.74 * r);
  c.lineTo(side * 0.66 * r, -0.74 * r);
  c.quadraticCurveTo(side * 0.69 * r, -0.58 * r, side * 0.68 * r, -0.42 * r);
  c.lineTo(side * 0.5 * r, -0.4 * r);
  c.closePath();
}
function islamEars(c, r, look, line, lw) {
  var lwd = lw(0.035), cauli = look.ears === "cauliflower";
  [-1, 1].forEach(function (s) {
    var ex = s * r * 0.76, ey = -r * 0.56, er = r * (cauli ? 0.14 : 0.12);
    c.fillStyle = shadeHex(look.skin, -0.06); c.strokeStyle = line; c.lineWidth = lwd;
    c.beginPath(); c.ellipse(ex, ey, er * 0.7, er, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.beginPath(); c.arc(ex - s * er * 0.1, ey, er * 0.55, s > 0 ? Math.PI * 0.5 : -Math.PI * 0.5, s > 0 ? Math.PI * 1.5 : Math.PI * 0.5); c.stroke();
    if (cauli) {
      c.beginPath(); c.arc(ex, ey - er * 0.35, er * 0.28, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(ex + s * er * 0.1, ey + er * 0.3, er * 0.22, 0, Math.PI * 2); c.stroke();
    }
  });
}
// Called at the end of drawArtHeadLayer (fighter-art.js) when look.islamBeard is set.
function drawIslamBeard(c, r, look, line, lw) {
  if (look.kratosPaint) drawKratosPaint(c, r); // the god of war's red stripe while his axe is out (islam-axe.js)
  var bc = look.beardColor || look.hairColor, rnd = artRand(311), f = ISLAM_FIT, S = 2;
  // build the beard once per size on its own canvas so the traced outline, the
  // jaw fill and the strips by the ears merge into one shape
  var key = Math.round(r * 2) + bc, cv = islamBeardCache[key];
  if (!cv) {
    if (++islamBeardCount > 40) { islamBeardCache = {}; islamBeardCount = 1; }  // sizes change with zoom: keep the cache small
    cv = islamBeardCache[key] = islamBuildBeard(r, bc, rnd, f, S);
  }
  c.save();
  c.fillStyle = "rgba(0,0,0,0.16)";
  c.beginPath(); c.ellipse(0, r * -0.13, r * 0.3, r * 0.04, 0, 0, Math.PI * 2); c.fill();
  c.shadowColor = "rgba(0,0,0,0.45)"; c.shadowBlur = r * 0.03;  // soft clean edge
  c.drawImage(cv, -r, -r, 2 * r, r);
  c.restore();
  islamEars(c, r, look, line, lw);
}
var islamBeardCache = {}, islamBeardCount = 0;
function islamBuildBeard(r, bc, rnd, f, S) {
  var cv = document.createElement("canvas"); cv.width = Math.ceil(2 * r * S); cv.height = Math.ceil(r * S);
  var o = cv.getContext("2d"); o.scale(S, S); o.translate(r, r);
  o.beginPath(); o.arc(0, 0, r * 0.985, 0, Math.PI * 2); o.clip();  // stays on the ball
  o.fillStyle = bc;
  islamBeardPath(o, r); o.fill();
  o.beginPath(); islamJawPath(o, r); o.fill();
  islamEarPath(o, r, -1); o.fill(); islamEarPath(o, r, 1); o.fill();
  o.globalCompositeOperation = "source-atop";
  var g = o.createLinearGradient(0, f.top * r, 0, -0.14 * r);
  g.addColorStop(0, "rgba(255,255,255,0.08)"); g.addColorStop(0.6, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.22)");
  o.fillStyle = g; o.fillRect(-r, -r, 2 * r, r);
  o.lineCap = "round"; o.lineWidth = r * 0.009;
  for (var k = 0; k < 300; k++) {
    var x = (rnd() * 2 - 1) * 0.7, y = f.top + rnd() * (-0.15 - f.top), len = 0.035 + rnd() * 0.025, dx = -x * 0.1;
    o.strokeStyle = rnd() < 0.6 ? shadeHex(bc, 0.3) : shadeHex(bc, -0.35);
    o.globalAlpha = 0.28 + rnd() * 0.2;
    o.beginPath(); o.moveTo(x * r, y * r); o.quadraticCurveTo((x + dx * 0.3) * r, (y + len * 0.6) * r, (x + dx) * r, (y + len) * r); o.stroke();
  }
  return cv;
}
