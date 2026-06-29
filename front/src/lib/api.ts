import axios from 'axios';

/**
 * Shared Axios instance pre-configured with the n8n base URL.
 *
 * Set VITE_API_BASE_URL in your environment (e.g. https://n8n.magnetai.cc).
 * Falls back to http://localhost:5678 (the default n8n port) for local dev.
 *
 * Usage:
 *   import api from '../lib/api';
 *   api.get('/webhook/get-invoices')
 *   api.post('/webhook/web-invoice-upload', formData)
 *
 * Full-URL overrides still work — if an env var like VITE_API_UPLOAD_URL
 * contains "https://…", axios ignores baseURL and uses that URL directly.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5678';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export default api;
