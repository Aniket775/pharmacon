import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  GitBranch,
  Calendar,
  Users,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const DEFAULT_VERSIONS = [
  {
    id: 'v1.0.0',
    name: 'Planning Presentation v1',
    date: '2026-08-25',
    authors: 'Aryan Sharma, Aniket Raj, Amitesh Kumar Singh, Chirag Lamba',
    status: 'current',
    change_summary: 'Initial project planning deliverable covering scope, intended users, system architecture, performance goals, technical risks, and interactive Gantt roadmap.',
    deployment_url: '#/presentation/v1',
  },
  {
    id: 'v2.0.0',
    name: 'Planning Presentation v2 & Rebuild',
    date: '2026-09-10',
    authors: 'Team Pharmacon',
    status: 'current',
    change_summary: 'Clean architecture rebuild: React + Vite + Tailwind + PostgreSQL Supabase persistence, real RLS security, and storage file uploads.',
    deployment_url: '#/prototype',
  },
  {
    id: 'v3.0.0',
    name: 'Phase 2 Architecture Milestone',
    date: 'TBD',
    authors: 'Team Pharmacon',
    status: 'future',
    change_summary: 'Phase 2 milestone integrating doctor calibration dataset collection and trained LoRA weights on clinical cursive handwriting.',
    deployment_url: '#/roadmap',
  },
  {
    id: 'v4.0.0',
    name: 'Final Release Milestone',
    date: 'TBD',
    authors: 'Team Pharmacon',
    status: 'future',
    change_summary: 'Final evaluation with multi-doctor comparative benchmarks (CER, WER, exact medicine accuracy) and production hospital formulary deployment.',
    deployment_url: '#/evaluation',
  },
];

export default function VersionsPage() {
  const [versions, setVersions] = useState(DEFAULT_VERSIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVersions() {
      setLoading(true);
      try {
        if (!isSupabaseConfigured()) {
          setVersions(DEFAULT_VERSIONS);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('versions')
          .select('*')
          .order('date', { ascending: false });

        if (error || !data || data.length === 0) {
          setVersions(DEFAULT_VERSIONS);
        } else {
          setVersions(data);
        }
      } catch (err) {
        console.warn('Versions fetch note:', err);
        setVersions(DEFAULT_VERSIONS);
      } finally {
        setLoading(false);
      }
    }

    fetchVersions();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <GitBranch className="w-3.5 h-3.5 text-brand-red" />
            Project Traceability
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Release History &amp; Versions
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Changelog of project planning milestones, architecture pivots, and future deliverable releases.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {versions.map((ver) => (
          <div
            key={ver.id}
            className="card-tactile p-6 sm:p-8 bg-white flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-brand-dark/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-sm bg-brand-pink/20 text-brand-crimson px-3 py-1 rounded-lg border border-brand-pink/40">
                  {ver.id}
                </span>
                <h3 className="text-xl font-bold font-display text-brand-dark">
                  {ver.name}
                </h3>
              </div>
              <StatusBadge status={ver.status} />
            </div>

            <p className="text-xs sm:text-sm text-brand-dark/80 leading-relaxed font-medium">
              {ver.change_summary}
            </p>

            <div className="pt-4 border-t border-brand-dark/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-brand-dark/60 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-pink" />
                  {ver.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-dark/50" />
                  {ver.authors}
                </span>
              </div>

              {ver.deployment_url && (
                <a
                  href={ver.deployment_url}
                  className="btn-tactile-white px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brand-crimson" />
                  View Deliverable Link
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
