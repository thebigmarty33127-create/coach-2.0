let phases = [];
let phaseIndex = 0;
let totalTime = 0;
let globalTimer;
let rafId;
let completedExercises = [];
let totalExercises = 0;
let totalPhaseSeconds = 0;

let paused = false;
let remainingPhaseMs = 0;
let phaseDuration = 0;
let phaseStart = 0;
let currentPhase = null;
let phaseCallback = null;
let phaseBeeps = { at2: false, at1: false, at0: false };
let lastDisplaySec = null;
let lastExerciseProgress = 0;

const AMRAP_HINT = 'Maximum de répétitions';

const PHASE_COLORS = {
  prep:       { fill: '#3b82f6', track: '#1e293b', cls: 'phase-prep',   label: 'Prépa',   glow: 'rgba(59,130,246,0.55)' },
  warmup:     { fill: '#f59e0b', track: '#1e293b', cls: 'phase-warmup', label: 'Échauffement', glow: 'rgba(245,158,11,0.55)' },
  exercise:   { fill: '#ef4444', track: '#1e293b', cls: 'phase-series', label: 'Exercice', glow: 'rgba(239,68,68,0.55)' },
  transition: { fill: '#06b6d4', track: '#1e293b', cls: 'phase-rest',   label: 'Repos',   glow: 'rgba(6,182,212,0.55)' }
};

const WORKOUT_BODY_CLASSES = [
  'in-workout',
  'workout-phase-prep',
  'workout-phase-warmup',
  'workout-phase-exercise',
  'workout-phase-transition'
];

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function formatPhaseTime(seconds) {
  if (seconds >= 60) return formatTime(Math.ceil(seconds));
  return String(Math.ceil(seconds));
}

function exerciseProgress() {
  let completed = 0;
  for (let i = 0; i < phaseIndex - 1; i++) {
    if (phases[i].type === 'exercise') completed++;
  }
  if (currentPhase?.type === 'exercise' || currentPhase?.type === 'transition') {
    return Math.min(completed + 1, totalExercises);
  }
  return completed;
}

function sessionProgressRatio(phaseElapsedSeconds) {
  if (!totalPhaseSeconds) return 0;

  let elapsed = 0;
  for (let i = 0; i < phaseIndex - 1; i++) {
    elapsed += phases[i].seconds;
  }

  if (currentPhase) {
    elapsed += phaseElapsedSeconds || 0;
  }

  return Math.min(1, elapsed / totalPhaseSeconds);
}

function setWorkoutAmbience(phaseType) {
  const workout = document.getElementById('workout');
  workout.dataset.phase = phaseType;

  document.body.classList.remove(...WORKOUT_BODY_CLASSES);
  document.body.classList.add('in-workout', 'workout-phase-' + phaseType);
}

function clearWorkoutAmbience() {
  document.body.classList.remove(...WORKOUT_BODY_CLASSES);
  document.getElementById('workout').removeAttribute('data-phase');
}

function triggerPhaseAnimations() {
  const header = document.getElementById('workoutExerciseHeader');
  const ring = document.getElementById('circle');
  const badge = document.getElementById('label');

  header.classList.remove('phase-enter');
  ring.classList.remove('phase-swap');
  badge.classList.remove('badge-pop');
  void header.offsetWidth;

  if (!header.classList.contains('is-empty')) {
    header.classList.add('phase-enter');
  }
  ring.classList.add('phase-swap');
  badge.classList.add('badge-pop');

  setTimeout(() => ring.classList.remove('phase-swap'), 600);
}

