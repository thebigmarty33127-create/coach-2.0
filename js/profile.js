const PROFILE_KEY = 'coach-profile';

const DEFAULT_WEIGHTS = {
  dumbbells: ['medium'],
  kettlebell: ['medium']
};

const DEFAULT_PROFILE = {
  equipment: ['bodyweight', 'mat'],
  muscles: ['chest', 'back', 'core'],
  injuries: [],
  exerciseFilterMode: 'exclude',
  exerciseSelection: [],
  weights: { ...DEFAULT_WEIGHTS },
  noJumpRun: false,
  defaultDuration: 30
};

function normalizeWeights(weights) {
  return {
    dumbbells: Array.isArray(weights?.dumbbells) ? weights.dumbbells : [...DEFAULT_WEIGHTS.dumbbells],
    kettlebell: Array.isArray(weights?.kettlebell) ? weights.kettlebell : [...DEFAULT_WEIGHTS.kettlebell]
  };
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    delete parsed.defaultReps;
    delete parsed.defaultTimePerExercise;
    if (!parsed.exerciseFilterMode) {
      parsed.exerciseFilterMode = 'exclude';
    }
    if (!Array.isArray(parsed.exerciseSelection)) {
      parsed.exerciseSelection = Array.isArray(parsed.bannedExercises) ? parsed.bannedExercises : [];
    }
    delete parsed.bannedExercises;
    parsed.weights = normalizeWeights(parsed.weights);
    return parsed;
  } catch {
    return null;
  }
}

function saveProfile(profile) {
  const { defaultReps, defaultTimePerExercise, ...clean } = profile;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(clean));
}

function hasProfile() {
  return localStorage.getItem(PROFILE_KEY) !== null;
}

function readFormSelections(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  return [...container.querySelectorAll('.chip.selected')].map(el => el.dataset.value);
}

function setFormSelections(containerId, values) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.chip').forEach(chip => {
    chip.classList.toggle('selected', values.includes(chip.dataset.value));
  });
}

function readWeightsForm() {
  const weights = {};
  WEIGHTED_EQUIPMENT.forEach(w => {
    const container = document.getElementById('profileWeights_' + w.id);
    if (container) {
      weights[w.id] = [...container.querySelectorAll('.chip.selected')].map(c => c.dataset.value);
    }
  });
  return weights;
}

function readSessionForm() {
  return {
    equipment: readFormSelections('setupEquipment'),
    muscles: readFormSelections('setupMuscles'),
    injuries: readFormSelections('setupInjuries'),
    noJumpRun: document.getElementById('setupNoJumpRun').checked,
    duration: parseInt(document.getElementById('setupDuration').value, 10),
    intensity: parseInt(document.getElementById('setupIntensity').value, 10)
  };
}

function readProfileForm() {
  const equipment = readFormSelections('profileEquipment');
  const weights = readWeightsForm();
  WEIGHTED_EQUIPMENT.forEach(w => {
    if (!equipment.includes(w.id)) delete weights[w.id];
  });

  return {
    equipment,
    muscles: readFormSelections('profileMuscles'),
    injuries: readFormSelections('profileInjuries'),
    exerciseFilterMode: readExerciseFilterMode(),
    exerciseSelection: readFormSelections('profileExerciseSelection'),
    weights,
    noJumpRun: document.getElementById('profileNoJumpRun').checked,
    defaultDuration: parseInt(document.getElementById('profileDuration').value, 10)
  };
}

function applyProfileToSetupForm(profile) {
  setFormSelections('setupEquipment', profile.equipment);
  setFormSelections('setupMuscles', profile.muscles);
  setFormSelections('setupInjuries', profile.injuries);
  document.getElementById('setupNoJumpRun').checked = !!profile.noJumpRun;
  document.getElementById('setupDuration').value = profile.defaultDuration;
}

function applyProfileToProfileForm(profile) {
  setFormSelections('profileEquipment', profile.equipment);
  setFormSelections('profileMuscles', profile.muscles);
  setFormSelections('profileInjuries', profile.injuries);
  setExerciseFilterMode(profile.exerciseFilterMode || 'exclude');
  buildExerciseSelectionList(profile.exerciseSelection || [], profile.exerciseFilterMode || 'exclude');
  buildWeightSections(profile.weights || DEFAULT_WEIGHTS, profile.equipment);
  document.getElementById('profileNoJumpRun').checked = !!profile.noJumpRun;
  document.getElementById('profileDuration').value = profile.defaultDuration;
}

function readExerciseFilterMode() {
  const selected = document.querySelector('.filter-mode-btn.selected');
  return selected?.dataset.mode === 'include_only' ? 'include_only' : 'exclude';
}

