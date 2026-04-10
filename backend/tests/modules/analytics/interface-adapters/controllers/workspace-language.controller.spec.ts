import { WorkspaceLanguageController } from '@modules/analytics/interface-adapters/controllers/workspace-language.controller.js';
import { StubWorkspaceSettingsGateway } from '@modules/analytics/testing/good-path/stub.workspace-settings.gateway.js';
import { GetWorkspaceLanguageUsecase } from '@modules/analytics/usecases/get-workspace-language.usecase.js';
import { SetWorkspaceLanguageUsecase } from '@modules/analytics/usecases/set-workspace-language.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('WorkspaceLanguageController', () => {
  let gateway: StubWorkspaceSettingsGateway;
  let controller: WorkspaceLanguageController;

  beforeEach(() => {
    gateway = new StubWorkspaceSettingsGateway();
    const getUsecase = new GetWorkspaceLanguageUsecase(gateway);
    const setUsecase = new SetWorkspaceLanguageUsecase(gateway);
    controller = new WorkspaceLanguageController(getUsecase, setUsecase);
  });

  it('returns en by default', async () => {
    const result = await controller.getLanguage();

    expect(result).toEqual({ language: 'en' });
  });

  it('returns stored locale', async () => {
    gateway.storedLanguage = 'fr';

    const result = await controller.getLanguage();

    expect(result).toEqual({ language: 'fr' });
  });

  it('saves locale via PUT', async () => {
    await controller.setLanguage({ language: 'fr' });

    const result = await controller.getLanguage();
    expect(result).toEqual({ language: 'fr' });
  });
});
