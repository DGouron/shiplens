import { type ExcludedStatusesSectionViewModel } from '../../presenters/settings.view-model.schema.ts';
import { SettingsStatusToggleView } from './settings-status-toggle.view.tsx';

interface SettingsExcludedStatusesSectionViewProps {
  viewModel: ExcludedStatusesSectionViewModel;
  onStatusToggle: (statusName: string) => void;
}

export function SettingsExcludedStatusesSectionView({
  viewModel,
  onStatusToggle,
}: SettingsExcludedStatusesSectionViewProps) {
  if (viewModel.showEmptyState) {
    return (
      <section className="settings-section">
        <h2>{viewModel.title}</h2>
        <p className="settings-description">{viewModel.description}</p>
        <p className="settings-empty-state">{viewModel.emptyStateMessage}</p>
      </section>
    );
  }

  return (
    <section className="settings-section">
      <h2>{viewModel.title}</h2>
      <p className="settings-description">{viewModel.description}</p>
      {viewModel.showNoStatusesMessage && (
        <p className="settings-empty-state">{viewModel.noStatusesMessage}</p>
      )}
      <div className="settings-status-list">
        {viewModel.statusToggles.map((toggle) => (
          <SettingsStatusToggleView
            key={toggle.statusName}
            statusName={toggle.statusName}
            isExcluded={toggle.isExcluded}
            toggleLabel={toggle.toggleLabel}
            onToggle={() => onStatusToggle(toggle.statusName)}
          />
        ))}
      </div>
    </section>
  );
}
