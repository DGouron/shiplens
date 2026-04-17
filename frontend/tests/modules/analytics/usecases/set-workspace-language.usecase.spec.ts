import { describe, expect, it } from 'vitest';
import { StubWorkspaceLanguageGateway } from '@/modules/analytics/testing/good-path/stub.workspace-language.in-memory.gateway.ts';
import { SetWorkspaceLanguageUsecase } from '@/modules/analytics/usecases/set-workspace-language.usecase.ts';

describe('SetWorkspaceLanguageUsecase', () => {
  it('sets the workspace language via gateway', async () => {
    const gateway = new StubWorkspaceLanguageGateway();
    const usecase = new SetWorkspaceLanguageUsecase(gateway);

    await usecase.execute({ language: 'fr' });

    expect(gateway.storedLanguage).toBe('fr');
  });
});
