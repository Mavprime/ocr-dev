import React, { useCallback, useState } from 'react';
import { FileImage, FileUp, FileText } from 'lucide-react';

import { useLanguage } from './LanguageProvider';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { t, textClass } = useLanguage();

  const handleFile = (file: File) => {
    if (disabled) return;
    onFileSelect(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled],
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
      e.target.value = '';
    }
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`upload-zone group relative overflow-hidden rounded-2xl p-8 text-center cursor-pointer border
        ${isDragOver ? 'dragover scale-[1.01]' : ''}
        ${disabled ? 'opacity-60 pointer-events-none' : 'hover:-translate-y-0.5'}
        ui-surface`}
      onClick={() => {
        if (!disabled) document.getElementById('file-input')?.click();
      }}
      role="button"
      tabIndex={0}
      aria-label={t('uploadZone.aria')}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${isDragOver ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute inset-4 rounded-[28px] border border-cyan-400/35 animate-glow-pulse" />
      </div>

      <input
        id="file-input"
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={onFileInputChange}
        disabled={disabled}
      />

      <div className="relative flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
          <FileUp className="h-8 w-8" />
        </div>

        <h3 className={`mb-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 ${textClass}`}>
          {isDragOver ? t('uploadZone.dragDrop') : t('uploadZone.title')}
        </h3>
        <p className={`mb-4 text-slate-500 dark:text-slate-400 ${textClass}`}>{t('uploadZone.hint')}</p>

        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 dark:border-slate-800/80 dark:bg-slate-950/45">
            <FileText className="h-4 w-4 text-red-500" /> PDF
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 dark:border-slate-800/80 dark:bg-slate-950/45">
            <FileImage className="h-4 w-4 text-cyan-500 dark:text-cyan-300" /> JPG / PNG
          </div>
        </div>

        <div className={`mt-4 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-xs text-slate-600 dark:border-slate-800/80 dark:bg-slate-950/45 dark:text-slate-300 ${textClass}`}>
          {t('uploadZone.maxSize')}
        </div>
      </div>
    </div>
  );
};

export default UploadZone;