import { buildMemberHealthTrendsHtml } from '@modules/analytics/interface-adapters/controllers/member-health-trends.html.js';
import { describe, expect, it } from 'vitest';

describe('buildMemberHealthTrendsHtml', () => {
  describe('HTML lang attribute', () => {
    it('sets lang="en" for english locale', () => {
      const html = buildMemberHealthTrendsHtml('en');
      expect(html).toContain('lang="en"');
    });

    it('sets lang="fr" for french locale', () => {
      const html = buildMemberHealthTrendsHtml('fr');
      expect(html).toContain('lang="fr"');
    });
  });

  describe('page structure', () => {
    it('is a valid HTML document', () => {
      const html = buildMemberHealthTrendsHtml('en');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });
  });

  describe('page title and navigation', () => {
    it('english page title', () => {
      const html = buildMemberHealthTrendsHtml('en');
      expect(html).toContain('Health Trends');
    });

    it('french page title', () => {
      const html = buildMemberHealthTrendsHtml('fr');
      expect(html).toContain('Tendances de sante');
    });

    it('english back link', () => {
      const html = buildMemberHealthTrendsHtml('en');
      expect(html).toContain('Back to cycle report');
    });

    it('french back link', () => {
      const html = buildMemberHealthTrendsHtml('fr');
      expect(html).toContain('Retour au rapport de cycle');
    });

    it('english theme toggle', () => {
      const html = buildMemberHealthTrendsHtml('en');
      expect(html).toContain('title="Toggle theme"');
    });

    it('french theme toggle', () => {
      const html = buildMemberHealthTrendsHtml('fr');
      expect(html).toContain('title="Changer de theme"');
    });
  });

  describe('sprints selector', () => {
    it('english label', () => {
      const html = buildMemberHealthTrendsHtml('en');
      expect(html).toContain('Completed sprints to analyze:');
    });

    it('french label', () => {
      const html = buildMemberHealthTrendsHtml('fr');
      expect(html).toContain('Sprints termines a analyser :');
    });
  });

  describe('indicators', () => {
    it('english indicator labels', () => {
      const html = buildMemberHealthTrendsHtml('en');
      expect(html).toContain('Favorable trend');
      expect(html).toContain('First deviation or mixed');
      expect(html).toContain('Unfavorable for 2+ sprints');
      expect(html).toContain('Not enough data');
    });

    it('french indicator labels', () => {
      const html = buildMemberHealthTrendsHtml('fr');
      expect(html).toContain('Tendance favorable');
      expect(html).toContain('Premiere deviation ou mixte');
      expect(html).toContain('Defavorable depuis 2+ sprints');
      expect(html).toContain('Pas assez de donnees');
    });
  });

  describe('signal labels in TRANSLATIONS object', () => {
    it('english signal labels', () => {
      const html = buildMemberHealthTrendsHtml('en');
      expect(html).toContain('"signalEstimationScore":"Estimation Score"');
      expect(html).toContain('"signalDriftingTickets":"Drifting Tickets"');
      expect(html).toContain('"signalMedianReviewTime":"Median Review Time"');
    });

    it('french signal labels', () => {
      const html = buildMemberHealthTrendsHtml('fr');
      expect(html).toContain("Score d'estimation");
      expect(html).toContain('"signalDriftingTickets":"Tickets en derive"');
      expect(html).toContain(
        '"signalMedianReviewTime":"Temps median de review"',
      );
    });
  });

  describe('loading and empty states', () => {
    it('english loading text', () => {
      const html = buildMemberHealthTrendsHtml('en');
      expect(html).toContain('Loading health data...');
    });

    it('french loading text', () => {
      const html = buildMemberHealthTrendsHtml('fr');
      expect(html).toContain('Chargement des donnees de sante...');
    });

    it('english empty state', () => {
      const html = buildMemberHealthTrendsHtml('en');
      expect(html).toContain('No data available for this member');
    });

    it('french empty state', () => {
      const html = buildMemberHealthTrendsHtml('fr');
      expect(html).toContain('Aucune donnee disponible pour ce membre');
    });
  });
});
