const moduleNames = {
  'weekly-report':    'Weekly GM Report',
  'dsp-pitch':        'DSP Pitch List',
  'artist-scorecard': 'Artist Scorecard',
  'youtube-digest':   'YouTube Digest',
  'email-drafter':    'Email Drafter',
  'meeting-log':      'Meeting Log',
  'madcapp-estimator':'MADCAPP Estimator',
  'campaign-planner': 'Campaign Planner',
  'data-proof':       'Data Proof Builder',
};

function activateModule(moduleId) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.module-panel').forEach(el => el.classList.remove('active'));

  const navItem = document.querySelector(`.nav-item[data-module="${moduleId}"]`);
  const panel   = document.getElementById(`panel-${moduleId}`);

  if (navItem) navItem.classList.add('active');
  if (panel)   panel.classList.add('active');

  const title = document.getElementById('topbar-title');
  if (title) title.textContent = moduleNames[moduleId] || '';
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => activateModule(item.dataset.module));
});

(function setDate() {
  const el = document.getElementById('current-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).toUpperCase();
})();
