import { type Locale } from '../../entities/workspace-settings/workspace-language.schema.js';
import { cycleReportPageTranslations } from '../presenters/cycle-report-page.translations.js';
import { faviconLink } from './favicon.js';

export function buildCycleReportPageHtml(locale: Locale): string {
  const translations = cycleReportPageTranslations[locale];
  const translationsJson = JSON.stringify(translations);

  return `<!DOCTYPE html>
<html lang="${locale}" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shiplens — ${translations.pageTitle}</title>
  ${faviconLink}
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

    .nav { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 2rem; background: var(--bg-surface); backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur)); border-bottom: 1px solid var(--border); }
    .nav-left { display: flex; align-items: center; gap: 1rem; }
    .nav-brand { font-weight: 800; font-size: 1.1rem; background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.02em; text-decoration: none; }
    .nav-sep { color: var(--text-dim); font-size: 0.85rem; }
    .nav-crumb { color: var(--text-muted); font-size: 0.85rem; text-decoration: none; transition: color var(--transition); }
    .nav-crumb:hover { color: var(--text-secondary); }
    .nav-crumb-active { color: var(--text-secondary); font-weight: 600; }
    .nav-right { display: flex; align-items: center; gap: 1rem; }

    .theme-toggle { width: 44px; height: 24px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; cursor: pointer; position: relative; transition: all var(--transition); }
    .theme-toggle:hover { border-color: var(--border-hover); }
    .theme-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); transition: transform var(--transition); }
    [data-theme="light"] .theme-toggle::after { transform: translateX(20px); }
    .theme-icon { position: absolute; top: 4px; font-size: 0.7rem; line-height: 16px; pointer-events: none; }
    .theme-icon-dark { left: 5px; }
    .theme-icon-light { right: 5px; }

    .container { max-width: 1280px; margin: 0 auto; padding: 1.5rem 2rem 3rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.03em; color: var(--text-primary); }
    .selector-bar { display: flex; align-items: center; gap: 0.75rem; }
    .custom-select { appearance: none; -webkit-appearance: none; background: var(--bg-surface); backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur)); color: var(--text-primary); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.55rem 2.2rem 0.55rem 0.85rem; font-size: 0.85rem; font-family: inherit; cursor: pointer; transition: all var(--transition); background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%236366f1' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.7rem center; min-width: 260px; }
    .custom-select:hover { border-color: var(--border-hover); }
    .custom-select:focus { outline: none; border-color: var(--accent-1); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    .custom-select:disabled { opacity: 0.4; cursor: not-allowed; }
    input[type="text"] { display: none; }

    .btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-surface); backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur)); color: var(--text-secondary); font-size: 0.82rem; font-family: inherit; cursor: pointer; transition: all var(--transition); text-decoration: none; }
    .btn:hover { border-color: var(--border-hover); background: var(--bg-hover); color: var(--text-primary); }
    .btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .btn:disabled:hover { background: var(--bg-surface); border-color: var(--border); color: var(--text-secondary); }
    .btn-accent { background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); color: #fff; border: none; font-weight: 600; }
    .btn-accent:hover { opacity: 0.9; color: #fff; }

    .glass { background: var(--bg-surface); backdrop-filter: blur(var(--glass-blur)); -webkit-backdrop-filter: blur(var(--glass-blur)); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; margin-bottom: 1.25rem; box-shadow: var(--shadow-card); transition: all var(--transition); animation: fadeSlideIn 0.5s ease both; }
    .glass:nth-child(2) { animation-delay: 0.08s; }
    .glass:nth-child(3) { animation-delay: 0.16s; }
    .glass:nth-child(4) { animation-delay: 0.24s; }
    .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .section-title { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }

    .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem; }
    @media (max-width: 900px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 560px) { .metrics-grid { grid-template-columns: 1fr; } }
    .metric-card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.15rem 1.25rem; transition: all var(--transition); animation: fadeSlideIn 0.5s ease both; }
    .metric-card:nth-child(1) { animation-delay: 0.12s; } .metric-card:nth-child(2) { animation-delay: 0.18s; } .metric-card:nth-child(3) { animation-delay: 0.24s; } .metric-card:nth-child(4) { animation-delay: 0.30s; } .metric-card:nth-child(5) { animation-delay: 0.36s; } .metric-card:nth-child(6) { animation-delay: 0.42s; }
    .metric-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); border-color: var(--border-hover); }
    .metric-value { font-size: 1.65rem; font-weight: 800; letter-spacing: -0.03em; background: linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 50%, var(--accent-3) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.2; }
    .metric-label { font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-top: 0.35rem; display: flex; align-items: center; gap: 0.35rem; }
    .scope-creep-alert .metric-value { background: linear-gradient(135deg, var(--warning), var(--danger)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

    .metric-info { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 50%; border: 1px solid var(--text-dim); color: var(--text-muted); font-size: 0.55rem; font-style: normal; font-weight: 700; cursor: help; flex-shrink: 0; transition: all var(--transition); }
    .metric-info:hover { border-color: var(--accent-1); color: var(--accent-1); }
    .tooltip { display: none; position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%); background: var(--bg-elevated); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); color: var(--text-primary); font-size: 0.75rem; font-weight: 400; text-transform: none; letter-spacing: normal; padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-hover); white-space: normal; width: 230px; line-height: 1.5; z-index: 50; box-shadow: 0 8px 30px rgba(0,0,0,0.35); }
    .tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 6px solid transparent; border-top-color: var(--border-hover); }
    .metric-info:hover .tooltip { display: block; }

    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; color: var(--text-muted); font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); }
    td { padding: 0.7rem 1rem; border-bottom: 1px solid var(--border); color: var(--text-primary); font-size: 0.85rem; transition: background var(--transition); }
    tbody tr { transition: background var(--transition); }
    tbody tr:hover { background: var(--bg-hover); }
    .status-badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.65rem; border-radius: 99px; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.02em; }
    .status-done { background: rgba(16,185,129,0.12); color: var(--success); }
    .status-progress { background: rgba(99,102,241,0.12); color: var(--accent-1); }
    .status-other { background: var(--bg-elevated); color: var(--text-muted); border: 1px solid var(--border); }
    .status-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .report-content { line-height: 1.7; color: var(--text-secondary); }
    .report-empty { color: var(--text-muted); font-style: italic; font-size: 0.9rem; }
    .report-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .error-msg { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: var(--danger); border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-bottom: 1rem; font-size: 0.85rem; animation: fadeSlideIn 0.3s ease both; }
    .toast { position: fixed; bottom: 2rem; right: 2rem; background: var(--bg-elevated); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(16,185,129,0.3); color: var(--success); padding: 0.75rem 1.5rem; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; display: none; z-index: 100; box-shadow: 0 8px 30px rgba(0,0,0,0.3); animation: fadeSlideIn 0.3s ease both; }
    .loading { text-align: center; color: var(--text-muted); padding: 2.5rem; font-size: 0.9rem; }
    .loading::before { content: ''; display: block; width: 24px; height: 24px; border: 2px solid var(--border); border-top-color: var(--accent-1); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 0.75rem; }

    @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }

    .severity-badge { display: inline-flex; align-items: center; padding: 0.2rem 0.65rem; border-radius: 99px; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.02em; }
    .severity-critical { background: rgba(239,68,68,0.12); color: var(--danger); }
    .severity-warning { background: rgba(245,158,11,0.12); color: var(--warning); }
    .classification-well-estimated { background: rgba(16,185,129,0.12); color: var(--success); }
    .classification-over-estimated { background: rgba(245,158,11,0.12); color: var(--warning); }
    .classification-under-estimated { background: rgba(239,68,68,0.12); color: var(--danger); }
    .bottleneck-highlight { background: rgba(99,102,241,0.06); border-left: 3px solid var(--accent-1); }
    .evolution-positive { color: var(--success); }
    .evolution-negative { color: var(--danger); }
    .subsection { margin-top: 1.5rem; }
    .section-subtitle { font-size: 0.8rem; color: var(--text-muted); margin-top: -0.5rem; margin-bottom: 1rem; }
    .subsection-title { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 0.75rem; }
    .alert-card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-bottom: 0.5rem; transition: all var(--transition); }
    .alert-card:hover { border-color: var(--border-hover); box-shadow: var(--shadow-hover); }
    .alert-header { display: flex; align-items: center; gap: 0.5rem; }
    .alert-link { color: var(--text-primary); text-decoration: none; font-weight: 600; font-size: 0.88rem; transition: color var(--transition); }
    .alert-link:hover { color: var(--accent-1); }
  </style>
</head>
<body>
  <div class="app">
    <nav class="nav">
      <div class="nav-left">
        <a href="/dashboard" class="nav-brand">Shiplens</a>
        <span class="nav-sep">/</span>
        <a href="/dashboard" class="nav-crumb">${translations.breadcrumbDashboard}</a>
        <span class="nav-sep">/</span>
        <span class="nav-crumb nav-crumb-active">${translations.pageTitle}</span>
      </div>
      <div class="nav-right">
        <a href="/settings" class="nav-crumb" id="settingsLink">${translations.navSettings}</a>
        <div class="theme-toggle" id="themeToggle" title="${translations.themeToggleTitle}">
          <span class="theme-icon theme-icon-dark">&#9790;</span>
          <span class="theme-icon theme-icon-light">&#9788;</span>
        </div>
      </div>
    </nav>

    <div class="container">
      <div class="page-header">
        <h1 class="page-title">${translations.pageTitle}</h1>
        <div class="selector-bar">
          <input type="text" id="teamId" />
          <select class="custom-select" id="cycleSelector" disabled>
            <option value="">${translations.loadingCycles}</option>
          </select>
          <select class="custom-select" id="memberSelector" disabled style="min-width:200px">
            <option value="">${translations.wholeTeam}</option>
          </select>
        </div>
      </div>

      <div id="errorContainer"></div>

      <div class="glass" id="metricsSection">
        <div class="section-head">
          <span class="section-title">${translations.sectionMetrics}</span>
        </div>
        <div id="metricsContent" class="loading">${translations.selectCycleMetrics}</div>
      </div>

      <div class="glass" id="memberMetricsSection" style="display:none">
        <div class="section-head">
          <span class="section-title">${translations.sectionMemberMetrics}</span>
        </div>
        <div id="memberMetricsContent"></div>
      </div>

      <div class="glass" id="bottlenecksSection">
        <div class="section-head">
          <span class="section-title">${translations.sectionBottlenecks}</span>
        </div>
        <div class="section-subtitle">${translations.subtitleBottlenecks}</div>
        <div id="bottlenecksContent" class="loading">${translations.selectCycleBottlenecks}</div>
      </div>

      <div class="glass" id="blockedIssuesSection">
        <div class="section-head">
          <span class="section-title">${translations.sectionBlockedIssues}</span>
          <button class="btn" id="detectBtn" disabled>${translations.buttonDetect}</button>
        </div>
        <div class="section-subtitle">${translations.subtitleBlockedIssues}</div>
        <div id="blockedIssuesContent" class="loading">${translations.selectCycleBlockedIssues}</div>
      </div>

      <div class="glass" id="estimationSection">
        <div class="section-head">
          <span class="section-title">${translations.sectionEstimation}</span>
        </div>
        <div class="section-subtitle">${translations.subtitleEstimation}</div>
        <div id="estimationContent" class="loading">${translations.selectCycleEstimation}</div>
      </div>

      <div class="glass" id="digestSection" style="display:none">
        <div class="section-head">
          <span class="section-title">${translations.sectionDigest}</span>
          <div style="display:flex;gap:0.5rem;align-items:center">
            <a class="btn" id="healthTrendsLink" href="/member-health-trends" target="_blank">${translations.buttonViewHealthTrends}</a>
            <button class="btn btn-accent" id="digestBtn">${translations.buttonGenerateDigest}</button>
          </div>
        </div>
        <div id="digestContent" class="report-empty">${translations.selectMemberDigest}</div>
      </div>

      <div class="glass" id="reportSection">
        <div class="section-head">
          <span class="section-title">${translations.sectionReport}</span>
          <div class="report-actions">
            <button class="btn btn-accent" id="generateBtn" disabled>${translations.buttonGenerateReport}</button>
            <button class="btn" id="exportBtn" disabled>&#8681; ${translations.buttonExport}</button>
            <button class="btn" id="copyBtn" disabled>&#9112; ${translations.buttonCopy}</button>
          </div>
        </div>
        <div id="reportContent" class="report-empty">${translations.selectCycleReport}</div>
      </div>
    </div>
  </div>

  <div class="toast" id="toast"></div>

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

    var API = window.location.origin;
    var currentReport = null;
    var currentIssues = [];
    var currentAlerts = [];
    var currentBottlenecks = null;
    var currentEstimation = null;
    var selectedMember = null;

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

    function escapeHtml(text) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(text));
      return div.innerHTML;
    }

    function statusBadge(statusName) {
      var lower = statusName.toLowerCase();
      var cls = 'status-other';
      if (lower === 'done' || lower === 'completed') cls = 'status-done';
      else if (lower === 'in progress' || lower === 'started') cls = 'status-progress';
      return '<span class="status-badge ' + cls + '">' + escapeHtml(statusName) + '</span>';
    }

    function metricCard(value, label, tooltip, cssClass) {
      var cls = cssClass || 'metric-card';
      return '<div class="' + cls + '">' +
        '<div class="metric-value">' + escapeHtml(value) + '</div>' +
        '<div class="metric-label">' + escapeHtml(label) +
        '<span class="metric-info">i<span class="tooltip">' + escapeHtml(tooltip) + '</span></span>' +
        '</div></div>';
    }

    var urlParams = new URLSearchParams(window.location.search);
    var initialTeamId = urlParams.get('teamId');
    if (initialTeamId) {
      document.getElementById('teamId').value = initialTeamId;
      document.getElementById('settingsLink').href = '/settings?teamId=' + encodeURIComponent(initialTeamId);
      loadTeam();
    }

    document.getElementById('cycleSelector').addEventListener('change', function() {
      var cycleId = this.value;
      if (!cycleId) return;
      var teamId = document.getElementById('teamId').value.trim();
      clearError();
      currentReport = null;
      selectedMember = null;
      currentIssues = [];
      currentAlerts = [];
      currentBottlenecks = null;
      currentEstimation = null;
      document.getElementById('memberSelector').value = '';
      document.getElementById('memberMetricsSection').style.display = 'none';
      document.getElementById('digestSection').style.display = 'none';
      document.getElementById('generateBtn').disabled = false;
      document.getElementById('detectBtn').disabled = false;
      document.getElementById('exportBtn').disabled = true;
      document.getElementById('copyBtn').disabled = true;
      document.getElementById('reportContent').className = 'report-empty';
      document.getElementById('reportContent').textContent = TRANSLATIONS.noReportGenerated;
      loadMetrics(cycleId, teamId);
      loadBottlenecks(cycleId, teamId);
      loadBlockedIssues(teamId);
      loadEstimationAccuracy(teamId, cycleId);
      loadCycleIssues(cycleId, teamId);
    });

    async function loadTeam() {
      var teamId = document.getElementById('teamId').value.trim();
      if (!teamId) return;
      clearError();

      try {
        var response = await fetch(API + '/analytics/teams/' + encodeURIComponent(teamId) + '/cycles');
        if (!response.ok) {
          var err = await response.json().catch(function() { return {}; });
          throw new Error(err.message || TRANSLATIONS.errorLoadCycles);
        }
        var data = await response.json();
        var selector = document.getElementById('cycleSelector');
        selector.innerHTML = '<option value="">' + TRANSLATIONS.selectCycle + '</option>';
        data.cycles.forEach(function(cycle) {
          var option = document.createElement('option');
          option.value = cycle.externalId;
          option.textContent = cycle.name + ' (' + cycle.issueCount + ' issues) — ' + cycle.status;
          selector.appendChild(option);
        });
        selector.disabled = false;

        if (data.cycles.length > 0) {
          selector.value = data.cycles[0].externalId;
          selector.dispatchEvent(new Event('change'));
        }
      } catch (error) {
        showError(error.message);
      }
    }

    async function loadMetrics(cycleId, teamId) {
      var container = document.getElementById('metricsContent');
      container.className = 'loading';
      container.textContent = TRANSLATIONS.loadingMetrics;

      try {
        var response = await fetch(
          API + '/analytics/cycles/' + encodeURIComponent(cycleId) + '/metrics?teamId=' + encodeURIComponent(teamId)
        );
        if (!response.ok) {
          var err = await response.json().catch(function() { return {}; });
          container.className = '';
          container.innerHTML = '<div class="report-empty">' + escapeHtml(err.message || TRANSLATIONS.metricsUnavailable) + '</div>';
          return;
        }
        var data = await response.json();
        var scopeCreepValue = parseInt(data.scopeCreep) || 0;
        var scopeCreepClass = scopeCreepValue > 30 ? 'metric-card scope-creep-alert' : 'metric-card';

        container.className = '';
        container.innerHTML =
          '<div class="metrics-grid">' +
          metricCard(data.velocity, TRANSLATIONS.metricVelocity, TRANSLATIONS.tooltipVelocity) +
          metricCard(data.throughput, TRANSLATIONS.metricThroughput, TRANSLATIONS.tooltipThroughput) +
          metricCard(data.completionRate, TRANSLATIONS.metricCompletionRate, TRANSLATIONS.tooltipCompletionRate) +
          metricCard(data.scopeCreep, TRANSLATIONS.metricScopeCreep, TRANSLATIONS.tooltipScopeCreep, scopeCreepClass) +
          metricCard(data.averageCycleTime, TRANSLATIONS.metricCycleTime, TRANSLATIONS.tooltipCycleTime) +
          metricCard(data.averageLeadTime, TRANSLATIONS.metricLeadTime, TRANSLATIONS.tooltipLeadTime) +
          '</div>';
      } catch (error) {
        container.className = '';
        container.innerHTML = '<div class="report-empty">' + TRANSLATIONS.errorPrefix + escapeHtml(error.message) + '</div>';
      }
    }

    function renderBottlenecks() {
      var container = document.getElementById('bottlenecksContent');
      if (!currentBottlenecks) return;
      var data = currentBottlenecks;

      if (data.statusDistribution.length === 0) {
        container.innerHTML = '<div class="report-empty">' + TRANSLATIONS.noBottleneckData + '</div>';
        return;
      }

      var html = '';

      if (selectedMember) {
        var memberBreakdown = data.assigneeBreakdown.find(function(a) { return a.assigneeName === selectedMember; });
        if (memberBreakdown && memberBreakdown.statusMedians.length > 0) {
          html += '<table><thead><tr><th>' + TRANSLATIONS.headerStatus + '</th><th>' + TRANSLATIONS.headerMedianTime + '</th></tr></thead><tbody>';
          memberBreakdown.statusMedians.forEach(function(median) {
            html += '<tr><td>' + escapeHtml(median.statusName) + '</td><td style="font-variant-numeric:tabular-nums">' + escapeHtml(median.medianHours) + '</td></tr>';
          });
          html += '</tbody></table>';
        } else {
          html += '<div class="report-empty">' + TRANSLATIONS.noBottleneckDataMember + '</div>';
        }
      } else {
        html += '<table><thead><tr><th>' + TRANSLATIONS.headerStatus + '</th><th>' + TRANSLATIONS.headerMedianTime + '</th></tr></thead><tbody>';
        data.statusDistribution.forEach(function(entry) {
          var highlight = entry.statusName === data.bottleneckStatus ? ' class="bottleneck-highlight"' : '';
          html += '<tr' + highlight + '><td>' + escapeHtml(entry.statusName) + '</td><td style="font-variant-numeric:tabular-nums">' + escapeHtml(entry.medianHours) + '</td></tr>';
        });
        html += '</tbody></table>';

        html += '<div class="subsection"><div class="subsection-title">' + TRANSLATIONS.subsectionCycleComparison + '</div><div class="section-subtitle">' + TRANSLATIONS.subsectionCycleComparisonDescription + '</div>';
        if (data.cycleComparison) {
          html += '<table><thead><tr><th>' + TRANSLATIONS.headerStatus + '</th><th>' + TRANSLATIONS.headerPreviousCycle + '</th><th>' + TRANSLATIONS.headerCurrentCycle + '</th><th>' + TRANSLATIONS.headerEvolution + '</th></tr></thead><tbody>';
          data.cycleComparison.forEach(function(entry) {
            var evolutionValue = parseFloat(entry.evolution);
            var evolutionClass = evolutionValue > 0 ? 'evolution-negative' : evolutionValue < 0 ? 'evolution-positive' : '';
            html += '<tr><td>' + escapeHtml(entry.statusName) + '</td><td style="font-variant-numeric:tabular-nums">' + escapeHtml(entry.previousMedianHours) + '</td><td style="font-variant-numeric:tabular-nums">' + escapeHtml(entry.currentMedianHours) + '</td><td class="' + evolutionClass + '">' + escapeHtml(entry.evolution) + '</td></tr>';
          });
          html += '</tbody></table>';
        } else {
          html += '<div class="report-empty">' + TRANSLATIONS.notEnoughCycles + '</div>';
        }
        html += '</div>';

        html += '<div class="subsection"><div class="subsection-title">' + TRANSLATIONS.subsectionAssigneeBreakdown + '</div><div class="section-subtitle">' + TRANSLATIONS.subsectionAssigneeBreakdownDescription + '</div>';
        if (data.assigneeBreakdown.length > 0) {
          var statusSet = {};
          data.assigneeBreakdown.forEach(function(assignee) {
            assignee.statusMedians.forEach(function(median) { statusSet[median.statusName] = true; });
          });
          var allStatuses = Object.keys(statusSet);
          html += '<table><thead><tr><th>' + TRANSLATIONS.headerAssignee + '</th>';
          allStatuses.forEach(function(status) { html += '<th>' + escapeHtml(status) + '</th>'; });
          html += '</tr></thead><tbody>';
          data.assigneeBreakdown.forEach(function(assignee) {
            var medianMap = {};
            assignee.statusMedians.forEach(function(median) { medianMap[median.statusName] = median.medianHours; });
            html += '<tr><td>' + escapeHtml(assignee.assigneeName) + '</td>';
            allStatuses.forEach(function(status) {
              var value = medianMap[status] || '—';
              html += '<td style="font-variant-numeric:tabular-nums">' + escapeHtml(value) + '</td>';
            });
            html += '</tr>';
          });
          html += '</tbody></table>';
        }
        html += '</div>';
      }

      container.innerHTML = html;
    }

    async function loadBottlenecks(cycleId, teamId) {
      var container = document.getElementById('bottlenecksContent');
      container.className = 'loading';
      container.textContent = TRANSLATIONS.loadingBottlenecks;

      try {
        var response = await fetch(
          API + '/analytics/cycles/' + encodeURIComponent(cycleId) + '/bottlenecks?teamId=' + encodeURIComponent(teamId) + '&includeComparison=true'
        );
        if (!response.ok) {
          var err = await response.json().catch(function() { return {}; });
          container.className = '';
          container.innerHTML = '<div class="report-empty">' + escapeHtml(err.message || TRANSLATIONS.bottlenecksUnavailable) + '</div>';
          return;
        }
        currentBottlenecks = await response.json();
        container.className = '';
        renderBottlenecks();
      } catch (error) {
        container.className = '';
        container.innerHTML = '<div class="report-empty">' + TRANSLATIONS.errorPrefix + escapeHtml(error.message) + '</div>';
      }
    }

    function renderBlockedIssues() {
      var container = document.getElementById('blockedIssuesContent');
      var alerts = currentAlerts.slice();

      if (selectedMember) {
        var memberExternalIds = currentIssues
          .filter(function(issue) { return issue.assigneeName === selectedMember; })
          .map(function(issue) { return issue.externalId; });
        alerts = alerts.filter(function(alert) { return memberExternalIds.indexOf(alert.issueExternalId) !== -1; });
      }

      if (alerts.length === 0) {
        container.innerHTML = '<div class="report-empty">' + TRANSLATIONS.noBlockedIssues + '</div>';
        return;
      }

      alerts.sort(function(a, b) {
        if (a.severity === 'critical' && b.severity !== 'critical') return -1;
        if (a.severity !== 'critical' && b.severity === 'critical') return 1;
        return 0;
      });

      var html = '';
      alerts.forEach(function(alert) {
        var severityClass = alert.severity === 'critical' ? 'severity-critical' : 'severity-warning';
        html += '<div class="alert-card">' +
          '<div class="alert-header">' +
          '<a href="' + escapeHtml(alert.issueUrl) + '" target="_blank" class="alert-link">' + escapeHtml(alert.issueTitle) + '</a>' +
          '</div>' +
          '<div style="display:flex;gap:0.5rem;align-items:center;margin-top:0.4rem;">' +
          statusBadge(alert.statusName) +
          '<span class="severity-badge ' + severityClass + '">' + escapeHtml(alert.severity) + '</span>' +
          '<span style="color:var(--text-muted);font-size:0.82rem;">' + escapeHtml(alert.durationHours) + '</span>' +
          '</div>' +
          '</div>';
      });
      container.innerHTML = html;
    }

    async function loadBlockedIssues(teamId) {
      var container = document.getElementById('blockedIssuesContent');
      container.className = 'loading';
      container.textContent = TRANSLATIONS.loadingBlockedIssues;

      try {
        var response = await fetch(API + '/analytics/blocked-issues');
        if (!response.ok) {
          var err = await response.json().catch(function() { return {}; });
          container.className = '';
          container.innerHTML = '<div class="report-empty">' + escapeHtml(err.message || TRANSLATIONS.blockedIssuesUnavailable) + '</div>';
          return;
        }
        var allAlerts = await response.json();
        currentAlerts = teamId ? allAlerts.filter(function(a) { return a.teamId === teamId; }) : allAlerts;
        container.className = '';
        renderBlockedIssues();
      } catch (error) {
        container.className = '';
        container.innerHTML = '<div class="report-empty">' + TRANSLATIONS.errorPrefix + escapeHtml(error.message) + '</div>';
      }
    }

    async function detectBlockedIssues(teamId) {
      var btn = document.getElementById('detectBtn');
      btn.disabled = true;
      btn.textContent = TRANSLATIONS.detectionInProgress;

      try {
        var response = await fetch(API + '/analytics/blocked-issues/detect', { method: 'POST' });
        if (!response.ok) {
          var err = await response.json().catch(function() { return {}; });
          throw new Error(err.message || TRANSLATIONS.errorDetection);
        }
        await loadBlockedIssues(teamId);
        btn.textContent = TRANSLATIONS.buttonDetect;
        btn.disabled = false;
      } catch (error) {
        var container = document.getElementById('blockedIssuesContent');
        container.innerHTML = '<div class="report-empty">' + TRANSLATIONS.errorPrefix + escapeHtml(error.message) + '</div>';
        btn.textContent = TRANSLATIONS.buttonDetect;
        btn.disabled = false;
      }
    }

    function classificationLabel(classification) {
      if (classification === 'well-estimated') return TRANSLATIONS.classificationWellEstimated;
      if (classification === 'over-estimated') return TRANSLATIONS.classificationOverEstimated;
      return TRANSLATIONS.classificationUnderEstimated;
    }

    function renderEstimation() {
      var container = document.getElementById('estimationContent');
      if (!currentEstimation) return;
      var data = currentEstimation;

      if (data.teamScore.issueCount === 0) {
        container.innerHTML = '<div class="report-empty">' + TRANSLATIONS.notEnoughEstimationData + '</div>';
        return;
      }

      var html = '';

      if (selectedMember) {
        var memberScore = data.developerScores.find(function(dev) { return dev.developerName === selectedMember; });
        if (memberScore) {
          var memberClassification = 'classification-' + memberScore.classification;
          var memberLabel = classificationLabel(memberScore.classification);
          html += '<div class="metric-card" style="margin-bottom:1rem;">' +
            '<div class="metric-value">' + memberScore.daysPerPoint.toFixed(1) + ' <small>' + TRANSLATIONS.headerDaysPerPoint + '</small></div>' +
            '<div class="metric-label">Score ' + escapeHtml(selectedMember) + ' <span class="severity-badge ' + memberClassification + '">' + escapeHtml(memberLabel) + '</span></div>' +
            '</div>';
          html += '<table><thead><tr><th>' + TRANSLATIONS.headerDeveloper + '</th><th>' + TRANSLATIONS.headerIssues + '</th><th>' + TRANSLATIONS.headerDaysPerPoint + '</th><th>' + TRANSLATIONS.headerClassification + '</th></tr></thead><tbody>';
          html += '<tr><td>' + escapeHtml(memberScore.developerName) + '</td>' +
            '<td style="font-variant-numeric:tabular-nums">' + memberScore.issueCount + '</td>' +
            '<td style="font-variant-numeric:tabular-nums">' + memberScore.daysPerPoint.toFixed(1) + '</td>' +
            '<td><span class="severity-badge ' + memberClassification + '">' + escapeHtml(memberLabel) + '</span></td></tr>';
          html += '</tbody></table>';
        } else {
          html += '<div class="report-empty">' + TRANSLATIONS.noEstimationDataMember + '</div>';
        }
      } else {
        var classificationClass = 'classification-' + data.teamScore.classification;
        var teamLabel = classificationLabel(data.teamScore.classification);

        html += '<div class="metric-card" style="margin-bottom:1rem;">' +
          '<div class="metric-value">' + data.teamScore.daysPerPoint.toFixed(1) + ' <small>' + TRANSLATIONS.headerDaysPerPoint + '</small></div>' +
          '<div class="metric-label">' + TRANSLATIONS.teamScore + ' <span class="severity-badge ' + classificationClass + '">' + escapeHtml(teamLabel) + '</span></div>' +
          '</div>';
        html += '<p style="color:#64748b;font-size:0.85rem;margin:0 0 1.5rem 0;">' + TRANSLATIONS.estimationExplanation + '</p>';

        if (data.developerScores.length > 0) {
          html += '<div class="subsection"><div class="subsection-title">' + TRANSLATIONS.subsectionDeveloperBreakdown + '</div><div class="section-subtitle">' + TRANSLATIONS.subsectionDeveloperBreakdownDescription + '</div>';
          html += '<table><thead><tr><th>' + TRANSLATIONS.headerDeveloper + '</th><th>' + TRANSLATIONS.headerIssues + '</th><th>' + TRANSLATIONS.headerDaysPerPoint + '</th><th>' + TRANSLATIONS.headerClassification + '</th></tr></thead><tbody>';
          data.developerScores.forEach(function(dev) {
            var devClassification = 'classification-' + dev.classification;
            var devLabel = classificationLabel(dev.classification);
            html += '<tr><td>' + escapeHtml(dev.developerName) + '</td>' +
              '<td style="font-variant-numeric:tabular-nums">' + dev.issueCount + '</td>' +
              '<td style="font-variant-numeric:tabular-nums">' + dev.daysPerPoint.toFixed(1) + '</td>' +
              '<td><span class="severity-badge ' + devClassification + '">' + escapeHtml(devLabel) + '</span></td></tr>';
          });
          html += '</tbody></table></div>';
        }
      }

      container.innerHTML = html;
    }

    async function loadEstimationAccuracy(teamId, cycleId) {
      var container = document.getElementById('estimationContent');
      container.className = 'loading';
      container.textContent = TRANSLATIONS.loadingEstimation;

      try {
        var response = await fetch(
          API + '/api/analytics/teams/' + encodeURIComponent(teamId) + '/cycles/' + encodeURIComponent(cycleId) + '/estimation-accuracy'
        );
        if (!response.ok) {
          var err = await response.json().catch(function() { return {}; });
          container.className = '';
          container.innerHTML = '<div class="report-empty">' + escapeHtml(err.message || TRANSLATIONS.estimationUnavailable) + '</div>';
          return;
        }
        currentEstimation = await response.json();
        container.className = '';
        renderEstimation();
      } catch (error) {
        container.className = '';
        container.innerHTML = '<div class="report-empty">' + TRANSLATIONS.errorPrefix + escapeHtml(error.message) + '</div>';
      }
    }

    async function loadCycleIssues(cycleId, teamId) {
      try {
        var response = await fetch(
          API + '/analytics/cycles/' + encodeURIComponent(cycleId) + '/issues?teamId=' + encodeURIComponent(teamId)
        );
        if (!response.ok) {
          currentIssues = [];
          return;
        }
        var data = await response.json();
        currentIssues = data.issues || [];

        var memberSelector = document.getElementById('memberSelector');
        var names = {};
        currentIssues.forEach(function(issue) {
          if (issue.assigneeName && issue.assigneeName !== TRANSLATIONS.unassigned) {
            names[issue.assigneeName] = true;
          }
        });
        var uniqueNames = Object.keys(names).sort();
        memberSelector.innerHTML = '<option value="">' + TRANSLATIONS.wholeTeam + '</option>';
        uniqueNames.forEach(function(name) {
          var option = document.createElement('option');
          option.value = name;
          option.textContent = name;
          memberSelector.appendChild(option);
        });
        memberSelector.disabled = uniqueNames.length === 0;
      } catch (error) {
        currentIssues = [];
      }
    }

    function renderMemberMetrics() {
      var container = document.getElementById('memberMetricsContent');
      if (!selectedMember) {
        document.getElementById('memberMetricsSection').style.display = 'none';
        return;
      }

      document.getElementById('memberMetricsSection').style.display = '';
      var memberIssues = currentIssues.filter(function(issue) { return issue.assigneeName === selectedMember; });

      if (memberIssues.length === 0) {
        container.innerHTML = '<div class="report-empty">' + TRANSLATIONS.noIssueMember + '</div>';
        return;
      }

      var memberExternalIds = memberIssues.map(function(issue) { return issue.externalId; });
      var blockedCount = currentAlerts.filter(function(alert) { return memberExternalIds.indexOf(alert.issueExternalId) !== -1; }).length;

      var inProgressCount = 0;
      var doneCount = 0;
      var completedPoints = 0;

      memberIssues.forEach(function(issue) {
        var lower = issue.statusName.toLowerCase();
        if (lower === 'done' || lower === 'completed') {
          doneCount++;
          var raw = parseInt(issue.points);
          if (!isNaN(raw)) completedPoints += raw;
        } else if (lower.indexOf('progress') !== -1 || lower.indexOf('started') !== -1) {
          inProgressCount++;
        }
      });

      container.innerHTML = '<div class="metrics-grid" style="grid-template-columns:repeat(4,1fr)">' +
        metricCard(String(inProgressCount), TRANSLATIONS.memberMetricInProgress, TRANSLATIONS.tooltipMemberInProgress) +
        metricCard(String(blockedCount), TRANSLATIONS.memberMetricBlocked, TRANSLATIONS.tooltipMemberBlocked) +
        metricCard(String(doneCount), TRANSLATIONS.memberMetricDone, TRANSLATIONS.tooltipMemberDone) +
        metricCard(String(completedPoints), TRANSLATIONS.memberMetricCompletedPoints, TRANSLATIONS.tooltipMemberCompletedPoints) +
        '</div>';
    }

    document.getElementById('memberSelector').addEventListener('change', function() {
      selectedMember = this.value || null;

      document.getElementById('digestSection').style.display = selectedMember ? '' : 'none';
      document.getElementById('digestContent').className = 'report-empty';
      document.getElementById('digestContent').textContent = TRANSLATIONS.clickToGenerateDigest;

      if (selectedMember) {
        var healthTeamId = document.getElementById('teamId').value.trim();
        document.getElementById('healthTrendsLink').href =
          '/member-health-trends?teamId=' + encodeURIComponent(healthTeamId) +
          '&memberName=' + encodeURIComponent(selectedMember) + '&cycles=5';
      }

      renderMemberMetrics();
      renderBottlenecks();
      renderBlockedIssues();
      renderEstimation();
    });

    document.getElementById('digestBtn').addEventListener('click', async function() {
      var cycleId = document.getElementById('cycleSelector').value;
      var teamId = document.getElementById('teamId').value.trim();
      if (!cycleId || !teamId || !selectedMember) return;

      var btn = document.getElementById('digestBtn');
      var digestEl = document.getElementById('digestContent');
      btn.disabled = true;
      btn.textContent = TRANSLATIONS.generatingDigest;
      digestEl.className = 'loading';
      digestEl.textContent = TRANSLATIONS.digestGenerating;

      try {
        var response = await fetch(
          API + '/analytics/cycles/' + encodeURIComponent(cycleId) + '/member-digest',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: teamId, memberName: selectedMember, provider: 'Anthropic' }),
          }
        );
        if (!response.ok) {
          var err = await response.json().catch(function() { return {}; });
          throw new Error(err.message || TRANSLATIONS.digestFailed);
        }
        var data = await response.json();
        digestEl.className = 'report-content';
        digestEl.textContent = data.digest;
        btn.textContent = TRANSLATIONS.buttonRegenerateDigest;
        btn.disabled = false;
      } catch (error) {
        digestEl.className = 'report-empty';
        digestEl.textContent = TRANSLATIONS.digestFailed;
        btn.textContent = TRANSLATIONS.buttonRetry;
        btn.disabled = false;
      }
    });

    document.getElementById('detectBtn').addEventListener('click', function() {
      var teamId = document.getElementById('teamId').value.trim();
      detectBlockedIssues(teamId);
    });

    document.getElementById('generateBtn').addEventListener('click', async function() {
      var cycleId = document.getElementById('cycleSelector').value;
      var teamId = document.getElementById('teamId').value.trim();
      if (!cycleId || !teamId) return;

      var btn = document.getElementById('generateBtn');
      var reportEl = document.getElementById('reportContent');
      btn.disabled = true;
      btn.textContent = TRANSLATIONS.generatingReport;
      reportEl.className = 'loading';
      reportEl.textContent = TRANSLATIONS.reportGenerating;
      clearError();

      try {
        var response = await fetch(
          API + '/analytics/cycles/' + encodeURIComponent(cycleId) + '/report',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: teamId, provider: 'Anthropic' }),
          }
        );
        if (!response.ok) {
          var err = await response.json().catch(function() { return {}; });
          throw new Error(err.message || TRANSLATIONS.reportGenerationError);
        }
        var data = await response.json();
        currentReport = data;

        reportEl.className = 'report-content';
        reportEl.innerHTML =
          '<h3 style="margin-bottom:0.75rem;color:var(--text-primary);">' + escapeHtml(data.cycleName) + '</h3>' +
          '<p><strong style="color:var(--text-secondary);">' + TRANSLATIONS.reportSummary + '</strong></p>' +
          '<p>' + escapeHtml(data.executiveSummary) + '</p><br>' +
          '<p><strong style="color:var(--text-secondary);">' + TRANSLATIONS.reportTrends + '</strong></p>' +
          '<p>' + escapeHtml(data.trends) + '</p><br>' +
          '<p><strong style="color:var(--text-secondary);">' + TRANSLATIONS.reportHighlights + '</strong></p>' +
          '<p>' + escapeHtml(data.highlights) + '</p><br>' +
          '<p><strong style="color:var(--text-secondary);">' + TRANSLATIONS.reportRisks + '</strong></p>' +
          '<p>' + escapeHtml(data.risks) + '</p><br>' +
          '<p><strong style="color:var(--text-secondary);">' + TRANSLATIONS.reportRecommendations + '</strong></p>' +
          '<p>' + escapeHtml(data.recommendations) + '</p>';

        document.getElementById('exportBtn').disabled = false;
        document.getElementById('copyBtn').disabled = false;
        btn.textContent = TRANSLATIONS.buttonRegenerate;
        btn.disabled = false;
      } catch (error) {
        reportEl.className = 'report-empty';
        reportEl.textContent = error.message;
        btn.textContent = TRANSLATIONS.buttonRetry;
        btn.disabled = false;
      }
    });

    document.getElementById('exportBtn').addEventListener('click', function() {
      if (!currentReport) {
        showError(TRANSLATIONS.errorExportNoReport);
        return;
      }
      var markdown = '# ' + currentReport.cycleName + '\\n\\n' +
        '## ' + TRANSLATIONS.reportSummary + '\\n' + currentReport.executiveSummary + '\\n\\n' +
        '## ' + TRANSLATIONS.reportTrends + '\\n' + currentReport.trends + '\\n\\n' +
        '## ' + TRANSLATIONS.reportHighlights + '\\n' + currentReport.highlights + '\\n\\n' +
        '## ' + TRANSLATIONS.reportRisks + '\\n' + currentReport.risks + '\\n\\n' +
        '## ' + TRANSLATIONS.reportRecommendations + '\\n' + currentReport.recommendations + '\\n';
      var blob = new Blob([markdown], { type: 'text/markdown' });
      var url = URL.createObjectURL(blob);
      var anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = currentReport.cycleName.replace(/\\s+/g, '-').toLowerCase() + '-report.md';
      anchor.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('copyBtn').addEventListener('click', function() {
      if (!currentReport) {
        showError(TRANSLATIONS.errorExportNoReport);
        return;
      }
      var text = currentReport.executiveSummary + '\\n\\n' +
        currentReport.trends + '\\n\\n' +
        currentReport.highlights + '\\n\\n' +
        currentReport.risks + '\\n\\n' +
        currentReport.recommendations;
      navigator.clipboard.writeText(text).then(function() {
        showToast(TRANSLATIONS.toastReportCopied);
      });
    });
  </script>
</body>
</html>`;
}
