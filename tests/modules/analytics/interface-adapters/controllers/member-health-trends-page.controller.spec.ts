import { MemberHealthTrendsPageController } from '@modules/analytics/interface-adapters/controllers/member-health-trends-page.controller.js';
import { StubWorkspaceSettingsGateway } from '@modules/analytics/testing/good-path/stub.workspace-settings.gateway.js';
import { GetWorkspaceLanguageUsecase } from '@modules/analytics/usecases/get-workspace-language.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('MemberHealthTrendsPageController', () => {
  let settingsGateway: StubWorkspaceSettingsGateway;
  let controller: MemberHealthTrendsPageController;

  beforeEach(() => {
    settingsGateway = new StubWorkspaceSettingsGateway();
    const getLanguage = new GetWorkspaceLanguageUsecase(settingsGateway);
    controller = new MemberHealthTrendsPageController(getLanguage);
  });

  it('returns HTML page content with default english locale', async () => {
    const result = await controller.getPage();

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('Shiplens');
    expect(result).toContain('lang="en"');
  });

  it('returns HTML with french locale when preference is french', async () => {
    settingsGateway.storedLanguage = 'fr';

    const result = await controller.getPage();

    expect(result).toContain('lang="fr"');
    expect(result).toContain('Tendances de sante');
  });

  it('contains signal cards section', async () => {
    const result = await controller.getPage();

    expect(result).toContain('id="signalsGrid"');
  });

  it('contains loading spinner', async () => {
    const result = await controller.getPage();

    expect(result).toContain('id="loading"');
  });

  it('contains error state', async () => {
    const result = await controller.getPage();

    expect(result).toContain('id="error"');
  });

  it('contains breadcrumb navigation', async () => {
    const result = await controller.getPage();

    expect(result).toContain('Health Trends');
    expect(result).toContain('Dashboard');
  });

  it('fetches health data from API using URL parameters', async () => {
    const result = await controller.getPage();

    expect(result).toContain('/api/analytics/teams/');
    expect(result).toContain('/health');
    expect(result).toContain('teamId');
    expect(result).toContain('memberName');
  });

  it('renders 5 health signal labels in TRANSLATIONS', async () => {
    const result = await controller.getPage();

    expect(result).toContain('Estimation Score');
    expect(result).toContain('Underestimation Ratio');
    expect(result).toContain('Average Cycle Time');
    expect(result).toContain('Drifting Tickets');
    expect(result).toContain('Median Review Time');
  });

  it('handles not applicable and not enough history states', async () => {
    const result = await controller.getPage();

    expect(result).toContain('Not applicable');
    expect(result).toContain('Not enough history');
  });

  it('contains back link to cycle report', async () => {
    const result = await controller.getPage();

    expect(result).toContain('cycle-report');
  });

  it('uses glassmorphism design tokens', async () => {
    const result = await controller.getPage();

    expect(result).toContain('--bg-surface');
    expect(result).toContain('--glass-blur');
    expect(result).toContain('backdrop-filter');
  });
});
