import {
  type ActiveCycleLocator,
  type ThemeCandidateIssue,
} from './cycle-theme-set.schema.js';

export abstract class CycleThemeSetDataGateway {
  abstract getActiveCycleLocator(
    teamId: string,
  ): Promise<ActiveCycleLocator | null>;

  abstract getCycleIssuesForThemeDetection(
    teamId: string,
    cycleId: string,
  ): Promise<ThemeCandidateIssue[]>;
}
