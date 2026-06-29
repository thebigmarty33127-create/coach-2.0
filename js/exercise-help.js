function helpButton(exerciseId) {
  return `<button type="button" class="help-btn" onclick="ExerciseHelp.show('${exerciseId}')" aria-label="Comment faire">?</button>`;
}

function show(id) {
  const info = getExerciseInfo(id);
  if (!info) return;

  document.getElementById('modalTitle').innerText = info.name;
  document.getElementById('modalDesc').innerText = info.description;
  document.getElementById('exerciseModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function close() {
  document.getElementById('exerciseModal').style.display = 'none';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') close();
});

window.ExerciseHelp = { show, close, helpButton };
