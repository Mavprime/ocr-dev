import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { MessageCircleMore, Send } from 'lucide-react';
import Navbar from './components/Navbar';
import FloatingSupport from './components/FloatingSupport';
import SideDock from './components/SideDock';
import { useLanguage } from './components/LanguageProvider';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Invoices from './pages/Invoices';

const App: React.FC = () => {
  const { t, textClass } = useLanguage();

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Navbar />
      <SideDock />
      <main className="relative flex-1 lg:pl-[300px]">
        <div className="pointer-events-none absolute inset-0 ui-grid opacity-70 dark:opacity-30" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={
            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:px-6">
              <Upload />
            </div>
          } />
          <Route path="/invoices" element={
            <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 md:px-6">
              <Invoices />
            </div>
          } />
        </Routes>
      </main>

      <footer className={`border-t border-slate-200/70 bg-white/72 px-4 py-8 text-slate-600 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/72 dark:text-slate-400 lg:pl-[300px] ${textClass}`}>
        <div className="mx-auto max-w-7xl md:px-2">
          <div className="ui-surface rounded-2xl p-5">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]">
                    <span className="text-lg font-bold text-slate-950">A</span>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-slate-900 dark:text-slate-100">Addis Invoice</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      {t('footer.tagline')}
                    </div>
                  </div>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {t('footer.desc')}
                </p>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{t('footer.quickLinks')}</h4>
                <ul className="space-y-1.5 text-sm">
                  <li><Link to="/" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">{t('nav.home')}</Link></li>
                  <li><Link to="/upload" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">{t('nav.upload')}</Link></li>
                  <li><Link to="/invoices" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">{t('nav.invoices')}</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{t('footer.support')}</h4>
                <div className="flex gap-3">
                  <a
                    href="https://t.me/AddisInvoiceSupportBot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm text-slate-700 transition-colors hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:text-cyan-300"
                  >
                    <Send className="h-4 w-4" />
                    Telegram
                  </a>
                  <a
                    href="https://wa.me/251978407848"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm text-slate-700 transition-colors hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:text-cyan-300"
                  >
                    <MessageCircleMore className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200/70 pt-4 text-sm text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
              {t('footer.copyright')}
            </div>
          </div>
        </div>
      </footer>

      <FloatingSupport />
    </div>
  );
};

export default App;