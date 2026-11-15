// Carlos Prates's real look, from Joe's photos (2026-11-15), switched on by
// look.pratesSkin in his character file:
// - hair: skin fade on the sides, a short curly top and a Clark Kent curl
//   dropping onto his forehead (his look.hair is "bald" so the stock hair stays off)
// - face: a thin pencil moustache and a light chin goatee (light stubble from look.beard)
// - neck: small ornate letters on the throat and a thin vine up the left side
// - chest: his "Muay Thai" script traced from a photo (look.pratesChest), on his
//   chest only: clipped under the collarbones, inside the shoulders, above the pec lines
// - a navel ring
// His sleeves (tattoos.armDecalRight / armDecalLeft, traced from a photo) show
// only on his arms, never on the ball: drawTracedArm in fighter-art.js.
// Hooks: drawPratesInk in prates.js (head) and drawArtBody in fighter-art.js (chest).

function drawPratesSkinHead(c, r, look, lw) {
  drawPratesSkinHair(c, r, look, lw);
  drawPratesSkinFace(c, r, look);
  drawPratesSkinNeck(c, r, lw);
}

function drawPratesSkinNeck(c, r, lw) {
    c.save(); c.lineCap='round'; c.lineJoin='round';
    var ink='rgba(20,22,32,0.6)'; c.strokeStyle=ink; c.fillStyle=ink;
    // throat: a small block of ornate letters under the chin
    c.save(); c.translate(0,-r*0.19); c.scale(0.55,0.55); c.translate(0,r*0.13);
    c.lineWidth=lw(0.016);
    c.beginPath(); c.moveTo(-r*0.06,-r*0.17); c.lineTo(-r*0.06,-r*0.09); c.stroke();
    c.beginPath(); c.moveTo(-r*0.06,-r*0.17); c.bezierCurveTo(r*0.0,-r*0.18,r*0.01,-r*0.14,-r*0.06,-r*0.135); c.bezierCurveTo(r*0.02,-r*0.13,r*0.02,-r*0.09,-r*0.06,-r*0.09); c.stroke();
    c.beginPath(); c.moveTo(r*0.03,-r*0.17); c.lineTo(r*0.03,-r*0.09); c.moveTo(r*0.0,-r*0.145); c.lineTo(r*0.06,-r*0.145); c.stroke();
    c.lineWidth=lw(0.012);
    c.beginPath(); c.moveTo(-r*0.11,-r*0.075); c.quadraticCurveTo(0,-r*0.06,r*0.1,-r*0.078); c.stroke();
    c.restore(); c.lineWidth=lw(0.01);
    // a thin vine curling up the left side of his neck (screen right) toward the ear
    c.beginPath(); c.moveTo(r*0.05,-r*0.2); c.bezierCurveTo(r*0.14,-r*0.2,r*0.18,-r*0.22,r*0.24,-r*0.25); c.bezierCurveTo(r*0.3,-r*0.27,r*0.3,-r*0.33,r*0.34,-r*0.36); c.stroke();
    [[0.15,-0.215],[0.25,-0.27],[0.31,-0.32]].forEach(function (q) {c.beginPath(); c.arc(r*q[0],r*q[1],r*0.018,0,Math.PI*1.5); c.stroke();});
    c.restore();
}

