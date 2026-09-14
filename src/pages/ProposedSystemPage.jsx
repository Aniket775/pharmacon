import React from 'react';
import {
  Layers,
  Cpu,
  ShieldCheck,
  Package,
  Database,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import BannerDemo from '../components/BannerDemo';

export default function ProposedSystemPage() {
  const pipeline = [
    {
      num: '01',
      title: 'Image Acquisition & Segmentation',
      subtitle: 'Line extraction & contrast normalization',
      details: 'High-resolution prescription capture via smartphone camera or clinical flatbed scanner. Automatic perspective correction, deskewing, and line-level handwriting segmentation.',
      tag: 'Vision Pre-processing',
    },
    {
      num: '02',
      title: 'Doctor-Adaptive Vision Engine',
      subtitle: 'TrOCR base model + Physician LoRA weights',
      details: 'Visual tokens pass through CNN-Transformer encoder-decoder heads. Doctor identity triggers the loading of specific low-rank adaptation matrices to resolve physician cursive ligatures.',
      tag: 'Adaptive Inference',
    },
    {
      num: '03',
      title: 'Human-in-the-Loop Review',
      subtitle: 'Confidence thresholding & clinician editing',
      details: 'Tokens scoring below the safety confidence threshold (90%) are highlighted with "Needs Verification". Clinic staff reviews side-by-side with the original scan and confirms or adjusts.',
      tag: 'Clinical Safety Guard',
    },
    {
      num: '04',
      title: 'Formulary Mapping & Inventory Sync',
      subtitle: 'PostgreSQL inventory reservation with RLS',
      details: 'Validated drug name, strength, and dosage form are matched directly against hospital pharmacy database records. Confirmed prescriptions atomically reserve warehouse stock units.',
      tag: 'Database Sync',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <Layers className="w-3.5 h-3.5 text-brand-red" />
            System Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Proposed System &amp; Pipeline
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Technical blueprint of the 4-stage adaptive transcription pipeline, database persistence, and security controls.
          </p>
        </div>
      </div>

      <BannerDemo
        title="PROPOSED ML ARCHITECTURE BLUEPRINT"
        message="The software architecture defines clean boundaries between the UI layer, Supabase PostgreSQL persistence, Storage buckets, and the pluggable extraction engine."
      />

      {/* 4-Stage Pipeline Breakdown */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black font-display text-brand-dark">
          4-Stage Processing Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pipeline.map((stage) => (
            <div
              key={stage.num}
              className="card-tactile p-6 bg-white flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-transform"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-brand-crimson">
                    {stage.num}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-canvas-dark border border-brand-dark text-brand-dark">
                    {stage.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold font-display text-brand-dark">
                  {stage.title}
                </h3>
                <div className="text-xs font-semibold text-brand-dark/60">
                  {stage.subtitle}
                </div>
                <p className="text-xs text-brand-dark/80 leading-relaxed font-medium">
                  {stage.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & RLS Architecture */}
      <div className="card-tactile p-8 bg-brand-dark text-canvas space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-red rounded-2xl border-2 border-canvas text-canvas shadow-tactile-sm">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-display text-canvas">
              Security &amp; Row Level Security (RLS)
            </h3>
            <p className="text-xs text-accent-gold font-semibold">
              Zero frontend service-role keys • Database-enforced role permissions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-canvas/80">
          <div className="p-4 rounded-xl bg-canvas/10 border border-canvas/20 space-y-2">
            <h4 className="font-bold text-canvas text-sm">PostgreSQL RLS</h4>
            <p className="leading-relaxed">
              Every table (`prescriptions`, `refill_requests`, `inventory_items`, `audit_events`) is protected by Supabase RLS policies matching `auth.uid()`.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-canvas/10 border border-canvas/20 space-y-2">
            <h4 className="font-bold text-canvas text-sm">Isolated Storage</h4>
            <p className="leading-relaxed">
              Prescription scans and presentation assets are uploaded to dedicated Supabase Storage buckets with strict MIME-type and size limits.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-canvas/10 border border-canvas/20 space-y-2">
            <h4 className="font-bold text-canvas text-sm">Tamper-Evident Audit</h4>
            <p className="leading-relaxed">
              All clinical actions (field corrections, confirmations, inventory stock changes) generate immutable timestamped records in `audit_events`.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
