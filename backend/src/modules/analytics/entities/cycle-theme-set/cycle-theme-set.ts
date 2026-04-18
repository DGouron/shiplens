import { cycleThemeSetGuard } from './cycle-theme-set.guard.js';
import {
  type CycleTheme,
  type CycleThemeSetProps,
} from './cycle-theme-set.schema.js';

export class CycleThemeSet {
  private constructor(private readonly props: CycleThemeSetProps) {}

  static create(props: unknown): CycleThemeSet {
    const validatedProps = cycleThemeSetGuard.parse(props);
    return new CycleThemeSet(validatedProps);
  }

  get cycleId(): string {
    return this.props.cycleId;
  }

  get teamId(): string {
    return this.props.teamId;
  }

  get language(): 'EN' | 'FR' {
    return this.props.language;
  }

  get themes(): readonly CycleTheme[] {
    return this.props.themes;
  }

  get generatedAt(): string {
    return this.props.generatedAt;
  }

  isCachedWithin(nowIso: string, ttlMilliseconds: number): boolean {
    const nowMs = new Date(nowIso).getTime();
    const generatedAtMs = new Date(this.props.generatedAt).getTime();
    return nowMs - generatedAtMs < ttlMilliseconds;
  }
}
