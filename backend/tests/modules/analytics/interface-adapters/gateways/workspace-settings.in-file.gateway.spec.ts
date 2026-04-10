import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { WorkspaceSettingsInFileGateway } from '@modules/analytics/interface-adapters/gateways/workspace-settings.in-file.gateway.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

class TestableWorkspaceSettingsInFileGateway extends WorkspaceSettingsInFileGateway {
  protected override readonly filePath: string;

  constructor(testFilePath: string) {
    super();
    this.filePath = testFilePath;
  }
}

describe('WorkspaceSettingsInFileGateway', () => {
  const testDirectory = join(process.cwd(), 'data', 'test-workspace-settings');
  const testFilePath = join(testDirectory, 'workspace-settings.json');
  let gateway: WorkspaceSettingsInFileGateway;

  beforeEach(async () => {
    await mkdir(testDirectory, { recursive: true });
    gateway = new TestableWorkspaceSettingsInFileGateway(testFilePath);
  });

  afterEach(async () => {
    await rm(testDirectory, { recursive: true, force: true });
  });

  it('returns en when file does not exist', async () => {
    const result = await gateway.getLanguage();
    expect(result).toBe('en');
  });

  it('returns en when file is empty object', async () => {
    await writeFile(testFilePath, '{}', 'utf-8');

    const result = await gateway.getLanguage();
    expect(result).toBe('en');
  });

  it('returns stored locale from file', async () => {
    await writeFile(testFilePath, JSON.stringify({ language: 'fr' }), 'utf-8');

    const result = await gateway.getLanguage();
    expect(result).toBe('fr');
  });

  it('persists locale to file', async () => {
    await gateway.setLanguage('fr');

    const result = await gateway.getLanguage();
    expect(result).toBe('fr');
  });

  it('overwrites previously stored locale', async () => {
    await gateway.setLanguage('fr');
    await gateway.setLanguage('en');

    const result = await gateway.getLanguage();
    expect(result).toBe('en');
  });

  it('returns en when file contains invalid locale', async () => {
    await writeFile(testFilePath, JSON.stringify({ language: 'de' }), 'utf-8');

    const result = await gateway.getLanguage();
    expect(result).toBe('en');
  });
});
