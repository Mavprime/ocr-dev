# Addis Invoice Dashboard

A simple, mobile-friendly React dashboard for AI-powered invoice processing targeted at small businesses in Addis Ababa, Ethiopia.

## Features
- Drag & drop invoice upload (PDF / JPG / PNG)
- Real-time processing with progress + states
- Extracted data preview with line items t able
- Save invoices (persisted locally + API integration)
- Searchable, filterable, sortable invoice list
- Details modal with PDF export
- Responsive for phones and desktop
- n8n webhook ready

## Tech
React 18 + TypeScript + Tailwind + Axios + React Router + react-hot-toast + date-fns + jspdf

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure the n8n webhook base URL:

   Edit `.env`:
   ```
   VITE_N8N_WEBHOOK_URL=https://your-n8n.example.com/webhook
   ```

   - POST /webhook/invoice-upload  (multipart/form-data with field "file")
   - GET  /webhook/get-invoices     (returns array or { data: [...] })

3. Run locally:
   ```bash
   npm run dev
   ```

   Open http://localhost:3000

## Pages
- `/` - Home / landing
- `/upload` - Upload and process invoices
- `/invoices` - List, search, filter, view, download

## API Integration
- Upload: Uses FormData with `file` field
- Timeout: 30s
- Error messages are user-friendly
- LocalStorage fallback + demo data for offline use

## Deployment (Vercel)
1. `npm run build`
2. Push to GitHub
3. Import in Vercel
4. Add environment variable `VITE_N8N_WEBHOOK_URL`

## Folder Structure
```
src/
├── components/
│   ├── Navbar.tsx
│   ├── UploadZone.tsx
│   ├── ProcessingSpinner.tsx
│   ├── ResultsCard.tsx
│   ├── FilterBar.tsx
│   ├── InvoiceTable.tsx
│   └── DetailsModal.tsx
├── hooks/
│   ├── useInvoiceUpload.ts
│   └── useInvoiceList.ts
├── pages/
│   ├── Home.tsx
│   ├── Upload.tsx
│   └── Invoices.tsx
├── types/
│   └── invoice.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Notes for n8n Backend
- Make sure webhooks are publicly accessible
- Return format for upload:
  ```json
  {
    "success": true,
    "data": { "vendor": "...", "date": "...", "grand_total": 0, "items": [...], "items_summary": "..." }
  }
  ```
- GET returns array of same invoice objects

Built for Ethiopian businesses — simple, fast, and accessible.
