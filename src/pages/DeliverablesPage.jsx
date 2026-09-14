import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { logAuditEvent } from '../lib/auditLogger';
import {
  FileText,
  Download,
  Calendar,
  Layers,
  Plus,
  Sparkles,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const DEFAULT_DELIVERABLES = [
  {
    id: 'D-001',
    title: 'Planning Presentation v1 (Interactive Web Deck)',
    type: 'Interactive Presentation',
    version_id: 'v1.0.0',
    date: '2026-08-25',
    status: 'published',
    description: 'Direct browser-delivered planning presentation satisfying all system requirements.',
    file_name: 'Pharmacon_Commitment_Pitch.pptx',
    file_url: './presentations/Pharmacon_Commitment_Pitch.pptx',
  },
  {
    id: 'D-002',
    title: 'Planning Presentation v2 (Scope & Feedback Updates)',
    type: 'Interactive Presentation',
    version_id: 'v2.0.0',
    date: '2026-09-10',
    status: 'published',
    description: 'Updated planning deliverable incorporating clinical advisory feedback and revised architecture.',
    file_name: 'Merged_Presentation_from_Claude.pptx',
    file_url: './presentations/Merged_Presentation_from_Claude.pptx',
  },
  {
    id: 'D-003',
    title: 'Software Comparison Grid',
    type: 'Specification Table',
    version_id: 'v1.0.0',
    date: '2026-08-25',
    status: 'published',
    description: 'Detailed feature comparison grid contrasting Pharmacon with existing OCR and e-prescribing platforms.',
    file_name: 'software-grid',
    file_url: '#/software-grid',
  },
  {
    id: 'D-004',
    title: 'System Architecture & Feasibility Report',
    type: 'Document / Report',
    version_id: 'v1.0.0',
    date: '2026-08-25',
    status: 'published',
    description: 'Technical evaluation of CNN-Transformer architectures, few-shot LoRA fine-tuning, and clinical risk register.',
    file_name: 'feasibility',
    file_url: '#/feasibility',
  },
];

export default function DeliverablesPage() {
  const { role, profile, user } = useAuth();
  const [deliverables, setDeliverables] = useState(DEFAULT_DELIVERABLES);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const isAdmin = role === 'admin' || role === 'instructor';

  useEffect(() => {
    async function fetchDeliverables() {
      setLoading(true);
      try {
        if (!isSupabaseConfigured()) {
          setDeliverables(DEFAULT_DELIVERABLES);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('deliverables')
          .select('*')
          .order('date', { ascending: false });

        if (error || !data || data.length === 0) {
          setDeliverables(DEFAULT_DELIVERABLES);
        } else {
          const mapped = data.map((d) => ({
            ...d,
            file_url: d.file_url || `./presentations/${d.file_name || 'Pharmacon_Commitment_Pitch.pptx'}`,
          }));
          setDeliverables(mapped);
        }
      } catch (err) {
        console.warn('Deliverables fetch error:', err);
        setDeliverables(DEFAULT_DELIVERABLES);
      } finally {
        setLoading(false);
      }
    }

    fetchDeliverables();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <FileText className="w-3.5 h-3.5 text-brand-red" />
            Platform Documentation
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            System Deliverables &amp; Specifications
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Official project documents, pitch decks, specifications, and architecture deliverables.
          </p>
        </div>
      </div>

      {/* Deliverables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deliverables.map((item) => (
          <div
            key={item.id}
            className="card-tactile p-6 bg-white flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-transform"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-mono font-bold text-brand-dark/50 bg-canvas px-2 py-0.5 rounded border border-brand-dark/20">
                  {item.id}
                </span>
                <StatusBadge status={item.status} />
              </div>

              <h3 className="text-lg font-bold font-display text-brand-dark">
                {item.title}
              </h3>
              <p className="text-xs text-brand-dark/75 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>

            <div className="pt-4 border-t border-brand-dark/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-brand-dark/60 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-brand-pink" />
                <span>{item.date}</span>
                <span>•</span>
                <span className="font-bold text-brand-dark/80">{item.type}</span>
              </div>

              {item.file_url && (
                <a
                  href={item.file_url}
                  download={item.file_name?.endsWith('.pptx') || item.file_name?.endsWith('.pdf')}
                  className="btn-tactile-red px-3.5 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-tactile-sm"
                >
                  {item.file_name?.endsWith('.pptx') ? (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      Download ({item.file_name})
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Deliverable
                    </>
                  )}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
