import React, { useCallback, useState } from 'react';
import { FaCloudUploadAlt, FaFilePdf, FaImage } from 'react-icons/fa';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (disabled) return;
    onFileSelect(file);
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [disabled]);

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
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`upload-zone rounded-3xl p-10 text-center cursor-pointer transition-all
        ${isDragOver ? 'dragover' : ''} 
        ${disabled ? 'opacity-60 pointer-events-none' : 'hover:border-primary'}
        border-2 border-dashed border-neutral-300 bg-white`}
      onClick={() => {
        if (!disabled) document.getElementById('file-input')?.click();
      }}
      role="button"
      tabIndex={0}
      aria-label="Upload invoice file. Drag and drop or click to browse"
    >
      <input
        id="file-input"
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={onFileInputChange}
        disabled={disabled}
      />

      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <FaCloudUploadAlt className="w-9 h-9 text-primary" />
        </div>

        <h3 className="text-xl font-semibold text-neutral-900 mb-1">
          Drop your invoice here
        </h3>
        <p className="text-neutral-500 mb-4">or click to browse</p>

        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <div className="flex items-center gap-1.5">
            <FaFilePdf className="text-red-500" /> PDF
          </div>
          <div className="flex items-center gap-1.5">
            <FaImage className="text-blue-500" /> JPG / PNG
          </div>
        </div>

        <div className="mt-4 text-xs px-3 py-1 bg-neutral-100 rounded-full text-neutral-600">
          Max file size: 10MB
        </div>
      </div>
    </div>
  );
};

export default UploadZone;
