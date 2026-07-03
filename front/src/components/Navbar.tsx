import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Moon, SunMedium, X } from 'lucide-react';

import { navGroupDefs, scrollToSection } from '../lib/navigation';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from './LanguageProvider';
import { useTheme } from './ThemeProvider';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t, textClass } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleHashNav = (hash: string) => {
    closeMenu();
    scrollToSection(hash, navigate, location.pathname);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/78 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/78">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={closeMenu}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]">
            <span className="text-base font-bold text-slate-950">A</span>
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Addis Invoice
            </div>
            <div className={`text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 ${textClass}`}>
              {t('nav.tagline')}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageToggle />

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/82 text-slate-700 shadow-sm transition-all hover:text-cyan-600 dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:text-cyan-300"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/82 text-slate-700 shadow-sm transition-all hover:text-cyan-600 lg:hidden dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:text-cyan-300"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200/70 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden dark:border-slate-800/80 dark:bg-slate-950/95">
          <nav className="mx-auto max-w-[1600px] space-y-4" aria-label="Mobile navigation">
            {navGroupDefs.map((group) => (
              <div key={group.labelKey}>
                <div className={`mb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ${textClass}`}>
                  {t(group.labelKey)}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const label = t(item.labelKey);

                    if (item.type === 'route') {
                      return (
                        <NavLink
                          key={item.labelKey}
                          to={item.to}
                          end={item.to === '/'}
                          onClick={closeMenu}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${textClass} ${
                              isActive
                                ? 'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300'
                                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-50'
                            }`
                          }
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {label}
                        </NavLink>
                      );
                    }

                    if (item.type === 'external') {
                      return (
                        <a
                          key={item.labelKey}
                          href={item.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={closeMenu}
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-50 ${textClass}`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {label}
                        </a>
                      );
                    }

                    return (
                      <button
                        key={item.labelKey}
                        type="button"
                        onClick={() => handleHashNav(item.to)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-50 ${textClass}`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </nav>
  );
};

export default Navbar;