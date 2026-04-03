export const settingsPageHtml = `<!DOCTYPE html>
<html lang="fr" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Settings — Shiplens</title>
  <style>
    :root {
      --accent-1: #6366f1;
      --accent-2: #a855f7;
      --accent-3: #ec4899;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --radius: 14px;
      --radius-sm: 8px;
      --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    [data-theme="dark"] {
      --bg-deep: #06080f;
      --bg-base: #0c1021;
      --bg-surface: rgba(15, 20, 40, 0.65);
      --bg-elevated: rgba(22, 28, 52, 0.7);
      --bg-hover: rgba(30, 36, 64, 0.8);
      --border: rgba(99, 102, 241, 0.12);
      --border-hover: rgba(99, 102, 241, 0.3);
      --border-strong: rgba(99, 102, 241, 0.5);
      --text-primary: #eef2ff;
      --text-secondary: #c7d2fe;
      --text-muted: #8b8fc7;
      --text-dim: #4f5280;
      --glass-blur: 16px;
      --shadow-card: 0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px var(--border);
      --shadow-hover: 0 8px 40px rgba(99,102,241,0.15), 0 0 0 1px var(--border-hover);
    }

    [data-theme="light"] {
      --bg-deep: #f0f0f8;
      --bg-base: #f8f9fc;
      --bg-surface: rgba(255, 255, 255, 0.75);
      --bg-elevated: rgba(255, 255, 255, 0.85);
      --bg-hover: rgba(238, 242, 255, 0.9);
      --border: rgba(99, 102, 241, 0.15);
      --border-hover: rgba(99, 102, 241, 0.35);
      --border-strong: rgba(99, 102, 241, 0.6);
      --text-primary: #1e1b4b;
      --text-secondary: #4338ca;
      --text-muted: #6b7280;
      --text-dim: #c7d2fe;
      --glass-blur: 20px;
      --shadow-card: 0 2px 16px rgba(99,102,241,0.08), 0 0 0 1px var(--border);
      --shadow-hover: 0 6px 32px rgba(99,102,241,0.12), 0 0 0 1px var(--border-hover);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: var(--bg-deep);
      color: var(--text-primary);
      min-height: 100vh;
      transition: background var(--transition), color var(--transition);
    }

    [data-theme="dark"] body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,0.08), transparent),
        radial-gradient(ellipse 60% 50% at 80% 80%, rgba(168,85,247,0.06), transparent);
      pointer-events: none;
      z-index: 0;
    }

    .app { position: relative; z-index: 1; }

    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 2rem;
      background: var(--bg-surface);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      border-bottom: 1px solid var(--border);
    }

    .nav-left { display: flex; align-items: center; gap: 1rem; }

    .nav-brand {
      font-weight: 800;
      font-size: 1.1rem;
      background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
      text-decoration: none;
    }

    .nav-sep { color: var(--text-dim); font-size: 0.85rem; }
    .nav-crumb { color: var(--text-muted); font-size: 0.85rem; text-decoration: none; transition: color var(--transition); }
    .nav-crumb:hover { color: var(--text-secondary); }
    .nav-crumb-active { color: var(--text-secondary); font-weight: 600; }
    .nav-right { display: flex; align-items: center; gap: 1rem; }

    .theme-toggle {
      width: 44px; height: 24px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 12px;
      cursor: pointer;
      position: relative;
      transition: all var(--transition);
    }
    .theme-toggle:hover { border-color: var(--border-hover); }
    .theme-toggle::after {
      content: '';
      position: absolute;
      top: 3px; left: 3px;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
      transition: transform var(--transition);
    }
    [data-theme="light"] .theme-toggle::after { transform: translateX(20px); }
    .theme-icon { position: absolute; top: 4px; font-size: 0.7rem; line-height: 16px; pointer-events: none; }
    .theme-icon-dark { left: 5px; }
    .theme-icon-light { right: 5px; }

    .container { max-width: 800px; margin: 0 auto; padding: 1.5rem 2rem 3rem; }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--text-primary);
    }

    .custom-select {
      appearance: none;
      -webkit-appearance: none;
      background: var(--bg-surface);
      backdrop-filter: blur(var(--glass-blur));
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0.55rem 2.2rem 0.55rem 0.85rem;
      font-size: 0.85rem;
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%236366f1' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.7rem center;
      min-width: 260px;
    }
    .custom-select:hover { border-color: var(--border-hover); }
    .custom-select:focus { outline: none; border-color: var(--accent-1); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    .custom-select:disabled { opacity: 0.4; cursor: not-allowed; }

    input[type="text"] { display: none; }

    .glass {
      background: var(--bg-surface);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      margin-bottom: 1.25rem;
      box-shadow: var(--shadow-card);
      transition: all var(--transition);
      animation: fadeSlideIn 0.5s ease both;
    }

    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .section-title {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }

    .section-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      backdrop-filter: blur(var(--glass-blur));
      color: var(--text-secondary);
      font-size: 0.82rem;
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition);
      text-decoration: none;
    }
    .btn:hover { border-color: var(--border-hover); background: var(--bg-hover); color: var(--text-primary); }
    .btn:disabled { opacity: 0.35; cursor: not-allowed; }

    .status-input {
      appearance: none;
      -webkit-appearance: none;
      background: var(--bg-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 0.55rem 0.85rem;
      font-size: 0.85rem;
      font-family: inherit;
      transition: all var(--transition);
      flex: 1;
    }
    .status-input:focus { outline: none; border-color: var(--accent-1); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    .status-input::placeholder { color: var(--text-dim); }

    .add-form {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .chip-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.75rem;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 99px;
      font-size: 0.8rem;
      color: var(--text-secondary);
      transition: all var(--transition);
    }

    .chip-remove {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      padding: 0;
      transition: color var(--transition);
    }
    .chip-remove:hover { color: var(--danger); }

    .empty-state {
      color: var(--text-muted);
      font-style: italic;
      font-size: 0.9rem;
    }

    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--bg-elevated);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(16,185,129,0.3);
      color: var(--success);
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      display: none;
      z-index: 100;
      box-shadow: 0 8px 30px rgba(0,0,0,0.3);
      animation: fadeSlideIn 0.3s ease both;
    }

    .error-msg {
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.25);
      color: var(--danger);
      border-radius: var(--radius-sm);
      padding: 0.85rem 1rem;
      margin-bottom: 1rem;
      font-size: 0.85rem;
      animation: fadeSlideIn 0.3s ease both;
    }

    .loading {
      text-align: center;
      color: var(--text-muted);
      padding: 2.5rem;
      font-size: 0.9rem;
    }

    .loading::before {
      content: '';
      display: block;
      width: 24px; height: 24px;
      border: 2px solid var(--border);
      border-top-color: var(--accent-1);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin: 0 auto 0.75rem;
    }

    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="app">
    <nav class="nav">
      <div class="nav-left">
        <a href="/dashboard" class="nav-brand">Shiplens</a>
        <span class="nav-sep">/</span>
        <a href="/dashboard" class="nav-crumb">Dashboard</a>
        <span class="nav-sep">/</span>
        <span class="nav-crumb nav-crumb-active">Settings</span>
      </div>
      <div class="nav-right">
        <div class="theme-toggle" id="themeToggle" title="Changer de theme">
          <span class="theme-icon theme-icon-dark">&#9790;</span>
          <span class="theme-icon theme-icon-light">&#9788;</span>
        </div>
      </div>
    </nav>

    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
        <div>
          <input type="text" id="teamId" />
          <select class="custom-select" id="teamSelector" disabled>
            <option value="">Chargement des equipes...</option>
          </select>
        </div>
      </div>

      <div id="errorContainer"></div>

      <div class="glass" id="excludedStatusesSection">
        <div class="section-head">
          <span class="section-title">Issues bloquees — Statuts exclus</span>
        </div>
        <div class="section-subtitle">Les statuts exclus ne seront pas analyses lors de la detection d'issues bloquees.</div>
        <div id="excludedStatusesContent" class="empty-state">Selectionnez une equipe pour gerer les statuts exclus.</div>
      </div>
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    (function() {
      var saved = localStorage.getItem('shiplens-theme') || 'dark';
      document.documentElement.setAttribute('data-theme', saved);
    })();

    document.getElementById('themeToggle').addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('shiplens-theme', next);
    });

    var API = window.location.origin;
    var currentExcluded = [];

    function escapeHtml(text) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(text));
      return div.innerHTML;
    }

    function showError(message) {
      document.getElementById('errorContainer').innerHTML =
        '<div class="error-msg">' + escapeHtml(message) + '</div>';
    }

    function clearError() {
      document.getElementById('errorContainer').innerHTML = '';
    }

    function showToast(message) {
      var toast = document.getElementById('toast');
      toast.textContent = message;
      toast.style.display = 'block';
      setTimeout(function() { toast.style.display = 'none'; }, 2500);
    }

    var urlParams = new URLSearchParams(window.location.search);
    var initialTeamId = urlParams.get('teamId');
    if (initialTeamId) {
      document.getElementById('teamId').value = initialTeamId;
      loadTeams();
    }

    async function loadTeams() {
      var teamId = document.getElementById('teamId').value.trim();
      if (!teamId) return;
      clearError();

      try {
        var response = await fetch(API + '/analytics/teams/' + encodeURIComponent(teamId) + '/cycles');
        if (!response.ok) throw new Error('Equipe introuvable');
        var selector = document.getElementById('teamSelector');
        selector.innerHTML = '<option value="' + escapeHtml(teamId) + '">' + escapeHtml(teamId) + '</option>';
        selector.disabled = false;
        selector.value = teamId;
        loadExcludedStatuses(teamId);
      } catch (error) {
        showError(error.message);
      }
    }

    document.getElementById('teamSelector').addEventListener('change', function() {
      var teamId = this.value;
      if (!teamId) return;
      clearError();
      loadExcludedStatuses(teamId);
    });

    async function loadExcludedStatuses(teamId) {
      var container = document.getElementById('excludedStatusesContent');
      container.className = 'loading';
      container.textContent = 'Chargement...';

      try {
        var response = await fetch(API + '/settings/teams/' + encodeURIComponent(teamId) + '/excluded-statuses');
        if (!response.ok) throw new Error('Impossible de charger les statuts exclus');
        var data = await response.json();
        currentExcluded = data.statuses;
        renderExcludedStatuses(teamId);
      } catch (error) {
        container.className = '';
        container.innerHTML = '<div class="error-msg">' + escapeHtml(error.message) + '</div>';
      }
    }

    function renderExcludedStatuses(teamId) {
      var container = document.getElementById('excludedStatusesContent');
      container.className = '';

      var html = '<div class="add-form">' +
        '<input type="text" class="status-input" id="newStatusInput" placeholder="Nom du statut a exclure (ex: Todo, Candidate)" />' +
        '<button class="btn" id="addStatusBtn">Ajouter</button>' +
        '</div>';

      if (currentExcluded.length === 0) {
        html += '<div class="empty-state">Aucun statut exclu — toutes les issues seront analysees</div>';
      } else {
        html += '<div class="chip-list">';
        currentExcluded.forEach(function(status) {
          html += '<div class="chip">' +
            '<span>' + escapeHtml(status) + '</span>' +
            '<button class="chip-remove" data-status="' + escapeHtml(status) + '" title="Retirer">&times;</button>' +
            '</div>';
        });
        html += '</div>';
      }

      container.innerHTML = html;

      document.getElementById('addStatusBtn').addEventListener('click', function() {
        addStatus(teamId);
      });

      document.getElementById('newStatusInput').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') addStatus(teamId);
      });

      container.querySelectorAll('.chip-remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
          removeStatus(teamId, btn.getAttribute('data-status'));
        });
      });
    }

    async function addStatus(teamId) {
      var input = document.getElementById('newStatusInput');
      var status = input.value.trim();
      if (!status) return;
      if (currentExcluded.includes(status)) {
        showError('Ce statut est deja exclu');
        return;
      }

      clearError();
      currentExcluded.push(status);
      await saveExcludedStatuses(teamId);
      showToast(status + ' exclu');
    }

    async function removeStatus(teamId, status) {
      clearError();
      currentExcluded = currentExcluded.filter(function(s) { return s !== status; });
      await saveExcludedStatuses(teamId);
      showToast(status + ' retire');
    }

    async function saveExcludedStatuses(teamId) {
      try {
        var response = await fetch(
          API + '/settings/teams/' + encodeURIComponent(teamId) + '/excluded-statuses',
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ statuses: currentExcluded }),
          }
        );
        if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
        renderExcludedStatuses(teamId);
      } catch (error) {
        showError(error.message);
      }
    }
  </script>
</body>
</html>`;
