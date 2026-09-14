import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, FileCheck, Layers, Sparkles } from 'lucide-react';
import BannerDemo from '../components/BannerDemo';

export default function ValidationPage() {
  const validationTracks = [
    {
      title: 'Track A: Technical OCR Accuracy Validation',
      desc: 'Benchmarking character and word error rates across 100+ held-out clinical prescription test sheets.',
      criteria: [
        'CER & WER evaluation against manually ground-truthed transcriptions.',
        'Ablation comparison across Generic vs Adapted vs Constrained model stages.',
        'Quantification of few-shot sample efficiency (10 vs 15 vs 20 calibration sheets).',
      ],
    },
    {
      title: 'Track B: Clinical Workflow & Safety Validation',
      desc: 'Measuring time-to-dispense and error interception rates in simulated hospital OPD environments.',
      criteria: [
        'Time-motion studies comparing manual paper entry (4–8 min) vs Pharmacon assisted review (< 45 sec).',
        'Abstention efficacy: 100% of synthetic dosage ambiguities successfully flagged with "Needs Verification".',
        'Zero drug-drug or substitute hallucination tolerance in formulary mapping.',
      ],
    },
    {
      title: 'Track C: Systems & Data Integrity Validation',
      desc: 'Validating PostgreSQL database consistency, RLS boundaries, and Supabase Storage security.',
      criteria: [
        'Concurrency testing on atomic inventory decrements to prevent negative stock conditions.',
        'Row Level Security policy audits ensuring cross-role tenant isolation.',
        'Complete audit event traceability from image upload to final medication dispensing.',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-red" />
            Verification Plan
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Clinical &amp; System Validation Methodology
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Tri-part validation framework assessing technical OCR metrics, clinical safety thresholds, and database integrity.
          </p>
        </div>
      </div>

      <BannerDemo
        title="PLANNED CLINICAL VALIDATION METHODOLOGY"
        message="Validation experiments will be conducted using anonymized synthetic prescription datasets following medical ethics guidelines."
      />

      {/* Validation Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {validationTracks.map((track) => (
          <div
            key={track.title}
            className="card-tactile p-6 bg-white flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-transform"
          >
            <div className="space-y-3">
              <h3 className="text-lg font-bold font-display text-brand-dark">
                {track.title}
              </h3>
              <p className="text-xs text-brand-dark/75 leading-relaxed font-medium">
                {track.desc}
              </p>

              <div className="pt-2 space-y-2">
                <h4 className="text-[11px] font-black uppercase text-brand-crimson">
                  Evaluation Criteria:
                </h4>
                <ul className="space-y-1.5 text-xs text-brand-dark/80">
                  {track.criteria.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
