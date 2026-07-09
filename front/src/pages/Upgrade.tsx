import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Crown,
  Banknote,
  Smartphone,
  Upload,
  FileText,
  FileImage,
  CheckCircle2,
  LoaderCircle,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../components/LanguageProvider';
import { useAuth } from '../components/AuthProvider';
import supabase from '../lib/supabaseClient';

const PAYMENT_AMOUNT = 750;
const PAYMENT_PHONE = '09XXXXXXXX';

const Upgrade: React.FC = () => {
  const { t, textClass } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFile = (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid PDF or image (JPG, PNG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 10MB.');
      return;
    }
    setSelectedFile(file);
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleSubmit = async () => {
    if (!selectedFile || !user) return;

    setIsSubmitting(true);

    try {
      // 1. Upload the receipt file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `receipts/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payments')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('payments')
        .getPublicUrl(filePath);

      const receiptUrl = urlData?.publicUrl || '';

      // 3. Insert a pending payment record into public.payments
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: PAYMENT_AMOUNT,
          receipt_url: receiptUrl,
          status: 'PENDING',
        });

      if (insertError) {
        throw insertError;
      }

      setIsSuccess(true);
      toast.success(t('upgrade.success'), { icon: '✅', duration: 5000 });
    } catch (err: any) {
      console.error('Payment submission error:', err);
      toast.error(err?.message || 'Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`text-center ${textClass}`}>
        <div className="ui-surface rounded-2xl p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('upgrade.pending')}
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {t('upgrade.note')}
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <ArrowRight className="h-4 w-4" />
            {t('nav.upload')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={textClass}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
          <Crown className="h-3.5 w-3.5" />
          {t('upload.premium')}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t('upgrade.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('upgrade.subtitle')}
        </p>
      </div>

      {/* Payment Instructions Card */}
      <div className="ui-surface mb-6 rounded-2xl p-5">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t('upgrade.instructions')}
        </h3>

        <div className="mb-4 rounded-xl bg-cyan-500/10 px-4 py-3">
          <div className="flex items-center gap-2 text-lg font-bold text-cyan-700 dark:text-cyan-300">
            <Banknote className="h-5 w-5" />
            {t('upgrade.amount', { amount: PAYMENT_AMOUNT })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/60 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100">Telebirr</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {t('upgrade.paymentMethods')}: {PAYMENT_PHONE}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/60 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
            <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-300" />
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100">CBE (Commercial Bank of Ethiopia)</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {t('upgrade.paymentMethods')}: {PAYMENT_PHONE}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Upload */}
      <div className="ui-surface rounded-2xl p-5">
        <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t('upgrade.uploadReceipt')}
        </h3>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {t('upgrade.uploadHint')}
        </p>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => document.getElementById('receipt-file-input')?.click()}
          className={`cursor-pointer rounded-2xl border p-6 text-center transition-all
            ${isDragOver
              ? 'border-cyan-400 bg-cyan-500/8 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]'
              : 'border-dashed border-slate-300/80 hover:border-cyan-400/50 dark:border-slate-700/80'
            }
            ${selectedFile ? 'bg-emerald-500/5 border-emerald-400/40' : 'bg-white/40 dark:bg-slate-950/30'}
          `}
          role="button"
          tabIndex={0}
        >
          <input
            id="receipt-file-input"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFile(file);
                e.target.value = '';
              }
            }}
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              {selectedFile.type === 'application/pdf' ? (
                <FileText className="h-10 w-10 text-emerald-500" />
              ) : (
                <FileImage className="h-10 w-10 text-emerald-500" />
              )}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {selectedFile.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {(selectedFile.size / 1024).toFixed(0)} KB
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Drop your payment receipt here
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                PDF, JPG, or PNG — up to 10 MB
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedFile || isSubmitting}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_32px_rgba(6,182,212,0.22)] transition-all hover:bg-cyan-400 disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {t('upgrade.submitPayment')}
        </button>
      </div>
    </div>
  );
};

export default Upgrade;
