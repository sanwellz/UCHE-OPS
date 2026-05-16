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

// ── Module 01: Weekly GM Report ──────────────────────────────────────────────

function renderReport(text) {
  const lines = text.split('\n');
  return lines.map(line => {
    const trimmed = line.trim();
    if (/^\*\*[A-Z][A-Z\s']+\*\*$/.test(trimmed)) {
      return `<div class="report-section-header">${trimmed.replace(/\*\*/g, '')}</div>`;
    }
    const rendered = trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return rendered
      ? `<div class="report-line">${rendered}</div>`
      : '<div class="report-empty-line"></div>';
  }).join('');
}

function setStatus(text, type) {
  const el = document.getElementById('report-status');
  if (!el) return;
  el.textContent = text;
  el.className = 'status-label' + (type ? ` ${type}` : '');
}

async function generateWeeklyReport() {
  const input      = document.getElementById('report-input').value;
  const weekEnding = document.getElementById('week-ending').value;
  const outputEl   = document.getElementById('report-output');
  const generateBtn = document.getElementById('generate-btn');
  const downloadBtn = document.getElementById('download-btn');

  if (!input.trim()) {
    setStatus('INPUT REQUIRED', 'error');
    return;
  }

  outputEl.innerHTML = '';
  generateBtn.disabled = true;
  downloadBtn.disabled = true;
  setStatus('GENERATING...', 'generating');

  let accum = '';

  try {
    const res = await fetch('/api/weekly-report/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, weekEnding }),
    });

    if (!res.ok) {
      const err = await res.json();
      setStatus(`ERROR: ${err.error}`, 'error');
      generateBtn.disabled = false;
      return;
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.text) {
            accum += data.text;
            outputEl.innerHTML = renderReport(accum);
            outputEl.scrollTop = outputEl.scrollHeight;
          }
          if (data.done) {
            setStatus('COMPLETE', '');
            downloadBtn.disabled = false;
          }
          if (data.error) {
            setStatus(`ERROR: ${data.error}`, 'error');
          }
        } catch (_) {}
      }
    }
  } catch (err) {
    setStatus(`ERROR: ${err.message}`, 'error');
  } finally {
    generateBtn.disabled = false;
  }
}

function downloadReport() {
  window.location.href = '/api/weekly-report/download';
}
