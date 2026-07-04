import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CirclePlay,
  ChevronDown,
  FileCheck2,
  Landmark,
  ScanSearch,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { useLanguage } from '../components/LanguageProvider';
import { scrollToHash } from '../lib/navigation';
import { TranslationKey } from '../lib/i18n/translations';

const WHATSAPP_NUMBER = '251701681571';
const WHATSAPP_FREE_TRIAL_MSG = encodeURIComponent(
  'Hi, I want to try Addis Invoice free',
);

const PRICING_TIER_DEFS = [
  {
    nameKey: 'pricing.starter' as TranslationKey,
    price: '300',
    invoices: '50',
    featureKeys: [
      'pricing.feature.spreadsheetExport',
      'pricing.feature.telegramWhatsapp',
      'pricing.feature.bilingualInvoices',
      'pricing.feature.emailSupport',
    ] as TranslationKey[],
    highlighted: false,
  },
  {
    nameKey: 'pricing.pro' as TranslationKey,
    price: '750',
    invoices: '500',
    featureKeys: [
      'pricing.feature.everythingStarter',
      'pricing.feature.priorityProcessing',
      'pricing.feature.bulkExport',
      'pricing.feature.prioritySupport',
    ] as TranslationKey[],
    highlighted: true,
  },
  {
    nameKey: 'pricing.enterprise' as TranslationKey,
    price: 'custom',
    invoices: 'unlimited',
    featureKeys: [
      'pricing.feature.everythingPro',
      'pricing.feature.accountManager',
      'pricing.feature.customIntegrations',
      'pricing.feature.slaGuarantee',
    ] as TranslationKey[],
    highlighted: false,
  },
];

const SectionHeading: React.FC<{
  overline?: string;
  title: string;
  subtitle?: string;
  textClass?: string;
}> = ({ overline, title, subtitle, textClass = '' }) => (
  <div className={`text-center max-w-2xl mx-auto mb-8 ${textClass}`}>
    {overline && (
      <p className="text-cyan-600 dark:text-cyan-300 font-semibold text-sm uppercase tracking-[0.24em] mb-2">
        {overline}
      </p>
    )}
    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
      {title}
    </h2>
    <div className="flex items-center justify-center gap-2 mb-4">
      <div className="h-0.5 w-8 bg-cyan-500 rounded" />
      <div className="h-0.5 w-16 bg-cyan-500/30 rounded" />
    </div>
    {subtitle && (
      <p className="text-slate-600 dark:text-slate-300 text-base max-w-xl mx-auto">{subtitle}</p>
    )}
  </div>
);

const FAQItem: React.FC<{ q: string; a: string; textClass?: string }> = ({ q, a, textClass = '' }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b border-slate-200/80 dark:border-slate-800/80 ${textClass}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left font-semibold text-slate-900 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
      >
        <span>{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="pb-4 text-slate-600 dark:text-slate-300 leading-relaxed">{a}</div>
      )}
    </div>
  );
};

