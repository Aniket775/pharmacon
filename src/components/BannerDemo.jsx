import React from 'react';
import { AlertCircle, Cpu } from 'lucide-react';

export default function BannerDemo({
  title = 'DEMO EXTRACTION (ML MODEL: PLANNED)',
  message = 'The handwriting recognition model is currently in training/planning. This interface runs an isolated demonstration pipeline with simulated confidence values and human review workflows. No real AI accuracy is claimed.',
  className = '',
}) {
  return (
    <div
      className={`border-2 border-brand-dark bg-accent-goldLight p-4 rounded-2xl shadow-tactile-sm flex items-start gap-3 text-brand-dark ${className}`}
    >
      <div className="p-2 bg-accent-gold rounded-xl border border-brand-dark flex-shrink-0 text-brand-dark">
        <Cpu className="w-5 h-5" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs uppercase tracking-wider bg-accent-gold px-2 py-0.5 rounded-md border border-brand-dark">
            Prototype Notice
          </span>
          <h4 className="font-bold text-sm text-brand-dark">{title}</h4>
        </div>
        <p className="text-xs text-brand-dark/80 mt-1 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
