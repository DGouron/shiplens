import { SettingsPageController } from '@modules/analytics/interface-adapters/controllers/settings-page.controller.js';
import { describe, expect, it } from 'vitest';

describe('SettingsPageController', () => {
  const controller = new SettingsPageController();

  it('returns HTML page content', () => {
    const result = controller.getPage();

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('Shiplens');
    expect(result).toContain('Settings');
  });

  it('contains excluded statuses section', () => {
    const result = controller.getPage();

    expect(result).toContain('id="excludedStatusesSection"');
    expect(result).toContain('Statuts exclus');
  });

  it('contains team selector', () => {
    const result = controller.getPage();

    expect(result).toContain('id="teamSelector"');
  });
});
