import { buildSettingsPageHtml } from '@modules/analytics/interface-adapters/controllers/settings-page.html.js';
import { StubWorkspaceSettingsGateway } from '@modules/analytics/testing/good-path/stub.workspace-settings.gateway.js';
import { GetWorkspaceLanguageUsecase } from '@modules/analytics/usecases/get-workspace-language.usecase.js';
import { SetWorkspaceLanguageUsecase } from '@modules/analytics/usecases/set-workspace-language.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Set Workspace Language (acceptance)', () => {
  let workspaceSettingsGateway: StubWorkspaceSettingsGateway;
  let getWorkspaceLanguage: GetWorkspaceLanguageUsecase;
  let setWorkspaceLanguage: SetWorkspaceLanguageUsecase;

  beforeEach(() => {
    workspaceSettingsGateway = new StubWorkspaceSettingsGateway();
    getWorkspaceLanguage = new GetWorkspaceLanguageUsecase(
      workspaceSettingsGateway,
    );
    setWorkspaceLanguage = new SetWorkspaceLanguageUsecase(
      workspaceSettingsGateway,
    );
  });

  describe('workspace has a single language preference, default English', () => {
    it('default language: no stored preference returns English and lang="en"', async () => {
      const locale = await getWorkspaceLanguage.execute();
      const html = buildSettingsPageHtml(locale);

      expect(locale).toBe('en');
      expect(html).toContain('lang="en"');
      expect(html).toContain('Timezone');
      expect(html).toContain('Toggle theme');
    });

    it('switch to french: saves preference and page renders in French with lang="fr"', async () => {
      await setWorkspaceLanguage.execute({ language: 'fr' });

      const locale = await getWorkspaceLanguage.execute();
      const html = buildSettingsPageHtml(locale);

      expect(locale).toBe('fr');
      expect(html).toContain('lang="fr"');
      expect(html).toContain('Fuseau horaire');
      expect(html).toContain('Changer de theme');
    });

    it('switch back to english: saves preference and page renders in English', async () => {
      await setWorkspaceLanguage.execute({ language: 'fr' });
      await setWorkspaceLanguage.execute({ language: 'en' });

      const locale = await getWorkspaceLanguage.execute();
      const html = buildSettingsPageHtml(locale);

      expect(locale).toBe('en');
      expect(html).toContain('lang="en"');
      expect(html).toContain('Timezone');
    });

    it('persistence: stored FR preference returns French on next read', async () => {
      await setWorkspaceLanguage.execute({ language: 'fr' });

      const locale = await getWorkspaceLanguage.execute();

      expect(locale).toBe('fr');
    });
  });

  describe('section titles adapt to selected language', () => {
    it('section titles in english', async () => {
      const locale = await getWorkspaceLanguage.execute();
      const html = buildSettingsPageHtml(locale);

      expect(html).toContain('Timezone');
      expect(html).toContain('Blocked issues');
      expect(html).toContain('Excluded statuses');
      expect(html).toContain('Drift grid');
      expect(html).toContain('Points to duration mapping');
    });

    it('section titles in french', async () => {
      await setWorkspaceLanguage.execute({ language: 'fr' });
      const locale = await getWorkspaceLanguage.execute();
      const html = buildSettingsPageHtml(locale);

      expect(html).toContain('Fuseau horaire');
      expect(html).toContain('Issues bloquees');
      expect(html).toContain('Statuts exclus');
      expect(html).toContain('Grille de derive');
      expect(html).toContain('Correspondance points / duree');
    });
  });

  describe('team selector adapts to selected language', () => {
    it('team selector empty in english', async () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('Select a team...');
    });

    it('team selector empty in french', async () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('Selectionnez une equipe...');
    });

    it('team selector loading in english', async () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('Loading teams...');
    });

    it('team selector loading in french', async () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('Chargement des equipes...');
    });
  });

  describe('drift grid adapts to selected language', () => {
    it('drift grid in english', async () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('8h (1 day)');
      expect(html).toContain('20h (2-3 days)');
      expect(html).toContain(
        'Tickets estimated at 8 points or more are flagged',
      );
    });

    it('drift grid in french', async () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('8h (1 jour)');
      expect(html).toContain('20h (2-3 jours)');
      expect(html).toContain(
        'Les tickets estimes a 8 points ou plus sont signales',
      );
    });
  });

  describe('excluded status labels adapt to selected language', () => {
    it('excluded status labels in english', async () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('"statusIncludedLabel":"Analyzed"');
      expect(html).toContain('"statusExcludedLabel":"Excluded"');
    });

    it('excluded status labels in french', async () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('"statusIncludedLabel":"Analyse"');
      expect(html).toContain('"statusExcludedLabel":"Exclu"');
    });
  });

  describe('empty states and toasts adapt to selected language', () => {
    it('empty statuses in english', async () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('No synced statuses for this team.');
    });

    it('empty statuses in french', async () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('Aucun statut synchronise pour cette equipe.');
    });

    it('theme toggle tooltip in english', async () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('title="Toggle theme"');
    });

    it('theme toggle tooltip in french', async () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('title="Changer de theme"');
    });

    it('toast timezone saved in english', async () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('Timezone saved');
    });

    it('toast timezone saved in french', async () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('Fuseau horaire sauvegarde');
    });

    it('toast status saved in english', async () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('Settings saved');
    });

    it('toast status saved in french', async () => {
      const html = buildSettingsPageHtml('fr');
      expect(html).toContain('Parametres sauvegardes');
    });

    it('page title in english', async () => {
      const html = buildSettingsPageHtml('en');
      expect(html).toContain('>Settings</h1>');
    });
  });
});
