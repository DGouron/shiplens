import { Injectable } from '@nestjs/common';
import { type SprintReport } from '../../entities/sprint-report/sprint-report.js';
import { type AuditSection } from '../../entities/sprint-report/sprint-report.schema.js';
import { type Locale } from '../../entities/workspace-settings/workspace-language.schema.js';

export interface ReportDetailDto {
  id: string;
  cycleId: string;
  cycleName: string;
  language: string;
  generatedAt: string;
  markdown: string;
  plainText: string;
}

const NO_TREND_MESSAGE: Record<Locale, string> = {
  fr: "Pas d'historique disponible pour comparer la vélocité",
  en: 'No historical data available to compare velocity',
};

const SECTION_LABELS: Record<Locale, Record<string, string>> = {
  fr: {
    summary: 'Résumé',
    trends: 'Tendances',
    highlights: 'Points forts',
    risks: 'Risques',
    recommendations: 'Recommandations',
  },
  en: {
    summary: 'Summary',
    trends: 'Trends',
    highlights: 'Highlights',
    risks: 'Risks',
    recommendations: 'Recommendations',
  },
};

const AUDIT_LABELS: Record<Locale, Record<string, string>> = {
  fr: {
    title: 'Audit des pratiques',
    adherenceScorePrefix: "Score d'adhérence : ",
    trendPrefix: 'Tendance : ',
    noTrend: "Pas assez d'historique pour afficher la tendance.",
    recommendations: 'Recommandations',
    checklist: 'Checklist',
    ruleHeader: 'Règle',
    statusHeader: 'Statut',
    measuredValueHeader: 'Valeur mesurée',
  },
  en: {
    title: 'Practice audit',
    adherenceScorePrefix: 'Adherence score: ',
    trendPrefix: 'Trend: ',
    noTrend: 'Not enough history to display trend.',
    recommendations: 'Recommendations',
    checklist: 'Checklist',
    ruleHeader: 'Rule',
    statusHeader: 'Status',
    measuredValueHeader: 'Measured value',
  },
};

@Injectable()
export class ReportDetailPresenter {
  present(report: SprintReport, locale: Locale): ReportDetailDto {
    const labels = SECTION_LABELS[locale];
    const trendsContent = report.trends ?? NO_TREND_MESSAGE[locale];

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
        ...this.renderAuditSectionMarkdown(report.auditSection, locale),
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
        ...this.renderAuditSectionPlainText(report.auditSection, locale),
      );
    }

    const plainText = plainTextParts.join('\n');

    return {
      id: report.id,
      cycleId: report.cycleId,
      cycleName: report.cycleName,
      language: report.language,
      generatedAt: report.generatedAt,
      markdown,
      plainText,
    };
  }

  private renderAuditSectionMarkdown(
    auditSection: AuditSection,
    locale: Locale,
  ): string[] {
    const audit = AUDIT_LABELS[locale];
    const lines: string[] = [];

    lines.push(`## ${audit.title}`);
    lines.push('');
    lines.push(
      `**${audit.adherenceScorePrefix}${auditSection.adherenceScore}%**`,
    );
    lines.push('');

    if (auditSection.trend) {
      lines.push(`**${audit.trendPrefix}${auditSection.trend.message}**`);
    } else {
      lines.push(audit.noTrend);
    }
    lines.push('');

    lines.push(
      `| ${audit.ruleHeader} | ${audit.statusHeader} | ${audit.measuredValueHeader} |`,
    );
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
      lines.push(`### ${audit.recommendations}`);
      for (const rule of failedRules) {
        lines.push(`- **${rule.ruleName}** : ${rule.recommendation}`);
      }
    }

    if (auditSection.checklistItems.length > 0) {
      lines.push('');
      lines.push(`### ${audit.checklist}`);
      for (const item of auditSection.checklistItems) {
        lines.push(`- [ ] ${item.name}`);
      }
    }

    return lines;
  }

  private renderAuditSectionPlainText(
    auditSection: AuditSection,
    locale: Locale,
  ): string[] {
    const audit = AUDIT_LABELS[locale];
    const lines: string[] = [];

    lines.push(`${audit.title}:`);
    lines.push('');
    lines.push(`${audit.adherenceScorePrefix}${auditSection.adherenceScore}%`);
    lines.push('');

    if (auditSection.trend) {
      lines.push(`${audit.trendPrefix}${auditSection.trend.message}`);
    } else {
      lines.push(audit.noTrend);
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
      lines.push(`${audit.recommendations}:`);
      for (const rule of failedRules) {
        lines.push(`- ${rule.ruleName} : ${rule.recommendation}`);
      }
    }

    if (auditSection.checklistItems.length > 0) {
      lines.push('');
      lines.push(`${audit.checklist}:`);
      for (const item of auditSection.checklistItems) {
        lines.push(`- ${item.name}`);
      }
    }

    return lines;
  }
}
