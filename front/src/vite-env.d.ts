/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for n8n webhooks (set in .env.development / .env.production). */
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
