import { type AuditRuleProps, type Origin, severitySchema, originSchema } from './audit-rule.schema.js';
import { type Condition } from './condition.schema.js';
import { type CycleMetrics } from './cycle-metrics.js';
import { parseCondition } from './parse-condition.js';
import {
  MissingIdentifierError,
  InvalidSeverityError,
} from './audit-rule.errors.js';

export interface EvaluationResult {
  outcome: 'pass' | 'warn' | 'fail';
  message: string;
}

interface CreateAuditRuleInput {
  identifier: string;
  name: string;
  severity: string;
  conditionExpression: string;
  origin?: string;
}

const METRIC_FIELD_MAP: Record<string, keyof CycleMetrics> = {
  'cycle time': 'averageCycleTimeInDays',
  'lead time': 'averageLeadTimeInDays',
  'throughput': 'throughput',
  'completion rate': 'completionRate',
  'scope creep': 'scopeCreep',
  'velocity': 'velocity',
};

const METRIC_LABEL_MAP: Record<string, string> = {
  'cycle time': 'Cycle time moyen',
  'lead time': 'Lead time moyen',
  'throughput': 'Throughput',
  'completion rate': 'Taux de completion',
  'scope creep': 'Scope creep',
  'velocity': 'Velocite',
};

function compareValues(actual: number, operator: string, threshold: number): boolean {
  switch (operator) {
    case '>': return actual > threshold;
    case '<': return actual < threshold;
    case '>=': return actual >= threshold;
    case '<=': return actual <= threshold;
    default: return false;
  }
}

export class AuditRule {
  private constructor(private readonly props: AuditRuleProps) {}

  static create(input: CreateAuditRuleInput): AuditRule {
    if (input.identifier.trim() === '') {
      throw new MissingIdentifierError();
    }

    const severityResult = severitySchema.safeParse(input.severity);
    if (!severityResult.success) {
      throw new InvalidSeverityError();
    }

    const condition = parseCondition(input.conditionExpression);

    const origin: Origin = input.origin
      ? originSchema.parse(input.origin)
      : 'manual';

    return new AuditRule({
      identifier: input.identifier,
      name: input.name,
      severity: severityResult.data,
      condition,
      origin,
    });
  }

  get identifier(): string {
    return this.props.identifier;
  }

  get name(): string {
    return this.props.name;
  }

  get severity(): string {
    return this.props.severity;
  }

  get condition(): Condition {
    return this.props.condition;
  }

  get origin(): Origin {
    return this.props.origin;
  }

  evaluate(metrics: CycleMetrics): EvaluationResult {
    const condition = this.props.condition;

    switch (condition.type) {
      case 'threshold':
        return this.evaluateThreshold(condition, metrics);
      case 'ratio':
        return this.evaluateRatio(condition, metrics);
      case 'pattern':
        return this.evaluatePattern(condition, metrics);
    }
  }

  private evaluateThreshold(
    condition: Extract<Condition, { type: 'threshold' }>,
    metrics: CycleMetrics,
  ): EvaluationResult {
    const metricField = METRIC_FIELD_MAP[condition.metric];
    const metricLabel = METRIC_LABEL_MAP[condition.metric] ?? condition.metric;
    const actualValue = metricField ? metrics[metricField] : 0;
    const numericValue = typeof actualValue === 'number' ? actualValue : 0;

    const violated = compareValues(numericValue, condition.operator, condition.value);
    const unitSuffix = condition.unit ? ` ${condition.unit}` : '';
    const message = `${metricLabel} : ${numericValue}${unitSuffix} (seuil : ${condition.value}${unitSuffix})`;

    return {
      outcome: this.determineOutcome(violated),
      message,
    };
  }

  private evaluateRatio(
    condition: Extract<Condition, { type: 'ratio' }>,
    metrics: CycleMetrics,
  ): EvaluationResult {
    const ratioKey = `${condition.numerator}/${condition.denominator}`;
    const actualValue = metrics.metricRatios[ratioKey] ?? 0;

    const violated = compareValues(actualValue, condition.operator, condition.value);
    const message = `Ratio ${ratioKey} : ${actualValue} (seuil : ${condition.value})`;

    return {
      outcome: this.determineOutcome(violated),
      message,
    };
  }

  private evaluatePattern(
    condition: Extract<Condition, { type: 'pattern' }>,
    metrics: CycleMetrics,
  ): EvaluationResult {
    const distribution =
      condition.target === 'label'
        ? metrics.labelDistribution
        : metrics.statusDistribution;

    let matched = false;
    if (condition.matcher === 'contains') {
      matched = condition.value in distribution;
    } else {
      matched = Object.keys(distribution).length === 1 && condition.value in distribution;
    }

    const message = matched
      ? `${condition.target} "${condition.value}" detecte dans la distribution`
      : `${condition.target} "${condition.value}" absent de la distribution`;

    return {
      outcome: this.determineOutcome(matched),
      message,
    };
  }

  private determineOutcome(violated: boolean): 'pass' | 'warn' | 'fail' {
    if (!violated) {
      return 'pass';
    }

    switch (this.props.severity) {
      case 'error':
        return 'fail';
      case 'warning':
        return 'warn';
      case 'info':
        return 'pass';
    }
  }
}
