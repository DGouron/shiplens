import { Link } from 'react-router';
import '../styles/app-navbar.css';
import { Breadcrumb, type BreadcrumbItem } from './breadcrumb.tsx';
import { ThemeToggle } from './theme-toggle.tsx';

type AppNavbarProps = {
  breadcrumbs: BreadcrumbItem[];
  settingsLabel: string;
  themeToggleTitle: string;
  showSettings?: boolean;
};

export function AppNavbar({
  breadcrumbs,
  settingsLabel,
  themeToggleTitle,
  showSettings = true,
}: AppNavbarProps) {
  const hasBreadcrumbs = breadcrumbs.length > 0;

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/dashboard" className="nav-brand">
          Shiplens
        </Link>
        {hasBreadcrumbs && <span className="nav-sep">/</span>}
        <Breadcrumb items={breadcrumbs} />
      </div>
      <div className="nav-right">
        {showSettings && (
          <Link to="/settings" className="nav-crumb">
            {settingsLabel}
          </Link>
        )}
        <ThemeToggle title={themeToggleTitle} />
      </div>
    </nav>
  );
}
