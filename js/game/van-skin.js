// Joshua Van's look from Joe's five photos (Joe, 2026-11-18), turned on by
// look.vanReal in characters/joshua-van.json. Each function takes over from
// its counterpart in van.js (one-line hooks there):
//   drawVanRealHead    his chest piece (tattoos.vanChestReal) drawn from the
//                      head layer so it can run right up to the chin line and
//                      stop there, then a thin moustache and a narrow chin
//                      goatee (drawVanGoatee)
//   drawVanRealShorts  red with darker red zigzags, black and white stripes,
//                      JOSHUA 1:9 in white (drawVanShorts)
// The chest piece, placed from the square-on photo: angel wings along the
// collarbones (cut off at the chin line), "Blessed" across both pecs (the
// real lettering traced off his photo, look.vanBlessed), two roses at the
// bottom middle of the chest with their stems meeting where the sternum
// meets the abs, and small praying hands between them. His sleeve is on his
// LEFT ARM only (tattoos.armDecalLeft, a traced decal with "Romans 8:31");
// his right arm and his body carry no arm ink.
// c is at the ball's centre, r its radius (contained layout).
"use strict";

function drawVanRealChest(c, r, look, lw) {
    const R=k=>r*k, ink='rgba(14,16,24,0.88)', grey='rgba(40,44,58,';
    c.save();
    // the chest only: under the chin and neck, down to the waistband
    // cut off along the chin line (drawArtHeadLayer's jaw curve), just under its stroke
    c.beginPath(); c.moveTo(-r,-R(0.39)); c.lineTo(-R(0.68),-R(0.39)); c.quadraticCurveTo(-R(0.52),-R(0.15),0,-R(0.15));
    c.quadraticCurveTo(R(0.52),-R(0.15),R(0.68),-R(0.39)); c.lineTo(r,-R(0.39)); c.lineTo(r,R(0.37)); c.lineTo(-r,R(0.37)); c.closePath(); c.clip();
    // soft grey cloud shading behind the script and roses
    [[0,-0.08,0.48,0.09,0.14],[0,0.14,0.36,0.1,0.1]].forEach(q=>{
      const g=c.createRadialGradient(R(q[0]),R(q[1]),0,R(q[0]),R(q[1]),R(q[2]));
      g.addColorStop(0,grey+q[4]+')'); g.addColorStop(1,grey+'0)'); c.fillStyle=g;
      c.save(); c.translate(R(q[0]),R(q[1])); c.scale(1,q[3]/q[2]); c.translate(-R(q[0]),-R(q[1])); c.beginPath(); c.arc(R(q[0]),R(q[1]),R(q[2]),0,Math.PI*2); c.fill(); c.restore(); });
    // angel wings: top edge along the collarbones, feathers hanging down and out
    [-1,1].forEach(sd=>{ c.save(); c.scale(sd,1);
      const wing=()=>{ c.beginPath(); c.moveTo(R(0.06),-R(0.3));
        c.quadraticCurveTo(R(0.35),-R(0.3),R(0.7),-R(0.35));
        c.quadraticCurveTo(R(0.74),-R(0.27),R(0.66),-R(0.2));
        for(let f=0;f<6;f++){ const x0=R(0.66-f*0.09), x1=R(0.66-(f+1)*0.09), yb=-R(0.2-f*0.012)+R(0.025);
          c.quadraticCurveTo((x0+x1)/2+R(0.01),yb+R(0.045),x1,yb-R(0.012)); }
        c.quadraticCurveTo(R(0.1),-R(0.17),R(0.06),-R(0.3)); c.closePath(); };
      const wg=c.createLinearGradient(0,-R(0.37),0,-R(0.16)); wg.addColorStop(0,grey+'0.4)'); wg.addColorStop(1,grey+'0.12)'); c.fillStyle=wg; wing(); c.fill();
      c.save(); wing(); c.clip();
      c.strokeStyle='rgba(14,16,24,0.35)'; c.lineWidth=lw(0.008);
      for(let row=0;row<4;row++){ for(let f=0;f<10-row*2;f++){            // rows of feathers, long ones at the outside
        const x=R(0.68-f*0.065-row*0.04), y=-R(0.34-row*0.045)+f*R(0.006);
        c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+R(0.004),y+R(0.05),x-R(0.03),y+R(0.06)); c.quadraticCurveTo(x-R(0.04),y+R(0.03),x-R(0.035),y); c.stroke(); } }
            c.restore();
      c.strokeStyle=ink; c.lineWidth=lw(0.011); c.globalAlpha=0.7; wing(); c.stroke(); c.globalAlpha=1;
      c.restore(); });
    // roses: layered petals, deep red with dark edges
    const rose=(x,y,rr,rot)=>{ c.save(); c.translate(R(x),R(y)); c.rotate(rot||0); c.scale(1.25,1); const q=R(rr);
      c.fillStyle='rgba(120,14,26,0.92)'; c.beginPath(); c.arc(0,0,q,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(40,4,10,0.85)'; c.lineWidth=lw(0.009);
      for(let ring=0;ring<3;ring++){ const n=5-ring, pr=q*(0.95-ring*0.28);
        for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+ring*0.6;
          c.fillStyle=ring===2?'rgba(110,10,22,0.95)':'rgba('+(170+ring*15)+',26,40,0.9)';
          c.beginPath(); c.ellipse(Math.cos(a)*pr*0.45,Math.sin(a)*pr*0.45,pr*0.55,pr*0.38,a+Math.PI/2,0,Math.PI*2); c.fill(); c.stroke(); } }
      c.fillStyle='rgba(60,6,14,0.9)'; c.beginPath(); c.arc(0,0,q*0.12,0,Math.PI*2); c.fill();
      c.restore(); };
    const leaf=(x,y,a,len)=>{ c.save(); c.translate(R(x),R(y)); c.rotate(a); const L=R(len);
      c.fillStyle='rgba(70,96,64,0.85)'; c.strokeStyle='rgba(16,24,16,0.8)'; c.lineWidth=lw(0.008);
      c.beginPath(); c.moveTo(0,0); c.quadraticCurveTo(L*0.5,-L*0.4,L,0); c.quadraticCurveTo(L*0.5,L*0.4,0,0); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(0,0); c.lineTo(L*0.9,0); c.stroke(); c.restore(); };
    // two roses at the bottom of the piece, one under each pec, their stems curving in to the sternum
    c.strokeStyle='rgba(30,40,30,0.85)'; c.lineWidth=lw(0.013);
    [-1,1].forEach(sd=>{ c.beginPath(); c.moveTo(sd*R(0.12),R(0.02)); c.bezierCurveTo(sd*R(0.1),R(0.06),sd*R(0.03),R(0.06),0,R(0.085)); c.stroke();
      leaf(sd*0.075,0.05,sd>0?2.3:0.8,0.035); });
    rose(-0.14,-0.005,0.045,0.2); rose(0.14,-0.005,0.045,-0.3);
    // praying hands down the sternum: two palms pressed together, fingers up and leaning,
    // thumbs on the near side, sleeve cuffs at the wrists and rosary beads hanging off them
    c.save(); c.translate(0,R(0.0)); c.rotate(0.06); c.scale(0.38,0.42);
    const palm=sd=>{ c.beginPath(); c.moveTo(0,-R(0.1));
      c.bezierCurveTo(sd*R(0.005),-R(0.12),sd*R(0.04),-R(0.1),sd*R(0.05),-R(0.05));
      c.quadraticCurveTo(sd*R(0.075),R(0.0),sd*R(0.06),R(0.06)); c.lineTo(0,R(0.06)); c.closePath(); };
    [-1,1].forEach(sd=>{ const hg=c.createLinearGradient(sd*R(0.05),0,0,0); hg.addColorStop(0,grey+'0.5)'); hg.addColorStop(1,grey+'0.18)');
      c.fillStyle=hg; palm(sd); c.fill(); c.strokeStyle=ink; c.lineWidth=lw(0.009); palm(sd); c.stroke(); });
    c.lineWidth=lw(0.006); c.strokeStyle='rgba(14,16,24,0.6)';
    c.beginPath(); c.moveTo(0,-R(0.11)); c.lineTo(0,R(0.06)); c.stroke();                      // where the palms meet
    [-0.07,-0.045,-0.02].forEach(y=>{ c.beginPath(); c.moveTo(-R(0.045),R(y)); c.quadraticCurveTo(-R(0.025),R(y)+R(0.008),-R(0.005),R(y)); c.stroke(); }); // finger joints
    c.beginPath(); c.ellipse(R(0.035),R(0.01),R(0.014),R(0.035),-0.3,0,Math.PI*2); c.stroke();   // thumb
    c.fillStyle=grey+'0.55)'; c.beginPath(); c.moveTo(-R(0.07),R(0.06)); c.lineTo(R(0.07),R(0.06)); c.lineTo(R(0.075),R(0.1)); c.lineTo(-R(0.075),R(0.1)); c.closePath(); c.fill(); c.strokeStyle=ink; c.stroke(); // cuffs
    c.fillStyle=ink; for(let bd=0;bd<8;bd++){ c.beginPath(); c.arc(-R(0.06)-Math.sin(bd*0.5)*R(0.01),-R(0.02)+bd*R(0.013),R(0.0055),0,Math.PI*2); c.fill(); }
    c.restore();
    // "Blessed": the real lettering traced off the front photo, across both pecs
    const bim=look.vanBlessed&&artDecalImage(look.vanBlessed);
    if(bim&&bim.complete&&bim.naturalWidth){ c.save(); c.translate(R(0.02),-R(0.115)); c.rotate(-0.03);
      const bw=R(0.72), bh=bw*bim.naturalHeight/bim.naturalWidth*0.55;
      c.globalAlpha=0.95; c.drawImage(bim,-bw/2,-bh/2,bw,bh); c.restore(); }
    c.restore();
}

