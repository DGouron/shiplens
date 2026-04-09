import { buildWorkspaceDashboardHtml } from '@modules/analytics/interface-adapters/controllers/workspace-dashboard.html.js';
import { describe, expect, it } from 'vitest';

describe('buildWorkspaceDashboardHtml', () => {
  describe('HTML lang attribute', () => {
    it('sets lang="en" for english locale', () => {
      const html = buildWorkspaceDashboardHtml('en');
      expect(html).toContain('lang="en"');
    });

    it('sets lang="fr" for french locale', () => {
      const html = buildWorkspaceDashboardHtml('fr');
      expect(html).toContain('lang="fr"');
    });
  });

  describe('page structure', () => {
    it('is a valid HTML document', () => {
      const html = buildWorkspaceDashboardHtml('en');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('page title is Dashboard', () => {
      const html = buildWorkspaceDashboardHtml('en');
      expect(html).toContain('>Dashboard</h1>');
    });
  });

  describe('navigation', () => {
    it('english breadcrumb and settings link', () => {
      const html = buildWorkspaceDashboardHtml('en');
      expect(html).toContain('Dashboard');
      expect(html).toContain('Settings');
      expect(html).toContain('title="Toggle theme"');
    });

    it('french theme toggle', () => {
      const html = buildWorkspaceDashboardHtml('fr');
      expect(html).toContain('title="Changer de theme"');
    });
  });

  describe('sync labels', () => {
    it('english sync texts in TRANSLATIONS object', () => {
      const html = buildWorkspaceDashboardHtml('en');
      expect(html).toContain('"lastSync":"Last sync: "');
      expect(html).toContain('"neverSynced":"Never synced"');
      expect(html).toContain('"resynchronize":"Resynchronize"');
    });

    it('french sync texts in TRANSLATIONS object', () => {
      const html = buildWorkspaceDashboardHtml('fr');
      expect(html).toContain('"lastSync":"Derniere sync : "');
      expect(html).toContain('"neverSynced":"Jamais synchronise"');
      expect(html).toContain('"resynchronize":"Resynchroniser"');
    });
  });

  describe('KPI labels', () => {
    it('english KPI labels in TRANSLATIONS object', () => {
      const html = buildWorkspaceDashboardHtml('en');
      expect(html).toContain('"kpiCompletion":"Completion"');
      expect(html).toContain('"kpiVelocity":"Velocity"');
      expect(html).toContain('"kpiBlockedIssues":"Blocked issues"');
    });

    it('french KPI labels in TRANSLATIONS object', () => {
      const html = buildWorkspaceDashboardHtml('fr');
      expect(html).toContain('"kpiVelocity":"Velocite"');
      expect(html).toContain('"kpiBlockedIssues":"Issues bloquees"');
    });
  });

  describe('report link', () => {
    it('english report texts in TRANSLATIONS object', () => {
      const html = buildWorkspaceDashboardHtml('en');
      expect(html).toContain('"viewReport":"View report"');
      expect(html).toContain('"noReportAvailable":"No report available"');
    });

    it('french report texts in TRANSLATIONS object', () => {
      const html = buildWorkspaceDashboardHtml('fr');
      expect(html).toContain('"viewReport":"Voir le rapport"');
      expect(html).toContain('"noReportAvailable":"Aucun rapport disponible"');
    });
  });

  describe('loading state', () => {
    it('english loading text', () => {
      const html = buildWorkspaceDashboardHtml('en');
      expect(html).toContain('Loading...');
    });

    it('french loading text', () => {
      const html = buildWorkspaceDashboardHtml('fr');
      expect(html).toContain('Chargement...');
    });
  });
});
