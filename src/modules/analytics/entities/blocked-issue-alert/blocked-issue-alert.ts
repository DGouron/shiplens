import { type BlockedIssueAlertProps } from './blocked-issue-alert.schema.js';
import { blockedIssueAlertGuard } from './blocked-issue-alert.guard.js';

export class BlockedIssueAlert {
  private constructor(private readonly props: BlockedIssueAlertProps) {}

  static create(props: unknown): BlockedIssueAlert {
    const validated = blockedIssueAlertGuard.parse(props);
    return new BlockedIssueAlert(validated);
  }

  get id(): string {
    return this.props.id;
  }

  get issueExternalId(): string {
    return this.props.issueExternalId;
  }

  get issueTitle(): string {
    return this.props.issueTitle;
  }

  get issueUuid(): string {
    return this.props.issueUuid;
  }

  get statusName(): string {
    return this.props.statusName;
  }

  get severity(): string {
    return this.props.severity;
  }

  get durationHours(): number {
    return this.props.durationHours;
  }

  get detectedAt(): string {
    return this.props.detectedAt;
  }

  get active(): boolean {
    return this.props.active;
  }

  get resolvedAt(): string | null {
    return this.props.resolvedAt;
  }

  get issueUrl(): string {
    return `https://linear.app/issue/${this.props.issueUuid}`;
  }

  resolve(resolvedAt: string): BlockedIssueAlert {
    return BlockedIssueAlert.create({
      ...this.props,
      active: false,
      resolvedAt,
    });
  }
}
