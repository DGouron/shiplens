export const cycleReportPageHtml = `<!DOCTYPE html>
<html lang="fr" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shiplens — Rapport de cycle</title>
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
      --glow: 0 0 30px rgba(99,102,241,0.08);
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
      --glow: 0 0 20px rgba(99,102,241,0.05);
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
        radial-gradient(ellipse 60% 50% at 80% 80%, rgba(168,85,247,0.06), transparent),
        radial-gradient(ellipse 40% 40% at 50% 50%, rgba(99,102,241,0.03), transparent);
      pointer-events: none;
      z-index: 0;
    }

    [data-theme="light"] body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,0.04), transparent),
        radial-gradient(ellipse 60% 50% at 80% 80%, rgba(168,85,247,0.03), transparent);
      pointer-events: none;
      z-index: 0;
    }

    .app { position: relative; z-index: 1; }

    /* ── NAV ── */
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

    /* ── THEME TOGGLE ── */
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

    /* ── CONTAINER ── */
    .container { max-width: 1280px; margin: 0 auto; padding: 1.5rem 2rem 3rem; }

    /* ── PAGE HEADER ── */
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

    /* ── SELECTORS ── */
    .selector-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .custom-select {
      appearance: none;
      -webkit-appearance: none;
      background: var(--bg-surface);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
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

    input[type="text"] {
      display: none;
    }

    /* ── BUTTONS ── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      color: var(--text-secondary);
      font-size: 0.82rem;
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition);
      text-decoration: none;
    }
    .btn:hover { border-color: var(--border-hover); background: var(--bg-hover); color: var(--text-primary); }
    .btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .btn:disabled:hover { background: var(--bg-surface); border-color: var(--border); color: var(--text-secondary); }

    .btn-accent {
      background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
      color: #fff;
      border: none;
      font-weight: 600;
    }
    .btn-accent:hover { opacity: 0.9; color: #fff; }

    /* ── GLASS SECTION ── */
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

    .glass:nth-child(2) { animation-delay: 0.08s; }
    .glass:nth-child(3) { animation-delay: 0.16s; }
    .glass:nth-child(4) { animation-delay: 0.24s; }

    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .section-title {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }

    /* ── METRICS ── */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.85rem;
    }

    @media (max-width: 900px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 560px) { .metrics-grid { grid-template-columns: 1fr; } }

    .metric-card {
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 1.15rem 1.25rem;
      transition: all var(--transition);
      animation: fadeSlideIn 0.5s ease both;
    }

    .metric-card:nth-child(1) { animation-delay: 0.12s; }
    .metric-card:nth-child(2) { animation-delay: 0.18s; }
    .metric-card:nth-child(3) { animation-delay: 0.24s; }
    .metric-card:nth-child(4) { animation-delay: 0.30s; }
    .metric-card:nth-child(5) { animation-delay: 0.36s; }
    .metric-card:nth-child(6) { animation-delay: 0.42s; }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover);
      border-color: var(--border-hover);
    }

    .metric-value {
      font-size: 1.65rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 50%, var(--accent-3) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }

    .metric-label {
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-top: 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .scope-creep-alert .metric-value {
      background: linear-gradient(135deg, var(--warning), var(--danger));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ── TOOLTIP ── */
    .metric-info {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px; height: 14px;
      border-radius: 50%;
      border: 1px solid var(--text-dim);
      color: var(--text-muted);
      font-size: 0.55rem;
      font-style: normal;
      font-weight: 700;
      cursor: help;
      flex-shrink: 0;
      transition: all var(--transition);
    }
    .metric-info:hover { border-color: var(--accent-1); color: var(--accent-1); }

    .tooltip {
      display: none;
      position: absolute;
      bottom: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-elevated);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      color: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 400;
      text-transform: none;
      letter-spacing: normal;
      padding: 0.6rem 0.85rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-hover);
      white-space: normal;
      width: 230px;
      line-height: 1.5;
      z-index: 50;
      box-shadow: 0 8px 30px rgba(0,0,0,0.35);
    }
    .tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: var(--border-hover);
    }
    .metric-info:hover .tooltip { display: block; }

    /* ── TABLE ── */
    table { width: 100%; border-collapse: collapse; }

    th {
      text-align: left;
      color: var(--text-muted);
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border);
    }

    td {
      padding: 0.7rem 1rem;
      border-bottom: 1px solid var(--border);
      color: var(--text-primary);
      font-size: 0.85rem;
      transition: background var(--transition);
    }

    tbody tr { transition: background var(--transition); }
    tbody tr:hover { background: var(--bg-hover); }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.65rem;
      border-radius: 99px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .status-done { background: rgba(16,185,129,0.12); color: var(--success); }
    .status-progress { background: rgba(99,102,241,0.12); color: var(--accent-1); }
    .status-other { background: var(--bg-elevated); color: var(--text-muted); border: 1px solid var(--border); }

    .status-badge::before {
      content: '';
      width: 6px; height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    /* ── REPORT SECTION ── */
    .report-content { line-height: 1.7; color: var(--text-secondary); }
    .report-empty { color: var(--text-muted); font-style: italic; font-size: 0.9rem; }

    .report-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }

    /* ── ERROR ── */
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

    /* ── TOAST ── */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--bg-elevated);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
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

    /* ── LOADING ── */
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

    /* ── ANIMATIONS ── */
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
        <span class="nav-crumb nav-crumb-active">Rapport de cycle</span>
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
        <h1 class="page-title">Rapport de cycle</h1>
        <div class="selector-bar">
          <input type="text" id="teamId" />
          <select class="custom-select" id="cycleSelector" disabled>
            <option value="">Chargement des cycles...</option>
          </select>
        </div>
      </div>

      <div id="errorContainer"></div>

      <div class="glass" id="metricsSection">
        <div class="section-head">
          <span class="section-title">Metriques</span>
        </div>
        <div id="metricsContent" class="loading">Selectionnez un cycle pour voir les metriques.</div>
      </div>

      <div class="glass" id="issuesSection">
        <div class="section-head">
          <span class="section-title">Issues du cycle</span>
        </div>
        <div id="issuesContent" class="loading">Selectionnez un cycle pour voir les issues.</div>
      </div>

      <div class="glass" id="reportSection">
        <div class="section-head">
          <span class="section-title">Rapport IA</span>
          <div class="report-actions">
            <button class="btn btn-accent" id="generateBtn" disabled>Generer le rapport</button>
            <button class="btn" id="exportBtn" disabled>&#8681; Export</button>
            <button class="btn" id="copyBtn" disabled>&#9112; Copier</button>
          </div>
        </div>
        <div id="reportContent" class="report-empty">Selectionnez un cycle pour generer un rapport.</div>
      </div>
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    /* ── THEME ── */
    (function() {
      const saved = localStorage.getItem('shiplens-theme') || 'dark';
      document.documentElement.setAttribute('data-theme', saved);
    })();

    document.getElementById('themeToggle').addEventListener('click', function() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('shiplens-theme', next);
    });

    /* ── APP LOGIC ── */
    const API = window.location.origin;
    let currentReport = null;

    function showError(message) {
      document.getElementById('errorContainer').innerHTML =
        '<div class="error-msg">' + escapeHtml(message) + '</div>';
    }

    function clearError() {
      document.getElementById('errorContainer').innerHTML = '';
    }

    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.style.display = 'block';
      setTimeout(function() { toast.style.display = 'none'; }, 2500);
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode(text));
      return div.innerHTML;
    }

    function statusBadge(statusName) {
      const lower = statusName.toLowerCase();
      let cls = 'status-other';
      if (lower === 'done' || lower === 'completed') cls = 'status-done';
      else if (lower === 'in progress' || lower === 'started') cls = 'status-progress';
      return '<span class="status-badge ' + cls + '">' + escapeHtml(statusName) + '</span>';
    }

    function metricCard(value, label, tooltip, cssClass) {
      const cls = cssClass || 'metric-card';
      return '<div class="' + cls + '">' +
        '<div class="metric-value">' + escapeHtml(value) + '</div>' +
        '<div class="metric-label">' + escapeHtml(label) +
        '<span class="metric-info">i<span class="tooltip">' + escapeHtml(tooltip) + '</span></span>' +
        '</div></div>';
    }

    /* ── INIT ── */
    const urlParams = new URLSearchParams(window.location.search);
    const initialTeamId = urlParams.get('teamId');
    if (initialTeamId) {
      document.getElementById('teamId').value = initialTeamId;
      loadTeam();
    }

    document.getElementById('cycleSelector').addEventListener('change', function() {
      const cycleId = this.value;
      if (!cycleId) return;
      const teamId = document.getElementById('teamId').value.trim();
      clearError();
      currentReport = null;
      document.getElementById('generateBtn').disabled = false;
      document.getElementById('exportBtn').disabled = true;
      document.getElementById('copyBtn').disabled = true;
      document.getElementById('reportContent').className = 'report-empty';
      document.getElementById('reportContent').textContent = 'Aucun rapport genere pour ce cycle.';
      loadMetrics(cycleId, teamId);
      loadIssues(cycleId, teamId);
    });

    async function loadTeam() {
      const teamId = document.getElementById('teamId').value.trim();
      if (!teamId) return;
      clearError();

      try {
        const response = await fetch(API + '/analytics/teams/' + encodeURIComponent(teamId) + '/cycles');
        if (!response.ok) {
          const err = await response.json().catch(function() { return {}; });
          throw new Error(err.message || 'Erreur lors du chargement des cycles');
        }
        const data = await response.json();
        const selector = document.getElementById('cycleSelector');
        selector.innerHTML = '<option value="">Selectionnez un cycle...</option>';
        data.cycles.forEach(function(cycle) {
          const option = document.createElement('option');
          option.value = cycle.externalId;
          option.textContent = cycle.name + ' (' + cycle.issueCount + ' issues) — ' + cycle.status;
          selector.appendChild(option);
        });
        selector.disabled = false;
      } catch (error) {
        showError(error.message);
      }
    }

    async function loadMetrics(cycleId, teamId) {
      const container = document.getElementById('metricsContent');
      container.className = 'loading';
      container.textContent = 'Chargement des metriques...';

      try {
        const response = await fetch(
          API + '/analytics/cycles/' + encodeURIComponent(cycleId) + '/metrics?teamId=' + encodeURIComponent(teamId)
        );
        if (!response.ok) {
          const err = await response.json().catch(function() { return {}; });
          container.className = '';
          container.innerHTML = '<div class="report-empty">' + escapeHtml(err.message || 'Metriques non disponibles') + '</div>';
          return;
        }
        const data = await response.json();
        const scopeCreepValue = parseInt(data.scopeCreep) || 0;
        const scopeCreepClass = scopeCreepValue > 30 ? 'metric-card scope-creep-alert' : 'metric-card';

        container.className = '';
        container.innerHTML =
          '<div class="metrics-grid">' +
          metricCard(data.velocity, 'Velocite', 'Points completes par rapport aux points planifies sur le cycle.') +
          metricCard(data.throughput, 'Throughput', 'Nombre total d\\'issues terminees dans le cycle.') +
          metricCard(data.completionRate, 'Taux de completion', 'Pourcentage d\\'issues du scope initial terminees (hors scope creep).') +
          metricCard(data.scopeCreep, 'Scope creep', 'Issues ajoutees apres le debut du cycle. Un scope creep eleve indique un perimetre instable.', scopeCreepClass) +
          metricCard(data.averageCycleTime, 'Cycle time moyen', 'Duree moyenne entre le debut du travail sur une issue et sa completion.') +
          metricCard(data.averageLeadTime, 'Lead time moyen', 'Duree moyenne entre la creation d\\'une issue et sa completion. Inclut le temps d\\'attente avant le debut du travail.') +
          '</div>';
      } catch (error) {
        container.className = '';
        container.innerHTML = '<div class="report-empty">Erreur: ' + escapeHtml(error.message) + '</div>';
      }
    }

    async function loadIssues(cycleId, teamId) {
      const container = document.getElementById('issuesContent');
      container.className = 'loading';
      container.textContent = 'Chargement des issues...';

      try {
        const response = await fetch(
          API + '/analytics/cycles/' + encodeURIComponent(cycleId) + '/issues?teamId=' + encodeURIComponent(teamId)
        );
        if (!response.ok) {
          const err = await response.json().catch(function() { return {}; });
          throw new Error(err.message || 'Erreur lors du chargement des issues');
        }
        const data = await response.json();

        container.className = '';
        if (data.issues.length === 0) {
          container.innerHTML = '<div class="report-empty">Aucune issue dans ce cycle.</div>';
          return;
        }

        let html = '<table><thead><tr><th>Titre</th><th>Statut</th><th>Points</th><th>Assignee</th></tr></thead><tbody>';
        data.issues.forEach(function(issue) {
          html += '<tr>' +
            '<td>' + escapeHtml(issue.title) + '</td>' +
            '<td>' + statusBadge(issue.statusName) + '</td>' +
            '<td style="font-variant-numeric:tabular-nums">' + escapeHtml(issue.points != null ? String(issue.points) : '—') + '</td>' +
            '<td>' + escapeHtml(issue.assigneeName || '—') + '</td>' +
            '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;
      } catch (error) {
        container.className = '';
        container.innerHTML = '<div class="report-empty">Erreur: ' + escapeHtml(error.message) + '</div>';
      }
    }

    document.getElementById('generateBtn').addEventListener('click', async function() {
      const cycleId = document.getElementById('cycleSelector').value;
      const teamId = document.getElementById('teamId').value.trim();
      if (!cycleId || !teamId) return;

      const btn = document.getElementById('generateBtn');
      const reportEl = document.getElementById('reportContent');
      btn.disabled = true;
      btn.textContent = 'Generation en cours...';
      reportEl.className = 'loading';
      reportEl.textContent = 'Le rapport est en cours de generation par l\\'IA...';
      clearError();

      try {
        const response = await fetch(
          API + '/analytics/cycles/' + encodeURIComponent(cycleId) + '/report',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: teamId, language: 'FR', provider: 'Anthropic' }),
          }
        );
        if (!response.ok) {
          const err = await response.json().catch(function() { return {}; });
          throw new Error(err.message || 'Erreur lors de la generation du rapport');
        }
        const data = await response.json();
        currentReport = data;

        reportEl.className = 'report-content';
        reportEl.innerHTML =
          '<h3 style="margin-bottom:0.75rem;color:var(--text-primary);">' + escapeHtml(data.cycleName) + '</h3>' +
          '<p><strong style="color:var(--text-secondary);">Resume</strong></p>' +
          '<p>' + escapeHtml(data.executiveSummary) + '</p><br>' +
          '<p><strong style="color:var(--text-secondary);">Tendances</strong></p>' +
          '<p>' + escapeHtml(data.trends) + '</p><br>' +
          '<p><strong style="color:var(--text-secondary);">Points forts</strong></p>' +
          '<p>' + escapeHtml(data.highlights) + '</p><br>' +
          '<p><strong style="color:var(--text-secondary);">Risques</strong></p>' +
          '<p>' + escapeHtml(data.risks) + '</p><br>' +
          '<p><strong style="color:var(--text-secondary);">Recommandations</strong></p>' +
          '<p>' + escapeHtml(data.recommendations) + '</p>';

        document.getElementById('exportBtn').disabled = false;
        document.getElementById('copyBtn').disabled = false;
        btn.textContent = 'Regenerer';
        btn.disabled = false;
      } catch (error) {
        reportEl.className = 'report-empty';
        reportEl.textContent = error.message;
        btn.textContent = 'Reessayer';
        btn.disabled = false;
      }
    });

    document.getElementById('exportBtn').addEventListener('click', function() {
      if (!currentReport) {
        showError('Aucun rapport a exporter. Veuillez d\\'abord generer un rapport pour ce cycle.');
        return;
      }
      const markdown = '# ' + currentReport.cycleName + '\\n\\n' +
        '## Resume\\n' + currentReport.executiveSummary + '\\n\\n' +
        '## Tendances\\n' + currentReport.trends + '\\n\\n' +
        '## Points forts\\n' + currentReport.highlights + '\\n\\n' +
        '## Risques\\n' + currentReport.risks + '\\n\\n' +
        '## Recommandations\\n' + currentReport.recommendations + '\\n';
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = currentReport.cycleName.replace(/\\s+/g, '-').toLowerCase() + '-report.md';
      anchor.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('copyBtn').addEventListener('click', function() {
      if (!currentReport) {
        showError('Aucun rapport a exporter. Veuillez d\\'abord generer un rapport pour ce cycle.');
        return;
      }
      const text = currentReport.executiveSummary + '\\n\\n' +
        currentReport.trends + '\\n\\n' +
        currentReport.highlights + '\\n\\n' +
        currentReport.risks + '\\n\\n' +
        currentReport.recommendations;
      navigator.clipboard.writeText(text).then(function() {
        showToast('Rapport copie !');
      });
    });
  </script>
</body>
</html>`;
