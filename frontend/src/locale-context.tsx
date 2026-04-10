import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type Locale = 'en' | 'fr';

const LocaleContext = createContext<Locale>('en');

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    fetch('/settings/language')
      .then((response) => {
        if (!response.ok) return;
        return response.json();
      })
      .then((data) => {
        if (data?.language === 'fr' || data?.language === 'en') {
          setLocale(data.language);
        }
      })
      .catch(() => {});
  }, []);

  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}
