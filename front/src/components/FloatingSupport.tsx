import React, { useState, useRef, useEffect } from 'react';
import { FaTelegramPlane, FaWhatsapp, FaHeadset, FaTimes } from 'react-icons/fa';

const TELEGRAM_URL = 'https://t.me/AddisInvoiceSupportBot';
const WHATSAPP_URL = 'https://wa.me/251978407848';

const channels = [
  {
    label: 'Telegram Support',
    url: TELEGRAM_URL,
    icon: FaTelegramPlane,
    color: 'hover:bg-[#2AABEE]',
    ring: 'ring-[#2AABEE]/30',
  },
  {
    label: 'WhatsApp Business',
    url: WHATSAPP_URL,
    icon: FaWhatsapp,
    color: 'hover:bg-[#25D366]',
    ring: 'ring-[#25D366]/30',
  },
];

const FloatingSupport: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Channel buttons — animated in from bottom */}
      <div
        className={`flex flex-col-reverse gap-3 transition-all duration-300 ease-out ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {channels.map(({ label, url, icon: Icon, color, ring }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              group flex items-center gap-3 px-4 py-2.5 rounded-xl
              bg-white border border-neutral-200 shadow-lg
              text-neutral-700 text-sm font-medium
              hover:text-white ${color}
              focus:outline-none focus:ring-2 ${ring}
              transition-all duration-200 whitespace-nowrap
            `}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </a>
        ))}
      </div>

      {/* Main FAB toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          w-14 h-14 rounded-2xl flex items-center justify-center
          shadow-lg transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-primary/30
          ${open
            ? 'bg-neutral-800 text-white rotate-90 scale-90'
            : 'bg-primary text-white hover:bg-cyan-600 hover:scale-105'
          }
        `}
        aria-label={open ? 'Close support menu' : 'Open support menu'}
      >
        {open ? (
          <FaTimes className="w-5 h-5" />
        ) : (
          <FaHeadset className="w-5 h-5" />
        )}
      </button>

      {/* Subtle pulse ring when closed (attract attention) */}
      {!open && (
        <div
          className="absolute bottom-0 right-0 w-14 h-14 rounded-2xl bg-primary/20 animate-ping pointer-events-none"
          style={{ animationDuration: '2.5s' }}
        />
      )}
    </div>
  );
};

export default FloatingSupport;
