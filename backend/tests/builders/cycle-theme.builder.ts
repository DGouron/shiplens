import { type CycleTheme } from '@modules/analytics/entities/cycle-theme-set/cycle-theme-set.schema.js';

const defaultTheme: CycleTheme = {
  name: 'Auth refactor',
  issueExternalIds: ['issue-1'],
};

export class CycleThemeBuilder {
  private theme: CycleTheme = { ...defaultTheme };

  withName(name: string): this {
    this.theme = { ...this.theme, name };
    return this;
  }

  withIssueExternalIds(issueExternalIds: string[]): this {
    this.theme = { ...this.theme, issueExternalIds: [...issueExternalIds] };
    return this;
  }

  build(): CycleTheme {
    return {
      ...this.theme,
      issueExternalIds: [...this.theme.issueExternalIds],
    };
  }
}