function drawPratesSkinHair(c, r, look, lw) {
    var hc=look.hairColor, sk=look.skin, gr=artRand(613);
    c.save();
    // skin fade on the sides: dark at the top of the fade, down to skin above the ears
    var side=function () { c.beginPath();
      c.moveTo(-r,-r*0.5); c.lineTo(-r*0.8,-r*0.54); c.quadraticCurveTo(-r*0.72,-r*0.62,-r*0.62,-r*0.66);
      c.lineTo(r*0.62,-r*0.66); c.quadraticCurveTo(r*0.72,-r*0.62,r*0.8,-r*0.54); c.lineTo(r,-r*0.5); c.lineTo(r,-r); c.lineTo(-r,-r); c.closePath(); };
    var fg=c.createLinearGradient(0,-r*0.95,0,-r*0.52);
    fg.addColorStop(0,mixHex(sk,hc,0.9)); fg.addColorStop(0.5,mixHex(sk,hc,0.6)); fg.addColorStop(1,mixHex(sk,hc,0.15));
    c.fillStyle=fg; side(); c.fill();
    c.save(); side(); c.clip(); c.fillStyle=hc; c.globalAlpha=0.45;
    for(var k=0;k<170;k++){ var sx=(gr()<0.5?-1:1)*r*(0.56+gr()*0.42), sy=-r*(0.56+gr()*0.4); c.fillRect(sx,sy,r*0.014,r*0.014); }
    c.restore();
    // the top: short, dense and textured, a sharp lined-up front with squared temples,
    // a little longer at the front with a slight wave
    var top=function () { c.beginPath();
      c.moveTo(-r*0.64,-r);
      c.lineTo(-r*0.64,-r*0.88); c.quadraticCurveTo(-r*0.62,-r*0.76,-r*0.5,-r*0.735);
      // a row of small curls along the front edge
      var n=14; for(var i=0;i<n;i++){ var x1=-r*0.5+(i+1)*r*1.0/n, xm=x1-r*0.5/n; c.quadraticCurveTo(xm,-r*(0.7+(i%2)*0.01),x1,-r*0.735); }
      c.quadraticCurveTo(r*0.62,-r*0.76,r*0.64,-r*0.88); c.lineTo(r*0.64,-r); c.closePath(); };
    var tg=c.createLinearGradient(0,-r,0,-r*0.7); tg.addColorStop(0,shadeHex(hc,-0.2)); tg.addColorStop(1,shadeHex(hc,0.08));
    c.fillStyle=tg; top(); c.fill();
    c.strokeStyle=shadeHex(hc,-0.45); c.globalAlpha=0.7; c.lineWidth=lw(0.012); c.stroke(); c.globalAlpha=1;
    // packed little curls: a dark coil with a light catch on each
    c.save(); top(); c.clip(); c.lineCap='round';
    for(var row=0;row<6;row++) for(var col=-9;col<=9;col++){
      var tx=col*r*0.07+(row%2)*r*0.035+(gr()-0.5)*r*0.02, ty=-r*(0.735+row*0.045)+(gr()-0.5)*r*0.012, a=gr()*6, cr=r*(0.02+gr()*0.006);
      c.lineWidth=lw(0.011); c.strokeStyle='rgba(0,0,0,0.5)'; c.beginPath(); c.arc(tx,ty,cr,a,a+4.4); c.stroke();
      c.lineWidth=lw(0.008); c.strokeStyle='rgba(255,255,255,0.18)'; c.beginPath(); c.arc(tx,ty-cr*0.2,cr*0.6,Math.PI*1.1,Math.PI*1.7); c.stroke(); }
    c.restore(); c.save();
    // the Clark Kent curl: one lock dropping out of the front onto the forehead, curling back on itself
    var cx=-r*0.04, cy=-r*0.725;
    c.translate(cx,cy); c.scale(1.7,1.7); c.translate(-cx,-cy);
    var lock=function () { c.beginPath();
      c.moveTo(cx-r*0.06,cy+r*0.005);
      c.bezierCurveTo(cx-r*0.07,cy+r*0.06,cx+r*0.0,cy+r*0.1,cx+r*0.05,cy+r*0.085);
      c.bezierCurveTo(cx+r*0.09,cy+r*0.07,cx+r*0.075,cy+r*0.025,cx+r*0.04,cy+r*0.035);
      c.bezierCurveTo(cx+r*0.06,cy+r*0.05,cx+r*0.025,cy+r*0.07,cx+r*0.0,cy+r*0.05);
      c.bezierCurveTo(cx-r*0.02,cy+r*0.035,cx-r*0.0,cy+r*0.01,cx+r*0.03,cy-r*0.005);
      c.closePath(); };
    c.fillStyle=shadeHex(hc,0.05); lock(); c.fill();
    c.strokeStyle=shadeHex(hc,-0.5); c.lineWidth=lw(0.01); c.stroke();
    c.strokeStyle='rgba(255,255,255,0.22)'; c.lineWidth=lw(0.008);
    c.beginPath(); c.moveTo(cx-r*0.045,cy+r*0.02); c.quadraticCurveTo(cx-r*0.04,cy+r*0.07,cx+r*0.03,cy+r*0.075); c.stroke();
    c.restore();
    c.restore();
}

