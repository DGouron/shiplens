import { buildSettingsPageHtml } from '@modules/analytics/interface-adapters/controllers/settings-page.html.js';
import { describe, expect, it } from 'vitest';

describe('buildSettingsPageHtml', () => {
  describe('HTML lang attribute', () => {
    it('sets lang="en" for english locale', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('lang="en"');
    });

    it('sets lang="fr" for french locale', () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('lang="fr"');
    });
  });

  describe('section titles in english', () => {
    it('renders english section titles', () => {
      const html = buildSettingsPageHtml('en');

      expect(html).toContain('Timezone');
      expect(html).toContain('Blocked issues');
      expect(html).toContain('Excluded statuses');
      expect(html).toContain('Drift grid');
      expect(html).toContain('Points to duration mapping');
    });
  });

  describe('section titles in french', () => {
    it('renders french section titles', () => {
      const html = buildSettingsPageHtml('fr');

      expect(html).toContain('Fuseau horaire');
      expect(html).toContain('Issues bloquees');
      expect(html).toContain('Statuts exclus');
      expect(html).toContain('Grille de derive');
      expect(html).toContain('Correspondance points / duree');
    });
  });

  describe('team selector', () => {
    it('english loading text', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('Loading teams...');
    });

    it('french loading text', () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('Chargement des equipes...');
    });

    it('english empty text in JS', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('Select a team...');
    });

    it('french empty text in JS', () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('Selectionnez une equipe...');
    });
  });

  describe('drift grid', () => {
    it('english drift grid rows', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('8h (1 day)');
      expect(html).toContain('20h (2-3 days)');
    });

    it('french drift grid rows', () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('8h (1 jour)');
      expect(html).toContain('20h (2-3 jours)');
    });

    it('english drift grid note', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain(
        'Tickets estimated at 8 points or more are flagged',
      );
    });

    it('french drift grid note', () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain(
        'Les tickets estimes a 8 points ou plus sont signales',
      );
    });
  });

  describe('status labels', () => {
    it('english status labels in JS translations object', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('"statusIncludedLabel":"Analyzed"');
      expect(html).toContain('"statusExcludedLabel":"Excluded"');
    });

    it('french status labels in JS translations object', () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('"statusIncludedLabel":"Analyse"');
      expect(html).toContain('"statusExcludedLabel":"Exclu"');
    });
  });

  describe('empty states', () => {
    it('english empty statuses message', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('No synced statuses for this team.');
    });

    it('french empty statuses message', () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('Aucun statut synchronise pour cette equipe.');
    });
  });

  describe('theme toggle', () => {
    it('english theme toggle title', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('title="Toggle theme"');
    });

    it('french theme toggle title', () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('title="Changer de theme"');
    });
  });

  describe('toasts', () => {
    it('english timezone toast in JS', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('Timezone saved');
    });

    it('french timezone toast in JS', () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('Fuseau horaire sauvegarde');
    });

    it('english status toast in JS', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('Settings saved');
    });

    it('french status toast in JS', () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('Parametres sauvegardes');
    });
  });

  describe('language selector section', () => {
    it('contains language selector section', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('id="languageSection"');
    });

    it('english language section title', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('Language');
    });

    it('french language section title', () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('Langue');
    });

    it('has language select with both options', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('id="languageSelect"');
      expect(html).toContain('value="en"');
      expect(html).toContain('value="fr"');
      expect(html).toContain('English');
    });

    it('pre-selects current locale', () => {
      const htmlEn = buildSettingsPageHtml('en');
      const htmlFr = buildSettingsPageHtml('fr');

      expect(htmlEn).toContain('value="en" selected');
      expect(htmlFr).toContain('value="fr" selected');
    });
  });

  describe('page structure', () => {
    it('is a valid HTML document', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('page title is Settings', () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('>Settings</h1>');
    });
  });
});
