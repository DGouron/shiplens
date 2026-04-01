import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';
import { AuditRule } from '@modules/audit/entities/audit-rule/audit-rule.js';

interface AuditRuleBuilderProps {
  identifier: string;
  name: string;
  severity: string;
  conditionExpression: string;
  origin: string;
}

const defaultProps: AuditRuleBuilderProps = {
  identifier: 'CT-MAX-5',
  name: 'Cycle time max 5 jours',
  severity: 'warning',
  conditionExpression: 'cycle time > 5 jours',
  origin: 'manual',
};

export class AuditRuleBuilder extends EntityBuilder<AuditRuleBuilderProps, AuditRule> {
  constructor() {
    super(defaultProps);
  }

  withIdentifier(identifier: string): this {
    this.props.identifier = identifier;
    return this;
  }

  withName(name: string): this {
    this.props.name = name;
    return this;
  }

  withSeverity(severity: string): this {
    this.props.severity = severity;
    return this;
  }

  withConditionExpression(conditionExpression: string): this {
    this.props.conditionExpression = conditionExpression;
    return this;
  }

  withOrigin(origin: string): this {
    this.props.origin = origin;
    return this;
  }

  build(): AuditRule {
    return AuditRule.create({ ...this.props });
  }
}
