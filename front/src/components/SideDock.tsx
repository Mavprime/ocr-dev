import React, { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { navGroupDefs, scrollToSection } from '../lib/navigation';
import { useLanguage } from './LanguageProvider';

const surfaceBase =
  'border border-slate-200/70 bg-white/92 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-md';

const ICON_BOX = 'relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center';
const ICON_SIZE = 'h-[18px] w-[18px]';

let navItemIndex = 0;

const SideDock: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { t, textClass } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = useMemo(
    () => location.pathname + location.hash,
    [location.hash, location.pathname],
  );

  const activateHash = (hash: string) => {
    scrollToSection(hash, navigate, location.pathname);
  };

  navItemIndex = 0;

  const renderNavItem = (
    item: (typeof navGroupDefs)[number]['items'][number],
    isActive: boolean,
    collapsed: boolean,
  ) => {
    const Icon = item.icon;
    const staggerIndex = navItemIndex++;
    const delay = 120 + staggerIndex * 45;

    const baseClass = `side-dock-item group relative flex items-center rounded-xl text-sm font-medium transition-[background-color,color,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
      collapsed ? 'justify-center px-1 py-1.5' : 'gap-2 px-2.5 py-2'
    } ${
      isActive
        ? 'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300'
        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-50'
    }`;

    const activeRail = isActive ? (
      <span className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-cyan-500" />
    ) : null;

    const iconWrap = (
      <span className={ICON_BOX} title={collapsed ? t(item.labelKey) : undefined}>
        <Icon className={ICON_SIZE} strokeWidth={2} />
      </span>
    );

    const label = (
      <span
        className={`side-dock-label relative z-[1] min-w-0 truncate whitespace-nowrap transition-[opacity,transform,max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          collapsed
            ? 'pointer-events-none max-w-0 -translate-x-1 opacity-0'
            : 'max-w-[180px] translate-x-0 opacity-100'
        }`}
      >
        {t(item.labelKey)}
      </span>
    );

    const content = (
      <>
        {activeRail}
        {iconWrap}
        {label}
      </>
    );

    if (item.type === 'route') {
      return (
        <NavLink
          key={item.labelKey}
          to={item.to}
          end={item.to === '/'}
          className={baseClass}
          style={{ animationDelay: `${delay}ms` }}
        >
          {content}
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
          className={baseClass}
          style={{ animationDelay: `${delay}ms` }}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        key={item.labelKey}
        type="button"
        onClick={() => activateHash(item.to)}
        className={`${baseClass} w-full text-left`}
        style={{ animationDelay: `${delay}ms` }}
      >
        {content}
      </button>
    );
  };

  return (
    <aside
      className={`side-dock-shell pointer-events-auto fixed bottom-6 left-4 top-24 z-[60] hidden lg:flex lg:flex-col ${
        collapsed ? 'w-[76px]' : 'w-[270px]'
      }`}
      data-collapsed={collapsed}
    >
      <div
        className={`side-dock-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] p-3 ${surfaceBase}`}
      >
        <div
          className={`flex shrink-0 items-center pb-2 transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            collapsed ? 'justify-center px-0' : 'justify-between px-1'
          }`}
        >
          <div
            className={`overflow-hidden transition-[opacity,transform,max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              collapsed
                ? 'pointer-events-none max-w-0 -translate-x-2 opacity-0'
                : 'max-w-[160px] translate-x-0 opacity-100'
            }`}
          >
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Addis Invoice
            </div>
            <div className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${textClass}`}>{t('nav.menu')}</div>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/70 bg-white/80 text-slate-600 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-cyan-400/40 hover:text-cyan-600 active:scale-95 dark:border-slate-800/80 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:text-cyan-300 ${
              collapsed ? 'mx-auto' : ''
            }`}
            aria-label={collapsed ? t('nav.expandMenu') : t('nav.collapseMenu')}
          >
            <span
              className={`inline-flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                collapsed ? 'rotate-0' : 'rotate-180'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        </div>

        <nav
          className="side-dock-scroll min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden pr-0.5"
          aria-label="Site navigation"
        >
          {navGroupDefs.map((group, groupIndex) => (
            <div
              key={group.labelKey}
              className="side-dock-group"
              style={{ animationDelay: `${80 + groupIndex * 60}ms` }}
            >
              <div
                className={`overflow-hidden px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 transition-[opacity,max-height,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:text-slate-400 ${
                  collapsed
                    ? 'pointer-events-none mb-0 max-h-0 opacity-0'
                    : 'mb-0 max-h-8 opacity-100'
                }`}
              >
                <span className={textClass}>{t(group.labelKey)}</span>
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    item.type === 'route'
                      ? location.pathname === item.to
                      : item.type === 'hash'
                        ? currentPath.endsWith(item.to)
                        : false;

                  return renderNavItem(item, isActive, collapsed);
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default SideDock;