import { WorkflowConfig } from '@modules/analytics/entities/workflow-config/workflow-config.js';
import { describe, expect, it } from 'vitest';

describe('WorkflowConfig', () => {
  it('creates a workflow config with started and completed statuses', () => {
    const config = WorkflowConfig.create({
      startedStatuses: ['In Progress'],
      completedStatuses: ['Done'],
      source: 'auto-detected',
    });

    expect(config.startedStatuses).toEqual(['In Progress']);
    expect(config.completedStatuses).toEqual(['Done']);
    expect(config.source).toBe('auto-detected');
  });

  it('creates a workflow config with manual source', () => {
    const config = WorkflowConfig.create({
      startedStatuses: ['In Dev'],
      completedStatuses: ['Shipped'],
      source: 'manual',
    });

    expect(config.startedStatuses).toEqual(['In Dev']);
    expect(config.completedStatuses).toEqual(['Shipped']);
    expect(config.source).toBe('manual');
  });

  it('creates a workflow config with empty status arrays', () => {
    const config = WorkflowConfig.create({
      startedStatuses: [],
      completedStatuses: [],
      source: 'auto-detected',
    });

    expect(config.startedStatuses).toEqual([]);
    expect(config.completedStatuses).toEqual([]);
  });

  it('creates a workflow config with multiple statuses', () => {
    const config = WorkflowConfig.create({
      startedStatuses: ['In Progress', 'In Dev', 'Started'],
      completedStatuses: ['Done', 'Completed'],
      source: 'auto-detected',
    });

    expect(config.startedStatuses).toEqual([
      'In Progress',
      'In Dev',
      'Started',
    ]);
    expect(config.completedStatuses).toEqual(['Done', 'Completed']);
  });
});
