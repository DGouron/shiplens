import { type EstimationTeamScoreViewModel } from '../../presenters/estimation-accuracy.view-model.schema.ts';

interface EstimationTeamScoreViewProps {
  teamScore: EstimationTeamScoreViewModel;
  heading: string;
}

export function EstimationTeamScoreView({
  teamScore,
  heading,
}: EstimationTeamScoreViewProps) {
  return (
    <section
      className={`estimation-accuracy-team-score estimation-accuracy-team-score--${teamScore.classification}`}
    >
      <h3 className="estimation-accuracy-team-score-heading">{heading}</h3>
      <p className="estimation-accuracy-team-score-classification">
        {teamScore.classificationLabel}
      </p>
      <p className="estimation-accuracy-team-score-days-per-point">
        {teamScore.daysPerPointLabel}
      </p>
      <p className="estimation-accuracy-team-score-issue-count">
        {teamScore.issueCountLabel}
      </p>
    </section>
  );
}
