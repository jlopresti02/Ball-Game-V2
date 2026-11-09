// Ad breaks (Joe, 2026-11-06): sponsor ads come up on the jumbotron (a
// banner in the test arena) at random times during a match. They aren't
// tied to any fighter, and they go through queueJumboAd like every other
// ad, so they never overlap one and wait out any special (truckees-ad.js).
//
// To add a sponsor: write its ad (see poorbet-ad.js) and add it to
// SPONSOR_ADS (`ready`, optional, says whether it can play right now). The
// same one never plays twice in a row while there's another to pick.
"use strict";

var SPONSOR_ADS = [
  { name: "poorbet", start: function () { startPoorbetAd(); } } // Poorbet: "Losses happen here" (poorbet-ad.js)
].concat(STILL_ADS.map(function (ad) { // silent still versions of the fighters' ads (still-ads.js)
  return { name: ad.name, ready: function () { return stillAdReady(ad); }, start: function () { startStillAd(ad); } };
}));
var AD_BREAK_FIRST = [12, 20];   // seconds into the fight before the first one
var AD_BREAK_EVERY = [25, 40];   // seconds between one and the next
var adBreakT = Infinity, adBreakLast = null;

function adBreakRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
// From startMatchWith (through resetJumboAds).
function resetAdBreaks() {
  adBreakT = adBreakRand(AD_BREAK_FIRST);
  adBreakLast = null;
  poorbetShow = 0; stillShow = 0; stillAd = null;
  stopPoorbetAd();
  bearWarnShow = 0;
  resetGaneAd();
  resetCologneAd();
  resetGoatGoatGo();
  resetTapWater();
}
// Every frame from update().
function tickAdBreaks(dt) {
  tickPoorbetAd(dt);
  tickStillAds(dt);
  tickBearWarning(dt);
  tickGaneAd(dt);
  tickCologneAd(dt);
  tickGoatGoatGo(dt);
  tickTapWater(dt);
  // No ad breaks in gallery demos, or once the fight's over.
  if (over || (typeof galleryDemo !== "undefined" && galleryDemo) || !SPONSOR_ADS.length) return;
  adBreakT -= dt;
  if (adBreakT > 0) return;
  // Something's already on the jumbotron or waiting for it: try again shortly.
  if (jumboAdLeft > 0 || jumboAds.length) { adBreakT = 3; return; }
  var ready = SPONSOR_ADS.filter(function (ad) { return !ad.ready || ad.ready(); });
  var pick = ready.filter(function (ad) { return ad.name !== adBreakLast; });
  if (!pick.length) pick = ready;
  var ad = pick[(Math.random() * pick.length) | 0];
  adBreakLast = ad.name;
  ad.start();
  adBreakT = adBreakRand(AD_BREAK_EVERY);
}
