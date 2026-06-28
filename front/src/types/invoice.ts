export interface InvoiceItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface InvoiceData {
  vendor: string;
  date: string;
  grand_total: number;
  items: InvoiceItem[];
  items_summary: string;
  source?: string;
}

export interface Invoice extends InvoiceData {
  id: string;
  created_at?: string;
}

// Response from the immediate webhook (n8n returns this right away)
export interface UploadStartResponse {
  job_id: string;
  status: 'queued';
  message?: string;
}

// Final structured data would come from AI Agent, but currently not returned to this POST
// (the workflow continues in background after the early response)

export interface ApiError {
  message: string;
  code?: string;
}

export type JobStatus = 'idle' | 'uploading' | 'queued' | 'processing' | 'uploaded' | 'completed' | 'failed';
