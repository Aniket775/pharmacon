import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Layers,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileCheck2,
  Cpu,
  Package,
} from 'lucide-react';
import BannerDemo from '../components/BannerDemo';

export default function ProjectPage() {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-brand-red bg-accent-goldLight px-3 py-1 rounded-full border border-accent-gold">
          Platform Architecture &amp; Vision
        </span>
        <h1 className="text-3xl sm:text-5xl font-black font-display text-brand-dark leading-tight">
          Project Vision &amp; Objectives
        </h1>
        <p className="text-base text-brand-dark/80 font-medium">
          Pharmacon is an AI-assisted clinical prescription digitization, human-in-the-loop verification, and real-time hospital formulary matching engine.
        </p>
      </div>

      {/* Demo Banner */}
      <BannerDemo
        title="ENTERPRISE HEALTHCARE WORKFLOW ENGINE"
        message="This rebuilt web application provides the complete end-to-end user workflow with Supabase PostgreSQL persistence and Role Level Security."
      />

      {/* Core Objectives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-tactile p-6 bg-white space-y-4">
          <div className="p-3 rounded-2xl bg-accent-goldLight border-2 border-brand-dark text-brand-dark w-fit">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display text-brand-dark">
            1. Doctor Style Adaptation
          </h3>
          <p className="text-xs text-brand-dark/80 leading-relaxed font-medium">
            Overcoming generic OCR failure on cursive medical shorthand through few-shot physician calibration datasets and lightweight LoRA adapter layers.
          </p>
        </div>

        <div className="card-tactile p-6 bg-white space-y-4">
          <div className="p-3 rounded-2xl bg-accent-mintLight border-2 border-brand-dark text-emerald-900 w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display text-brand-dark">
            2. Mandatory Human Verification
          </h3>
          <p className="text-xs text-brand-dark/80 leading-relaxed font-medium">
            Zero autonomous prescribing. Extracted tokens below confidence thresholds are highlighted for clinic staff review before any prescription confirmation.
          </p>
        </div>

        <div className="card-tactile p-6 bg-white space-y-4">
          <div className="p-3 rounded-2xl bg-brand-pink/20 border-2 border-brand-dark text-brand-crimson w-fit">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display text-brand-dark">
            3. Direct Formulary Inventory Match
          </h3>
          <p className="text-xs text-brand-dark/80 leading-relaxed font-medium">
            Validated medicine strings are cross-referenced directly against hospital pharmacy inventory for instant SKU mapping and atomic stock reservation.
          </p>
        </div>
      </div>

      {/* Navigation CTA Links */}
      <div className="card-tactile p-8 bg-canvas-dark text-center space-y-4">
        <h3 className="text-xl font-bold font-display text-brand-dark">
          Explore Specific Architecture Sections
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link to="/problem-users" className="btn-tactile-white px-4 py-2 rounded-xl text-xs font-bold">
            Clinical Users &amp; Pain Points
          </Link>
          <Link to="/proposed-system" className="btn-tactile-white px-4 py-2 rounded-xl text-xs font-bold">
            4-Stage Pipeline Architecture
          </Link>
          <Link to="/prototype" className="btn-tactile-red px-5 py-2 rounded-xl text-xs font-black">
            Test Interactive Prototype
          </Link>
        </div>
      </div>
    </div>
  );
}
