import { describe, it, expect, beforeEach } from 'vitest';
import { GetTeamSelectionUsecase } from '@modules/synchronization/usecases/get-team-selection.usecase.js';
import { StubTeamSelectionGateway } from '@modules/synchronization/testing/good-path/stub.team-selection.gateway.js';
import { TeamSelectionBuilder } from '../../../builders/team-selection.builder.js';

describe('GetTeamSelectionUsecase', () => {
  let teamSelectionGateway: StubTeamSelectionGateway;
  let usecase: GetTeamSelectionUsecase;

  beforeEach(() => {
    teamSelectionGateway = new StubTeamSelectionGateway();
    usecase = new GetTeamSelectionUsecase(teamSelectionGateway);
  });

  it('returns current selection when one exists', async () => {
    teamSelectionGateway.selection = new TeamSelectionBuilder().build();

    const result = await usecase.execute();

    expect(result).not.toBeNull();
    expect(result?.selectedTeams).toHaveLength(2);
  });

  it('returns null when no selection exists', async () => {
    const result = await usecase.execute();

    expect(result).toBeNull();
  });
});