function updatePhaseUI(palette) {
  const exerciseName = document.getElementById('exerciseName');
  const phaseHint = document.getElementById('phaseHint');
  const exerciseHeader = document.getElementById('workoutExerciseHeader');
  const labelDiv = document.getElementById('label');
  const glow = document.getElementById('timerGlow');

  labelDiv.innerText = palette.label;
  labelDiv.className = 'phase-badge ' + palette.cls.replace('phase-', '');
  glow.style.background = palette.glow;

  if (currentPhase.type === 'exercise' || currentPhase.type === 'warmup') {
    exerciseName.innerText = currentPhase.exerciseName;
    phaseHint.innerText = AMRAP_HINT;
    phaseHint.className = 'phase-hint ' + (currentPhase.type === 'warmup' ? 'warmup' : 'series');
    exerciseHeader.classList.remove('is-rest-prep');
    exerciseHeader.classList.remove('is-empty');
  } else if (currentPhase.type === 'transition') {
    exerciseName.innerHTML =
      '<span class="rest-prep-intro">Prépare-toi pour</span>' +
      `<span class="rest-prep-target">${currentPhase.nextExerciseName}</span>`;
    phaseHint.innerText = '';
    phaseHint.className = 'phase-hint rest';
    exerciseHeader.classList.add('is-rest-prep');
    exerciseHeader.classList.remove('is-empty');
  } else if (currentPhase.type === 'prep') {
    exerciseName.innerText = currentPhase.nextExerciseName || '';
    phaseHint.innerText = currentPhase.nextExerciseName ? 'Premier exercice' : '';
    phaseHint.className = 'phase-hint prep';
    exerciseHeader.classList.remove('is-rest-prep');
    exerciseHeader.classList.toggle('is-empty', !currentPhase.nextExerciseName);
  } else {
    exerciseName.innerText = '';
    phaseHint.innerText = '';
    phaseHint.className = 'phase-hint';
    exerciseHeader.classList.remove('is-rest-prep');
    exerciseHeader.classList.add('is-empty');
  }

  setWorkoutAmbience(currentPhase.type);
  triggerPhaseAnimations();
  updateWorkoutHelpButton();
}

function updateWorkoutHelpButton() {
  const btn = document.getElementById('workoutHelpBtn');
  if (!btn) return;

  if (currentPhase?.type === 'exercise' || currentPhase?.type === 'warmup') {
    btn.style.display = 'inline-flex';
    btn.onclick = () => ExerciseHelp.show(currentPhase.exerciseId);
  } else if (currentPhase?.type === 'transition' && currentPhase.nextExerciseId) {
    btn.style.display = 'inline-flex';
    btn.onclick = () => ExerciseHelp.show(currentPhase.nextExerciseId);
  } else {
    btn.style.display = 'none';
  }
}

function updateTop() {
  document.getElementById('timeLeft').innerText = formatTime(Math.max(0, totalTime));

  const progress = exerciseProgress();
  document.getElementById('exerciseProgress').innerText = progress + '/' + totalExercises;

  if (progress !== lastExerciseProgress) {
    lastExerciseProgress = progress;
    const pill = document.getElementById('exerciseProgress').closest('.stat-pill');
    pill.classList.remove('stat-pop');
    void pill.offsetWidth;
    pill.classList.add('stat-pop');
  }

  updateWorkoutHelpButton();
}

function startWorkout(workoutPhases, durationMinutes, exercises) {
  phases = workoutPhases;
  phaseIndex = 0;
  totalTime = durationMinutes * 60;
  paused = false;
  completedExercises = exercises || [];
  totalExercises = completedExercises.length;
  totalPhaseSeconds = phases.reduce((sum, p) => sum + p.seconds, 0);
  lastDisplaySec = null;
  lastExerciseProgress = 0;

  document.getElementById('pauseBtn').style.display = 'inline-flex';
  document.getElementById('pauseBtn').innerText = 'Pause';
  document.getElementById('pauseOverlay').classList.remove('visible');
  document.getElementById('sessionProgressFill').style.width = '0%';

  updateTop();
  Sounds.resume();
  startGlobalTimer();
  nextPhase();
}

function startGlobalTimer() {
  clearInterval(globalTimer);
  globalTimer = setInterval(() => {
    if (!paused) {
      totalTime--;
      updateTop();
      if (totalTime <= 0) finish(getCompletedExercises());
    }
  }, 1000);
}

function nextPhase() {
  if (phaseIndex >= phases.length) {
    finish(getCompletedExercises());
    return;
  }

  const phase = phases[phaseIndex];
  phaseIndex++;
  runPhase(phase, () => nextPhase());
}

