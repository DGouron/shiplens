import { useEffect, useState } from 'react';
import '../styles/theme-toggle.css';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'shiplens-theme';
const DEFAULT_THEME: Theme = 'dark';

function readStoredTheme(): Theme {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  return DEFAULT_THEME;
}

type ThemeToggleProps = {
  title: string;
};

export function ThemeToggle({ title }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const handleToggle = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      title={title}
      aria-label={title}
      onClick={handleToggle}
    >
      <span className="theme-icon theme-icon-dark">&#9790;</span>
      <span className="theme-icon theme-icon-light">&#9788;</span>
    </button>
  );
}
