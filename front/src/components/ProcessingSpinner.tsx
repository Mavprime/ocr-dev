import React from 'react';

interface ProcessingSpinnerProps {
  message?: string;
}

const ProcessingSpinner: React.FC<ProcessingSpinnerProps> = ({ message = "Extracting invoice data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="relative w-14 h-14 mb-4">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-primary border-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-neutral-600 font-medium">{message}</p>
      <p className="text-sm text-neutral-400 mt-1">This usually takes a few seconds</p>
    </div>
  );
};

export default ProcessingSpinner;
