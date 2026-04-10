import { buildCycleReportPageHtml } from '@modules/analytics/interface-adapters/controllers/cycle-report-page.html.js';
import { describe, expect, it } from 'vitest';

describe('buildCycleReportPageHtml', () => {
  describe('HTML lang attribute', () => {
    it('sets lang="en" for english locale', () => {
      const html = buildCycleReportPageHtml('en');
      expect(html).toContain('lang="en"');
    });

    it('sets lang="fr" for french locale', () => {
      const html = buildCycleReportPageHtml('fr');
      expect(html).toContain('lang="fr"');
    });
  });

  describe('page structure', () => {
    it('is a valid HTML document', () => {
      const html = buildCycleReportPageHtml('en');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });
  });

  describe('page title', () => {
    it('english page title', () => {
      const html = buildCycleReportPageHtml('en');
      expect(html).toContain('>Cycle Report</h1>');
    });

    it('french page title', () => {
      const html = buildCycleReportPageHtml('fr');
      expect(html).toContain('>Rapport de cycle</h1>');
    });
  });

  describe('navigation', () => {
    it('english theme toggle', () => {
      const html = buildCycleReportPageHtml('en');
      expect(html).toContain('title="Toggle theme"');
    });

    it('french theme toggle', () => {
      const html = buildCycleReportPageHtml('fr');
      expect(html).toContain('title="Changer de theme"');
    });
  });

  describe('selector texts', () => {
    it('english loading cycles', () => {
      const html = buildCycleReportPageHtml('en');
      expect(html).toContain('Loading cycles...');
    });

    it('french loading cycles', () => {
      const html = buildCycleReportPageHtml('fr');
      expect(html).toContain('Chargement des cycles...');
    });

    it('english whole team', () => {
      const html = buildCycleReportPageHtml('en');
      expect(html).toContain('Whole team');
    });

    it('french whole team', () => {
      const html = buildCycleReportPageHtml('fr');
      expect(html).toContain("Toute l'equipe");
    });
  });

  describe('section titles', () => {
    it('english section titles', () => {
      const html = buildCycleReportPageHtml('en');
      expect(html).toContain('Metrics');
      expect(html).toContain('Bottlenecks');
      expect(html).toContain('Blocked issues');
      expect(html).toContain('Estimation accuracy');
      expect(html).toContain('AI Report');
    });

    it('french section titles', () => {
      const html = buildCycleReportPageHtml('fr');
      expect(html).toContain('Metriques');
      expect(html).toContain("Goulots d'etranglement");
      expect(html).toContain('Issues bloquees');
      expect(html).toContain("Precision d'estimation");
      expect(html).toContain('Rapport IA');
    });
  });

  describe('metric labels in TRANSLATIONS object', () => {
    it('english metric labels', () => {
      const html = buildCycleReportPageHtml('en');
      expect(html).toContain('"metricVelocity":"Velocity"');
      expect(html).toContain('"metricThroughput":"Throughput"');
      expect(html).toContain('"metricCompletionRate":"Completion rate"');
    });

    it('french metric labels', () => {
      const html = buildCycleReportPageHtml('fr');
      expect(html).toContain('"metricVelocity":"Velocite"');
      expect(html).toContain('"metricCompletionRate":"Taux de completion"');
    });
  });

  describe('buttons', () => {
    it('english buttons', () => {
      const html = buildCycleReportPageHtml('en');
      expect(html).toContain('Generate report');
      expect(html).toContain('Export');
      expect(html).toContain('Copy');
      expect(html).toContain('Detect');
    });

    it('french buttons', () => {
      const html = buildCycleReportPageHtml('fr');
      expect(html).toContain('Generer le rapport');
      expect(html).toContain('Export');
      expect(html).toContain('Copier');
      expect(html).toContain('Relancer la detection');
    });
  });

  describe('report section labels in TRANSLATIONS', () => {
    it('english report sections', () => {
      const html = buildCycleReportPageHtml('en');
      expect(html).toContain('"reportSummary":"Summary"');
      expect(html).toContain('"reportTrends":"Trends"');
      expect(html).toContain('"reportHighlights":"Highlights"');
      expect(html).toContain('"reportRisks":"Risks"');
      expect(html).toContain('"reportRecommendations":"Recommendations"');
    });

    it('french report sections', () => {
      const html = buildCycleReportPageHtml('fr');
      expect(html).toContain('"reportSummary":"Resume"');
      expect(html).toContain('"reportTrends":"Tendances"');
      expect(html).toContain('"reportHighlights":"Points forts"');
      expect(html).toContain('"reportRisks":"Risques"');
      expect(html).toContain('"reportRecommendations":"Recommandations"');
    });
  });

  describe('toast messages in TRANSLATIONS', () => {
    it('english toast', () => {
      const html = buildCycleReportPageHtml('en');
      expect(html).toContain('"toastReportCopied":"Report copied!"');
    });

    it('french toast', () => {
      const html = buildCycleReportPageHtml('fr');
      expect(html).toContain('"toastReportCopied":"Rapport copie !"');
    });
  });

  describe('estimation labels in TRANSLATIONS', () => {
    it('english estimation labels', () => {
      const html = buildCycleReportPageHtml('en');
      expect(html).toContain('"classificationWellEstimated":"Well estimated"');
      expect(html).toContain('"classificationOverEstimated":"Over-estimated"');
      expect(html).toContain(
        '"classificationUnderEstimated":"Under-estimated"',
      );
    });

    it('french estimation labels', () => {
      const html = buildCycleReportPageHtml('fr');
      expect(html).toContain('"classificationWellEstimated":"Bien estimee"');
      expect(html).toContain('"classificationOverEstimated":"Sur-estimee"');
      expect(html).toContain('"classificationUnderEstimated":"Sous-estimee"');
    });
  });

  describe('bottleneck headers in TRANSLATIONS', () => {
    it('english bottleneck headers', () => {
      const html = buildCycleReportPageHtml('en');
      expect(html).toContain('"headerStatus":"Status"');
      expect(html).toContain('"headerMedianTime":"Median time"');
    });

    it('french bottleneck headers', () => {
      const html = buildCycleReportPageHtml('fr');
      expect(html).toContain('"headerStatus":"Statut"');
      expect(html).toContain('"headerMedianTime":"Temps median"');
    });
  });
});
