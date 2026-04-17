import '@/styles/settings.css';
import { useSettings } from '../../hooks/use-settings.ts';
import { SettingsReadyView } from './settings-ready.view.tsx';

export function SettingsView() {
  const {
    state,
    onLanguageChange,
    onTeamSelect,
    onTimezoneChange,
    onStatusToggle,
  } = useSettings();

  if (state.status === 'loading') {
    return <div className="settings-loading">Loading...</div>;
  }

  if (state.status === 'error') {
    return <div className="settings-error">{state.message}</div>;
  }

  return (
    <SettingsReadyView
      viewModel={state.data}
      onLanguageChange={onLanguageChange}
      onTeamSelect={onTeamSelect}
      onTimezoneChange={onTimezoneChange}
      onStatusToggle={onStatusToggle}
    />
  );
}
