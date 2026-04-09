import { type Locale } from '../../entities/workspace-settings/workspace-language.schema.js';
import { workspaceDashboardTranslations } from '../presenters/workspace-dashboard.translations.js';

export function buildWorkspaceDashboardHtml(locale: Locale): string {
  const translations = workspaceDashboardTranslations[locale];
  const translationsJson = JSON.stringify(translations);

  return `<!DOCTYPE html>
<html lang="${locale}" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${translations.pageTitle} — Shiplens</title>
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

    .container { max-width: 1280px; margin: 0 auto; padding: 1.5rem 2rem 3rem; }

    .page-title {
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin-bottom: 1.5rem;
    }

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
        <span class="nav-crumb-active">${translations.breadcrumbDashboard}</span>
      </div>
      <div class="nav-right">
        <a href="/settings" class="nav-crumb">${translations.navSettings}</a>
        <div class="theme-toggle" id="themeToggle" title="${translations.themeToggleTitle}">
          <span class="theme-icon theme-icon-dark">&#9790;</span>
          <span class="theme-icon theme-icon-light">&#9788;</span>
        </div>
      </div>
    </nav>

    <div class="container">
      <h1 class="page-title">${translations.pageTitle}</h1>
      <div id="loading">${translations.loading}</div>
      <div id="error"></div>
      <div id="sync-status" class="glass sync-bar" style="display:none"></div>
      <div id="teams-grid" class="teams-grid"></div>
    </div>
  </div>

  <script>
    var TRANSLATIONS = ${translationsJson};

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

    async function loadDashboard() {
      try {
        var response = await fetch('/dashboard/data');
        if (!response.ok) {
          var error = await response.json();
          throw new Error(error.message || TRANSLATIONS.errorUnknown);
        }
        var data = await response.json();
        renderDashboard(data);
      } catch (error) {
        document.getElementById('loading').style.display = 'none';
        var errorDiv = document.getElementById('error');
        errorDiv.style.display = 'block';
        errorDiv.textContent = error.message;
      }
    }

    var MAX_RETRIES = 3;
    var syncAttempt = 0;

    function renderEmptyState(data) {
      document.getElementById('loading').style.display = 'none';
      var grid = document.getElementById('teams-grid');
      if (data.status === 'no_teams') {
        grid.innerHTML = '<div class="empty-state">'
          + '<p>' + TRANSLATIONS.syncTeams + '</p>'
          + '<button class="btn btn-accent" disabled>' + TRANSLATIONS.syncInProgress + '</button>'
          + '</div>';
        startSync();
      } else {
        grid.innerHTML = '<div class="empty-state"><p>' + data.message + '</p></div>';
      }
    }

    async function startSync() {
      syncAttempt++;
      var btn = document.querySelector('.empty-state .btn');
      if (!btn) return;
      btn.disabled = true;
      btn.textContent = TRANSLATIONS.syncInProgress + (syncAttempt > 1 ? ' (' + TRANSLATIONS.syncRetry + ' ' + syncAttempt + '/' + MAX_RETRIES + ')' : '');
      try {
        var teamsResponse = await fetch('/sync/teams');
        if (!teamsResponse.ok) throw new Error(TRANSLATIONS.syncErrorRetrieveTeams);
        var teams = await teamsResponse.json();
        if (teams.length === 0) throw new Error(TRANSLATIONS.syncErrorNoTeams);

        var selectedTeams = teams.map(function(team) { return { teamId: team.teamId, teamName: team.teamName }; });
        var allProjects = teams.flatMap(function(team) {
          return (team.projects || []).map(function(project) {
            return { projectId: project.projectId, projectName: project.projectName, teamId: team.teamId };
          });
        });
        var seen = new Set();
        var selectedProjects = allProjects.filter(function(project) {
          if (seen.has(project.projectId)) return false;
          seen.add(project.projectId);
          return true;
        });
        var selectResponse = await fetch('/sync/selection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedTeams: selectedTeams, selectedProjects: selectedProjects }),
        });
        if (!selectResponse.ok) throw new Error(TRANSLATIONS.syncErrorSelectTeams);

        btn.textContent = TRANSLATIONS.syncReferenceData;
        await fetch('/sync/reference-data', { method: 'POST' });

        btn.textContent = TRANSLATIONS.syncIssues;
        for (var index = 0; index < selectedTeams.length; index++) {
          await fetch('/sync/issue-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: selectedTeams[index].teamId }),
          });
        }

        window.location.reload();
      } catch (error) {
        if (syncAttempt < MAX_RETRIES) {
          var delay = Math.pow(2, syncAttempt) * 1000;
          btn.textContent = error.message;
          setTimeout(startSync, delay);
        } else {
          btn.textContent = error.message;
          btn.disabled = false;
          btn.onclick = function() { syncAttempt = 0; startSync(); };
        }
      }
    }

    async function resync() {
      var btn = document.querySelector('#sync-status .btn');
      if (!btn) return;
      btn.disabled = true;
      btn.textContent = TRANSLATIONS.syncInProgress;
      try {
        var selectionResponse = await fetch('/sync/selection');
        var selection = await selectionResponse.json();
        if (!selection) throw new Error(TRANSLATIONS.syncNoSelection);

        btn.textContent = TRANSLATIONS.syncReferenceData;
        await fetch('/sync/reference-data', { method: 'POST' });

        btn.textContent = TRANSLATIONS.syncIssues;
        for (var index = 0; index < selection.selectedTeams.length; index++) {
          await fetch('/sync/issue-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: selection.selectedTeams[index].teamId }),
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

      var syncDiv = document.getElementById('sync-status');
      syncDiv.style.display = 'flex';
      syncDiv.className = 'glass sync-bar' + (data.synchronization.isLate ? ' late' : '');
      syncDiv.innerHTML =
        '<div class="sync-info">' +
          '<span class="sync-dot"></span>' +
          '<span>' +
            (data.synchronization.lastSyncDate
              ? TRANSLATIONS.lastSync + new Date(data.synchronization.lastSyncDate).toLocaleString('${locale === 'fr' ? 'fr-FR' : 'en-US'}')
              : TRANSLATIONS.neverSynced) +
          '</span>' +
          (data.synchronization.lateWarning
            ? '<span class="alert-text">' + data.synchronization.lateWarning + '</span>'
            : '') +
        '</div>' +
        '<button class="btn" onclick="resync()">' + TRANSLATIONS.resynchronize + '</button>';

      var grid = document.getElementById('teams-grid');
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
          + '<div class="kpi"><span class="kpi-label">' + TRANSLATIONS.kpiCompletion + '</span><span class="kpi-value">' + team.completionRate + '</span></div>'
          + '<div class="kpi"><span class="kpi-label">' + TRANSLATIONS.kpiVelocity + '</span><span class="kpi-value">' + team.currentVelocity + ' pts (' + team.velocityTrendLabel + ')</span></div>'
          + '<div class="kpi"><span class="kpi-label">' + TRANSLATIONS.kpiBlockedIssues + '</span><span class="kpi-value' + (team.blockedAlert ? ' alert-text' : '') + '">' + team.blockedIssuesCount + '</span></div>'
          + (team.reportLink ? '<a class="report-link" href="' + team.reportLink + '">' + TRANSLATIONS.viewReport + '</a>' : '<p class="no-cycle">' + TRANSLATIONS.noReportAvailable + '</p>')
          + '</div>';
      }).join('');
    }

    loadDashboard();
  </script>
</body>
</html>`;
}
