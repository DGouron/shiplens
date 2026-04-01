import { Injectable } from '@nestjs/common';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { AuditRuleGateway } from '../../entities/audit-rule/audit-rule.gateway.js';
import { AuditRule } from '../../entities/audit-rule/audit-rule.js';
import { RulesDirectoryNotFoundError } from '../../entities/audit-rule/audit-rule.errors.js';

const storedRuleSchema = z.object({
  identifier: z.string(),
  name: z.string(),
  severity: z.string(),
  conditionExpression: z.string(),
});

@Injectable()
export class AuditRuleInFilesystemGateway extends AuditRuleGateway {
  constructor(private readonly rulesDirectory: string) {
    super();
  }

  async save(rule: AuditRule): Promise<void> {
    this.ensureDirectoryExists();

    const filePath = join(this.rulesDirectory, `${rule.identifier}.json`);
    const stored = {
      identifier: rule.identifier,
      name: rule.name,
      severity: rule.severity,
      conditionExpression: this.serializeCondition(rule),
    };

    await writeFile(filePath, JSON.stringify(stored, null, 2), 'utf-8');
  }

  async findByIdentifier(identifier: string): Promise<AuditRule | null> {
    if (!existsSync(this.rulesDirectory)) {
      return null;
    }

    const filePath = join(this.rulesDirectory, `${identifier}.json`);
    if (!existsSync(filePath)) {
      return null;
    }

    const content = await readFile(filePath, 'utf-8');
    const stored: unknown = JSON.parse(content);
    return this.deserializeRule(stored);
  }

  async findAll(): Promise<AuditRule[]> {
    if (!existsSync(this.rulesDirectory)) {
      return [];
    }

    const files = await readdir(this.rulesDirectory);
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    const rules: AuditRule[] = [];
    for (const file of jsonFiles) {
      const content = await readFile(join(this.rulesDirectory, file), 'utf-8');
      const stored: unknown = JSON.parse(content);
      rules.push(this.deserializeRule(stored));
    }

    return rules;
  }

  private ensureDirectoryExists(): void {
    if (!existsSync(this.rulesDirectory)) {
      throw new RulesDirectoryNotFoundError();
    }
  }

  private serializeCondition(rule: AuditRule): string {
    const condition = rule.condition;
    switch (condition.type) {
      case 'threshold': {
        const unitPart = condition.unit ? ` ${condition.unit}` : '';
        return `${condition.metric} ${condition.operator} ${condition.value}${unitPart}`;
      }
      case 'ratio':
        return `ratio ${condition.numerator}/${condition.denominator} ${condition.operator} ${condition.value}`;
      case 'pattern':
        return `${condition.target} ${condition.matcher} ${condition.value}`;
    }
  }

  private deserializeRule(stored: unknown): AuditRule {
    const data = storedRuleSchema.parse(stored);
    return AuditRule.create({
      identifier: data.identifier,
      name: data.name,
      severity: data.severity,
      conditionExpression: data.conditionExpression,
    });
  }
}
