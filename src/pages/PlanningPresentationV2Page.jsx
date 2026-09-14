import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Sparkles,
  Calendar,
  Layers,
  Cpu,
} from 'lucide-react';

export default function PlanningPresentationV2Page() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      tag: 'Overview',
      title: 'Planning Presentation V2 (Scope Updates)',
      subtitle: 'Addressing Clinical Advisory Feedback & Refined Calibration Architecture',
      content: (
        <div className="space-y-6 text-center max-w-2xl mx-auto py-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-brand-dark bg-accent-gold text-brand-dark text-xs font-black uppercase shadow-tactile-sm">
            <Sparkles className="w-4 h-4 text-brand-red" />
            Presentation V2 (Scope &amp; Architecture)
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-brand-dark leading-tight">
            Refined Project Direction &amp; Milestone Commitment
          </h2>
          <p className="text-sm text-brand-dark/80 leading-relaxed font-medium">
            Updated deliverables addressing writer recruitment milestones, real clinic calibration workflows, and Supabase integration.
          </p>
        </div>
      ),
    },
    {
      id: 2,
      tag: 'Feedback Integration',
      title: 'Action on Clinical Advisory Recommendations',
      subtitle: 'Key architectural pivots incorporated in V2',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left">
          <div className="p-4 rounded-xl border-2 border-brand-dark bg-canvas-light space-y-2">
            <h4 className="font-bold text-sm text-brand-dark">1. Clear ML Boundary</h4>
            <p className="text-brand-dark/80 leading-relaxed">
              Explicitly isolated the handwriting extraction interface. No fabricated accuracy metrics or premature claims of unsupervised transcription.
            </p>
          </div>
          <div className="p-4 rounded-xl border-2 border-brand-dark bg-canvas-light space-y-2">
            <h4 className="font-bold text-sm text-brand-dark">2. Real Supabase Persistence</h4>
            <p className="text-brand-dark/80 leading-relaxed">
              Eliminated brittle localStorage mocks. Every inventory change, team edit, refill request, and audit log is persisted in PostgreSQL with RLS.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      tag: 'Roadmap',
      title: 'Timeline & Milestones',
      subtitle: 'Deliverables through Phase 2 Review and Enterprise Release',
      content: (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-accent-mintLight border border-emerald-400">
            <span className="font-bold">Phase 1: Planning &amp; Architecture V1</span>
            <span className="font-bold text-emerald-800">Completed (Aug 2026)</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-accent-goldLight border border-amber-400">
            <span className="font-bold">Phase 2: Full Prototype &amp; Formulary Matching</span>
            <span className="font-bold text-amber-800">Current (Sep 2026)</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-brand-dark/20">
            <span className="font-bold">Phase 3: Doctor LoRA Training &amp; Clinical Evaluation</span>
            <span className="font-bold text-brand-dark/60">Mid-Sem &amp; Final</span>
          </div>
        </div>
      ),
    },
  ];

  const totalSlides = slides.length;
  const current = slides[currentSlide];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-brand-dark/10">
        <div className="flex items-center gap-3">
          <Link
            to="/presentations"
            className="btn-tactile-white px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Decks
          </Link>
          <span className="font-display font-black text-lg text-brand-dark">
            Planning Presentation V2
          </span>
        </div>

        <a
          href="./presentations/Merged_Presentation_from_Claude.pptx"
          download
          className="btn-tactile-red px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-tactile-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Download PPTX
        </a>
      </div>

      <div className="card-tactile min-h-[380px] p-8 bg-white flex flex-col justify-between">
        <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-3 mb-6">
          <span className="text-xs font-black uppercase text-brand-crimson bg-brand-pink/15 px-3 py-1 rounded-full border border-brand-pink/30">
            {current.tag}
          </span>
          <span className="text-xs font-mono font-bold text-brand-dark/50">
            Slide {currentSlide + 1} of {totalSlides}
          </span>
        </div>

        <div className="my-auto">{current.content}</div>

        <div className="flex items-center justify-between pt-6 border-t-2 border-brand-dark/10 text-xs text-brand-dark/50 font-bold">
          <span>Pharmacon V2 Deliverable</span>
          <span>Team Pharmacon</span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-brand-dark shadow-tactile-sm">
        <button
          onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
          disabled={currentSlide === 0}
          className="btn-tactile-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Slide
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))}
          disabled={currentSlide === totalSlides - 1}
          className="btn-tactile-red px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 disabled:opacity-40"
        >
          Next Slide
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
