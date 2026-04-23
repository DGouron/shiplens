import { type Locale } from './cycle-metrics.translations.ts';

export interface MemberMetricsTranslations {
  sectionTitle: (memberDisplayName: string) => string;
  labelBlocked: string;
  labelDrifting: string;
  labelSlowestStatus: string;
  labelEstimationCalibration: string;
  labelThroughput: string;
  blockedIssuesCaption: string;
  driftingIssuesCaption: string;
  noStatusAvailable: string;
  noEstimationSignal: string;
  completedIssuesCaption: string;
  daysPerPointSuffix: string;
  classificationWellEstimated: string;
  classificationOverEstimated: string;
  classificationUnderEstimated: string;
  labelVerdict: string;
  verdictDrowning: string;
  verdictDrowningCaption: string;
  verdictWatch: string;
  verdictWatchCaption: string;
  verdictOnTrack: string;
  verdictOnTrackCaption: string;
  verdictAvailable: string;
  verdictAvailableCaption: string;
}

export const memberMetricsTranslations: Record<
  Locale,
  MemberMetricsTranslations
> = {
  en: {
    sectionTitle: (memberDisplayName) => `${memberDisplayName}'s metrics`,
    labelBlocked: 'Blocked',
    labelDrifting: 'Drifting',
    labelSlowestStatus: 'Slowest status',
    labelEstimationCalibration: 'Estimation calibration',
    labelThroughput: 'Completed estimated issues',
    blockedIssuesCaption: 'Stuck on a dependency',
    driftingIssuesCaption: 'Past their expected time',
    noStatusAvailable: 'No activity',
    noEstimationSignal: 'Not enough data',
    completedIssuesCaption: 'Shipped with an estimate',
    daysPerPointSuffix: 'days/point',
    classificationWellEstimated: 'Well-estimated',
    classificationOverEstimated: 'Over-estimated',
    classificationUnderEstimated: 'Under-estimated',
    labelVerdict: 'Verdict',
    verdictDrowning: 'Under water',
    verdictDrowningCaption: 'Needs help now',
    verdictWatch: 'Needs attention',
    verdictWatchCaption: 'Watch closely',
    verdictOnTrack: 'On track',
    verdictOnTrackCaption: 'No red flag',
    verdictAvailable: 'Available',
    verdictAvailableCaption: 'Can help others',
  },
  fr: {
    sectionTitle: (memberDisplayName) => `Metriques de ${memberDisplayName}`,
    labelBlocked: 'Bloquees',
    labelDrifting: 'En derive',
    labelSlowestStatus: 'Statut le plus lent',
    labelEstimationCalibration: 'Calibrage d estimation',
    labelThroughput: 'Issues estimees terminees',
    blockedIssuesCaption: 'Coincees sur une dependance',
    driftingIssuesCaption: 'Depassent le temps attendu',
    noStatusAvailable: 'Aucune activite',
    noEstimationSignal: 'Pas assez de donnees',
    completedIssuesCaption: 'Livrees avec une estimation',
    daysPerPointSuffix: 'jours/point',
    classificationWellEstimated: 'Bien estimee',
    classificationOverEstimated: 'Surestimee',
    classificationUnderEstimated: 'Sous-estimee',
    labelVerdict: 'Verdict',
    verdictDrowning: 'Sous l eau',
    verdictDrowningCaption: 'Besoin d aide maintenant',
    verdictWatch: 'A surveiller',
    verdictWatchCaption: 'Garder un oeil',
    verdictOnTrack: 'Sur les rails',
    verdictOnTrackCaption: 'Pas de signal rouge',
    verdictAvailable: 'Disponible',
    verdictAvailableCaption: 'Peut aider quelqu un',
  },
};
