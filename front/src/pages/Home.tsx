import React, { useState } from 'react';
import {
  FaPlay,
  FaChevronDown,
  FaWhatsapp,
  FaCheckCircle,
} from 'react-icons/fa';

/* ──────────────────────────────────────────────────────────────────────────────
   Constants
   ─────────────────────────────────────────────────────────────────────────── */

const WHATSAPP_NUMBER = '0988817281';
const WHATSAPP_FREE_TRIAL_MSG = encodeURIComponent(
  'Hi, I want to try Addis Invoice free',
);

/* ──────────────────────────────────────────────────────────────────────────────
   Data
   ─────────────────────────────────────────────────────────────────────────── */

const steps = [
  {
    emoji: '📸',
    title: 'Take a photo of your invoice',
    desc: 'Snap a picture of any receipt or invoice with your phone. PDF, JPG, PNG — all accepted.',
  },
  {
    emoji: '🤖',
    title: 'Send to our bot (Telegram/WhatsApp)',
    desc: 'Forward the photo to our AI-powered bot. It reads Amharic and English, even from faded thermal paper.',
  },
  {
    emoji: '✅',
    title: 'Data appears in your Google Sheet automatically',
    desc: 'Extracted vendor, date, line items, and totals land in your sheet in seconds — ready to review.',
  },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: '300',
    invoices: '50',
    features: ['Google Sheets integration', 'Telegram & WhatsApp support', 'Amharic + English OCR', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '750',
    invoices: '500',
    features: ['Everything in Starter', 'Priority processing', 'Bulk export (PDF/CSV)', 'Priority support'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    invoices: 'unlimited',
    features: ['Everything in Pro', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
    highlighted: false,
  },
];

const testimonials = [
  {
    quote: 'Saved 7 hours/week',
    name: '[Restaurant Name]',
    role: 'Restaurant Owner',
  },
  {
    quote: '200+ invoices, 0 errors',
    name: '[Pharmacy Name]',
    role: 'Pharmacy Manager',
  },
  {
    quote: 'Our clients love it',
    name: '[Accountant Name]',
    role: 'Accounting Firm',
  },
];

const faqs = [
  {
    q: 'Is my data safe?',
    a: 'Yes. Your data stays in YOUR Google Sheet. You can export anytime. We do not store or share your invoice data — the AI processes it in transit and writes directly to your sheet.',
  },
  {
    q: 'What about Amharic invoices?',
    a: 'We handle Amharic + English. Our AI reads both scripts natively — even mixed-language receipts. You always review the extracted data before it is saved, so you stay in control.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No contracts. No surprise fees. If Addis Invoice stops being useful, you can cancel with one message — and your data stays in your Google Sheet.',
  },
];

/* ──────────────────────────────────────────────────────────────────────────────
   Sub-components
   ─────────────────────────────────────────────────────────────────────────── */

const SectionHeading: React.FC<{
  overline?: string;
  title: string;
  subtitle?: string;
}> = ({ overline, title, subtitle }) => (
  <div className="text-center max-w-2xl mx-auto mb-12">
    {overline && (
      <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-2">
        {overline}
      </p>
    )}
    <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
      {title}
    </h2>
    <div className="flex items-center justify-center gap-2 mb-4">
      <div className="h-0.5 w-8 bg-primary rounded" />
      <div className="h-0.5 w-16 bg-primary/30 rounded" />
    </div>
    {subtitle && (
      <p className="text-neutral-600 text-lg max-w-xl mx-auto">{subtitle}</p>
    )}
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
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="pb-4 text-neutral-600 leading-relaxed">{a}</div>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────────────
   Home Page
   ─────────────────────────────────────────────────────────────────────────── */

const Home: React.FC = () => {
  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-12 md:pt-28 md:pb-16 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-neutral-900 mb-4 leading-tight">
            Stop typing invoices by hand.
          </h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-0.5 w-12 bg-primary rounded" />
            <div className="h-0.5 w-20 bg-primary/30 rounded" />
          </div>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto mb-10">
            Send a photo to our bot. AI extracts the data. You get clean data in
            seconds.
          </p>

          {/* Video placeholder — swap for real <video> or <iframe> */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="relative aspect-video bg-neutral-100 rounded-2xl border-2 border-dashed border-neutral-300 flex items-center justify-center overflow-hidden">
              {/* Replace this div with your actual video:
                  <video src="/demo.mp4" controls className="w-full h-full object-cover" />
                  or <iframe src="https://youtube.com/embed/..." className="w-full h-full" />
              */}
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaPlay className="w-7 h-7 md:w-9 md:h-9 text-primary ml-1" />
                </div>
                <p className="text-neutral-400 text-sm font-medium">
                  60-second demo
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_FREE_TRIAL_MSG}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-cyan-600 transition-colors shadow-lg shadow-primary/25"
          >
            <FaWhatsapp className="w-5 h-5" />
            Try Free for 7 Days
          </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════════════════════════════════════ */}
      <section id="how" className="bg-neutral-50 py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4">
          <SectionHeading
            overline="How It Works"
            title="Three steps. Five seconds each."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {steps.map(({ emoji, title, desc }) => (
              <div key={title} className="text-center">
                <div className="text-5xl mb-4">{emoji}</div>
                <h3 className="font-bold text-lg text-neutral-900 mb-2">
                  {title}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-neutral-500 text-base">
            Save 5+ hours per week. No credit card needed.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PRICING
          ════════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="bg-white py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeading
            overline="Pricing"
            title="Simple, transparent pricing."
            subtitle="Start with a 7-day free trial. Upgrade when you're ready."
          />

          {/* Free trial badge */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              <FaCheckCircle className="w-4 h-4" />
              Free trial: 7 days — no credit card required
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map(
              ({ name, price, invoices, features, highlighted }) => (
                <div
                  key={name}
                  className={`relative rounded-2xl border-2 p-8 flex flex-col ${
                    highlighted
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  {highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-neutral-900 mb-1">
                    {name}
                  </h3>
                  <div className="mb-1">
                    <span className="text-4xl font-extrabold text-neutral-900">
                      {price === 'Custom' ? 'Custom' : `${price} ETB`}
                    </span>
                    {price !== 'Custom' && (
                      <span className="text-neutral-500 text-sm">
                        /month
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-500 text-sm mb-6">
                    {invoices === 'unlimited'
                      ? 'Unlimited invoices'
                      : `${invoices} invoices/month`}
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 text-sm text-neutral-700"
                      >
                        <FaCheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_FREE_TRIAL_MSG}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
                      highlighted
                        ? 'bg-primary text-white hover:bg-cyan-600'
                        : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                    }`}
                  >
                    {price === 'Custom' ? 'Contact Us' : 'Start Free Trial'}
                  </a>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TESTIMONIALS
          ════════════════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="bg-neutral-50 py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeading
            overline="Testimonials"
            title="Loved by Ethiopian businesses."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role }) => (
              <div
                key={quote}
                className="bg-white rounded-2xl border border-neutral-200 p-8 text-center"
              >
                <div className="text-4xl mb-4">❝</div>
                <p className="text-lg font-semibold text-neutral-900 mb-3 italic">
                  "{quote}"
                </p>
                <p className="text-sm font-medium text-neutral-700">{name}</p>
                <p className="text-xs text-neutral-400">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FAQ
          ════════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="bg-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4">
          <SectionHeading overline="FAQ" title="Got questions?" />

          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 md:p-8">
            {faqs.map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER CTA
          ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-900 py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Have 20+ invoices per month?
          </h2>
          <p className="text-neutral-400 text-lg mb-8 max-w-md mx-auto">
            Let our AI handle the typing. You focus on your business.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              'Hi, I have 20+ invoices per month and want to learn more about Addis Invoice',
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#20bd5a] transition-colors shadow-lg shadow-[#25D366]/30"
          >
            <FaWhatsapp className="w-6 h-6" />
            Message us on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