const Home: React.FC = () => {
  const location = useLocation();
  const { t, textClass } = useLanguage();
  const [hover, setHover] = useState({ x: 50, y: 22 });

  useEffect(() => {
    if (!location.hash) return;
    scrollToHash(location.hash);
  }, [location.hash, location.pathname]);

  const heroGlow = useMemo(
    () => ({
      background: `radial-gradient(480px circle at ${hover.x}% ${hover.y}%, rgba(34,211,238,0.18), transparent 45%)`,
    }),
    [hover],
  );

  const steps = useMemo(
    () => [
      { icon: ScanSearch, title: t('how.step1.title'), desc: t('how.step1.desc') },
      { icon: Bot, title: t('how.step2.title'), desc: t('how.step2.desc') },
      { icon: Landmark, title: t('how.step3.title'), desc: t('how.step3.desc') },
    ],
    [t],
  );

  const metrics = useMemo(
    () => [
      { label: t('hero.metric.tax'), value: t('hero.metric.taxValue') },
      { label: t('hero.metric.lang'), value: t('hero.metric.langValue') },
      { label: t('hero.metric.export'), value: t('hero.metric.exportValue') },
    ],
    [t],
  );

  const features = useMemo(
    () => [
      { title: t('features.upload.title'), desc: t('features.upload.desc') },
      { title: t('features.search.title'), desc: t('features.search.desc') },
      { title: t('features.tax.title'), desc: t('features.tax.desc') },
      { title: t('features.pdf.title'), desc: t('features.pdf.desc') },
    ],
    [t],
  );

  const faqs = useMemo(
    () => [
      { q: t('faq.q1'), a: t('faq.a1') },
      { q: t('faq.q2'), a: t('faq.a2') },
      { q: t('faq.q3'), a: t('faq.a3') },
    ],
    [t],
  );

  const sampleFields = useMemo(
    () => [
      { label: t('table.tin'), value: '0034921884' },
      { label: t('table.fsNo'), value: 'FS-11-2091' },
      { label: t('table.subtotal'), value: 'ETB 12,340' },
      { label: t('table.total'), value: 'ETB 14,191' },
    ],
    [t],
  );

  return (
    <div className={`relative ${textClass}`}>
      <section
        className="relative overflow-hidden"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setHover({ x, y });
        }}
      >
        <div className="pointer-events-none absolute inset-0 ui-grid animate-grid-fade opacity-60 dark:opacity-30" />
        <div className="pointer-events-none absolute inset-0 transition-opacity duration-300" style={heroGlow} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_58%)]" />

        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-8 md:px-6 md:pb-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="animate-reveal-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 ui-surface dark:text-slate-300">
              <Sparkles className="h-3 w-3 text-cyan-500 dark:text-cyan-300" />
              {t('hero.badge')}
            </div>

            <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-slate-950 dark:text-white md:text-4xl">
              {t('hero.title')}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
              {t('hero.subtitle')}
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_12px_32px_rgba(6,182,212,0.22)] transition-all hover:bg-cyan-400"
              >
                {t('hero.uploadCta')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_FREE_TRIAL_MSG}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-900/55 dark:text-slate-200 dark:hover:text-cyan-300"
              >
                <Send className="h-4 w-4" />
                {t('hero.trialCta')}
              </a>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {metrics.map(({ label, value }) => (
                <div key={label} className="ui-surface rounded-xl px-3 py-2.5">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-reveal-up [animation-delay:120ms]">
            <div className="ui-surface rounded-2xl p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 dark:border-slate-800/80">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('hero.sampleLabel')}</div>
                  <div className="mt-0.5 text-base font-semibold text-slate-900 dark:text-slate-100">{t('hero.sampleTitle')}</div>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToHash('#how')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/70 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:text-cyan-300"
                >
                  <CirclePlay className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-300" />
                  {t('hero.seeHow')}
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="rounded-lg bg-cyan-500/10 p-1.5 text-cyan-600 dark:text-cyan-300">
                  <FileCheck2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Abebe Trading PLC</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">12 Mar 2026</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {sampleFields.map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-slate-200/70 bg-slate-50/70 px-2.5 py-2 dark:border-slate-800/80 dark:bg-slate-900/60">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</div>
                    <div className="mt-0.5 font-mono text-xs text-slate-900 dark:text-slate-100">{value}</div>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {t('hero.sampleNote')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <SectionHeading
            overline={t('how.overline')}
            title={t('how.title')}
            textClass={textClass}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {steps.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="ui-surface rounded-2xl p-5 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2">
                  {title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-500 dark:text-slate-400 text-base">
            {t('how.footer')}
          </p>
        </div>
      </section>

      <section id="pricing" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeading
            overline={t('pricing.overline')}
            title={t('pricing.title')}
            subtitle={t('pricing.subtitle')}
            textClass={textClass}
          />

          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
              <BadgeCheck className="h-4 w-4" />
              {t('pricing.trialBadge')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_TIER_DEFS.map(({ nameKey, price, invoices, featureKeys, highlighted }) => {
              const isCustom = price === 'custom';
              return (
                <div
                  key={nameKey}
                  className={`relative flex flex-col rounded-2xl p-5 ui-surface ${
                    highlighted ? 'ring-1 ring-cyan-500/25' : ''
                  }`}
                >
                  {highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-4 py-1 text-xs font-bold text-slate-950">
                      {t('pricing.mostPopular')}
                    </div>
                  )}
                  <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                    {t(nameKey)}
                  </h3>
                  <div className="mb-1">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
                      {isCustom ? t('pricing.custom') : `${price} ETB`}
                    </span>
                    {!isCustom && (
                      <span className="text-slate-500 dark:text-slate-400 text-sm">
                        {t('pricing.perMonth')}
                      </span>
                    )}
                  </div>
                  <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    {invoices === 'unlimited'
                      ? t('pricing.unlimited')
                      : t('pricing.invoicesPerMonth', { count: invoices })}
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {featureKeys.map((featureKey) => (
                      <li
                        key={featureKey}
                        className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                      >
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500 dark:text-cyan-300" />
                        {t(featureKey)}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_FREE_TRIAL_MSG}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block rounded-2xl py-3 text-center font-semibold transition-colors ${
                      highlighted
                        ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                        : 'border border-slate-200/70 bg-white/70 text-slate-800 hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:text-cyan-300'
                    }`}
                  >
                    {isCustom ? t('pricing.contactUs') : t('pricing.startTrial')}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="product" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeading
            overline={t('features.overline')}
            title={t('features.title')}
            textClass={textClass}
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ title, desc }) => (
              <div key={title} className="ui-surface rounded-2xl p-4">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                  <BadgeCheck className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <SectionHeading overline={t('faq.overline')} title={t('faq.title')} textClass={textClass} />

          <div className="ui-surface rounded-2xl p-4 md:p-5">
            {faqs.map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} textClass={textClass} />
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="ui-surface rounded-2xl px-5 py-7 md:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {t('cta.title')}
            </h2>
            <p className="mx-auto mb-6 max-w-md text-base text-slate-600 dark:text-slate-300">
              {t('cta.subtitle')}
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                'Hi, I have 20+ invoices per month and want to learn more about Addis Invoice',
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-base font-semibold text-slate-950 transition-all hover:bg-cyan-400"
            >
              <Send className="h-4 w-4" />
              {t('cta.whatsapp')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;