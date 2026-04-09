import { SettingsPageController } from '@modules/analytics/interface-adapters/controllers/settings-page.controller.js';
import { StubWorkspaceSettingsGateway } from '@modules/analytics/testing/good-path/stub.workspace-settings.gateway.js';
import { GetWorkspaceLanguageUsecase } from '@modules/analytics/usecases/get-workspace-language.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('SettingsPageController', () => {
  let gateway: StubWorkspaceSettingsGateway;
  let controller: SettingsPageController;

  beforeEach(() => {
    gateway = new StubWorkspaceSettingsGateway();
    const getLanguage = new GetWorkspaceLanguageUsecase(gateway);
    controller = new SettingsPageController(getLanguage);
  });

  it('returns HTML page content with default english locale', async () => {
    const result = await controller.getPage();

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('Shiplens');
    expect(result).toContain('Settings');
    expect(result).toContain('lang="en"');
  });

  it('returns HTML with french locale when preference is french', async () => {
    gateway.storedLanguage = 'fr';

    const result = await controller.getPage();

    expect(result).toContain('lang="fr"');
    expect(result).toContain('Fuseau horaire');
  });

  it('contains excluded statuses section', async () => {
    const result = await controller.getPage();

    expect(result).toContain('id="excludedStatusesSection"');
    expect(result).toContain('Excluded statuses');
  });

  it('contains team selector', async () => {
    const result = await controller.getPage();

    expect(result).toContain('id="teamSelector"');
  });
});
