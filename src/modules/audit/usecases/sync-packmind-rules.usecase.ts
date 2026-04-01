import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { GatewayError } from '@shared/foundation/gateway-error.js';
import { AuditRuleGateway } from '../entities/audit-rule/audit-rule.gateway.js';
import { AuditRule } from '../entities/audit-rule/audit-rule.js';
import { ChecklistItemGateway } from '../entities/checklist-item/checklist-item.gateway.js';
import { ChecklistItem } from '../entities/checklist-item/checklist-item.js';
import { PackmindGateway } from '../entities/packmind/packmind.gateway.js';
import { type PackmindPractice } from '../entities/packmind/packmind-practice.js';
import {
  MissingPackmindTokenError,
  NoPracticesFoundError,
  PackmindUnreachableWithoutCacheError,
} from '../entities/packmind/packmind.errors.js';

interface SyncPackmindRulesParams {
  token: string;
}

export interface SyncResult {
  createdRulesCount: number;
  updatedRulesCount: number;
  checklistItemsCount: number;
  fromCache: boolean;
  warning?: string;
}

@Injectable()
export class SyncPackmindRulesUsecase implements Usecase<SyncPackmindRulesParams, SyncResult> {
  constructor(
    private readonly auditRuleGateway: AuditRuleGateway,
    private readonly checklistItemGateway: ChecklistItemGateway,
    private readonly packmindGateway: PackmindGateway,
  ) {}

  async execute(params: SyncPackmindRulesParams): Promise<SyncResult> {
    if (params.token.trim() === '') {
      throw new MissingPackmindTokenError();
    }

    let practices: PackmindPractice[];

    try {
      practices = await this.packmindGateway.fetchPractices(params.token);
    } catch (error) {
      if (error instanceof GatewayError) {
        return this.handleUnreachable();
      }
      throw error;
    }

    if (practices.length === 0) {
      throw new NoPracticesFoundError();
    }

    return this.syncPractices(practices);
  }

  private async handleUnreachable(): Promise<SyncResult> {
    const cachedRules = await this.auditRuleGateway.findAllByOrigin('packmind');
    const cachedItems = await this.checklistItemGateway.findAll();
    const packmindItems = cachedItems.filter((item) => item.origin === 'packmind');

    if (cachedRules.length === 0 && packmindItems.length === 0) {
      throw new PackmindUnreachableWithoutCacheError();
    }

    return {
      createdRulesCount: 0,
      updatedRulesCount: 0,
      checklistItemsCount: packmindItems.length,
      fromCache: true,
      warning: 'Packmind est injoignable. Les regles en cache sont utilisees.',
    };
  }

  private async syncPractices(practices: PackmindPractice[]): Promise<SyncResult> {
    let createdRulesCount = 0;
    let updatedRulesCount = 0;
    let checklistItemsCount = 0;

    for (const practice of practices) {
      if (practice.measurable) {
        const existing = await this.auditRuleGateway.findByIdentifier(practice.identifier);

        const rule = AuditRule.create({
          identifier: practice.identifier,
          name: practice.name,
          severity: practice.severity ?? 'warning',
          conditionExpression: practice.conditionExpression ?? '',
          origin: 'packmind',
        });

        await this.auditRuleGateway.save(rule);

        if (existing) {
          updatedRulesCount++;
        } else {
          createdRulesCount++;
        }
      } else {
        const item = ChecklistItem.create({
          identifier: practice.identifier,
          name: practice.name,
          origin: 'packmind',
        });

        await this.checklistItemGateway.save(item);
        checklistItemsCount++;
      }
    }

    return {
      createdRulesCount,
      updatedRulesCount,
      checklistItemsCount,
      fromCache: false,
    };
  }
}
