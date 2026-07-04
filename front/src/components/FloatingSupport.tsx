import React, { useState, useRef, useEffect } from 'react';
import { Headset, MessageCircle, Send, X } from 'lucide-react';

import type { TranslationKey } from '../lib/i18n/translations';
import { useLanguage } from './LanguageProvider';

const TELEGRAM_URL = 'https://t.me/AddisInvoiceSupportBot';
const WHATSAPP_URL = 'https://wa.me/251978407848';

const channels: { labelKey: TranslationKey; url: string; icon: typeof Send }[] = [
  { labelKey: 'support.telegram', url: TELEGRAM_URL, icon: Send },
  { labelKey: 'support.whatsapp', url: WHATSAPP_URL, icon: MessageCircle },
];

const FloatingSupport: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t, textClass } = useLanguage();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50 flex w-14 flex-col items-end gap-2">
      {open && (
        <div className="flex w-56 flex-col-reverse gap-2" role="menu" aria-label={t('support.menu')}>
          {channels.map(({ labelKey, url, icon: Icon }, index) => (
            <a
              key={labelKey}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              className={`support-menu-item group flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/92 px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-lg transition-colors hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:text-cyan-300 ${textClass}`}
              style={{ animationDelay: `${index * 55}ms` }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                <Icon className="h-4 w-4" />
              </span>
              <span>{t(labelKey)}</span>
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-[0_18px_45px_rgba(6,182,212,0.22)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
          open
            ? 'rotate-0 bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-950'
            : 'bg-cyan-500 text-slate-950 hover:scale-105 hover:bg-cyan-400 active:scale-95'
        }`}
        aria-label={open ? t('support.close') : t('support.open')}
        aria-expanded={open}
        aria-haspopup="menu"
        title={t('support.getSupport')}
      >
        {open ? (
          <X className="h-5 w-5 transition-transform duration-300" />
        ) : (
          <>
            <Headset className="h-5 w-5" />
            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-cyan-500/25 animate-support-ping" />
          </>
        )}
      </button>
    </div>
  );
};

export default FloatingSupport;