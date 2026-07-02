import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUpload,
  FaListAlt,
  FaCheckCircle,
  FaPhoneAlt,
  FaTelegramPlane,
  FaEnvelope,
  FaChevronDown,
  FaChartBar,
  FaUsers,
  FaCalendarAlt,
  FaLanguage,
  FaCloud,
  FaArrowRight,
  FaClock,
  FaFileInvoice,
  FaSearch,
} from 'react-icons/fa';

/* ──────────────────────────────────────────────────────────────────────────────
   Data
   ─────────────────────────────────────────────────────────────────────────── */

const painPoints = [
  {
    icon: FaClock,
    title: 'Hours of manual data entry',
    desc: 'Ethiopian accountants spend 60–70% of their week typing receipt data into Excel. That\'s not accounting — it\'s data entry.',
  },
  {
    icon: FaFileInvoice,
    title: 'Thermal paper fades',
    desc: 'Receipts printed on thermal paper start fading within months. By tax season, the ink is gone — and so is your deduction.',
  },
  {
    icon: FaSearch,
    title: 'Tax season chaos',
    desc: 'Scattered spreadsheets, missing TINs, and a frantic scramble every time the tax deadline approaches.',
  },
];

const audiences = [
  {
    icon: FaUsers,
    title: 'For Accounting Firms',
    subtitle: 'Run more clients with less friction.',
    bullets: [
      'Manage multiple clients from a single workspace',
      'Clients forward receipts via Telegram — zero training',
      'Auto-match receipts to clients by TIN',
      'Export reports by Ethiopian month (መስከረም – ጳጉሜን)',
    ],
  },
  {
    icon: FaChartBar,
    title: 'For Business Owners',
    subtitle: 'Send a photo. We do the rest.',
    bullets: [
      'Snap a photo of any receipt — done in 5 seconds',
      'Delivered instantly to your accountant\'s inbox',
      'Audit-ready records without learning any software',
      'Works on 3G. No fancy phone required.',
    ],
  },
];

const steps = [
  {
    num: 1,
    title: 'Capture',
    desc: 'Snap a photo, upload a PDF, or forward via Telegram — whatever is fastest for you.',
  },
  {
    num: 2,
    title: 'Extract with AI',
    desc: 'Our AI reads merchant name, TIN, date, VAT, totals and line items — even from faded receipts.',
  },
  {
    num: 3,
    title: 'Organize & export',
    desc: 'Auto-matched to clients, organized by Ethiopian calendar, exported to PDF or CSV.',
  },
];

const faqs = [
  {
    q: 'Does this support Amharic?',
    a: 'Yes. Receipts in Amharic are read natively. The interface is bilingual — Amharic (አማርኛ) and English.',
  },
  {
    q: 'Does it support the Ethiopian calendar?',
    a: 'Absolutely. All reports, filters and exports default to Ethiopian months (መስከረም – ጳጉሜን). You can switch to Gregorian any time.',
  },
  {
    q: 'How does the Telegram integration work?',
    a: 'Every firm gets a private Telegram bot. Clients forward receipts to the bot and they land in your intake queue automatically — no app install, no login.',
  },
  {
    q: 'Is my data secure? Where is it stored?',
    a: 'All data is hosted on Ethio Telecom Cloud, inside Ethiopia. We encrypt data in transit and at rest. You control who has access.',
  },
  {
    q: 'Can I use it for multiple clients?',
    a: 'Yes — that\'s the core design. Create a workspace per client, auto-match receipts by TIN, and switch between them instantly.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes. The web app works on any modern phone browser. No app store download needed — open the link and start capturing.',
  },
  {
    q: 'Do I own my data? Can I export it?',
    a: 'You own 100% of your data. Export everything to PDF or CSV any time — no lock-in, no limits.',
  },
  {
    q: 'How much does it cost?',
    a: 'Addis Invoice is free during the early-access period. Paid plans will be announced well in advance — and early users get a permanent discount.',
  },
  {
    q: 'How do I get started?',
    a: 'Book a free demo below. We\'ll set up your workspace, connect the Telegram bot, and walk through your first 10 receipts together.',
  },
];

/* ──────────────────────────────────────────────────────────────────────────────
   Sub-components
   ─────────────────────────────────────────────────────────────────────────── */