function drawVanRealHead(c, r, look, line, lw) {
  if (look.tattoos && look.tattoos.vanChestReal) drawVanRealChest(c, r, look, lw);
    const bc=look.beardColor, gr=artRand(731);
    const stache=()=>{c.beginPath(); c.moveTo(-r*0.17,-r*0.4); c.quadraticCurveTo(-r*0.08,-r*0.45,0,-r*0.44); c.quadraticCurveTo(r*0.08,-r*0.45,r*0.17,-r*0.4);
      c.quadraticCurveTo(r*0.08,-r*0.425,0,-r*0.42); c.quadraticCurveTo(-r*0.08,-r*0.425,-r*0.17,-r*0.4); c.closePath();};
    const chin=()=>{c.beginPath(); c.moveTo(-r*0.05,-r*0.385); c.quadraticCurveTo(0,-r*0.395,r*0.05,-r*0.385);
      c.quadraticCurveTo(r*0.085,-r*0.3,r*0.06,-r*0.235); c.quadraticCurveTo(0,-r*0.21,-r*0.06,-r*0.235); c.quadraticCurveTo(-r*0.085,-r*0.3,-r*0.05,-r*0.385); c.closePath();};
    c.save();
    [stache,chin].forEach((sh,i)=>{ c.globalAlpha=i?0.32:0.6; c.fillStyle=bc; sh(); c.fill();
      c.save(); sh(); c.clip(); c.globalAlpha=i?0.35:0.8; for(let k=0;k<(i?110:70);k++) c.fillRect((gr()*2-1)*r*0.18,-r*(i?0.4:0.46)+gr()*r*(i?0.2:0.07),r*(i?0.008:0.013),r*(i?0.008:0.013)); c.restore(); });
    c.restore();
}

