import axios from 'axios';

/**
 * Shared Axios instance pre-configured with the n8n webhook base URL.
 *
 * Used exclusively for the OCR upload pipeline (POST multipart/form-data).
 * Invoice history retrieval now goes through Supabase directly.
 *
 * Set VITE_API_URL in .env.development / .env.production.
 * Falls back to http://localhost:5678/webhook/ for local dev without an env file.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5678/webhook/';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export default api;
