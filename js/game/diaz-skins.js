// The Diaz brothers' skins (Joe, 2026-11-15, from his photos).
//
// look.diazChin  a chin beard and nothing else: no moustache, no soul patch,
//                no cheek stubble. The number is its half-width (a share of r):
//                0.15 for Nate, 0.2 for Nick's fuller one. Drawn from
//                drawArtHeadLayer (fighter-art.js).
// look.flat      a skinny-fat body: barely-there muscle lines, no six pack, a
//                soft belly curve over the waistband and a belly button. Read
//                by drawArtBody (fighter-art.js), which calls drawSkinnyFatCore.

function drawDiazChin(c, r, look) {
  var bc = look.beardColor || look.hairColor, w = r * (typeof look.diazChin === "number" ? look.diazChin : 0.15), rnd = artRand(209);
  var chin = function () {
    c.beginPath();
    c.moveTo(-w, -r * 0.32 - w * 0.1);
    c.quadraticCurveTo(0, -r * 0.355 - w * 0.1, w, -r * 0.32 - w * 0.1);
    c.quadraticCurveTo(w, -r * 0.21, 0, -r * 0.19);
    c.quadraticCurveTo(-w, -r * 0.21, -w, -r * 0.32 - w * 0.1);
    c.closePath();
  };
  c.save();
  c.globalAlpha = 0.82; c.fillStyle = bc; chin(); c.fill();
  chin(); c.clip();
  c.fillStyle = shadeHex(bc, 0.3); c.globalAlpha = 0.45;
  for (var k = 0; k < 90; k++) c.fillRect((rnd() * 2 - 1) * w * 1.1, -r * 0.38 + rnd() * r * 0.2, r * 0.014, r * 0.014);
  c.restore();
}

// Called in drawArtBody's torso space in place of the six pack.
function drawSkinnyFatCore(c, r, lw, line) {
  var bg = c.createRadialGradient(0, r * 0.3, r * 0.05, 0, r * 0.28, r * 0.5);
  bg.addColorStop(0, "rgba(255,255,255,0.16)"); bg.addColorStop(1, "rgba(255,255,255,0)");
  c.globalAlpha = 1; c.fillStyle = bg;
  c.beginPath(); c.ellipse(0, r * 0.28, r * 0.5, r * 0.3, 0, 0, Math.PI * 2); c.fill();
  c.globalAlpha = 0.18; c.strokeStyle = line; c.lineWidth = lw(0.03);
  c.beginPath(); c.moveTo(0, -r * 0.02); c.lineTo(0, r * 0.16); c.stroke();
  c.globalAlpha = 0.3; c.lineWidth = lw(0.035);
  c.beginPath(); c.arc(0, r * 0.05, r * 0.48, 0.55, Math.PI - 0.55); c.stroke();  // soft belly over the waistband
  c.globalAlpha = 0.2; c.fillStyle = line;
  c.beginPath(); c.arc(0, r * 0.2, r * 0.025, 0, Math.PI * 2); c.fill();  // belly button
}
