let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function resume() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    return ctx.resume();
  }
  return Promise.resolve();
}

function tone({ duration, frequency, type, peak }) {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = frequency;
  osc.connect(gain);
  gain.connect(ctx.destination);

  const attack = 0.012;
  const release = Math.min(duration * 0.3, 0.08);
  const holdEnd = t + duration - release;

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t + attack);
  gain.gain.setValueAtTime(peak, holdEnd);
  gain.gain.linearRampToValueAtTime(0, t + duration);

  osc.start(t);
  osc.stop(t + duration + 0.03);
}

function playShort() {
  tone({
    duration: 0.14,
    frequency: 1100,
    type: 'triangle',
    peak: 0.32
  });
}

function playLong() {
  tone({
    duration: 0.6,
    frequency: 820,
    type: 'triangle',
    peak: 0.4
  });
}

window.Sounds = { resume, playShort, playLong };
