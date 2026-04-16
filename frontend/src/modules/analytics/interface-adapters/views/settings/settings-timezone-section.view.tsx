import { type TimezoneSectionViewModel } from '../../presenters/settings.view-model.schema.ts';

interface SettingsTimezoneSectionViewProps {
  viewModel: TimezoneSectionViewModel;
  onTimezoneChange: (timezone: string) => void;
}

const COMMON_TIMEZONES = [
  'Europe/Paris',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC',
];

export function SettingsTimezoneSectionView({
  viewModel,
  onTimezoneChange,
}: SettingsTimezoneSectionViewProps) {
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
      <select
        value={viewModel.currentTimezone}
        onChange={(event) => onTimezoneChange(event.target.value)}
        className="settings-select"
      >
        {COMMON_TIMEZONES.map((timezone) => (
          <option key={timezone} value={timezone}>
            {timezone}
          </option>
        ))}
      </select>
    </section>
  );
}
