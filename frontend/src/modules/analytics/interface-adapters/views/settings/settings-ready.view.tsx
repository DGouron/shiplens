import { type SettingsViewModel } from '../../presenters/settings.view-model.schema.ts';
import { SettingsDriftGridSectionView } from './settings-drift-grid-section.view.tsx';
import { SettingsExcludedStatusesSectionView } from './settings-excluded-statuses-section.view.tsx';
import { SettingsLanguageSectionView } from './settings-language-section.view.tsx';
import { SettingsTeamSelectorView } from './settings-team-selector.view.tsx';
import { SettingsTimezoneSectionView } from './settings-timezone-section.view.tsx';
import { SettingsToastView } from './settings-toast.view.tsx';

interface SettingsReadyViewProps {
  viewModel: SettingsViewModel;
  onLanguageChange: (language: string) => void;
  onTeamSelect: (teamId: string) => void;
  onTimezoneChange: (timezone: string) => void;
  onStatusToggle: (statusName: string) => void;
}

export function SettingsReadyView({
  viewModel,
  onLanguageChange,
  onTeamSelect,
  onTimezoneChange,
  onStatusToggle,
}: SettingsReadyViewProps) {
  return (
    <div className="settings-page">
      <nav className="breadcrumbs">
        {viewModel.breadcrumbs.map((crumb) =>
          crumb.href ? (
            <a key={crumb.label} href={crumb.href}>
              {crumb.label}
            </a>
          ) : (
            <span key={crumb.label} className="breadcrumb-active">
              {crumb.label}
            </span>
          ),
        )}
      </nav>

      <h1>{viewModel.pageTitle}</h1>

      <SettingsLanguageSectionView
        viewModel={viewModel.language}
        onLanguageChange={onLanguageChange}
      />

      <SettingsTeamSelectorView
        viewModel={viewModel.teamSelector}
        onTeamSelect={onTeamSelect}
      />

      <SettingsTimezoneSectionView
        viewModel={viewModel.timezone}
        onTimezoneChange={onTimezoneChange}
      />

      <SettingsExcludedStatusesSectionView
        viewModel={viewModel.excludedStatuses}
        onStatusToggle={onStatusToggle}
      />

      <SettingsDriftGridSectionView viewModel={viewModel.driftGrid} />

      {viewModel.toastMessage && (
        <SettingsToastView message={viewModel.toastMessage} />
      )}
    </div>
  );
}
