import React from 'react';

import { useLanguage } from './LanguageProvider';

const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200/70 bg-white/82 px-2.5 text-xs font-semibold shadow-sm transition-all hover:border-cyan-400/40 hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:text-cyan-300"
      aria-label={language === 'en' ? t('lang.switchToAm') : t('lang.switchToEn')}
      title={language === 'en' ? t('lang.switchToAm') : t('lang.switchToEn')}
    >
      <span className={language === 'en' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}>
        {t('lang.toggle.en')}
      </span>
      <span className="text-slate-300 dark:text-slate-600">/</span>
      <span className={`i18n-am ${language === 'am' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`}>
        {t('lang.toggle.am')}
      </span>
    </button>
  );
};

export default LanguageToggle;