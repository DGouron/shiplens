import { type LanguageSectionViewModel } from '../../presenters/settings.view-model.schema.ts';

interface SettingsLanguageSectionViewProps {
  viewModel: LanguageSectionViewModel;
  onLanguageChange: (language: string) => void;
}

export function SettingsLanguageSectionView({
  viewModel,
  onLanguageChange,
}: SettingsLanguageSectionViewProps) {
  return (
    <section className="settings-section">
      <h2>{viewModel.title}</h2>
      <p className="settings-description">{viewModel.description}</p>
      <select
        value={viewModel.currentLanguage}
        onChange={(event) => onLanguageChange(event.target.value)}
        className="settings-select"
      >
        {viewModel.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </section>
  );
}
