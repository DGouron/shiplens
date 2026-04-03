export const cycleReportPageHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shiplens - Rapport de cycle</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { font-size: 1.5rem; color: #f8fafc; }
    .selectors { display: flex; gap: 1rem; align-items: center; }
    select, input { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.5rem 1rem; font-size: 0.875rem; }
    select:focus, input:focus { outline: none; border-color: #3b82f6; }
    .section { background: #1e293b; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; }
    .section-title { font-size: 1.1rem; color: #94a3b8; margin-bottom: 1rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; font-size: 0.75rem; }
    .report-content { line-height: 1.7; color: #cbd5e1; }
    .report-empty { color: #64748b; font-style: italic; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .metric-card { background: #0f172a; border-radius: 0.5rem; padding: 1rem; }
    .metric-value { font-size: 1.5rem; font-weight: 700; color: #f8fafc; }
    .metric-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; margin-top: 0.25rem; display: flex; align-items: center; gap: 0.35rem; }
    .metric-info { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 50%; border: 1px solid #475569; color: #64748b; font-size: 0.6rem; font-style: normal; font-weight: 600; cursor: help; flex-shrink: 0; }
    .metric-info:hover { border-color: #93c5fd; color: #93c5fd; }
    .metric-info .tooltip { display: none; position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); background: #334155; color: #e2e8f0; font-size: 0.75rem; font-weight: 400; text-transform: none; padding: 0.5rem 0.75rem; border-radius: 0.375rem; white-space: normal; width: 220px; line-height: 1.4; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .metric-info .tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 5px solid transparent; border-top-color: #334155; }
    .metric-info:hover .tooltip { display: block; }
    .alert { color: #f59e0b; }
    .scope-creep-alert .metric-value { color: #ef4444; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; color: #64748b; font-size: 0.75rem; text-transform: uppercase; padding: 0.75rem; border-bottom: 1px solid #334155; }
    td { padding: 0.75rem; border-bottom: 1px solid #1e293b; color: #cbd5e1; font-size: 0.875rem; }
    tr:hover td { background: #0f172a; }
    .status-badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 500; }
    .status-done { background: #064e3b; color: #6ee7b7; }
    .status-progress { background: #1e3a5f; color: #93c5fd; }
    .status-other { background: #334155; color: #94a3b8; }
    .actions { display: flex; gap: 0.5rem; }
    .btn { background: #334155; color: #e2e8f0; border: none; border-radius: 0.5rem; padding: 0.5rem 1rem; cursor: pointer; font-size: 0.875rem; }
    .btn:hover { background: #475569; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .loading { text-align: center; color: #64748b; padding: 2rem; }
    .error { background: #450a0a; color: #fca5a5; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; }
    .cycle-status { font-size: 0.75rem; color: #3b82f6; margin-left: 0.5rem; }
    .toast { position: fixed; bottom: 2rem; right: 2rem; background: #065f46; color: #6ee7b7; padding: 0.75rem 1.5rem; border-radius: 0.5rem; display: none; z-index: 100; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Shiplens - Rapport de cycle</h1>
      <div class="selectors">
        <label>
          Team ID
          <input type="text" id="teamId" placeholder="team-id" />
        </label>
        <label>
          Cycle
          <select id="cycleSelector" disabled>
            <option value="">Chargez une team...</option>
          </select>
        </label>
        <button class="btn" id="loadTeamBtn">Charger</button>
      </div>
    </header>

    <div id="errorContainer"></div>

    <div class="section" id="reportSection">
      <div class="section-title">Rapport IA</div>
      <div id="reportContent" class="report-empty">Aucun rapport genere pour ce cycle.</div>
      <div class="actions" style="margin-top: 1rem;">
        <button class="btn" id="exportBtn" disabled>Exporter Markdown</button>
        <button class="btn" id="copyBtn" disabled>Copier</button>
      </div>
    </div>

    <div class="section" id="metricsSection">
      <div class="section-title">Metriques</div>
      <div id="metricsContent" class="loading">Selectionnez un cycle pour voir les metriques.</div>
    </div>

    <div class="section" id="issuesSection">
      <div class="section-title">Issues du cycle</div>
      <div id="issuesContent" class="loading">Selectionnez un cycle pour voir les issues.</div>
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    const API = window.location.origin;
    let currentReport = null;

    function showError(message) {
      document.getElementById('errorContainer').innerHTML =
        '<div class="error">' + escapeHtml(message) + '</div>';
    }

    function clearError() {
      document.getElementById('errorContainer').innerHTML = '';
    }

    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.style.display = 'block';
      setTimeout(function() { toast.style.display = 'none'; }, 2000);
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
      var cls = cssClass || 'metric-card';
      return '<div class="' + cls + '">' +
        '<div class="metric-value">' + escapeHtml(value) + '</div>' +
        '<div class="metric-label">' + escapeHtml(label) +
        '<span class="metric-info">i<span class="tooltip">' + escapeHtml(tooltip) + '</span></span>' +
        '</div></div>';
    }

    document.getElementById('loadTeamBtn').addEventListener('click', loadTeam);

    const urlParams = new URLSearchParams(window.location.search);
    const initialTeamId = urlParams.get('teamId');
    if (initialTeamId) {
      document.getElementById('teamId').value = initialTeamId;
      loadTeam();
    }

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
          option.textContent = cycle.name + ' (' + cycle.issueCount + ' issues) - ' + cycle.status;
          selector.appendChild(option);
        });
        selector.disabled = false;
      } catch (error) {
        showError(error.message);
      }
    }

    document.getElementById('cycleSelector').addEventListener('change', function() {
      const cycleId = this.value;
      if (!cycleId) return;
      const teamId = document.getElementById('teamId').value.trim();
      clearError();
      currentReport = null;
      document.getElementById('exportBtn').disabled = true;
      document.getElementById('copyBtn').disabled = true;
      document.getElementById('reportContent').className = 'report-empty';
      document.getElementById('reportContent').textContent = 'Aucun rapport genere pour ce cycle.';
      loadMetrics(cycleId, teamId);
      loadIssues(cycleId, teamId);
    });

    async function loadMetrics(cycleId, teamId) {
      const container = document.getElementById('metricsContent');
      container.innerHTML = '<div class="loading">Chargement...</div>';

      try {
        const response = await fetch(
          API + '/analytics/cycles/' + encodeURIComponent(cycleId) + '/metrics?teamId=' + encodeURIComponent(teamId)
        );
        if (!response.ok) {
          const err = await response.json().catch(function() { return {}; });
          container.innerHTML = '<div class="report-empty">' + escapeHtml(err.message || 'Metriques non disponibles') + '</div>';
          return;
        }
        const data = await response.json();
        const scopeCreepValue = parseInt(data.scopeCreep) || 0;
        const scopeCreepClass = scopeCreepValue > 30 ? 'metric-card scope-creep-alert' : 'metric-card';

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
        container.innerHTML = '<div class="report-empty">Erreur: ' + escapeHtml(error.message) + '</div>';
      }
    }

    async function loadIssues(cycleId, teamId) {
      const container = document.getElementById('issuesContent');
      container.innerHTML = '<div class="loading">Chargement...</div>';

      try {
        const response = await fetch(
          API + '/analytics/cycles/' + encodeURIComponent(cycleId) + '/issues?teamId=' + encodeURIComponent(teamId)
        );
        if (!response.ok) {
          const err = await response.json().catch(function() { return {}; });
          throw new Error(err.message || 'Erreur lors du chargement des issues');
        }
        const data = await response.json();

        if (data.issues.length === 0) {
          container.innerHTML = '<div class="report-empty">Aucune issue dans ce cycle.</div>';
          return;
        }

        let html = '<table><thead><tr><th>Titre</th><th>Statut</th><th>Points</th><th>Assignee</th></tr></thead><tbody>';
        data.issues.forEach(function(issue) {
          html += '<tr>' +
            '<td>' + escapeHtml(issue.title) + '</td>' +
            '<td>' + statusBadge(issue.statusName) + '</td>' +
            '<td>' + escapeHtml(issue.points) + '</td>' +
            '<td>' + escapeHtml(issue.assigneeName) + '</td>' +
            '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;
      } catch (error) {
        container.innerHTML = '<div class="report-empty">Erreur: ' + escapeHtml(error.message) + '</div>';
      }
    }

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