const SectionHeading: React.FC<{ overline?: string; title: string; subtitle?: string }> = ({
  overline,
  title,
  subtitle,
}) => (
  <div className="text-center max-w-2xl mx-auto mb-12">
    {overline && (
      <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-2">{overline}</p>
    )}
    <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">{title}</h2>
    <div className="flex items-center justify-center gap-2 mb-4">
      <div className="h-0.5 w-8 bg-primary rounded" />
      <div className="h-0.5 w-16 bg-primary/30 rounded" />
    </div>
    {subtitle && <p className="text-neutral-600 text-lg max-w-xl mx-auto">{subtitle}</p>}
  </div>
);

const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left font-semibold text-neutral-900 hover:text-primary transition-colors"
      >
        <span>{q}</span>
        <FaChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="pb-4 text-neutral-600 leading-relaxed">{a}</div>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────────
   Chat Mockup (Telegram bot)
   ─────────────────────────────────────────────────────────────────────────── */

const ChatMockup: React.FC = () => (
  <div className="bg-neutral-100 rounded-2xl p-4 max-w-sm mx-auto border border-neutral-200 shadow-sm">
    {/* Phone frame top bar */}
    <div className="bg-primary rounded-t-xl px-4 py-3 flex items-center gap-3 -mx-4 -mt-4 mb-3">
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">
        L
      </div>
      <div className="text-white text-sm font-semibold">Addis Invoice Bot</div>
    </div>
    {/* User message */}
    <div className="flex justify-end mb-2">
      <div className="bg-neutral-200 text-neutral-900 text-sm px-3 py-2 rounded-2xl rounded-br-md max-w-[80%]">
        📎 receipt-photo.jpg
      </div>
    </div>
    {/* Bot replies */}
    <div className="flex justify-start mb-1.5">
      <div className="bg-primary/10 text-neutral-800 text-sm px-3 py-2 rounded-2xl rounded-bl-md max-w-[85%]">
        ✅ Received — extracting data…
      </div>
    </div>
    <div className="flex justify-start">
      <div className="bg-white text-neutral-800 text-xs px-4 py-3 rounded-2xl rounded-bl-md max-w-[90%] border border-neutral-200 space-y-1">
        <div><strong>Merchant:</strong> Trading Co. A</div>
        <div><strong>TIN:</strong> 0012345678</div>
        <div><strong>Date:</strong> Yekatit 19, 2018</div>
        <div><strong>Total:</strong> <span className="text-primary font-bold">ETB 2,430.00</span></div>
      </div>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────────────────────
   Dashboard Mockup
   ─────────────────────────────────────────────────────────────────────────── */

const DashboardMockup: React.FC = () => (
  <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden max-w-3xl mx-auto">
    {/* Browser chrome */}
    <div className="bg-neutral-100 px-4 py-2 flex items-center gap-2 border-b border-neutral-200">
      <div className="flex gap-1.5">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
      </div>
      <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-neutral-500 text-center">
        app.addisinvoice.com/dashboard
      </div>
    </div>
    <div className="flex">
      {/* Sidebar */}
      <div className="hidden sm:block w-44 bg-neutral-900 p-4 space-y-4 shrink-0">
        <div className="text-white font-bold text-sm mb-6">Addis Invoice</div>
        <div className="bg-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded">📊 Dashboard</div>
        <div className="text-neutral-400 text-xs px-3 py-1.5">👥 Clients</div>
        <div className="text-neutral-400 text-xs px-3 py-1.5">📨 Telegram</div>
        <div className="text-neutral-400 text-xs px-3 py-1.5">📈 Reports</div>
        <div className="text-neutral-500 text-xs px-3 py-1.5 mt-8">⚙️ Settings</div>
      </div>
      {/* Main */}
      <div className="flex-1 p-4 space-y-3">
        <div className="text-sm font-semibold text-neutral-900">Dashboard</div>
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-neutral-50 rounded-xl p-3 text-center border border-neutral-100">
            <div className="text-lg font-bold text-neutral-900">12</div>
            <div className="text-[10px] text-neutral-500">Clients</div>
          </div>
          <div className="bg-neutral-50 rounded-xl p-3 text-center border border-neutral-100">
            <div className="text-lg font-bold text-neutral-900">187</div>
            <div className="text-[10px] text-neutral-500">Receipts</div>
          </div>
          <div className="bg-primary/5 rounded-xl p-3 text-center border border-primary/20">
            <div className="text-lg font-bold text-primary">94%</div>
            <div className="text-[10px] text-neutral-500">Verified</div>
          </div>
        </div>
        {/* Mini table */}
        <div className="bg-neutral-50 rounded-xl border border-neutral-100 overflow-hidden">
          <div className="grid grid-cols-3 text-[10px] font-semibold text-neutral-500 px-3 py-2 bg-neutral-100">
            <span>Merchant</span>
            <span>Status</span>
            <span>Amount</span>
          </div>
          {[
            { m: 'Trading Co. A', s: 'Verified', a: 'ETB 2,430', c: 'text-success' },
            { m: 'Workshop B', s: 'Pending', a: 'ETB 5,120', c: 'text-yellow-500' },
            { m: 'Supplier C', s: 'Verified', a: 'ETB 890', c: 'text-success' },
          ].map((r, i) => (
            <div key={i} className="grid grid-cols-3 text-xs px-3 py-2 border-t border-neutral-100">
              <span className="text-neutral-900">{r.m}</span>
              <span className={r.c}>{r.s}</span>
              <span className="text-neutral-700">{r.a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────────────────────
   Home Page
   ─────────────────────────────────────────────────────────────────────────── */

const Home: React.FC = () => {
  const [demoForm, setDemoForm] = useState({ name: '', phone: '', email: '', role: '', note: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-32 text-center relative z-10">
          {/* Overline */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            🇪🇹 <span>Built for Ethiopia</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-neutral-900 mb-4 leading-tight">
            Stop typing receipts
            <br />
            into Excel.
          </h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-0.5 w-12 bg-primary rounded" />
            <div className="h-0.5 w-20 bg-primary/30 rounded" />
          </div>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
            Ethiopian accountants spend <strong>60–70% of their week</strong> on receipt data entry.
            Addis Invoice captures, extracts, and organizes them automatically — in Amharic and English,
            on the Ethiopian calendar.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="#cta"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-cyan-600 transition-colors shadow-sm text-lg"
            >
              Book a free demo
              <FaArrowRight className="w-4 h-4" />
            </a>
            <a
              href="tel:0988817281"
              className="inline-flex items-center gap-2 text-neutral-700 hover:text-primary font-medium transition-colors"
            >
              <FaPhoneAlt className="w-4 h-4" />
              0988 817 281
            </a>
            <a
              href="https://t.me/addisinvoice"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-neutral-700 hover:text-primary font-medium transition-colors"
            >
              <FaTelegramPlane className="w-4 h-4" />
              Telegram
            </a>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {[
              { icon: FaLanguage, label: 'Amharic + English' },
              { icon: FaCalendarAlt, label: 'Ethiopian calendar' },
              { icon: FaTelegramPlane, label: 'Telegram intake' },
              { icon: FaCloud, label: 'Hosted in Ethiopia' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-full text-sm text-neutral-700"
              >
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </div>
            ))}
          </div>

          {/* Browser mockup */}
          <DashboardMockup />

          {/* Stat badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { value: '60–70%', label: 'Data entry time saved' },
              { value: '5s', label: 'To capture a receipt' },
              { value: 'EN + አማ', label: 'Bilingual + Ethiopian calendar' },
              { value: '🇪🇹', label: 'Hosted on Ethio Telecom Cloud' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-center">
                <div className="text-2xl font-extrabold text-primary mb-1">{value}</div>
                <div className="text-xs text-neutral-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          THE PROBLEM
          ════════════════════════════════════════════════════════════════════ */}
      <section id="problem" className="bg-neutral-50 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeading
            overline="The Problem"
            title="The receipt problem is bigger than it looks."
            subtitle="Three quiet leaks that cost Ethiopian businesses real money every year."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {painPoints.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900 mb-2">{title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          WHO IT'S FOR
          ════════════════════════════════════════════════════════════════════ */}
      <section id="who" className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeading
            overline="Who It's For"
            title="Built for both sides of the desk."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {audiences.map(({ icon: Icon, title, subtitle, bullets }) => (
              <div
                key={title}
                className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-xl text-neutral-900 mb-1">{title}</h3>
                <p className="text-primary font-medium mb-4">{subtitle}</p>
                <ul className="space-y-3">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-neutral-600">
                      <FaCheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════════════════════════════════════ */}
      <section id="how" className="bg-neutral-50 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeading
            overline="How It Works"
            title="Three steps. Five seconds each."
            subtitle="From faded receipt to organized record — before your coffee cools."
          />
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {num}
                </div>
                <h3 className="font-bold text-lg text-neutral-900 mb-2">{title}</h3>
                <p className="text-neutral-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>

          {/* Telegram subsection */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#0088cc]/10 text-[#0088cc] px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  <FaTelegramPlane className="w-3.5 h-3.5" />
                  Telegram Integration
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  Receipts come to you.
                  <br />
                  Not the other way around.
                </h3>
                <p className="text-neutral-600 mb-4 text-sm leading-relaxed">
                  Every firm gets a private Telegram bot. Your clients forward receipts
                  to the bot — no app install, no login, no training. They land in your
                  intake queue automatically, matched by TIN.
                </p>
                <a
                  href="https://t.me/addisinvoice"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#0088cc] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0077b5] transition-colors"
                >
                  <FaTelegramPlane className="w-4 h-4" />
                  Try the bot
                </a>
              </div>
              <ChatMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PRODUCT
          ════════════════════════════════════════════════════════════════════ */}
      <section id="product" className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeading
            overline="Product"
            title="Your accounting workspace, in one place."
            subtitle="Everything you need to capture, organize, and verify receipts — without leaving the browser."
          />
          <DashboardMockup />
          {/* Quick-link CTAs */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-semibold hover:bg-cyan-600 transition-colors shadow-sm"
            >
              <FaUpload className="w-4 h-4" />
              Upload an Invoice
            </Link>
            <Link
              to="/invoices"
              className="inline-flex items-center gap-2 bg-white border border-neutral-300 text-neutral-700 px-6 py-3 rounded-2xl font-semibold hover:bg-neutral-50 transition-colors"
            >
              <FaListAlt className="w-4 h-4" />
              View Invoices
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FAQ
          ════════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="bg-neutral-50 py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4">
          <SectionHeading
            overline="FAQ"
            title="Answers, not marketing."
          />
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
            {faqs.map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CTA / GET STARTED
          ════════════════════════════════════════════════════════════════════ */}
      <section id="cta" className="bg-neutral-900 py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Ready to stop losing receipts?
          </h2>
          <p className="text-neutral-400 mb-10 max-w-lg mx-auto">
            We'll set up your workspace, connect the Telegram bot, and walk through
            your first 10 receipts. <strong className="text-white">Free. No commitment.</strong>
          </p>

          {/* Contact methods */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              {
                icon: FaPhoneAlt,
                label: 'Call us',
                detail: '0988 817 281',
                href: 'tel:0988817281',
              },
              {
                icon: FaTelegramPlane,
                label: 'Message on Telegram',
                detail: '@addisinvoice',
                href: 'https://t.me/addisinvoice',
              },
              {
                icon: FaEnvelope,
                label: 'Email',
                detail: 'hello@addisinvoice.com',
                href: 'mailto:hello@addisinvoice.com',
              },
            ].map(({ icon: Icon, label, detail, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-3 bg-white/10 border border-white/20 text-white px-5 py-3 rounded-xl hover:bg-white/20 transition-colors"
              >
                <Icon className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <div className="text-xs text-neutral-400">{label}</div>
                  <div className="font-semibold text-sm">{detail}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Demo form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg mx-auto text-left shadow-xl">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Book a free demo</h3>
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="w-7 h-7 text-success" />
                </div>
                <p className="font-semibold text-neutral-900 text-lg">Thank you!</p>
                <p className="text-neutral-600 text-sm">We'll reach out within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Full name</label>
                  <input
                    type="text"
                    required
                    value={demoForm.name}
                    onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    placeholder="Your name"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={demoForm.phone}
                      onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                      className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      placeholder="09XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={demoForm.email}
                      onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                      className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">I am a…</label>
                  <select
                    value={demoForm.role}
                    onChange={(e) => setDemoForm({ ...demoForm, role: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white"
                  >
                    <option value="">Select your role</option>
                    <option>Accounting firm</option>
                    <option>Business owner / SMB</option>
                    <option>Merchant / retailer</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Anything else? (optional)</label>
                  <textarea
                    value={demoForm.note}
                    onChange={(e) => setDemoForm({ ...demoForm, note: e.target.value })}
                    rows={2}
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                    placeholder="Tell us about your needs…"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-colors"
                >
                  Book my demo
                </button>
                <p className="text-xs text-neutral-400 text-center">
                  We don't share your number. Ever.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
