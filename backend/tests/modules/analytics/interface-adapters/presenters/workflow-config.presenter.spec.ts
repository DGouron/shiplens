import { WorkflowConfig } from '@modules/analytics/entities/workflow-config/workflow-config.js';
import { WorkflowConfigPresenter } from '@modules/analytics/interface-adapters/presenters/workflow-config.presenter.js';
import { describe, expect, it } from 'vitest';

describe('WorkflowConfigPresenter', () => {
  const presenter = new WorkflowConfigPresenter();

  it('presents auto-detected workflow config', () => {
    const config = WorkflowConfig.create({
      startedStatuses: ['In Progress'],
      completedStatuses: ['Done'],
      source: 'auto-detected',
    });

    const dto = presenter.present(config);

    expect(dto).toEqual({
      startedStatuses: ['In Progress'],
      completedStatuses: ['Done'],
      source: 'auto-detected',
    });
  });

  it('presents manual workflow config', () => {
    const config = WorkflowConfig.create({
      startedStatuses: ['In Dev'],
      completedStatuses: ['Shipped'],
      source: 'manual',
    });

    const dto = presenter.present(config);

    expect(dto).toEqual({
      startedStatuses: ['In Dev'],
      completedStatuses: ['Shipped'],
      source: 'manual',
    });
  });
});
