let phases = [];
let phaseIndex = 0;
let totalTime = 0;
let globalTimer;
let rafId;
let completedExercises = [];
let totalExercises = 0;

let paused = false;
let remainingPhaseMs = 0;
let phaseDuration = 0;
let phaseStart = 0;
let currentPhase = null;
let phaseCallback = null;
let phaseBeeps = { at2: false, at1: false, at0: false };

const PHASE_COLORS = {
  prep:       { fill: '#3b82f6', track: '#1e293b', cls: 'phase-prep',   label: 'Prépa' },
  warmup:     { fill: '#f59e0b', track: '#1e293b', cls: 'phase-warmup', label: 'Échauffement' },
  exercise:   { fill: '#ef4444', track: '#1e293b', cls: 'phase-series', label: 'Exercice' },
  transition: { fill: '#06b6d4', track: '#1e293b', cls: 'phase-rest',   label: 'Repos' }
};

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

function updateWorkoutHelpButton() {
  const btn = document.getElementById('workoutHelpBtn');
  if (!btn) return;

  if (currentPhase?.type === 'exercise' || currentPhase?.type === 'warmup') {
    btn.style.display = 'inline-flex';
    btn.onclick = () => ExerciseHelp.show(currentPhase.exerciseId);
  } else {
    btn.style.display = 'none';
  }
}

function updateTop() {
  document.getElementById('timeLeft').innerText = formatTime(Math.max(0, totalTime));
  document.getElementById('exerciseProgress').innerText = exerciseProgress() + '/' + totalExercises;
  updateWorkoutHelpButton();
}

function startWorkout(workoutPhases, durationMinutes, exercises) {
  phases = workoutPhases;
  phaseIndex = 0;
  totalTime = durationMinutes * 60;
  paused = false;
  completedExercises = exercises || [];
  totalExercises = completedExercises.length;

  document.getElementById('pauseBtn').style.display = 'inline-flex';
  document.getElementById('pauseBtn').innerText = 'Pause';
  document.getElementById('nextInfo').innerText = '';

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

  phaseDuration = phase.seconds * 1000;
  remainingPhaseMs = phaseDuration;
  phaseStart = performance.now();

  updateTop();
  startPhaseAnimate();
}

function startPhaseAnimate() {
  const paletteKey = currentPhase.type in PHASE_COLORS ? currentPhase.type : 'exercise';
  const palette = PHASE_COLORS[paletteKey];

  function animate(now) {
    if (paused) return;

    const elapsed = now - phaseStart;
    const remaining = Math.max(0, remainingPhaseMs - elapsed);
    const progress = remaining / phaseDuration;
    const percent = progress * 100;
    const remainingSec = remaining / 1000;
    const displaySec = Math.ceil(remainingSec);

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
    const labelDiv = document.getElementById('label');
    const timerValue = document.getElementById('timerValue');
    const exerciseName = document.getElementById('exerciseName');
    const nextInfo = document.getElementById('nextInfo');

    circle.style.background = `conic-gradient(${palette.fill} ${percent}%, ${palette.track} ${percent}%)`;
    circle.className = 'timer-ring ' + palette.cls;
    timerValue.innerText = formatPhaseTime(remainingSec);
    labelDiv.innerText = palette.label;
    labelDiv.className = 'phase-badge ' + palette.cls.replace('phase-', '');

    if (currentPhase.type === 'exercise' || currentPhase.type === 'warmup') {
      exerciseName.innerText = currentPhase.exerciseName;
      nextInfo.innerText = '';
    } else if (currentPhase.type === 'transition') {
      exerciseName.innerText = '';
      nextInfo.innerText = 'Suivant : ' + currentPhase.nextExerciseName;
    } else if (currentPhase.type === 'prep') {
      exerciseName.innerText = '';
      nextInfo.innerText = currentPhase.nextExerciseName
        ? 'Premier : ' + currentPhase.nextExerciseName
        : '';
    } else {
      exerciseName.innerText = '';
    }

    if (remaining > 0) {
      rafId = requestAnimationFrame(animate);
    } else if (!phaseBeeps.at0) {
      phaseBeeps.at0 = true;
      Sounds.playLong();
      phaseCallback();
    }
  }

  rafId = requestAnimationFrame(animate);
}

function togglePause() {
  paused = !paused;
  const btn = document.getElementById('pauseBtn');

  if (paused) {
    btn.innerText = 'Reprendre';
    cancelAnimationFrame(rafId);
    const elapsed = performance.now() - phaseStart;
    remainingPhaseMs = Math.max(0, remainingPhaseMs - elapsed);
  } else {
    btn.innerText = 'Pause';
    phaseStart = performance.now();
    startPhaseAnimate();
  }
}

function getCompletedExercises() {
  const done = [];
  const seen = new Set();

  for (let i = 0; i < phaseIndex - 1; i++) {
    const p = phases[i];
    if (p.type === 'exercise' && !seen.has(p.exerciseId)) {
      seen.add(p.exerciseId);
      const ex = completedExercises.find(e => e.id === p.exerciseId);
      if (ex) done.push(ex);
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
  showFinishScreen(completed || []);
}

window.Workout = {
  startWorkout,
  togglePause,
  skipPhase,
  endWorkout,
  finish
};
