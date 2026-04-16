import { describe, expect, it } from 'vitest';
import { StubWorkspaceLanguageGateway } from '@/modules/analytics/testing/good-path/stub.workspace-language.in-memory.gateway.ts';
import { GetWorkspaceLanguageUsecase } from '@/modules/analytics/usecases/get-workspace-language.usecase.ts';

describe('GetWorkspaceLanguageUsecase', () => {
  it('returns the current workspace language', async () => {
    const gateway = new StubWorkspaceLanguageGateway();
    gateway.storedLanguage = 'fr';
    const usecase = new GetWorkspaceLanguageUsecase(gateway);

    const result = await usecase.execute();

    expect(result).toEqual({ language: 'fr' });
  });
});
