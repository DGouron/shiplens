import { Outlet } from 'react-router';
import '../styles/tokens.css';
import '../styles/global.css';
import '../styles/animations.css';
import { AppNavbar } from './app-navbar.tsx';

export function AppLayout() {
  return (
    <div className="app">
      <AppNavbar
        breadcrumbs={[]}
        settingsLabel="Settings"
        themeToggleTitle="Toggle theme"
      />
      <Outlet />
    </div>
  );
}
