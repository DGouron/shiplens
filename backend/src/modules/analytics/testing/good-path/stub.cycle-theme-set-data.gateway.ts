import {
  type ActiveCycleLocator,
  type ThemeCandidateIssue,
} from '../../entities/cycle-theme-set/cycle-theme-set.schema.js';
import { CycleThemeSetDataGateway } from '../../entities/cycle-theme-set/cycle-theme-set-data.gateway.js';

export class StubCycleThemeSetDataGateway extends CycleThemeSetDataGateway {
  activeCycleLocatorByTeamId: Map<string, ActiveCycleLocator | null> =
    new Map();

  themeCandidateIssuesByCycleId: Map<string, ThemeCandidateIssue[]> = new Map();

  async getActiveCycleLocator(
    teamId: string,
  ): Promise<ActiveCycleLocator | null> {
    return this.activeCycleLocatorByTeamId.get(teamId) ?? null;
  }

  async getCycleIssuesForThemeDetection(
    _teamId: string,
    cycleId: string,
  ): Promise<ThemeCandidateIssue[]> {
    return this.themeCandidateIssuesByCycleId.get(cycleId) ?? [];
  }

  setActiveCycle(teamId: string, locator: ActiveCycleLocator | null): void {
    this.activeCycleLocatorByTeamId.set(teamId, locator);
  }

  setThemeCandidateIssues(
    cycleId: string,
    issues: ThemeCandidateIssue[],
  ): void {
    this.themeCandidateIssuesByCycleId.set(cycleId, issues);
  }
}
