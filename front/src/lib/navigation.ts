import type { LucideIcon } from 'lucide-react';
import {
  CircleHelp,
  Coins,
  Crown,
  Home as HomeIcon,
  Layers,
  MessageCircle,
  Receipt,
  Rocket,
  Send,
  Upload,
  Workflow,
} from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';

import type { TranslationKey } from './i18n/translations';

export type NavItemType = 'route' | 'hash' | 'external';

export interface NavItem {
  labelKey: TranslationKey;
  type: NavItemType;
  to: string;
  icon: LucideIcon;
}

export interface NavGroup {
  labelKey: TranslationKey;
  items: NavItem[];
}

const WHATSAPP_SIGNUP =
  'https://wa.me/251701681571?text=' +
  encodeURIComponent('Hi, I want to start a free trial of Addis Invoice');

export const navGroupDefs: NavGroup[] = [
  {
    labelKey: 'nav.group.menu',
    items: [
      { labelKey: 'nav.home', type: 'route', to: '/', icon: HomeIcon },
      { labelKey: 'nav.upload', type: 'route', to: '/upload', icon: Upload },
      { labelKey: 'nav.invoices', type: 'route', to: '/invoices', icon: Receipt },
      { labelKey: 'nav.upgrade', type: 'route', to: '/upgrade', icon: Crown },
    ],
  },
  {
    labelKey: 'nav.group.learn',
    items: [
      { labelKey: 'nav.how', type: 'hash', to: '#how', icon: Workflow },
      { labelKey: 'nav.pricing', type: 'hash', to: '#pricing', icon: Coins },
      { labelKey: 'nav.features', type: 'hash', to: '#product', icon: Layers },
      { labelKey: 'nav.faq', type: 'hash', to: '#faq', icon: CircleHelp },
    ],
  },
  {
    labelKey: 'nav.group.start',
    items: [
      { labelKey: 'nav.trial', type: 'external', to: WHATSAPP_SIGNUP, icon: Rocket },
      {
        labelKey: 'nav.telegram',
        type: 'external',
        to: 'https://t.me/AddisInvoiceSupportBot',
        icon: Send,
      },
      {
        labelKey: 'nav.whatsapp',
        type: 'external',
        to: 'https://wa.me/251701681571',
        icon: MessageCircle,
      },
    ],
  },
];

export const scrollToSection = (
  hash: string,
  navigate: NavigateFunction,
  pathname: string,
): void => {
  const id = hash.startsWith('#') ? hash.slice(1) : hash;

  if (pathname === '/') {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    window.history.replaceState(null, '', `#${id}`);
    return;
  }

  navigate({ pathname: '/', hash: id });
};

export const scrollToHash = (hash: string): void => {
  const id = hash.startsWith('#') ? hash.slice(1) : hash;
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  });
};