function runPhase(phase, callback) {
  cancelAnimationFrame(rafId);
  currentPhase = phase;
  phaseCallback = callback;
  phaseBeeps = { atHalf: false, at2: false, at1: false, at0: false };
  lastDisplaySec = null;

  phaseDuration = phase.seconds * 1000;
  remainingPhaseMs = phaseDuration;
  phaseStart = performance.now();

  const paletteKey = currentPhase.type in PHASE_COLORS ? currentPhase.type : 'exercise';
  const palette = PHASE_COLORS[paletteKey];

  updatePhaseUI(palette);
  updateTop();
  startPhaseAnimate(palette);
}

function startPhaseAnimate(palette) {
  function animate(now) {
    if (paused) return;

    const elapsed = now - phaseStart;
    const remaining = Math.max(0, remainingPhaseMs - elapsed);
    const progress = remaining / phaseDuration;
    const percent = progress * 100;
    const remainingSec = remaining / 1000;
    const displaySec = Math.ceil(remainingSec);
    const isUrgent = displaySec <= 3 && displaySec > 0;

    if (elapsed >= phaseDuration / 2 && !phaseBeeps.atHalf) {
      phaseBeeps.atHalf = true;
      Sounds.playShort();
    }
    if (displaySec === 2 && !phaseBeeps.at2) {
      phaseBeeps.at2 = true;
      Sounds.playShort();
    }
    if (displaySec === 1 && !phaseBeeps.at1) {
      phaseBeeps.at1 = true;
      Sounds.playShort();
    }

    const circle = document.getElementById('circle');
    const timerValue = document.getElementById('timerValue');
    const progressFill = document.getElementById('sessionProgressFill');

    circle.style.background = `conic-gradient(${palette.fill} ${percent}%, ${palette.track} ${percent}%)`;
    circle.className = 'timer-ring ' + palette.cls + (isUrgent ? ' urgent' : '');
    timerValue.innerText = formatPhaseTime(remainingSec);
    timerValue.classList.toggle('urgent', isUrgent);
    progressFill.style.width = (sessionProgressRatio((phaseDuration - remaining) / 1000) * 100) + '%';

    if (displaySec !== lastDisplaySec) {
      timerValue.classList.remove('tick');
      void timerValue.offsetWidth;
      timerValue.classList.add('tick');
      lastDisplaySec = displaySec;
    }

    if (remaining > 0) {
      rafId = requestAnimationFrame(animate);
    } else if (!phaseBeeps.at0) {
      phaseBeeps.at0 = true;
      timerValue.classList.remove('urgent', 'tick');
      circle.classList.remove('urgent');
      Sounds.playLong();
      phaseCallback();
    }
  }

  rafId = requestAnimationFrame(animate);
}

function togglePause() {
  paused = !paused;
  const btn = document.getElementById('pauseBtn');
  const overlay = document.getElementById('pauseOverlay');

  if (paused) {
    btn.innerText = 'Reprendre';
    overlay.classList.add('visible');
    cancelAnimationFrame(rafId);
    const elapsed = performance.now() - phaseStart;
    remainingPhaseMs = Math.max(0, remainingPhaseMs - elapsed);
  } else {
    btn.innerText = 'Pause';
    overlay.classList.remove('visible');
    phaseStart = performance.now();
    const paletteKey = currentPhase.type in PHASE_COLORS ? currentPhase.type : 'exercise';
    startPhaseAnimate(PHASE_COLORS[paletteKey]);
  }
}

function getCompletedExercises() {
  const done = [];
  let exercisePhaseIndex = 0;

  for (let i = 0; i < phaseIndex - 1; i++) {
    const p = phases[i];
    if (p.type === 'exercise') {
      const ex = completedExercises[exercisePhaseIndex];
      if (ex) done.push(ex);
      exercisePhaseIndex++;
    }
  }

  return done;
}

function skipPhase() {
  cancelAnimationFrame(rafId);
  nextPhase();
}

function endWorkout() {
  cancelAnimationFrame(rafId);
  finish(getCompletedExercises());
}

function finish(completed) {
  cancelAnimationFrame(rafId);
  clearInterval(globalTimer);
  clearWorkoutAmbience();
  showFinishScreen(completed || []);
}

window.Workout = {
  startWorkout,
  togglePause,
  skipPhase,
  endWorkout,
  finish
};
