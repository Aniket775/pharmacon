import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Sparkles, FileText, Layers, Users, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-canvas border-t-3 border-brand-dark mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-canvas/15">
          {/* Col 1: Brand & Course */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-red rounded-xl border-2 border-canvas flex items-center justify-center text-canvas font-black font-display text-xl">
                P
              </div>
              <div>
                <span className="font-display font-black text-2xl tracking-tight text-canvas">
                  Pharmacon
                </span>
                <span className="block text-xs text-accent-gold font-bold">
                  UCS503 Capstone Project Rebuild
                </span>
              </div>
            </div>
            <p className="text-canvas/80 text-sm leading-relaxed max-w-sm mb-4">
              Doctor-adaptive clinical handwriting digitization, human-in-the-loop review, and real-time formulary inventory matching engine.
            </p>
            <div className="inline-flex items-center gap-2 bg-canvas/10 px-3 py-1.5 rounded-xl border border-canvas/20 text-xs text-accent-gold">
              <ShieldCheck className="w-4 h-4 text-brand-pink" />
              <span>Supabase PostgreSQL + RLS Protected</span>
            </div>
          </div>

          {/* Col 2: Architecture & Specs */}
          <div>
            <h4 className="font-display font-bold text-accent-gold text-sm uppercase tracking-wider mb-4">
              System Specs
            </h4>
            <ul className="space-y-2 text-sm text-canvas/80 font-medium">
              <li>
                <Link to="/project" className="hover:text-brand-pink transition-colors">
                  Project Overview
                </Link>
              </li>
              <li>
                <Link to="/problem-users" className="hover:text-brand-pink transition-colors">
                  Clinical Users & Pain Points
                </Link>
              </li>
              <li>
                <Link to="/proposed-system" className="hover:text-brand-pink transition-colors">
                  4-Stage Architecture
                </Link>
              </li>
              <li>
                <Link to="/validation" className="hover:text-brand-pink transition-colors">
                  Validation Methodology
                </Link>
              </li>
              <li>
                <Link to="/feasibility" className="hover:text-brand-pink transition-colors">
                  Feasibility & Risk Matrix
                </Link>
              </li>
              <li>
                <Link to="/evaluation" className="hover:text-brand-pink transition-colors">
                  Evaluation Metrics
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Workflows & Demos */}
          <div>
            <h4 className="font-display font-bold text-accent-gold text-sm uppercase tracking-wider mb-4">
              Workflows & Demos
            </h4>
            <ul className="space-y-2 text-sm text-canvas/80 font-medium">
              <li>
                <Link to="/prototype" className="hover:text-brand-pink transition-colors">
                  Interactive Pipeline Demo
                </Link>
              </li>
              <li>
                <Link to="/inventory" className="hover:text-brand-pink transition-colors">
                  Formulary Inventory
                </Link>
              </li>
              <li>
                <Link to="/doctor-adaptation" className="hover:text-brand-pink transition-colors">
                  Doctor AI Adaptation
                </Link>
              </li>
              <li>
                <Link to="/corrections" className="hover:text-brand-pink transition-colors">
                  Correction Learning Log
                </Link>
              </li>
              <li>
                <Link to="/audit" className="hover:text-brand-pink transition-colors">
                  System Audit Trail
                </Link>
              </li>
              <li>
                <Link to="/software-grid" className="hover:text-brand-pink transition-colors">
                  Software Comparison Grid
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Project Deliverables */}
          <div>
            <h4 className="font-display font-bold text-accent-gold text-sm uppercase tracking-wider mb-4">
              Releases & Team
            </h4>
            <ul className="space-y-2 text-sm text-canvas/80 font-medium">
              <li>
                <Link to="/presentations" className="hover:text-brand-pink transition-colors">
                  Presentation Decks (PPTX)
                </Link>
              </li>
              <li>
                <Link to="/deliverables" className="hover:text-brand-pink transition-colors">
                  Course Deliverables
                </Link>
              </li>
              <li>
                <Link to="/versions" className="hover:text-brand-pink transition-colors">
                  Version History
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="hover:text-brand-pink transition-colors">
                  Milestone Gantt Roadmap
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-brand-pink transition-colors">
                  4-Person Engineering Team
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-pink transition-colors">
                  Sign In / Role Access
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Academic Notice & Team Credits */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-canvas/70">
          <div>
            <p>
              Developed by <strong className="text-canvas">Aryan Sharma, Aniket Raj, Amitesh Kumar Singh & Chirag Lamba</strong>.
            </p>
            <p className="mt-1 text-canvas/60">
              Disclaimer: ML Handwriting extraction is currently in planning/training. Prototype runs simulated inference for workflow verification.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-canvas/10 px-3 py-1 rounded-full border border-canvas/20">
              Built for UCS503 Capstone
            </span>
            <span className="text-brand-pink">●</span>
            <span>React + Vite + Tailwind + Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
