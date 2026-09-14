import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  UploadCloud,
  FileCheck2,
  CheckCircle,
  Package,
  Activity,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Users,
  Eye,
  AlertTriangle,
  Play,
  FileSpreadsheet,
} from 'lucide-react';
import BannerDemo from '../components/BannerDemo';

export default function HomePage() {
  const pipelineSteps = [
    {
      num: '01',
      title: 'Handwritten Rx',
      desc: 'Doctor writes prescription or uploads high-res clinical image.',
      icon: UploadCloud,
      color: 'bg-accent-goldLight',
    },
    {
      num: '02',
      title: 'AI Extraction',
      desc: 'Doctor-adaptive OCR extracts drug name, strength, dosage & frequency.',
      icon: Cpu,
      color: 'bg-accent-purpleLight',
      badge: 'ML Planned',
    },
    {
      num: '03',
      title: 'Human Review',
      desc: 'Clinic staff reviews confidence scores & edits flagged fields.',
      icon: FileCheck2,
      color: 'bg-accent-mintLight',
    },
    {
      num: '04',
      title: 'Formulary Match',
      desc: 'Direct match with local hospital pharmacy inventory & SKU.',
      icon: Package,
      color: 'bg-accent-blueLight',
    },
    {
      num: '05',
      title: 'Confirmed & Refills',
      desc: 'Stock decremented atomically; patient receives scheduled dosage.',
      icon: CheckCircle,
      color: 'bg-brand-pink/20',
    },
  ];

  const pillars = [
    {
      title: 'Doctor Adaptation Engine',
      desc: 'Generic models fail on idiosyncratic medical cursive. Pharmacon uses few-shot writer calibration to adapt to each doctor’s handwriting style.',
      icon: Cpu,
      tag: 'Adaptive AI',
      link: '/doctor-adaptation',
    },
    {
      title: 'Human-in-the-Loop Safety',
      desc: 'Strict safety mandate: No autonomous clinical prescribing. Fields below confidence thresholds require manual staff verification before confirmation.',
      icon: ShieldCheck,
      tag: 'Zero Hallucination',
      link: '/proposed-system',
    },
    {
      title: 'Direct Formulary Matching',
      desc: 'Automatic SKU and pack mapping against real-time pharmacy inventory without unsafe drug substitutions or dose changes.',
      icon: Package,
      tag: 'Inventory Sync',
      link: '/inventory',
    },
    {
      title: 'Role-Based Dashboards',
      desc: 'Dedicated tailored interfaces for Doctors, Clinic Staff, Pharmacists, Patients, and Clinical Auditors with Row Level Security.',
      icon: Users,
      tag: 'Multi-Role Access',
      link: '/dashboard/admin',
    },
  ];

  return (
    <div className="space-y-20 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative pt-6 pb-12 text-center lg:text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-brand-dark bg-accent-gold text-brand-dark text-xs font-black uppercase tracking-wider shadow-tactile-sm">
              <Sparkles className="w-4 h-4 text-brand-red" />
              Healthcare Workflow Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display text-brand-dark leading-[1.08] tracking-tight">
              Clinical Handwriting Digitization &amp;{' '}
              <span className="text-brand-red underline decoration-accent-gold decoration-wavy decoration-4">
                Formulary Sync
              </span>
            </h1>

            <p className="text-lg text-brand-dark/80 max-w-2xl font-medium leading-relaxed">
              Pharmacon closes the gap between physician cursive prescriptions and pharmacy dispensing through <strong>doctor-specific handwriting adaptation</strong>, <strong>mandatory human verification</strong>, and <strong>exact inventory matching</strong>.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/prototype"
                className="btn-tactile-red px-6 py-3.5 rounded-2xl text-base font-bold inline-flex items-center gap-2 shadow-tactile"
              >
                <Play className="w-5 h-5 fill-current" />
                Launch Interactive Pipeline
              </Link>
              <Link
                to="/inventory"
                className="btn-tactile-white px-6 py-3.5 rounded-2xl text-base font-bold inline-flex items-center gap-2"
              >
                <Package className="w-5 h-5 text-brand-pink" />
                View Formulary Inventory
              </Link>
            </div>

            {/* Quick Demo Notice */}
            <div className="pt-2">
              <BannerDemo
                title="Prototype & Planning Demonstration"
                message="This live web application showcases the full 5-stage clinical workflow with true Supabase persistence. The deep learning handwriting recognition model is currently in training/planning."
              />
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="card-tactile p-6 bg-white space-y-5">
              <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-red border border-brand-dark"></div>
                  <div className="w-3 h-3 rounded-full bg-accent-gold border border-brand-dark"></div>
                  <div className="w-3 h-3 rounded-full bg-accent-mint border border-brand-dark"></div>
                  <span className="text-xs font-mono font-bold text-brand-dark/70 ml-2">RX-2024-0001</span>
                </div>
                <span className="text-xs font-bold uppercase bg-accent-mintLight text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-400">
                  Formulary Matched
                </span>
              </div>

              {/* Simulated prescription snippet */}
              <div className="bg-canvas-dark/60 p-4 rounded-2xl border-2 border-brand-dark/20 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-brand-dark/60">Doctor:</span>
                  <span className="text-brand-dark">Dr. A. Sharma (Cardiology)</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-brand-dark/60">Extracted Drug:</span>
                  <span className="text-brand-crimson font-black text-sm">Amoxicillin 500 mg</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-brand-dark/60">Inventory Match:</span>
                  <span className="text-emerald-700 font-extrabold">AMX-500-CAP (142 in stock)</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-brand-dark/60">Confidence:</span>
                  <span className="bg-accent-mint text-brand-dark px-2 py-0.5 rounded text-[11px] font-black border border-brand-dark">
                    96.4% Verified
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/doctor-adaptation"
                  className="btn-tactile-white py-2 px-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5"
                >
                  <Cpu className="w-3.5 h-3.5 text-brand-pink" />
                  Adaptation Demo
                </Link>
                <Link
                  to="/presentations"
                  className="btn-tactile-gold py-2 px-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-brand-dark" />
                  Pitch Decks (PPT)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Stage Pipeline Workflow */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-brand-red bg-brand-pink/10 px-3 py-1 rounded-full border border-brand-pink/30">
            End-to-End Clinical Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            The Pharmacon 5-Stage Workflow
          </h2>
          <p className="text-brand-dark/80 text-sm sm:text-base leading-relaxed">
            From physical paper prescription to dispensed medicine, human verification ensures clinical safety at every junction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="card-tactile p-5 bg-white flex flex-col justify-between relative group hover:-translate-y-1 transition-transform"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-display text-brand-dark/30">
                      {step.num}
                    </span>
                    <div className={`p-2.5 rounded-xl border-2 border-brand-dark ${step.color} shadow-tactile-sm`}>
                      <Icon className="w-5 h-5 text-brand-dark" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold font-display text-brand-dark mb-1 flex items-center gap-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-brand-dark/75 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {step.badge && (
                  <div className="mt-4 pt-2 border-t border-brand-dark/10">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-accent-gold text-brand-dark border border-brand-dark">
                      {step.badge}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4 Pillars Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-brand-crimson bg-accent-goldLight px-3 py-1 rounded-full border border-accent-gold">
            System Design &amp; Principles
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Why Pharmacon Is Different
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="card-tactile p-7 bg-white flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-brand-pink/20 rounded-2xl border-2 border-brand-dark text-brand-crimson shadow-tactile-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black uppercase px-2.5 py-1 rounded-md bg-canvas-dark border border-brand-dark text-brand-dark">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-brand-dark">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-brand-dark/80 leading-relaxed font-medium">
                    {pillar.desc}
                  </p>
                </div>

                <Link
                  to={pillar.link}
                  className="inline-flex items-center gap-2 text-sm font-bold text-brand-red hover:text-brand-crimson group"
                >
                  Explore Module Specifications
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="card-tactile p-8 sm:p-12 bg-brand-pink text-white text-center space-y-6 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black font-display leading-tight">
            Ready to explore the rebuilt Pharmacon workflow?
          </h2>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            Test real Supabase inventory adjustments, prescription extraction review, presentation downloads, and multi-role dashboards.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/prototype"
              className="btn-tactile-white px-6 py-3 rounded-2xl text-sm font-black text-brand-dark"
            >
              Test Prototype
            </Link>
            <Link
              to="/team"
              className="btn-tactile-gold px-6 py-3 rounded-2xl text-sm font-black text-brand-dark"
            >
              Meet the 4-Person Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
