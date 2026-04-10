import { StubWorkspaceSettingsGateway } from '@modules/analytics/testing/good-path/stub.workspace-settings.gateway.js';
import { SetWorkspaceLanguageUsecase } from '@modules/analytics/usecases/set-workspace-language.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('SetWorkspaceLanguageUsecase', () => {
  let gateway: StubWorkspaceSettingsGateway;
  let usecase: SetWorkspaceLanguageUsecase;

  beforeEach(() => {
    gateway = new StubWorkspaceSettingsGateway();
    usecase = new SetWorkspaceLanguageUsecase(gateway);
  });

  it('persists the locale', async () => {
    await usecase.execute({ language: 'fr' });

    const stored = await gateway.getLanguage();
    expect(stored).toBe('fr');
  });

  it('overwrites previously stored locale', async () => {
    await usecase.execute({ language: 'fr' });
    await usecase.execute({ language: 'en' });

    const stored = await gateway.getLanguage();
    expect(stored).toBe('en');
  });

  it('rejects invalid locale', async () => {
    await expect(usecase.execute({ language: 'de' })).rejects.toThrow();
  });
});
