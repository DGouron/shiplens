export const workspaceDashboardHtml = `<!DOCTYPE html>
<html lang="fr" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard — Shiplens</title>
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
    .nav-crumb-active { color: var(--text-secondary); font-weight: 600; font-size: 0.85rem; }

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

    .page-title {
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin-bottom: 1.5rem;
    }

    /* ── GLASS ── */
    .glass {
      background: var(--bg-surface);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem 1.5rem;
      box-shadow: var(--shadow-card);
      transition: all var(--transition);
      animation: fadeSlideIn 0.5s ease both;
    }

    /* ── SYNC BAR ── */
    .sync-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .sync-bar.late { border-left: 3px solid var(--danger); }

    .sync-info {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .sync-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 8px rgba(16,185,129,0.4);
      animation: pulse 2s ease infinite;
    }

    .sync-bar.late .sync-dot { background: var(--danger); box-shadow: 0 0 8px rgba(239,68,68,0.4); }

    .alert-text { color: var(--danger); font-weight: 600; }

    /* ── BUTTONS ── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.95rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      color: var(--text-secondary);
      font-size: 0.8rem;
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

    /* ── TEAMS GRID ── */
    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.25rem;
    }

    .team-card {
      background: var(--bg-surface);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: var(--shadow-card);
      transition: all var(--transition);
      animation: fadeSlideIn 0.5s ease both;
    }

    .team-card:nth-child(1) { animation-delay: 0.05s; }
    .team-card:nth-child(2) { animation-delay: 0.10s; }
    .team-card:nth-child(3) { animation-delay: 0.15s; }
    .team-card:nth-child(4) { animation-delay: 0.20s; }
    .team-card:nth-child(5) { animation-delay: 0.25s; }
    .team-card:nth-child(6) { animation-delay: 0.30s; }

    .team-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover);
      border-color: var(--border-hover);
    }

    .team-name {
      font-size: 1.05rem;
      font-weight: 700;
      margin-bottom: 0.2rem;
    }

    .cycle-name {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .kpi {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.55rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.85rem;
    }
    .kpi:last-of-type { border-bottom: none; }

    .kpi-label { color: var(--text-muted); }

    .kpi-value {
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .kpi-value.alert-text {
      background: linear-gradient(135deg, var(--warning), var(--danger));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .no-cycle { color: var(--text-muted); font-style: italic; font-size: 0.85rem; padding: 0.5rem 0; }

    .report-link {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      margin-top: 1rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 600;
      transition: color var(--transition);
    }
    .report-link:hover { color: var(--accent-2); }
    .report-link::after { content: ' \\2192'; }

    /* ── EMPTY STATE ── */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--bg-surface);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      border: 1px solid var(--border);
      border-radius: var(--radius);
      animation: fadeSlideIn 0.5s ease both;
    }
    .empty-state p { font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem; }

    /* ── LOADING / ERROR ── */
    #loading {
      text-align: center;
      padding: 3rem;
      color: var(--text-muted);
    }

    #loading::before {
      content: '';
      display: block;
      width: 28px; height: 28px;
      border: 2px solid var(--border);
      border-top-color: var(--accent-1);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin: 0 auto 1rem;
    }

    #error { color: var(--danger); text-align: center; padding: 2rem; display: none; font-size: 0.9rem; }

    /* ── ANIMATIONS ── */
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  </style>
</head>
<body>
  <div class="app">
    <nav class="nav">
      <div class="nav-left">
        <a href="/dashboard" class="nav-brand">Shiplens</a>
        <span class="nav-sep">/</span>
        <span class="nav-crumb-active">Dashboard</span>
      </div>
      <div class="nav-right">
        <div class="theme-toggle" id="themeToggle" title="Changer de theme">
          <span class="theme-icon theme-icon-dark">&#9790;</span>
          <span class="theme-icon theme-icon-light">&#9788;</span>
        </div>
      </div>
    </nav>

    <div class="container">
      <h1 class="page-title">Dashboard</h1>
      <div id="loading">Chargement...</div>
      <div id="error"></div>
      <div id="sync-status" class="glass sync-bar" style="display:none"></div>
      <div id="teams-grid" class="teams-grid"></div>
    </div>
  </div>

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
    async function loadDashboard() {
      try {
        const response = await fetch('/dashboard/data');
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Erreur inconnue');
        }
        const data = await response.json();
        renderDashboard(data);
      } catch (error) {
        document.getElementById('loading').style.display = 'none';
        const errorDiv = document.getElementById('error');
        errorDiv.style.display = 'block';
        errorDiv.textContent = error.message;
      }
    }

    const MAX_RETRIES = 3;
    let syncAttempt = 0;

    function renderEmptyState(data) {
      document.getElementById('loading').style.display = 'none';
      const grid = document.getElementById('teams-grid');
      if (data.status === 'no_teams') {
        grid.innerHTML = '<div class="empty-state">'
          + '<p>Synchronisation des equipes en cours...</p>'
          + '<button class="btn btn-accent" disabled>Synchronisation en cours...</button>'
          + '</div>';
        startSync();
      } else {
        grid.innerHTML = '<div class="empty-state"><p>' + data.message + '</p></div>';
      }
    }

    async function startSync() {
      syncAttempt++;
      const btn = document.querySelector('.empty-state .btn');
      if (!btn) return;
      btn.disabled = true;
      btn.textContent = 'Synchronisation en cours...' + (syncAttempt > 1 ? ' (tentative ' + syncAttempt + '/' + MAX_RETRIES + ')' : '');
      try {
        const teamsResponse = await fetch('/sync/teams');
        if (!teamsResponse.ok) throw new Error('Impossible de recuperer les equipes');
        const teams = await teamsResponse.json();
        if (teams.length === 0) throw new Error('Aucune equipe disponible dans le workspace');

        const selectedTeams = teams.map(function(team) { return { teamId: team.teamId, teamName: team.teamName }; });
        const allProjects = teams.flatMap(function(team) {
          return (team.projects || []).map(function(project) {
            return { projectId: project.projectId, projectName: project.projectName, teamId: team.teamId };
          });
        });
        const seen = new Set();
        const selectedProjects = allProjects.filter(function(project) {
          if (seen.has(project.projectId)) return false;
          seen.add(project.projectId);
          return true;
        });
        const selectResponse = await fetch('/sync/selection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedTeams: selectedTeams, selectedProjects: selectedProjects }),
        });
        if (!selectResponse.ok) throw new Error('Impossible de selectionner les equipes');

        btn.textContent = 'Donnees de reference...';
        await fetch('/sync/reference-data', { method: 'POST' });

        btn.textContent = 'Synchronisation des issues...';
        for (const team of selectedTeams) {
          await fetch('/sync/issue-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: team.teamId }),
          });
        }

        window.location.reload();
      } catch (error) {
        if (syncAttempt < MAX_RETRIES) {
          const delay = Math.pow(2, syncAttempt) * 1000;
          btn.textContent = error.message + ' — nouvelle tentative dans ' + (delay / 1000) + 's...';
          setTimeout(startSync, delay);
        } else {
          btn.textContent = error.message;
          btn.disabled = false;
          btn.onclick = function() { syncAttempt = 0; startSync(); };
        }
      }
    }

    async function resync() {
      const btn = document.querySelector('#sync-status .btn');
      if (!btn) return;
      btn.disabled = true;
      btn.textContent = 'Synchronisation...';
      try {
        const selectionResponse = await fetch('/sync/selection');
        const selection = await selectionResponse.json();
        if (!selection) throw new Error('Aucune selection');

        btn.textContent = 'Donnees de reference...';
        await fetch('/sync/reference-data', { method: 'POST' });

        btn.textContent = 'Issues...';
        for (const team of selection.selectedTeams) {
          await fetch('/sync/issue-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: team.teamId }),
          });
        }

        window.location.reload();
      } catch (error) {
        btn.textContent = error.message;
        btn.disabled = false;
      }
    }

    function renderDashboard(data) {
      document.getElementById('loading').style.display = 'none';

      if (data.status) {
        renderEmptyState(data);
        return;
      }

      const syncDiv = document.getElementById('sync-status');
      syncDiv.style.display = 'flex';
      syncDiv.className = 'glass sync-bar' + (data.synchronization.isLate ? ' late' : '');
      syncDiv.innerHTML =
        '<div class="sync-info">' +
          '<span class="sync-dot"></span>' +
          '<span>' +
            (data.synchronization.lastSyncDate
              ? 'Derniere sync : ' + new Date(data.synchronization.lastSyncDate).toLocaleString('fr-FR')
              : 'Jamais synchronise') +
          '</span>' +
          (data.synchronization.lateWarning
            ? '<span class="alert-text">' + data.synchronization.lateWarning + '</span>'
            : '') +
        '</div>' +
        '<button class="btn" onclick="resync()">Resynchroniser</button>';

      const grid = document.getElementById('teams-grid');
      grid.innerHTML = data.teams.map(function(team) {
        if (!team.hasActiveCycle) {
          return '<div class="team-card">'
            + '<div class="team-name">' + team.teamName + '</div>'
            + '<p class="no-cycle">' + team.noActiveCycleMessage + '</p>'
            + '</div>';
        }
        return '<div class="team-card">'
          + '<div class="team-name">' + team.teamName + '</div>'
          + '<div class="cycle-name">' + team.cycleName + '</div>'
          + '<div class="kpi"><span class="kpi-label">Completion</span><span class="kpi-value">' + team.completionRate + '</span></div>'
          + '<div class="kpi"><span class="kpi-label">Velocite</span><span class="kpi-value">' + team.currentVelocity + ' pts (' + team.velocityTrendLabel + ')</span></div>'
          + '<div class="kpi"><span class="kpi-label">Issues bloquees</span><span class="kpi-value' + (team.blockedAlert ? ' alert-text' : '') + '">' + team.blockedIssuesCount + '</span></div>'
          + (team.reportLink ? '<a class="report-link" href="' + team.reportLink + '">Voir le rapport</a>' : '<p class="no-cycle">Aucun rapport disponible</p>')
          + '</div>';
      }).join('');
    }

    loadDashboard();
  </script>
</body>
</html>`;