function drawPratesSkinFace(c, r, look) {
    var bc=look.beardColor||look.hairColor, gr=artRand(411);
    c.save();
    // pencil moustache: thin, the ends dipping down past the corners of the mouth
    var st=function () { c.beginPath();
      c.moveTo(-r*0.2,-r*0.37);
      c.quadraticCurveTo(-r*0.15,-r*0.44,0,-r*0.445);
      c.quadraticCurveTo(r*0.15,-r*0.44,r*0.2,-r*0.37);
      c.quadraticCurveTo(r*0.14,-r*0.415,0,-r*0.425);
      c.quadraticCurveTo(-r*0.14,-r*0.415,-r*0.2,-r*0.37); c.closePath(); };
    c.globalAlpha=0.7; c.fillStyle=bc; st(); c.fill();
    // light goatee: a soft patch under the lip and on the chin
    var ch=function () { c.beginPath();
      c.moveTo(-r*0.035,-r*0.36); c.lineTo(r*0.035,-r*0.36);
      c.quadraticCurveTo(r*0.09,-r*0.28,r*0.075,-r*0.235); c.quadraticCurveTo(0,-r*0.215,-r*0.075,-r*0.235);
      c.quadraticCurveTo(-r*0.09,-r*0.28,-r*0.035,-r*0.36); c.closePath(); };
    c.globalAlpha=0.38; ch(); c.fill();
    c.save(); ch(); c.clip(); c.globalAlpha=0.35;
    for(var k=0;k<40;k++) c.fillRect((gr()*2-1)*r*0.09,-r*0.36+gr()*r*0.14,r*0.012,r*0.012);
    c.restore();
    c.restore();
}

// From drawArtBody (contained layout), after the head layer.
function drawPratesSkinBody(c, r, look) {
  if (look.pratesChest) {
    var im = artDecalImage(look.pratesChest);
    if (im.complete && im.naturalWidth) {
      c.save();
        // clip to his chest only: under the collarbones, inside the shoulders, above the pec lines
        // (built in the torso's own squeezed space, the same one drawArtBody uses)
        c.save(); c.translate(0,r*0.11); c.scale(0.86,0.59);
        var pw=0.6; c.beginPath();
        c.moveTo(-r*0.58,-r*0.7); c.quadraticCurveTo(-r*0.3,-r*0.58,-r*0.06,-r*0.66);
        c.lineTo(r*0.06,-r*0.66); c.quadraticCurveTo(r*0.3,-r*0.58,r*0.58,-r*0.7);
        c.quadraticCurveTo(r*0.64,-r*0.5,r*(pw+0.02),-r*0.3);
        c.quadraticCurveTo(r*0.35,-r*0.04,r*0.04,-r*0.18);
        c.lineTo(-r*0.04,-r*0.18);
        c.quadraticCurveTo(-r*0.35,-r*0.04,-r*(pw+0.02),-r*0.3);
        c.quadraticCurveTo(-r*0.64,-r*0.5,-r*0.58,-r*0.7); c.closePath();
        c.restore(); c.clip();
        c.globalCompositeOperation='multiply'; c.globalAlpha=0.9;
        var W=r*0.92, H=r*0.25, x0=-W/2, y0=-r*0.2, N=40, sw=im.naturalWidth/N;
        for(var i=0;i<N;i++){ var u=(i+0.5)/N-0.5;
          var dy=-Math.pow(Math.abs(u)*2,2)*r*0.07;          // ends lift with the pecs
          var sc=1-Math.pow(Math.abs(u)*2,2)*0.12;           // narrows round the sides
          c.drawImage(im,i*sw,0,sw+0.6,im.naturalHeight,x0+i*W/N,y0+dy+H*(1-sc)/2,W/N+0.6,H*sc); }
      c.restore();
    }
  }
  // Navel ring
  c.save(); c.strokeStyle = "#d8dde3"; c.lineWidth = Math.max(1, r * 0.02);
  c.beginPath(); c.arc(0, r * 0.335, r * 0.02, 0, Math.PI * 2); c.stroke(); c.restore();
}