function drawVanRealShorts(c, r, look, sTop, band, name) {
    const dark=shadeHex(look.shorts,-0.4);
    c.save(); c.beginPath(); c.rect(-r,sTop+band,r*2,r-sTop-band); c.clip();
    for(let row=0;row<4;row++){ const y0=sTop+band+r*0.07+row*r*0.15;
      c.fillStyle=dark; c.globalAlpha=0.7; c.beginPath(); c.moveTo(-r,y0);
      for(let u=0;u<=20;u++) c.lineTo(-r+u*r*0.1,y0+(u%2?r*0.07:0));
      for(let u=20;u>=0;u--) c.lineTo(-r+u*r*0.1,y0+r*0.04+(u%2?r*0.07:0)); c.closePath(); c.fill(); }
    c.globalAlpha=1;
    [-1,1].forEach(s=>{ [['#141414',0],['#ffffff',0.045]].forEach(([col,o])=>{ c.strokeStyle=col; c.lineWidth=Math.max(0.8,r*0.02);
      c.beginPath(); c.moveTo(s*r*(0.62+o),sTop+band); c.lineTo(s*r*(0.4+o),r); c.stroke(); }); });
    c.fillStyle='#ffffff'; c.font='900 '+(r*0.075)+'px Arial, Helvetica, sans-serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('JOSHUA 1:9',-r*0.3,r*0.8);
    c.restore();
}
