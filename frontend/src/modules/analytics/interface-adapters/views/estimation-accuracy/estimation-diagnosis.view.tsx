import { type EstimationDiagnosisViewModel } from '../../presenters/estimation-accuracy.view-model.schema.ts';

interface EstimationDiagnosisViewProps {
  diagnosis: EstimationDiagnosisViewModel;
}

export function EstimationDiagnosisView({
  diagnosis,
}: EstimationDiagnosisViewProps) {
  return (
    <section
      className={`estimation-accuracy-diagnosis estimation-accuracy-diagnosis--${diagnosis.healthLevel}`}
    >
      <p className="estimation-accuracy-diagnosis-headline">
        {diagnosis.healthHeadline}
      </p>
      <p className="estimation-accuracy-diagnosis-accuracy">
        {diagnosis.accuracySummary}
      </p>
      {diagnosis.showDriftSummary && (
        <p className="estimation-accuracy-diagnosis-drift">
          {diagnosis.driftSummary}
        </p>
      )}
      <p className="estimation-accuracy-diagnosis-recommendation">
        {diagnosis.recommendation}
      </p>
    </section>
  );
}
