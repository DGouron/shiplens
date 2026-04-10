import { type Locale } from '../../entities/workspace-settings/workspace-language.schema.js';
import { memberHealthTrendsTranslations } from '../presenters/member-health-trends.translations.js';
import { faviconLink } from './favicon.js';

export function buildMemberHealthTrendsHtml(locale: Locale): string {
  const translations = memberHealthTrendsTranslations[locale];
  const translationsJson = JSON.stringify(translations);

  return `<!DOCTYPE html>
<html lang="${locale}" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${translations.pageTitle} — Shiplens</title>
  ${faviconLink}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
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
      --bg-deep: #f4f4fb;
      --bg-base: #ffffff;
      --bg-surface: rgba(255, 255, 255, 0.92);
      --bg-elevated: rgba(255, 255, 255, 0.96);
      --bg-hover: rgba(238, 242, 255, 0.95);
      --border: rgba(99, 102, 241, 0.12);
      --border-hover: rgba(99, 102, 241, 0.25);
      --border-strong: rgba(99, 102, 241, 0.45);
      --text-primary: #1a1a2e;
      --text-secondary: #4338ca;
      --text-muted: #64748b;
      --text-dim: #cbd5e1;
      --glass-blur: 20px;
      --shadow-card: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(99,102,241,0.06), 0 0 0 1px rgba(99,102,241,0.08);
      --shadow-hover: 0 4px 20px rgba(99,102,241,0.12), 0 0 0 1px rgba(99,102,241,0.15);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
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
        radial-gradient(ellipse 80% 60% at 10% 0%, rgba(99,102,241,0.07), transparent 60%),
        radial-gradient(ellipse 60% 50% at 90% 90%, rgba(168,85,247,0.05), transparent 60%);
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
    .nav-crumb { color: var(--text-muted); text-decoration: none; font-size: 0.85rem; }
    .nav-crumb:hover { color: var(--text-secondary); }
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

    .page-header { margin-bottom: 1.5rem; }

    .page-title {
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin-bottom: 0.25rem;
    }

    .page-subtitle {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .member-name {
      background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .signals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .signal-card {
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

    .signal-card:nth-child(1) { animation-delay: 0.05s; }
    .signal-card:nth-child(2) { animation-delay: 0.10s; }
    .signal-card:nth-child(3) { animation-delay: 0.15s; }
    .signal-card:nth-child(4) { animation-delay: 0.20s; }
    .signal-card:nth-child(5) { animation-delay: 0.25s; }

    .signal-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover);
      border-color: var(--border-hover);
    }

    .signal-label {
      font-size: 0.78rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }

    .signal-value {
      font-size: 1.8rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      margin-bottom: 0.5rem;
    }

    .signal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .signal-trend {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .indicator-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .indicator-green { background: var(--success); box-shadow: 0 0 8px rgba(16,185,129,0.4); }
    .indicator-orange { background: var(--warning); box-shadow: 0 0 8px rgba(245,158,11,0.4); }
    .indicator-red { background: var(--danger); box-shadow: 0 0 8px rgba(239,68,68,0.4); }
    .indicator-grey { background: var(--text-dim); }

    .signal-note {
      font-size: 0.75rem;
      color: var(--text-dim);
      margin-top: 0.25rem;
      font-style: italic;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 600;
      transition: color var(--transition);
      margin-bottom: 1.5rem;
    }
    .back-link:hover { color: var(--accent-2); }
    .back-link::before { content: '\\2190 '; }

    .cycles-selector {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .cycles-selector label {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .custom-select {
      padding: 0.4rem 0.8rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--bg-elevated);
      color: var(--text-primary);
      font-family: inherit;
      font-size: 0.85rem;
      cursor: pointer;
      transition: border-color var(--transition);
    }
    .custom-select:hover { border-color: var(--border-hover); }

    .notice {
      background: var(--bg-surface);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent-1);
      border-radius: var(--radius-sm);
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      font-size: 0.84rem;
      line-height: 1.6;
      color: var(--text-secondary);
      animation: fadeSlideIn 0.4s ease both;
    }

    .notice strong { color: var(--text-primary); font-weight: 600; }

    .notice-indicators {
      display: flex;
      gap: 1.25rem;
      margin-top: 0.6rem;
      flex-wrap: wrap;
    }

    .notice-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.78rem;
    }

    .notice-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .signal-description {
      font-size: 0.78rem;
      line-height: 1.5;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }

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

    #loading { padding: 1.5rem 0; }
    .skeleton-line { height: 14px; background: var(--bg-hover); border-radius: 6px; margin-bottom: 0.75rem; animation: skeletonPulse 1.8s ease-in-out infinite; }
    .skeleton-line:nth-child(1) { width: 60%; }
    .skeleton-line:nth-child(2) { width: 80%; }
    .skeleton-line:nth-child(3) { width: 40%; }
    @keyframes skeletonPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

    #error { color: var(--danger); text-align: center; padding: 2rem; display: none; font-size: 0.9rem; }

    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

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
        <span class="nav-crumb-active">${translations.pageTitle}</span>
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
      <a id="backLink" href="/cycle-report" class="back-link">${translations.backToCycleReport}</a>

      <div class="page-header">
        <h1 class="page-title"><span id="memberTitle" class="member-name"></span> ${translations.healthTrendsSuffix}</h1>
        <p class="page-subtitle">${translations.healthSignalsSubtitle}</p>
      </div>

      <div class="cycles-selector">
        <label for="cyclesSelect">${translations.completedSprintsLabel}</label>
        <select class="custom-select" id="cyclesSelect">
          <option value="3">3</option>
          <option value="5" selected>5</option>
          <option value="8">8</option>
          <option value="10">10</option>
        </select>
      </div>

      <div class="notice">
        ${translations.noticeIntro}
        A minimum of <strong>${translations.noticeMinimum}</strong> is required to compute a trend.
        <div class="notice-indicators">
          <span class="notice-indicator"><span class="notice-dot indicator-green"></span> ${translations.indicatorFavorable}</span>
          <span class="notice-indicator"><span class="notice-dot indicator-orange"></span> ${translations.indicatorMixed}</span>
          <span class="notice-indicator"><span class="notice-dot indicator-red"></span> ${translations.indicatorUnfavorable}</span>
          <span class="notice-indicator"><span class="notice-dot indicator-grey"></span> ${translations.indicatorNotEnoughData}</span>
        </div>
      </div>

      <div id="loading"><div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div></div>
      <div id="error"></div>
      <div id="emptyState" class="empty-state" style="display:none">
        <p>${translations.noDataAvailable}</p>
      </div>
      <div id="signalsGrid" class="signals-grid" style="display:none"></div>
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

    var urlParams = new URLSearchParams(window.location.search);
    var teamId = urlParams.get('teamId') || '';
    var memberName = urlParams.get('memberName') || '';
    var cycles = parseInt(urlParams.get('cycles') || '5', 10) || 5;

    document.getElementById('memberTitle').textContent = memberName;
    document.getElementById('cyclesCount').textContent = String(cycles);

    var cyclesSelect = document.getElementById('cyclesSelect');
    cyclesSelect.value = String(cycles);

    var backLink = document.getElementById('backLink');
    if (teamId) {
      backLink.href = '/cycle-report?teamId=' + encodeURIComponent(teamId);
    }

    var SIGNAL_CONFIG = {
      estimationScore: {
        label: TRANSLATIONS.signalEstimationScore,
        description: TRANSLATIONS.signalEstimationScoreDescription
      },
      underestimationRatio: {
        label: TRANSLATIONS.signalUnderestimationRatio,
        description: TRANSLATIONS.signalUnderestimationRatioDescription
      },
      averageCycleTime: {
        label: TRANSLATIONS.signalAverageCycleTime,
        description: TRANSLATIONS.signalAverageCycleTimeDescription
      },
      driftingTickets: {
        label: TRANSLATIONS.signalDriftingTickets,
        description: TRANSLATIONS.signalDriftingTicketsDescription
      },
      medianReviewTime: {
        label: TRANSLATIONS.signalMedianReviewTime,
        description: TRANSLATIONS.signalMedianReviewTimeDescription
      }
    };

    var TREND_ARROWS = {
      rising: '\\u2197',
      falling: '\\u2198',
      stable: '\\u2192',
      mixed: '\\u223C'
    };

    function escapeHtml(text) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(text));
      return div.innerHTML;
    }

    function renderSignalCard(key, signal) {
      var config = SIGNAL_CONFIG[key] || { label: key, description: '' };
      var trendArrow = signal.trend ? (TREND_ARROWS[signal.trend] || '') : '';
      var trendLabel = signal.trend ? (trendArrow + ' ' + signal.trend) : '';

      var indicatorClass = 'indicator-grey';
      var indicatorAriaLabel = 'neutral';
      if (signal.indicator === 'green') { indicatorClass = 'indicator-green'; indicatorAriaLabel = 'favorable'; }
      else if (signal.indicator === 'orange') { indicatorClass = 'indicator-orange'; indicatorAriaLabel = 'mixed'; }
      else if (signal.indicator === 'red') { indicatorClass = 'indicator-red'; indicatorAriaLabel = 'unfavorable'; }

      var note = '';
      if (signal.indicator === 'not-applicable') {
        note = '<div class="signal-note">' + TRANSLATIONS.noteNotApplicable + '</div>';
      } else if (signal.indicator === 'not-enough-history') {
        note = '<div class="signal-note">' + TRANSLATIONS.noteNotEnoughHistory + '</div>';
      }

      return '<div class="signal-card">' +
        '<div class="signal-label">' + escapeHtml(config.label) + '</div>' +
        '<div class="signal-description">' + escapeHtml(config.description) + '</div>' +
        '<div class="signal-value">' + escapeHtml(signal.value) + '</div>' +
        '<div class="signal-footer">' +
          '<span class="signal-trend">' + trendLabel + '</span>' +
          '<span class="indicator-dot ' + indicatorClass + '" aria-label="' + indicatorAriaLabel + '"></span>' +
        '</div>' +
        note +
      '</div>';
    }

    function renderSignals(data) {
      var grid = document.getElementById('signalsGrid');
      var signalKeys = ['estimationScore', 'underestimationRatio', 'averageCycleTime', 'driftingTickets', 'medianReviewTime'];
      var html = '';

      for (var index = 0; index < signalKeys.length; index++) {
        var key = signalKeys[index];
        html += renderSignalCard(key, data[key]);
      }

      grid.innerHTML = html;
      grid.style.display = '';
    }

    async function loadHealthData() {
      if (!teamId || !memberName) {
        document.getElementById('loading').style.display = 'none';
        var errorDiv = document.getElementById('error');
        errorDiv.style.display = 'block';
        errorDiv.textContent = TRANSLATIONS.errorMissingParams;
        return;
      }

      try {
        var response = await fetch(
          '/api/analytics/teams/' + encodeURIComponent(teamId) +
          '/members/' + encodeURIComponent(memberName) +
          '/health?cycles=' + cycles
        );

        if (response.status === 422) {
          document.getElementById('loading').style.display = 'none';
          document.getElementById('emptyState').style.display = '';
          return;
        }

        if (!response.ok) {
          var errorData = await response.json().catch(function() { return {}; });
          throw new Error(errorData.message || TRANSLATIONS.errorLoadFailed);
        }

        var data = await response.json();
        document.getElementById('loading').style.display = 'none';
        renderSignals(data);
      } catch (error) {
        document.getElementById('loading').style.display = 'none';
        var errorEl = document.getElementById('error');
        errorEl.style.display = 'block';
        errorEl.textContent = error.message;
      }
    }

    cyclesSelect.addEventListener('change', function() {
      cycles = parseInt(this.value, 10) || 5;
      document.getElementById('cyclesCount').textContent = String(cycles);

      var newUrl = window.location.pathname +
        '?teamId=' + encodeURIComponent(teamId) +
        '&memberName=' + encodeURIComponent(memberName) +
        '&cycles=' + cycles;
      window.history.replaceState(null, '', newUrl);

      document.getElementById('signalsGrid').style.display = 'none';
      document.getElementById('emptyState').style.display = 'none';
      document.getElementById('error').style.display = 'none';
      document.getElementById('loading').style.display = '';
      loadHealthData();
    });

    loadHealthData();
  </script>
</body>
</html>`;
}
