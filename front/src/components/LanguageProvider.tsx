import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  interpolate,
  Language,
  TranslationKey,
  translations,
} from '../lib/i18n/translations';

const STORAGE_KEY = 'addis_invoice_lang';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isAmharic: boolean;
  textClass: string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const resolveInitialLanguage = (): Language => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'am') return saved;
  return 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => resolveInitialLanguage());

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.classList.toggle('lang-am', language === 'am');
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'en' ? 'am' : 'en'));
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const value = translations[language][key] ?? translations.en[key] ?? key;
      return interpolate(value, params);
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      isAmharic: language === 'am',
      textClass: language === 'am' ? 'i18n-am' : '',
    }),
    [language, setLanguage, toggleLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};