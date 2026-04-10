import { StubWorkspaceSettingsGateway } from '@modules/analytics/testing/good-path/stub.workspace-settings.gateway.js';
import { GetWorkspaceLanguageUsecase } from '@modules/analytics/usecases/get-workspace-language.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('GetWorkspaceLanguageUsecase', () => {
  let gateway: StubWorkspaceSettingsGateway;
  let usecase: GetWorkspaceLanguageUsecase;

  beforeEach(() => {
    gateway = new StubWorkspaceSettingsGateway();
    usecase = new GetWorkspaceLanguageUsecase(gateway);
  });

  it('returns en when no preference is stored', async () => {
    const result = await usecase.execute();

    expect(result).toBe('en');
  });

  it('returns stored locale', async () => {
    gateway.storedLanguage = 'fr';

    const result = await usecase.execute();

    expect(result).toBe('fr');
  });
});
