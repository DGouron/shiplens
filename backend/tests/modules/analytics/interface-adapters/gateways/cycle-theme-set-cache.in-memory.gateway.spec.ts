import { CycleThemeSetCacheInMemoryGateway } from '@modules/analytics/interface-adapters/gateways/cycle-theme-set-cache.in-memory.gateway.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { CycleThemeSetBuilder } from '../../../../builders/cycle-theme-set.builder.js';

describe('CycleThemeSetCacheInMemoryGateway', () => {
  let gateway: CycleThemeSetCacheInMemoryGateway;

  beforeEach(() => {
    gateway = new CycleThemeSetCacheInMemoryGateway();
  });

  it('returns null when no entry exists for the cycle', async () => {
    const entry = await gateway.get('cycle-1');

    expect(entry).toBeNull();
  });

  it('stores and retrieves a theme set by cycleId', async () => {
    const themeSet = new CycleThemeSetBuilder().withCycleId('cycle-1').build();

    await gateway.save(themeSet);
    const retrieved = await gateway.get('cycle-1');

    expect(retrieved?.cycleId).toBe('cycle-1');
  });

  it('overwrites an existing entry on save', async () => {
    const original = new CycleThemeSetBuilder()
      .withCycleId('cycle-1')
      .withThemes([{ name: 'Original', issueExternalIds: ['issue-1'] }])
      .build();
    const replacement = new CycleThemeSetBuilder()
      .withCycleId('cycle-1')
      .withThemes([{ name: 'Replacement', issueExternalIds: ['issue-2'] }])
      .build();

    await gateway.save(original);
    await gateway.save(replacement);
    const retrieved = await gateway.get('cycle-1');

    expect(retrieved?.themes[0].name).toBe('Replacement');
  });

  it('deletes an entry by cycleId', async () => {
    const themeSet = new CycleThemeSetBuilder().withCycleId('cycle-1').build();

    await gateway.save(themeSet);
    await gateway.delete('cycle-1');
    const retrieved = await gateway.get('cycle-1');

    expect(retrieved).toBeNull();
  });
});