function setExerciseFilterMode(mode) {
  document.querySelectorAll('.filter-mode-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.mode === mode);
  });
  updateExerciseFilterHint(mode);
  const selected = readFormSelections('profileExerciseSelection');
  buildExerciseSelectionList(selected, mode);
}

function updateExerciseFilterHint(mode) {
  const hint = document.getElementById('profileExerciseFilterHint');
  if (!hint) return;
  hint.innerText = mode === 'include_only'
    ? 'Seuls les exercices sélectionnés apparaîtront dans vos séances.'
    : 'Les exercices sélectionnés ne seront jamais proposés dans vos séances.';
}

function buildChipGroup(containerId, options, selectedValues) {
  const container = document.getElementById(containerId);
  container.innerHTML = options.map(opt => {
    const selected = selectedValues.includes(opt.id) ? ' selected' : '';
    return `<button type="button" class="chip${selected}" data-value="${opt.id}">${opt.label}</button>`;
  }).join('');

  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('selected'));
  });
}

function buildWeightSections(weights, equipment) {
  const section = document.getElementById('profileWeightsSection');
  const container = document.getElementById('profileWeights');
  const active = WEIGHTED_EQUIPMENT.filter(w => equipment.includes(w.id));

  if (!active.length) {
    section.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = active.map(w => {
    const selected = weights[w.id]?.length ? weights[w.id] : ['medium'];
    const tiers = WEIGHT_TIER_OPTIONS.map(t => {
      const sel = selected.includes(t.id) ? ' selected' : '';
      return `<button type="button" class="chip chip-weight${sel}" data-value="${t.id}">${t.label}</button>`;
    }).join('');

    return `
      <div class="weight-block">
        <div class="weight-block-title">${w.label}</div>
        <div id="profileWeights_${w.id}" class="chip-group">${tiers}</div>
      </div>`;
  }).join('');

  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('selected'));
  });
}

function onProfileEquipmentChange() {
  setTimeout(() => {
    buildWeightSections(readWeightsForm(), readFormSelections('profileEquipment'));
  }, 0);
}

function buildExerciseSelectionList(selectedIds, mode) {
  const container = document.getElementById('profileExerciseSelection');
  const chipClass = mode === 'include_only' ? 'chip-allow' : 'chip-ban';
  const sorted = [...EXERCISES].sort((a, b) => a.nameFr.localeCompare(b.nameFr, 'fr'));
  container.innerHTML = sorted.map(ex => {
    const selected = selectedIds.includes(ex.id) ? ' selected' : '';
    return `<button type="button" class="chip ${chipClass}${selected}" data-value="${ex.id}">${ex.nameFr}</button>`;
  }).join('');

  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('selected'));
  });
}

function initExerciseFilterModeToggle() {
  const container = document.querySelector('.filter-mode-toggle');
  if (!container || container.dataset.bound) return;
  container.dataset.bound = '1';
  container.querySelectorAll('.filter-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('selected')) return;
      setExerciseFilterMode(btn.dataset.mode);
    });
  });
}

function initChipGroups(profile) {
  buildChipGroup('setupEquipment', EQUIPMENT_OPTIONS, profile.equipment);
  buildChipGroup('setupMuscles', MUSCLE_OPTIONS, profile.muscles);
  buildChipGroup('setupInjuries', INJURY_OPTIONS, profile.injuries);
  buildChipGroup('profileEquipment', EQUIPMENT_OPTIONS, profile.equipment);
  buildChipGroup('profileMuscles', MUSCLE_OPTIONS, profile.muscles);
  buildChipGroup('profileInjuries', INJURY_OPTIONS, profile.injuries);
  setExerciseFilterMode(profile.exerciseFilterMode || 'exclude');
  buildExerciseSelectionList(profile.exerciseSelection || [], profile.exerciseFilterMode || 'exclude');
  initExerciseFilterModeToggle();
  buildWeightSections(profile.weights || DEFAULT_WEIGHTS, profile.equipment);

  const profileEquipment = document.getElementById('profileEquipment');
  profileEquipment.removeEventListener('click', onProfileEquipmentChange);
  profileEquipment.addEventListener('click', onProfileEquipmentChange);
}

function validateWeights(equipment, weights) {
  for (const w of WEIGHTED_EQUIPMENT) {
    if (equipment.includes(w.id) && !(weights[w.id]?.length)) {
      return `Sélectionnez au moins un niveau de charge pour les ${w.label.toLowerCase()}.`;
    }
  }
  return null;
}

window.Profile = {
  loadProfile,
  saveProfile,
  hasProfile,
  readSessionForm,
  readProfileForm,
  applyProfileToSetupForm,
  applyProfileToProfileForm,
  initChipGroups,
  validateWeights,
  DEFAULT_PROFILE
};
