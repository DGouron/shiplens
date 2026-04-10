import { buildCycleReportPageHtml } from '@modules/analytics/interface-adapters/controllers/cycle-report-page.html.js';
import { buildMemberHealthTrendsHtml } from '@modules/analytics/interface-adapters/controllers/member-health-trends.html.js';
import { buildWorkspaceDashboardHtml } from '@modules/analytics/interface-adapters/controllers/workspace-dashboard.html.js';
import { describe, expect, it } from 'vitest';

describe('Translate remaining pages (acceptance)', () => {
  describe('all user-facing text adapts to workspace language', () => {
    describe('Dashboard', () => {
      it('renders english text when locale is en', () => {
        const html = buildWorkspaceDashboardHtml('en');

        expect(html).toContain('lang="en"');
        expect(html).toContain('>Dashboard</');
        expect(html).toContain('Toggle theme');
        expect(html).toContain('Settings');
      });

      it('renders french text when locale is fr', () => {
        const html = buildWorkspaceDashboardHtml('fr');

        expect(html).toContain('lang="fr"');
        expect(html).toContain('>Dashboard</');
        expect(html).toContain('Changer de theme');
        expect(html).toContain('Settings');
      });

      it('renders sync labels in english', () => {
        const html = buildWorkspaceDashboardHtml('en');

        expect(html).toContain('Last sync: ');
        expect(html).toContain('Never synced');
        expect(html).toContain('Resynchronize');
      });

      it('renders sync labels in french', () => {
        const html = buildWorkspaceDashboardHtml('fr');

        expect(html).toContain('Derniere sync : ');
        expect(html).toContain('Jamais synchronise');
        expect(html).toContain('Resynchroniser');
      });

      it('renders KPI labels in english', () => {
        const html = buildWorkspaceDashboardHtml('en');

        expect(html).toContain('Completion');
        expect(html).toContain('Velocity');
        expect(html).toContain('Blocked issues');
      });

      it('renders KPI labels in french', () => {
        const html = buildWorkspaceDashboardHtml('fr');

        expect(html).toContain('Completion');
        expect(html).toContain('Velocite');
        expect(html).toContain('Issues bloquees');
      });

      it('renders report link in english', () => {
        const html = buildWorkspaceDashboardHtml('en');

        expect(html).toContain('View report');
        expect(html).toContain('No report available');
      });

      it('renders report link in french', () => {
        const html = buildWorkspaceDashboardHtml('fr');

        expect(html).toContain('Voir le rapport');
        expect(html).toContain('Aucun rapport disponible');
      });
    });

    describe('Member Health Trends', () => {
      it('renders english text when locale is en', () => {
        const html = buildMemberHealthTrendsHtml('en');

        expect(html).toContain('lang="en"');
        expect(html).toContain('Health Trends');
        expect(html).toContain('Back to cycle report');
        expect(html).toContain('Completed sprints to analyze:');
      });

      it('renders french text when locale is fr', () => {
        const html = buildMemberHealthTrendsHtml('fr');

        expect(html).toContain('lang="fr"');
        expect(html).toContain('Tendances de sante');
        expect(html).toContain('Retour au rapport de cycle');
        expect(html).toContain('Sprints termines a analyser :');
      });

      it('renders signal labels in english', () => {
        const html = buildMemberHealthTrendsHtml('en');

        expect(html).toContain('Estimation Score');
        expect(html).toContain('Drifting Tickets');
        expect(html).toContain('Median Review Time');
      });

      it('renders signal labels in french', () => {
        const html = buildMemberHealthTrendsHtml('fr');

        expect(html).toContain("Score d'estimation");
        expect(html).toContain('Tickets en derive');
        expect(html).toContain('Temps median de review');
      });

      it('renders indicators in english', () => {
        const html = buildMemberHealthTrendsHtml('en');

        expect(html).toContain('Favorable trend');
        expect(html).toContain('Not enough data');
      });

      it('renders indicators in french', () => {
        const html = buildMemberHealthTrendsHtml('fr');

        expect(html).toContain('Tendance favorable');
        expect(html).toContain('Pas assez de donnees');
      });
    });

    describe('Cycle Report', () => {
      it('renders english text when locale is en', () => {
        const html = buildCycleReportPageHtml('en');

        expect(html).toContain('lang="en"');
        expect(html).toContain('Cycle Report');
        expect(html).toContain('Whole team');
      });

      it('renders french text when locale is fr', () => {
        const html = buildCycleReportPageHtml('fr');

        expect(html).toContain('lang="fr"');
        expect(html).toContain('Rapport de cycle');
        expect(html).toContain("Toute l'equipe");
      });

      it('renders section titles in english', () => {
        const html = buildCycleReportPageHtml('en');

        expect(html).toContain('Metrics');
        expect(html).toContain('Bottlenecks');
        expect(html).toContain('Blocked issues');
        expect(html).toContain('Estimation accuracy');
        expect(html).toContain('AI Report');
      });

      it('renders section titles in french', () => {
        const html = buildCycleReportPageHtml('fr');

        expect(html).toContain('Metriques');
        expect(html).toContain("Goulots d'etranglement");
        expect(html).toContain('Issues bloquees');
        expect(html).toContain("Precision d'estimation");
        expect(html).toContain('Rapport IA');
      });

      it('renders metric labels in english', () => {
        const html = buildCycleReportPageHtml('en');

        expect(html).toContain('Velocity');
        expect(html).toContain('Throughput');
        expect(html).toContain('Completion rate');
      });

      it('renders metric labels in french', () => {
        const html = buildCycleReportPageHtml('fr');

        expect(html).toContain('Velocite');
        expect(html).toContain('Throughput');
        expect(html).toContain('Taux de completion');
      });

      it('renders buttons in english', () => {
        const html = buildCycleReportPageHtml('en');

        expect(html).toContain('Generate report');
        expect(html).toContain('Export');
        expect(html).toContain('Copy');
      });

      it('renders buttons in french', () => {
        const html = buildCycleReportPageHtml('fr');

        expect(html).toContain('Generer le rapport');
        expect(html).toContain('Export');
        expect(html).toContain('Copier');
      });

      it('renders report sections in english', () => {
        const html = buildCycleReportPageHtml('en');

        expect(html).toContain('Summary');
        expect(html).toContain('Trends');
        expect(html).toContain('Highlights');
        expect(html).toContain('Risks');
        expect(html).toContain('Recommendations');
      });

      it('renders report sections in french', () => {
        const html = buildCycleReportPageHtml('fr');

        expect(html).toContain('Resume');
        expect(html).toContain('Tendances');
        expect(html).toContain('Points forts');
        expect(html).toContain('Risques');
        expect(html).toContain('Recommandations');
      });
    });
  });
});
