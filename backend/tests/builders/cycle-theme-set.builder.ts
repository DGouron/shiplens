import { CycleThemeSet } from '@modules/analytics/entities/cycle-theme-set/cycle-theme-set.js';
import {
  type CycleTheme,
  type CycleThemeSetProps,
} from '@modules/analytics/entities/cycle-theme-set/cycle-theme-set.schema.js';
import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';

const defaultProps: CycleThemeSetProps = {
  cycleId: 'cycle-1',
  teamId: 'team-1',
  language: 'EN',
  themes: [{ name: 'Auth refactor', issueExternalIds: ['issue-1'] }],
  generatedAt: '2026-04-18T10:00:00.000Z',
};

export class CycleThemeSetBuilder extends EntityBuilder<
  CycleThemeSetProps,
  CycleThemeSet
> {
  constructor() {
    super(defaultProps);
  }

  withCycleId(cycleId: string): this {
    this.props.cycleId = cycleId;
    return this;
  }

  withTeamId(teamId: string): this {
    this.props.teamId = teamId;
    return this;
  }

  withLanguage(language: 'EN' | 'FR'): this {
    this.props.language = language;
    return this;
  }

  withThemes(themes: CycleTheme[]): this {
    this.props.themes = themes.map((theme) => ({
      ...theme,
      issueExternalIds: [...theme.issueExternalIds],
    }));
    return this;
  }

  withGeneratedAt(generatedAt: string): this {
    this.props.generatedAt = generatedAt;
    return this;
  }

  build(): CycleThemeSet {
    return CycleThemeSet.create({
      ...this.props,
      themes: this.props.themes.map((theme) => ({
        ...theme,
        issueExternalIds: [...theme.issueExternalIds],
      })),
    });
  }
}
