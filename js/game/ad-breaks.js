// Ad breaks (Joe, 2026-11-06): sponsor ads come up on the jumbotron (a
// banner in the test arena) at random times during a match. They aren't
// tied to any fighter, and they go through queueJumboAd like every other
// ad, so they never overlap one and wait out any special (truckees-ad.js).
//
// To add a sponsor: write its ad (see poorbet-ad.js) and add its start
// function to SPONSOR_ADS. The same one never plays twice in a row while
// there's another to pick.
"use strict";

var SPONSOR_ADS = [
  function () { startPoorbetAd(); } // Poorbet: "Losses happen here" (poorbet-ad.js)
];
var AD_BREAK_FIRST = [12, 20];   // seconds into the fight before the first one
var AD_BREAK_EVERY = [25, 40];   // seconds between one and the next
var adBreakT = Infinity, adBreakLast = -1;

function adBreakRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
// From startMatchWith (through resetJumboAds).
function resetAdBreaks() {
  adBreakT = adBreakRand(AD_BREAK_FIRST);
  adBreakLast = -1;
  poorbetShow = 0;
  stopPoorbetAd();
}
// Every frame from update().
function tickAdBreaks(dt) {
  tickPoorbetAd(dt);
  // No ad breaks in gallery demos, or once the fight's over.
  if (over || (typeof galleryDemo !== "undefined" && galleryDemo) || !SPONSOR_ADS.length) return;
  adBreakT -= dt;
  if (adBreakT > 0) return;
  // Something's already on the jumbotron or waiting for it: try again shortly.
  if (jumboAdLeft > 0 || jumboAds.length) { adBreakT = 3; return; }
  var i = (Math.random() * SPONSOR_ADS.length) | 0;
  if (SPONSOR_ADS.length > 1 && i === adBreakLast) i = (i + 1) % SPONSOR_ADS.length;
  adBreakLast = i;
  SPONSOR_ADS[i]();
  adBreakT = adBreakRand(AD_BREAK_EVERY);
}
