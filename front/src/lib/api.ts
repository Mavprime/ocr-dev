import axios from 'axios';

/**
 * Shared Axios instance pre-configured with the n8n webhook base URL.
 *
 * Set VITE_API_URL in .env.development / .env.production.
 * Falls back to http://localhost:5678/webhook/ for local dev without an env file.
 *
 * Usage:
 *   import api from '../lib/api';
 *   api.get('get-invoices')
 *   api.post('web-invoice-upload', formData)
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5678/webhook/';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

/* ──────────────────────────────────────────────────────────────────────────────
   Anonymous User ID
   Generates a persistent random identifier so every browser gets its own
   "tenant" in the master Google Sheet without needing a login.
   ─────────────────────────────────────────────────────────────────────────── */

const USER_ID_KEY = 'addis_invoice_user_id';

/**
 * Returns the persistent anonymous user ID for this browser.
 * Creates one (format: `anon_<random>`) on first visit and stores it in
 * localStorage so it survives refreshes and tab closes.
 */
export const getUserId = (): string => {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
};

export default api;
