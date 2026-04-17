import { type TeamSelectorViewModel } from '../../presenters/settings.view-model.schema.ts';

interface SettingsTeamSelectorViewProps {
  viewModel: TeamSelectorViewModel;
  onTeamSelect: (teamId: string) => void;
}

export function SettingsTeamSelectorView({
  viewModel,
  onTeamSelect,
}: SettingsTeamSelectorViewProps) {
  return (
    <div className="settings-team-selector">
      <select
        value={viewModel.selectedTeamId ?? ''}
        onChange={(event) => onTeamSelect(event.target.value)}
        className="settings-select"
        disabled={viewModel.showLoading}
      >
        <option value="" disabled>
          {viewModel.placeholder}
        </option>
        {viewModel.teams.map((team) => (
          <option key={team.teamId} value={team.teamId}>
            {team.teamName}
          </option>
        ))}
      </select>
    </div>
  );
}
