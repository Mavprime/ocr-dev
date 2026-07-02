import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { FaTelegramPlane, FaPhoneAlt } from 'react-icons/fa';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Invoices from './pages/Invoices';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={
            <div className="max-w-6xl mx-auto px-4 py-8">
              <Upload />
            </div>
          } />
          <Route path="/invoices" element={
            <div className="max-w-6xl mx-auto px-4 py-8">
              <Invoices />
            </div>
          } />
        </Routes>
      </main>

      {/* Footer — Ledger.et style */}
      <footer className="bg-neutral-900 text-neutral-400 pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-white font-semibold text-lg">Ledger</span>
              </div>
              <p className="text-sm max-w-xs leading-relaxed">
                Smart accounting for Ethiopia. Capture, organize, and verify receipts —
                in seconds, in your language.
              </p>
            </div>

            {/* Product links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'The Problem', href: '/#problem' },
                  { label: 'How It Works', href: '/#how' },
                  { label: 'Dashboard', href: '/#product' },
                  { label: 'FAQ', href: '/#faq' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link to={href} className="hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company & Legal */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="tel:0988817281" className="hover:text-white transition-colors">Contact</a></li>
                <li><Link to="/upload" className="hover:text-white transition-colors">Upload</Link></li>
                <li><Link to="/invoices" className="hover:text-white transition-colors">Invoices</Link></li>
                <li><span className="hover:text-white transition-colors cursor-default">Privacy</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Terms</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-neutral-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span>© 2026 Ledger. Built in Ethiopia.</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://t.me/ledgerethiopia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-neutral-700 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                aria-label="Telegram"
              >
                <FaTelegramPlane className="w-4 h-4" />
              </a>
              <a
                href="tel:0988817281"
                className="w-9 h-9 rounded-full border border-neutral-700 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                aria-label="Phone"
              >
                <FaPhoneAlt className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
