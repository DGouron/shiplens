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
    .metric-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; margin-top: 0.25rem; }
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

    document.getElementById('loadTeamBtn').addEventListener('click', loadTeam);

    async function loadTeam() {
      var teamId = document.getElementById('teamId').value.trim();
      if (!teamId) return;
      clearError();

      try {
        var response = await fetch(API + '/analytics/teams/' + encodeURIComponent(teamId) + '/cycles');
        if (!response.ok) {
          var err = await response.json().catch(function() { return {}; });
          throw new Error(err.message || 'Erreur lors du chargement des cycles');
        }
        var data = await response.json();
        var selector = document.getElementById('cycleSelector');
        selector.innerHTML = '<option value="">Selectionnez un cycle...</option>';
        data.cycles.forEach(function(cycle) {
          var option = document.createElement('option');
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
      var cycleId = this.value;
      if (!cycleId) return;
      var teamId = document.getElementById('teamId').value.trim();
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
      var container = document.getElementById('metricsContent');
      container.innerHTML = '<div class="loading">Chargement...</div>';

      try {
        var response = await fetch(
          API + '/analytics/cycles/' + encodeURIComponent(cycleId) + '/metrics?teamId=' + encodeURIComponent(teamId)
        );
        if (!response.ok) {
          var err = await response.json().catch(function() { return {}; });
          container.innerHTML = '<div class="report-empty">' + escapeHtml(err.message || 'Metriques non disponibles') + '</div>';
          return;
        }
        var data = await response.json();
        var scopeCreepValue = parseInt(data.scopeCreep) || 0;
        var scopeCreepClass = scopeCreepValue > 30 ? 'metric-card scope-creep-alert' : 'metric-card';

        container.innerHTML =
          '<div class="metrics-grid">' +
          '<div class="metric-card"><div class="metric-value">' + escapeHtml(data.velocity) + '</div><div class="metric-label">Velocite</div></div>' +
          '<div class="metric-card"><div class="metric-value">' + escapeHtml(data.throughput) + '</div><div class="metric-label">Throughput</div></div>' +
          '<div class="metric-card"><div class="metric-value">' + escapeHtml(data.completionRate) + '</div><div class="metric-label">Taux de completion</div></div>' +
          '<div class="' + scopeCreepClass + '"><div class="metric-value">' + escapeHtml(data.scopeCreep) + '</div><div class="metric-label">Scope creep</div></div>' +
          '<div class="metric-card"><div class="metric-value">' + escapeHtml(data.averageCycleTime) + '</div><div class="metric-label">Cycle time moyen</div></div>' +
          '<div class="metric-card"><div class="metric-value">' + escapeHtml(data.averageLeadTime) + '</div><div class="metric-label">Lead time moyen</div></div>' +
          '</div>';
      } catch (error) {
        container.innerHTML = '<div class="report-empty">Erreur: ' + escapeHtml(error.message) + '</div>';
      }
    }

    async function loadIssues(cycleId, teamId) {
      var container = document.getElementById('issuesContent');
      container.innerHTML = '<div class="loading">Chargement...</div>';

      try {
        var response = await fetch(
          API + '/analytics/cycles/' + encodeURIComponent(cycleId) + '/issues?teamId=' + encodeURIComponent(teamId)
        );
        if (!response.ok) {
          var err = await response.json().catch(function() { return {}; });
          throw new Error(err.message || 'Erreur lors du chargement des issues');
        }
        var data = await response.json();

        if (data.issues.length === 0) {
          container.innerHTML = '<div class="report-empty">Aucune issue dans ce cycle.</div>';
          return;
        }

        var html = '<table><thead><tr><th>Titre</th><th>Statut</th><th>Points</th><th>Assignee</th></tr></thead><tbody>';
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
      var markdown = '# ' + currentReport.cycleName + '\\n\\n' +
        '## Resume\\n' + currentReport.executiveSummary + '\\n\\n' +
        '## Tendances\\n' + currentReport.trends + '\\n\\n' +
        '## Points forts\\n' + currentReport.highlights + '\\n\\n' +
        '## Risques\\n' + currentReport.risks + '\\n\\n' +
        '## Recommandations\\n' + currentReport.recommendations + '\\n';
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
        showError('Aucun rapport a exporter. Veuillez d\\'abord generer un rapport pour ce cycle.');
        return;
      }
      var text = currentReport.executiveSummary + '\\n\\n' +
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
