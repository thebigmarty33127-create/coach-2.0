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

function transitionSecondsFromIntensity(intensity) {
  const level = Math.min(33, Math.max(0, intensity ?? 23));
  return 33 - level;
}

function filterExercises(equipment, muscles, injuries, noJumpRun, exerciseFilterMode, exerciseSelection, weights) {
  const selection = exerciseSelection || [];
  const userWeights = weights || {};
  const userEquipment = equipment.includes('bodyweight')
    ? equipment
    : ['bodyweight', ...equipment];

  return EXERCISES.filter(ex => {
    if (exerciseFilterMode === 'include_only' && selection.length && !selection.includes(ex.id)) {
      return false;
    }
    if (exerciseFilterMode !== 'include_only' && selection.includes(ex.id)) {
      return false;
    }
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

function pickRandomExcluding(pool, excludeId) {
  const choices = excludeId && pool.length > 1
    ? pool.filter(ex => ex.id !== excludeId)
    : pool;
  const source = choices.length ? choices : pool;
  return source[Math.floor(Math.random() * source.length)];
}

function ensureNoConsecutiveDuplicates(exercises, candidates) {
  if (exercises.length < 2 || candidates.length < 2) return exercises;

  const result = [...exercises];
  for (let i = 1; i < result.length; i++) {
    if (result[i].id !== result[i - 1].id) continue;

    let fixed = false;
    for (let j = i + 1; j < result.length; j++) {
      if (result[j].id === result[i - 1].id) continue;
      if (j + 1 < result.length && result[j].id === result[j + 1].id) continue;
      [result[i], result[j]] = [result[j], result[i]];
      fixed = true;
      break;
    }

    if (!fixed) {
      const alt = pickRandomExcluding(candidates, result[i - 1].id);
      if (alt) result[i] = alt;
    }
  }

  return result;
}

function pickExercises(candidates, muscles, count, previousId = null) {
  if (!candidates.length) return [];

  const scored = candidates
    .map(ex => ({ ex, score: scoreExercise(ex, muscles) }))
    .sort((a, b) => b.score - a.score);

  const topPool = scored.slice(0, Math.max(count * 2, scored.length));
  const poolExercises = topPool.map(p => p.ex);
  const shuffled = shuffle(topPool);
  const picked = [];
  const usedMuscles = new Set();

  for (const { ex } of shuffled) {
    if (picked.length >= count) break;
    const lastId = picked.length ? picked[picked.length - 1].id : previousId;
    if (lastId && ex.id === lastId && candidates.length > 1) continue;
    const addsCoverage = ex.muscles.some(m => muscles.includes(m) && !usedMuscles.has(m));
    if (picked.length < count - 1 && !addsCoverage && picked.length > 0 && candidates.length > 1) continue;
    picked.push(ex);
    ex.muscles.forEach(m => { if (muscles.includes(m)) usedMuscles.add(m); });
  }

  while (picked.length < count) {
    const lastId = picked.length ? picked[picked.length - 1].id : previousId;
    picked.push(pickRandomExcluding(poolExercises, lastId));
  }

  return picked.slice(0, count);
}

function isLightIntensity(ex, userEquipment) {
  if (ex.highImpact) return false;

  if (ex.weightOptions?.length) {
    const applicable = ex.weightOptions.filter(o => userEquipment.includes(o.equipment));
    if (applicable.length) {
      return applicable.every(o => o.tier === 'light');
    }
  }

  const usesFreeWeights = ex.equipment.some(
    e => (e === 'dumbbells' || e === 'kettlebell') && userEquipment.includes(e)
  );
  return !usesFreeWeights;
}

function exerciseIntensity(ex, userEquipment) {
  let score = 0;

  if (ex.highImpact) score += 50;

  if (ex.weightOptions?.length) {
    const applicable = ex.weightOptions.filter(o => userEquipment.includes(o.equipment));
    if (applicable.length) {
      const minTier = Math.min(...applicable.map(o => TIER_RANK[o.tier]));
      score += minTier * 12;
    }
  }

  const usesFreeWeights = ex.equipment.some(
    e => (e === 'dumbbells' || e === 'kettlebell') && userEquipment.includes(e)
  );
  if (usesFreeWeights && !ex.weightOptions?.length) score += 10;

  return score;
}

function pickExercisesTwoPart(candidates, muscles, count, userEquipment) {
  const lightCount = Math.max(1, Math.round(count * 0.25));
  let lightPool = candidates.filter(ex => isLightIntensity(ex, userEquipment));

  if (!lightPool.length) {
    lightPool = [...candidates].sort(
      (a, b) => exerciseIntensity(a, userEquipment) - exerciseIntensity(b, userEquipment)
    );
  }

  const firstPart = pickExercises(lightPool, muscles, lightCount);
  const lastFirst = firstPart[firstPart.length - 1]?.id ?? null;
  const secondPart = pickExercises(candidates, muscles, count - firstPart.length, lastFirst);
  return ensureNoConsecutiveDuplicates([...firstPart, ...secondPart], candidates);
}

function maxExerciseCount(durationMinutes, timePerExercise, transitionSeconds) {
  const exerciseSeconds = timePerExercise * 60;
  const blockSeconds = exerciseSeconds + transitionSeconds;
  return Math.max(1, Math.floor((durationMinutes * 60 + transitionSeconds) / blockSeconds));
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

function buildMainPhases(exercises, timePerExercise, transitionSeconds) {
  const phases = [];
  const exerciseSeconds = timePerExercise * 60;

  exercises.forEach((ex, i) => {
    phases.push({
      type: 'exercise',
      exerciseId: ex.id,
      exerciseName: ex.nameFr,
      seconds: exerciseSeconds
    });

    if (i < exercises.length - 1 && transitionSeconds > 0) {
      phases.push({
        type: 'transition',
        exerciseName: ex.nameFr,
        nextExerciseId: exercises[i + 1].id,
        nextExerciseName: exercises[i + 1].nameFr,
        seconds: transitionSeconds
      });
    }
  });

  return phases;
}

function estimatePhasesSeconds(phases) {
  return phases.reduce((sum, p) => sum + p.seconds, 0);
}

function generateWorkout({
  equipment, muscles, injuries, duration, noJumpRun,
  exerciseFilterMode, exerciseSelection, weights, intensity
}) {
  const transitionSeconds = transitionSecondsFromIntensity(intensity);
  const candidates = filterExercises(
    equipment, muscles, injuries, noJumpRun, exerciseFilterMode, exerciseSelection, weights
  );
  if (candidates.length === 0) {
    return { error: 'Aucun exercice compatible — modifiez équipement, charges, muscles ou blessures.' };
  }

  const warmupPhases = buildWarmupPhases(noJumpRun);
  const reservedSeconds = estimatePhasesSeconds(warmupPhases) + PREP_SECONDS;
  const mainDurationMinutes = Math.max(1, (duration * 60 - reservedSeconds) / 60);

  const userEquipment = equipment.includes('bodyweight')
    ? equipment
    : ['bodyweight', ...equipment];

  const exerciseCount = maxExerciseCount(
    mainDurationMinutes, EXERCISE_DURATION_MINUTES, transitionSeconds
  );
  const selected = pickExercisesTwoPart(candidates, muscles, exerciseCount, userEquipment);
  const mainPhases = buildMainPhases(selected, EXERCISE_DURATION_MINUTES, transitionSeconds);

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
    transitionSeconds,
    intensity: Math.min(33, Math.max(0, intensity ?? 23)),
    estimatedSeconds: estimatePhasesSeconds(phases)
  };
}

window.Generator = {
  generateWorkout,
  transitionSecondsFromIntensity,
  formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ' min' + (s > 0 ? ' ' + s + ' s' : '');
  }
};
