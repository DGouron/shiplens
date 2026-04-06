import { MemberHealthTrendsPageController } from '@modules/analytics/interface-adapters/controllers/member-health-trends-page.controller.js';
import { describe, expect, it } from 'vitest';

describe('MemberHealthTrendsPageController', () => {
  const controller = new MemberHealthTrendsPageController();

  it('returns HTML page content', () => {
    const result = controller.getPage();

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('Shiplens');
  });

  it('contains signal cards section', () => {
    const result = controller.getPage();

    expect(result).toContain('id="signalsGrid"');
  });

  it('contains loading spinner', () => {
    const result = controller.getPage();

    expect(result).toContain('id="loading"');
  });

  it('contains error state', () => {
    const result = controller.getPage();

    expect(result).toContain('id="error"');
  });

  it('contains breadcrumb navigation', () => {
    const result = controller.getPage();

    expect(result).toContain('Health Trends');
    expect(result).toContain('Dashboard');
  });

  it('fetches health data from API using URL parameters', () => {
    const result = controller.getPage();

    expect(result).toContain('/api/analytics/teams/');
    expect(result).toContain('/health');
    expect(result).toContain('teamId');
    expect(result).toContain('memberName');
  });

  it('renders 5 health signal cards', () => {
    const result = controller.getPage();

    expect(result).toContain('Estimation Score');
    expect(result).toContain('Underestimation Ratio');
    expect(result).toContain('Average Cycle Time');
    expect(result).toContain('Drifting Tickets');
    expect(result).toContain('Median Review Time');
  });

  it('handles not applicable and not enough history states', () => {
    const result = controller.getPage();

    expect(result).toContain('Not applicable');
    expect(result).toContain('Not enough history');
  });

  it('contains back link to cycle report', () => {
    const result = controller.getPage();

    expect(result).toContain('cycle-report');
  });

  it('uses glassmorphism design tokens', () => {
    const result = controller.getPage();

    expect(result).toContain('--bg-surface');
    expect(result).toContain('--glass-blur');
    expect(result).toContain('backdrop-filter');
  });
});
