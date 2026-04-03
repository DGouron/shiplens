import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type SprintReport } from '../../entities/sprint-report/sprint-report.js';
import { type AuditSection } from '../../entities/sprint-report/sprint-report.schema.js';

export interface ReportDetailDto {
  id: string;
  cycleName: string;
  language: string;
  generatedAt: string;
  markdown: string;
  plainText: string;
}

const NO_TREND_MESSAGE: Record<string, string> = {
  FR: "Pas d'historique disponible pour comparer la vélocité",
  EN: 'No historical data available to compare velocity',
};

const SECTION_LABELS: Record<string, Record<string, string>> = {
  FR: {
    summary: 'Résumé',
    trends: 'Tendances',
    highlights: 'Points forts',
    risks: 'Risques',
    recommendations: 'Recommandations',
  },
  EN: {
    summary: 'Summary',
    trends: 'Trends',
    highlights: 'Highlights',
    risks: 'Risks',
    recommendations: 'Recommendations',
  },
};

const _STATUS_EMOJI: Record<string, string> = {
  pass: 'pass',
  warn: 'warn',
  fail: 'fail',
};

@Injectable()
export class ReportDetailPresenter
  implements Presenter<SprintReport, ReportDetailDto>
{
  present(report: SprintReport): ReportDetailDto {
    const labels = SECTION_LABELS[report.language] ?? SECTION_LABELS.EN;
    const trendsContent =
      report.trends ?? NO_TREND_MESSAGE[report.language] ?? NO_TREND_MESSAGE.EN;

    const markdownParts = [
      `# ${report.cycleName}`,
      '',
      `## ${labels.summary}`,
      report.executiveSummary,
      '',
      `## ${labels.trends}`,
      trendsContent,
      '',
      `## ${labels.highlights}`,
      report.highlights,
      '',
      `## ${labels.risks}`,
      report.risks,
      '',
      `## ${labels.recommendations}`,
      report.recommendations,
    ];

    if (report.auditSection) {
      markdownParts.push(
        '',
        ...this.renderAuditSectionMarkdown(report.auditSection),
      );
    }

    const markdown = markdownParts.join('\n');

    const plainTextParts = [
      report.cycleName,
      '',
      `${labels.summary}:`,
      report.executiveSummary,
      '',
      `${labels.trends}:`,
      trendsContent,
      '',
      `${labels.highlights}:`,
      report.highlights,
      '',
      `${labels.risks}:`,
      report.risks,
      '',
      `${labels.recommendations}:`,
      report.recommendations,
    ];

    if (report.auditSection) {
      plainTextParts.push(
        '',
        ...this.renderAuditSectionPlainText(report.auditSection),
      );
    }

    const plainText = plainTextParts.join('\n');

    return {
      id: report.id,
      cycleName: report.cycleName,
      language: report.language,
      generatedAt: report.generatedAt,
      markdown,
      plainText,
    };
  }

  private renderAuditSectionMarkdown(auditSection: AuditSection): string[] {
    const lines: string[] = [];

    lines.push(`## Audit des pratiques`);
    lines.push('');
    lines.push(`**Score d'adhérence : ${auditSection.adherenceScore}%**`);
    lines.push('');

    if (auditSection.trend) {
      lines.push(`**Tendance : ${auditSection.trend.message}**`);
    } else {
      lines.push("Pas assez d'historique pour afficher la tendance.");
    }
    lines.push('');

    lines.push('| Règle | Statut | Valeur mesurée |');
    lines.push('|-------|--------|----------------|');
    for (const rule of auditSection.evaluatedRules) {
      lines.push(
        `| ${rule.ruleName} | ${rule.status} | ${rule.measuredValue} |`,
      );
    }

    const failedRules = auditSection.evaluatedRules.filter(
      (rule) => rule.recommendation !== null,
    );
    if (failedRules.length > 0) {
      lines.push('');
      lines.push('### Recommandations');
      for (const rule of failedRules) {
        lines.push(`- **${rule.ruleName}** : ${rule.recommendation}`);
      }
    }

    if (auditSection.checklistItems.length > 0) {
      lines.push('');
      lines.push('### Checklist');
      for (const item of auditSection.checklistItems) {
        lines.push(`- [ ] ${item.name}`);
      }
    }

    return lines;
  }

  private renderAuditSectionPlainText(auditSection: AuditSection): string[] {
    const lines: string[] = [];

    lines.push('Audit des pratiques:');
    lines.push('');
    lines.push(`Score d'adhérence : ${auditSection.adherenceScore}%`);
    lines.push('');

    if (auditSection.trend) {
      lines.push(`Tendance : ${auditSection.trend.message}`);
    } else {
      lines.push("Pas assez d'historique pour afficher la tendance.");
    }
    lines.push('');

    for (const rule of auditSection.evaluatedRules) {
      lines.push(`${rule.ruleName} - ${rule.status} - ${rule.measuredValue}`);
    }

    const failedRules = auditSection.evaluatedRules.filter(
      (rule) => rule.recommendation !== null,
    );
    if (failedRules.length > 0) {
      lines.push('');
      lines.push('Recommandations:');
      for (const rule of failedRules) {
        lines.push(`- ${rule.ruleName} : ${rule.recommendation}`);
      }
    }

    if (auditSection.checklistItems.length > 0) {
      lines.push('');
      lines.push('Checklist:');
      for (const item of auditSection.checklistItems) {
        lines.push(`- ${item.name}`);
      }
    }

    return lines;
  }
}
