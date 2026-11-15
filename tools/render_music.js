// Renders the background music loops (js/music.js MUSIC_SONGS A-L) in
// Chromium and saves each as music/<id>.mp3, so every browser plays the same
// audio (Joe, 2026-11-15: on iPhone Safari the code-made music came out as
// harsh static on every beat). Each file holds 1.2 times the loop, so the game
// can loop a clean stretch of it (MUSIC_LOOP_FROM..+1 loop) whatever silence
// the MP3 decoder adds at the start. Saved MUSIC_FILE_GAIN quieter so nothing
// clips; the game turns it back up when it loads the file.
// Run: node tools/render_music.js   (needs Playwright + ffmpeg)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage();
  await p.goto('file://' + root + '/index.html');
  await p.waitForTimeout(1000);
  const ids = await p.evaluate(() => MUSIC_LIST.filter(id => id !== 'off'));
  for (const id of ids) {
    const r = await p.evaluate(id => new Promise(res => {
      window.MUSIC_FILES_OFF = true; // render the code version
      getAudioCtx();
      renderMusic(id, buf => {
        const n = buf.length, extra = Math.round(n * 0.2), out = [], k = 1 / MUSIC_FILE_GAIN;
        for (let c = 0; c < 2; c++) {
          const d = buf.getChannelData(c), a = new Float32Array(n + extra);
          a.set(d); a.set(d.subarray(0, extra), n); for (let i = 0; i < a.length; i++) a[i] *= k;
          let s = ''; const u = new Uint8Array(a.buffer);
          for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768));
          out.push(btoa(s));
        }
        res({ sr: buf.sampleRate, ch: out });
      });
    }), id);
    const L = Buffer.from(r.ch[0], 'base64'), R = Buffer.from(r.ch[1], 'base64');
    const n = L.length / 4, inter = Buffer.alloc(n * 8);
    for (let i = 0; i < n; i++) { inter.writeFloatLE(L.readFloatLE(i * 4), i * 8); inter.writeFloatLE(R.readFloatLE(i * 4), i * 8 + 4); }
    const raw = path.join(root, 'music', id + '.f32');
    fs.writeFileSync(raw, inter);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'f32le', '-ar', String(r.sr), '-ac', '2', '-i', raw, '-c:a', 'libmp3lame', '-b:a', '128k', path.join(root, 'music', id + '.mp3')]);
    fs.unlinkSync(raw);
    console.log(id, (n / r.sr).toFixed(2) + 's');
  }
  await b.close();
})();
