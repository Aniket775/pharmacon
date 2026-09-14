import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  FileCheck2,
  ArrowRight,
  User,
  Clock,
  Search,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import BannerDemo from '../components/BannerDemo';

const INITIAL_CORRECTIONS = [
  {
    id: 'CR-001',
    prescription_id: 'RX-2024-0042',
    field: 'Medicine Name',
    original_value: 'Amoxcillin',
    corrected_value: 'Amoxicillin',
    confidence: 76,
    doctor_name: 'Dr. A. Sharma',
    actor_name: 'Priya Desai (Clinic Staff)',
    timestamp: '2024-11-14 10:22:15',
  },
  {
    id: 'CR-002',
    prescription_id: 'RX-2024-0042',
    field: 'Frequency',
    original_value: '1-0-2',
    corrected_value: '1-0-1',
    confidence: 68,
    doctor_name: 'Dr. A. Sharma',
    actor_name: 'Priya Desai (Clinic Staff)',
    timestamp: '2024-11-14 10:23:01',
  },
  {
    id: 'CR-003',
    prescription_id: 'RX-2024-0038',
    field: 'Medicine Name',
    original_value: 'Paracetmol',
    corrected_value: 'Paracetamol',
    confidence: 81,
    doctor_name: 'Dr. R. Gupta',
    actor_name: 'Anil Mehta (Clinic Staff)',
    timestamp: '2024-11-13 15:45:30',
  },
  {
    id: 'CR-004',
    prescription_id: 'RX-2024-0038',
    field: 'Strength',
    original_value: '250mg',
    corrected_value: '500 mg',
    confidence: 72,
    doctor_name: 'Dr. R. Gupta',
    actor_name: 'Anil Mehta (Clinic Staff)',
    timestamp: '2024-11-13 15:46:00',
  },
];

export default function CorrectionsPage() {
  const [corrections, setCorrections] = useState(INITIAL_CORRECTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredCorrections = corrections.filter(
    (c) =>
      c.prescription_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.corrected_value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.doctor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <FileCheck2 className="w-3.5 h-3.5 text-brand-red" />
            Human Verification Loop
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Correction History &amp; Feedback Buffer
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Audit trail of human clinician field corrections used to retrain doctor-specific adapter weights.
          </p>
        </div>
      </div>

      {/* Planned Feature Banner */}
      <BannerDemo
        title="CONTINUOUS LEARNING PIPELINE: DESIGN SPECIFICATION"
        message="Corrections made by staff during verification are captured in the replay buffer. When fine-tuning is triggered, these verified pairs adapt the doctor's LoRA adapter weights."
      />

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border-2 border-brand-dark shadow-tactile-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-brand-dark/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Rx ID, field label, corrected drug, or doctor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-dark/30 bg-canvas text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-pink"
          />
        </div>
      </div>

      {/* Corrections List */}
      <div className="space-y-4">
        {filteredCorrections.map((item) => (
          <div
            key={item.id}
            className="card-tactile p-6 bg-white space-y-4 hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-brand-dark/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs bg-canvas px-2.5 py-1 rounded-md border border-brand-dark/30">
                  {item.prescription_id}
                </span>
                <span className="font-bold text-sm text-brand-dark">{item.field}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-dark/60">
                <Clock className="w-3.5 h-3.5" />
                <span>{item.timestamp}</span>
              </div>
            </div>

            {/* Before / After Diff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border-2 border-red-300 bg-red-50 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-700">
                  AI Model Prediction ({item.confidence}% confidence)
                </span>
                <div className="font-mono font-bold text-sm text-red-950 line-through">
                  {item.original_value}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border-2 border-emerald-400 bg-emerald-50 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Staff Verified Value (100% confidence)
                </span>
                <div className="font-mono font-black text-sm text-emerald-950">
                  {item.corrected_value}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-brand-dark/70 pt-1">
              <span>Doctor: <strong>{item.doctor_name}</strong></span>
              <span>Verified by: <strong>{item.actor_name}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
