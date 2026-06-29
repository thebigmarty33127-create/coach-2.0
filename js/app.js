let currentWorkout = null;
let sessionDuration = 30;

function showScreen(id) {
  ['profile', 'setup', 'preview', 'workout', 'finish'].forEach(name => {
    const el = document.getElementById(name);
    if (!el) return;
    if (name === 'workout') {
      el.style.display = id === 'workout' ? 'flex' : 'none';
    } else if (name === 'finish') {
      el.style.display = id === 'finish' ? 'flex' : 'none';
    } else {
      el.style.display = name === id ? 'block' : 'none';
    }
  });
  document.getElementById('settingsBtn').style.display = id === 'profile' ? 'none' : 'block';
}

const FINISH_MESSAGES = [
  { title: 'Félicitations !', subtitle: 'Encore une séance de faite — continuez sur cette lancée.' },
  { title: 'Bravo !', subtitle: 'Vous avez tenu bon jusqu\'au bout. Votre corps vous dit merci.' },
  { title: 'Beau travail !', subtitle: 'Chaque séance compte. Vous progressez.' },
  { title: 'Séance réussie !', subtitle: 'Repos bien mérité — à la prochaine.' },
  { title: 'Chapeau !', subtitle: 'Vous avez accompli quelque chose aujourd\'hui.' },
  { title: 'Excellent !', subtitle: 'La régularité paie. Revenez bientôt.' },
  { title: 'Super séance !', subtitle: 'Vous pouvez être fier de vous.' },
  { title: 'Well done !', subtitle: 'Mission accomplie pour aujourd\'hui.' }
];

function resetTopbarStats() {
  document.getElementById('timeLeft').innerText = '--:--';
  document.getElementById('exerciseProgress').innerText = '--';
}

function showFinishScreen(completedExercises) {
  const msg = FINISH_MESSAGES[Math.floor(Math.random() * FINISH_MESSAGES.length)];
  const list = completedExercises || [];

  document.getElementById('finishTitle').innerText = msg.title;
  document.getElementById('finishSubtitle').innerText = msg.subtitle;

  const listEl = document.getElementById('finishList');
  if (list.length) {
    listEl.innerHTML = list.map(ex => `<li>${ex.name} — ${ex.durationMinutes} min</li>`).join('');
    listEl.style.display = 'block';
    document.getElementById('finishSummary').innerText =
      list.length + ' exercice' + (list.length > 1 ? 's' : '') + ' complété' + (list.length > 1 ? 's' : '');
    document.getElementById('finishSummary').style.display = 'block';
  } else {
    listEl.innerHTML = '';
    listEl.style.display = 'none';
    document.getElementById('finishSummary').style.display = 'none';
  }

  showScreen('finish');
  resetTopbarStats();
}

function goHome() {
  currentWorkout = null;
  resetTopbarStats();
  const profile = Profile.loadProfile() || Profile.DEFAULT_PROFILE;
  Profile.applyProfileToSetupForm(profile);
  showScreen('setup');
}

function initApp() {
  const profile = Profile.loadProfile() || Profile.DEFAULT_PROFILE;
  Profile.initChipGroups(profile);

  if (!Profile.hasProfile()) {
    Profile.applyProfileToProfileForm(profile);
    showScreen('profile');
  } else {
    Profile.applyProfileToSetupForm(profile);
    showScreen('setup');
  }
}

function saveProfileAndContinue() {
  const data = Profile.readProfileForm();
  if (!data.equipment.length || !data.muscles.length || !data.defaultDuration) {
    document.getElementById('profileError').innerText = 'Sélectionnez au moins un équipement, un muscle et une durée totale.';
    return;
  }
  const weightError = Profile.validateWeights(data.equipment, data.weights);
  if (weightError) {
    document.getElementById('profileError').innerText = weightError;
    return;
  }
  Profile.saveProfile(data);
  Profile.applyProfileToSetupForm(data);
  document.getElementById('profileError').innerText = '';
  showScreen('setup');
}

function openProfileSettings() {
  const profile = Profile.loadProfile() || Profile.DEFAULT_PROFILE;
  Profile.applyProfileToProfileForm(profile);
  showScreen('profile');
}

function createSession() {
  const form = Profile.readSessionForm();
  const profile = Profile.loadProfile() || Profile.DEFAULT_PROFILE;
  document.getElementById('setupError').innerText = '';

  if (!form.equipment.length || !form.muscles.length || !form.duration) {
    document.getElementById('setupError').innerText = 'Remplissez tous les champs obligatoires.';
    return;
  }

  const result = Generator.generateWorkout({
    equipment: form.equipment,
    muscles: form.muscles,
    injuries: form.injuries,
    duration: form.duration,
    noJumpRun: form.noJumpRun,
    bannedExercises: profile.bannedExercises || [],
    weights: profile.weights || {}
  });

  if (result.error) {
    document.getElementById('setupError').innerText = result.error;
    return;
  }

  currentWorkout = result;
  sessionDuration = form.duration;
  renderPreview(result);
  showScreen('preview');
}

function renderPreview(workout) {
  const list = document.getElementById('previewList');
  let html = '';

  if (workout.warmup?.length) {
    html += '<li class="preview-section">Échauffement (2 min)</li>';
    html += workout.warmup.map(w =>
      `<li class="preview-warmup preview-row"><span>${w.name} — ${w.durationSeconds} s</span>${ExerciseHelp.helpButton(w.id)}</li>`
    ).join('');
    html += '<li class="preview-section">Séance</li>';
  }

  html += workout.exercises.map(ex =>
    `<li class="preview-row"><span><strong>${ex.name}</strong> — ${ex.durationMinutes} min · max reps</span>${ExerciseHelp.helpButton(ex.id)}</li>`
  ).join('');

  list.innerHTML = html;

  document.getElementById('previewMeta').innerText =
    workout.exercises.length + ' exercices · ~' +
    Generator.formatDuration(workout.estimatedSeconds);
}

function startFromPreview() {
  showScreen('workout');
  Workout.startWorkout(currentWorkout.phases, sessionDuration, currentWorkout.exercises);
}

function backToSetup() {
  showScreen('setup');
}

document.addEventListener('DOMContentLoaded', initApp);

window.saveProfileAndContinue = saveProfileAndContinue;
window.openProfileSettings = openProfileSettings;
window.createSession = createSession;
window.startFromPreview = startFromPreview;
window.backToSetup = backToSetup;
window.showFinishScreen = showFinishScreen;
window.goHome = goHome;
