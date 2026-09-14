import React from 'react';
import { Calendar, CheckCircle2, Clock, Sparkles, Flag, ArrowRight } from 'lucide-react';

export default function RoadmapPage() {
  const milestones = [
    {
      phase: 'Phase 1',
      title: 'Planning, Architecture & Scope Commitment',
      period: 'August 2026',
      status: 'completed',
      deliverables: [
        'UCS503 Planning Presentation v1 and Pitch Deck (.pptx).',
        'Clinical stakeholder pain point analysis & risk register.',
        'Initial prototype workflow wireframes and formulary schema design.',
      ],
    },
    {
      phase: 'Phase 2',
      title: 'Full Web Engine & Supabase Persistence Rebuild',
      period: 'September 2026',
      status: 'completed',
      deliverables: [
        'Clean React + Vite + Tailwind frontend architecture.',
        'Complete PostgreSQL database with Row Level Security (RLS) & Storage buckets.',
        'Interactive 5-stage prescription verification and formulary matching pipeline.',
        'Multi-role dashboards for Doctor, Clinic Staff, Pharmacist, Patient, and Admin.',
      ],
    },
    {
      phase: 'Phase 3',
      title: 'Doctor Handwriting Dataset & LoRA Training',
      period: 'October – November 2026',
      status: 'in-progress',
      deliverables: [
        'Recruitment of participating physicians and collection of 15+ calibration sheets per doctor.',
        'CNN-Transformer base model fine-tuning with low-rank adaptation (LoRA).',
        'Integration of live Python/PyTorch inference service with Supabase Edge Functions.',
      ],
    },
    {
      phase: 'Phase 4',
      title: 'Ablation Study, Clinical Validation & Final Capstone',
      period: 'December 2026',
      status: 'future',
      deliverables: [
        'Execution of 4-stage ablation evaluation (Generic vs Adapted vs Constrained).',
        'Empirical measurement of CER, WER, and exact medicine accuracy metrics.',
        'Final UCS503 project defense, documentation, and live hospital deployment demo.',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <Calendar className="w-3.5 h-3.5 text-brand-red" />
            Project Schedule
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Milestones &amp; Development Roadmap
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Gantt timeline tracking engineering deliverables from initial pitch through ML model evaluation.
          </p>
        </div>
      </div>

      {/* Roadmap Timeline Cards */}
      <div className="space-y-6">
        {milestones.map((m) => (
          <div
            key={m.phase}
            className="card-tactile p-6 sm:p-8 bg-white flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-brand-dark/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-xs uppercase px-3 py-1 rounded-md bg-brand-pink/20 text-brand-crimson border border-brand-pink/40">
                  {m.phase}
                </span>
                <h3 className="text-xl font-bold font-display text-brand-dark">
                  {m.title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-brand-dark/60">{m.period}</span>
                <span
                  className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    m.status === 'completed'
                      ? 'bg-accent-mintLight text-emerald-900 border-emerald-400'
                      : m.status === 'in-progress'
                      ? 'bg-accent-goldLight text-amber-900 border-amber-400'
                      : 'bg-canvas text-brand-dark/60 border-brand-dark/20'
                  }`}
                >
                  {m.status}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-brand-dark/50">
                Key Deliverables &amp; Outcomes:
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-brand-dark/80 font-medium">
                {m.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-canvas p-2.5 rounded-xl border border-brand-dark/10">
                    <CheckCircle2 className="w-4 h-4 text-brand-pink flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
