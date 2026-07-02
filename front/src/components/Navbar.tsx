import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FaUpload, FaListAlt, FaBars, FaTimes, FaArrowRight } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  /** Scroll to a hash section. If not on home page, navigate home first. */
  const scrollTo = (hash: string) => {
    closeMenu();
    if (isHome) {
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/' + hash);
    }
  };

  const closeMenu = () => setIsOpen(false);

  const anchorLinks = [
    { hash: '#problem', label: 'The Problem' },
    { hash: '#who', label: 'Who It\'s For' },
    { hash: '#how', label: 'How It Works' },
    { hash: '#product', label: 'Product' },
    { hash: '#faq', label: 'FAQ' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" onClick={closeMenu}>
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold text-lg text-neutral-900 leading-tight">Addis Invoice</div>
              <div className="text-[10px] text-neutral-500 -mt-0.5">Smart OCR for Ethiopia</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {anchorLinks.map(({ hash, label }) => (
              <button
                key={hash}
                onClick={() => scrollTo(hash)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:text-primary hover:bg-primary/5 transition-colors"
              >
                {label}
              </button>
            ))}
            <div className="w-px h-5 bg-neutral-200 mx-2" />
            <NavLink
              to="/upload"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-neutral-600 hover:text-primary hover:bg-primary/5'
                }`
              }
            >
              Upload
            </NavLink>
            <NavLink
              to="/invoices"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-neutral-600 hover:text-primary hover:bg-primary/5'
                }`
              }
            >
              Invoices
            </NavLink>
            <a
              href="#cta"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('#cta');
              }}
              className="ml-2 inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-cyan-600 transition-colors"
            >
              Book a demo
              <FaArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900"
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-neutral-200 py-4 space-y-1">
            {anchorLinks.map(({ hash, label }) => (
              <button
                key={hash}
                onClick={() => scrollTo(hash)}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:text-primary hover:bg-primary/5 transition-colors"
              >
                {label}
              </button>
            ))}
            <div className="border-t border-neutral-100 my-2" />
            <NavLink
              to="/upload"
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'text-primary bg-primary/10' : 'text-neutral-600'
                }`
              }
            >
              <FaUpload className="w-4 h-4" />
              Upload Invoice
            </NavLink>
            <NavLink
              to="/invoices"
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'text-primary bg-primary/10' : 'text-neutral-600'
                }`
              }
            >
              <FaListAlt className="w-4 h-4" />
              My Invoices
            </NavLink>
            <a
              href="#cta"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('#cta');
              }}
              className="flex items-center justify-center gap-2 bg-primary text-white mt-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            >
              Book a demo
              <FaArrowRight className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
