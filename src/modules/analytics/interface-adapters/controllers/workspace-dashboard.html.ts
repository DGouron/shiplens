export const workspaceDashboardHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard — Shiplens</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    h1 { margin-bottom: 1.5rem; }
    .sync-status { background: #fff; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .sync-status.late { border-left: 4px solid #e74c3c; }
    .teams-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
    .team-card { background: #fff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .team-card h2 { margin-bottom: 1rem; font-size: 1.2rem; }
    .kpi { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
    .kpi:last-child { border-bottom: none; }
    .alert { color: #e74c3c; font-weight: bold; }
    .no-cycle { color: #999; font-style: italic; }
    .report-link { display: inline-block; margin-top: 1rem; color: #3498db; text-decoration: none; }
    .report-link:hover { text-decoration: underline; }
    #loading { text-align: center; padding: 2rem; }
    #error { color: #e74c3c; text-align: center; padding: 2rem; display: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Dashboard</h1>
    <div id="loading">Chargement...</div>
    <div id="error"></div>
    <div id="sync-status" class="sync-status" style="display:none"></div>
    <div id="teams-grid" class="teams-grid"></div>
  </div>
  <script>
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

    function renderDashboard(data) {
      document.getElementById('loading').style.display = 'none';

      const syncDiv = document.getElementById('sync-status');
      syncDiv.style.display = 'block';
      syncDiv.className = 'sync-status' + (data.synchronization.isLate ? ' late' : '');
      syncDiv.innerHTML = [
        '<strong>Synchronisation</strong>',
        data.synchronization.lastSyncDate
          ? 'Dernière sync : ' + new Date(data.synchronization.lastSyncDate).toLocaleString('fr-FR')
          : 'Jamais synchronisé',
        data.synchronization.lateWarning
          ? '<span class="alert">' + data.synchronization.lateWarning + '</span>'
          : '',
        data.synchronization.nextSync,
      ].filter(Boolean).join(' — ');

      const grid = document.getElementById('teams-grid');
      grid.innerHTML = data.teams.map(function(team) {
        if (!team.hasActiveCycle) {
          return '<div class="team-card">'
            + '<h2>' + team.teamName + '</h2>'
            + '<p class="no-cycle">' + team.noActiveCycleMessage + '</p>'
            + '</div>';
        }
        return '<div class="team-card">'
          + '<h2>' + team.teamName + ' — ' + team.cycleName + '</h2>'
          + '<div class="kpi"><span>Complétion</span><span>' + team.completionRate + '</span></div>'
          + '<div class="kpi"><span>Vélocité</span><span>' + team.currentVelocity + ' pts (' + team.velocityTrendLabel + ')</span></div>'
          + '<div class="kpi"><span>Issues bloquées</span><span' + (team.blockedAlert ? ' class="alert"' : '') + '>' + team.blockedIssuesCount + '</span></div>'
          + (team.reportLink ? '<a class="report-link" href="' + team.reportLink + '">Voir le rapport</a>' : '<p class="no-cycle">Aucun rapport disponible</p>')
          + '</div>';
      }).join('');
    }

    loadDashboard();
  </script>
</body>
</html>`;
