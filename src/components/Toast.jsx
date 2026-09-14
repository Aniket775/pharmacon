import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounceIn">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 border-brand-dark shadow-tactile ${
          isSuccess
            ? 'bg-accent-mintLight text-emerald-950'
            : isError
            ? 'bg-red-100 text-red-950'
            : 'bg-accent-goldLight text-brand-dark'
        }`}
      >
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-amber-700 flex-shrink-0" />}

        <span className="text-sm font-bold">{toast.message}</span>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 ml-2 rounded-lg hover:bg-black/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
