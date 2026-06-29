const TRANSITION_SECONDS = 10;
const EXERCISE_DURATION_MINUTES = 1;

function hasEquipment(userEquipment, required) {
  if (!required || required.length === 0) return true;
  return required.every(eq => userEquipment.includes(eq));
}

const TIER_RANK = { light: 1, medium: 2, heavy: 3 };

function hasMatchingWeight(exercise, userEquipment, userWeights) {
  if (!exercise.weightOptions?.length) return true;

  return exercise.weightOptions.some(opt => {
    if (!userEquipment.includes(opt.equipment)) return false;
    const required = TIER_RANK[opt.tier];
    const userTiers = userWeights[opt.equipment] || [];
    // Lighter weights can substitute for heavier exercises, not the other way around.
    return userTiers.some(w => TIER_RANK[w] <= required);
  });
}

function filterExercises(equipment, muscles, injuries, noJumpRun, bannedExercises, weights) {
  const banned = bannedExercises || [];
  const userWeights = weights || {};
  const userEquipment = equipment.includes('bodyweight')
    ? equipment
    : ['bodyweight', ...equipment];

  return EXERCISES.filter(ex => {
    if (banned.includes(ex.id)) return false;
    if (!hasEquipment(userEquipment, ex.equipment)) return false;
    if (!hasMatchingWeight(ex, userEquipment, userWeights)) return false;
    if (ex.avoidIf.some(i => injuries.includes(i))) return false;
    if (noJumpRun && ex.highImpact) return false;
    if (!ex.muscles.some(m => muscles.includes(m))) return false;
    return true;
  });
}

function scoreExercise(exercise, muscles) {
  const overlap = exercise.muscles.filter(m => muscles.includes(m)).length;
  return overlap * 10 + (exercise.priority || 1);
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickExercises(candidates, muscles, count) {
  const scored = candidates
    .map(ex => ({ ex, score: scoreExercise(ex, muscles) }))
    .sort((a, b) => b.score - a.score);

  const topPool = scored.slice(0, Math.max(count * 2, count));
  const shuffled = shuffle(topPool);
  const picked = [];
  const usedMuscles = new Set();

  for (const { ex } of shuffled) {
    if (picked.length >= count) break;
    const addsCoverage = ex.muscles.some(m => muscles.includes(m) && !usedMuscles.has(m));
    if (picked.length < count - 1 && !addsCoverage && picked.length > 0) continue;
    picked.push(ex);
    ex.muscles.forEach(m => { if (muscles.includes(m)) usedMuscles.add(m); });
  }

  if (picked.length < count) {
    for (const { ex } of shuffled) {
      if (picked.length >= count) break;
      if (!picked.includes(ex)) picked.push(ex);
    }
  }

  return picked.slice(0, count);
}

function maxExerciseCount(durationMinutes, timePerExercise) {
  const exerciseSeconds = timePerExercise * 60;
  const blockSeconds = exerciseSeconds + TRANSITION_SECONDS;
  return Math.max(1, Math.floor((durationMinutes * 60 + TRANSITION_SECONDS) / blockSeconds));
}

function buildWarmupPhases(noJumpRun) {
  const pool = WARMUP_BLOCKS.filter(b => !noJumpRun || !b.highImpact);
  const highImpactIds = ['jumping_jacks', 'high_knees', 'arm_circles', 'jogging'];
  const lowImpactIds = ['arm_circles', 'torso_twist', 'walking_high_knees', 'hip_circles'];

  const ids = noJumpRun ? lowImpactIds : highImpactIds;
  const blocks = ids
    .map(id => pool.find(b => b.id === id))
    .filter(Boolean);

  return blocks.map(block => ({
    type: 'warmup',
    exerciseId: block.id,
    exerciseName: block.nameFr,
    seconds: block.seconds
  }));
}

function buildMainPhases(exercises, timePerExercise) {
  const phases = [];
  const exerciseSeconds = timePerExercise * 60;

  exercises.forEach((ex, i) => {
    phases.push({
      type: 'exercise',
      exerciseId: ex.id,
      exerciseName: ex.nameFr,
      seconds: exerciseSeconds
    });

    if (i < exercises.length - 1) {
      phases.push({
        type: 'transition',
        exerciseName: ex.nameFr,
        nextExerciseName: exercises[i + 1].nameFr,
        seconds: TRANSITION_SECONDS
      });
    }
  });

  return phases;
}

function estimatePhasesSeconds(phases) {
  return phases.reduce((sum, p) => sum + p.seconds, 0);
}

function generateWorkout({ equipment, muscles, injuries, duration, noJumpRun, bannedExercises, weights }) {
  const candidates = filterExercises(equipment, muscles, injuries, noJumpRun, bannedExercises, weights);
  if (candidates.length === 0) {
    return { error: 'Aucun exercice compatible — modifiez équipement, charges, muscles ou blessures.' };
  }

  const warmupPhases = buildWarmupPhases(noJumpRun);
  const reservedSeconds = estimatePhasesSeconds(warmupPhases) + PREP_SECONDS;
  const mainDurationMinutes = Math.max(1, (duration * 60 - reservedSeconds) / 60);

  const exerciseCount = Math.min(
    candidates.length,
    maxExerciseCount(mainDurationMinutes, EXERCISE_DURATION_MINUTES)
  );
  const selected = pickExercises(candidates, muscles, exerciseCount);
  const mainPhases = buildMainPhases(selected, EXERCISE_DURATION_MINUTES);

  const phases = [
    ...warmupPhases,
    {
      type: 'prep',
      seconds: PREP_SECONDS,
      nextExerciseName: selected[0]?.nameFr || ''
    },
    ...mainPhases
  ];

  return {
    phases,
    warmup: warmupPhases.map(p => ({
      id: p.exerciseId,
      name: p.exerciseName,
      durationSeconds: p.seconds
    })),
    exercises: selected.map(ex => ({
      id: ex.id,
      name: ex.nameFr,
      durationMinutes: EXERCISE_DURATION_MINUTES
    })),
    estimatedSeconds: estimatePhasesSeconds(phases)
  };
}

window.Generator = {
  generateWorkout,
  formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ' min' + (s > 0 ? ' ' + s + ' s' : '');
  }
};
