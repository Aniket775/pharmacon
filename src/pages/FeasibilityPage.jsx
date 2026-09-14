import React from 'react';
import { ShieldAlert, AlertCircle, CheckCircle2, Cpu, Database, Activity } from 'lucide-react';

const RISKS = [
  {
    id: 'R-01',
    risk: 'Handwriting Recognition Accuracy Variance',
    impact: 'High',
    mitigation: 'Doctor-specific few-shot calibration; confidence score flagging; mandatory human-in-the-loop review.',
    fallback: 'Rapid manual transcription with assisted formulary auto-complete.',
  },
  {
    id: 'R-02',
    risk: 'Insufficient Doctor Calibration Samples',
    impact: 'Medium',
    mitigation: 'Structured 15-sheet onboarding protocol during clinician profile registration.',
    fallback: 'Fall back to generic base model with elevated confidence thresholds.',
  },
  {
    id: 'R-03',
    risk: 'Look-Alike / Sound-Alike Drug Name Ambiguity',
    impact: 'High',
    mitigation: 'Formulary dictionary constraints; exact match enforcement; zero automatic drug substitution.',
    fallback: 'Manual drug selection dropdown restricted to registered hospital formulary.',
  },
  {
    id: 'R-04',
    risk: 'Incorrect Dosage / Frequency Interpretation',
    impact: 'High',
    mitigation: 'Mandatory staff confirmation on all dosage tokens; audit logging of every edit.',
    fallback: 'Clinical verification blocker prevents dispensing until explicit staff sign-off.',
  },
  {
    id: 'R-05',
    risk: 'Pharmacy Inventory Synchronization Delays',
    impact: 'Medium',
    mitigation: 'PostgreSQL database triggers and atomic decrement transactions; Supabase real-time updates.',
    fallback: 'Manual inventory stock override and periodic physical warehouse audit reconciliation.',
  },
  {
    id: 'R-06',
    risk: 'Patient Healthcare Data Privacy Concerns',
    impact: 'High',
    mitigation: 'Supabase Row Level Security (RLS); isolated authenticated storage buckets; encrypted transport.',
    fallback: 'Strict role authorization separating patient identifiable data from OCR model telemetry.',
  },
];

export default function FeasibilityPage() {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <Activity className="w-3.5 h-3.5 text-brand-red" />
            Engineering Feasibility
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Feasibility &amp; Risk Register
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Technical feasibility assessment, infrastructure choices, and clinical risk mitigation matrix.
          </p>
        </div>
      </div>

      {/* Feasibility Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-tactile p-6 bg-white space-y-3">
          <div className="p-3 bg-brand-pink/20 rounded-2xl border-2 border-brand-dark text-brand-crimson w-fit">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-display text-brand-dark">Technical Feasibility</h3>
          <p className="text-xs text-brand-dark/80 leading-relaxed font-medium">
            Proven foundation leveraging Transformer vision architectures (TrOCR) paired with parameter-efficient fine-tuning (LoRA) for low-overhead writer adaptation.
          </p>
        </div>

        <div className="card-tactile p-6 bg-white space-y-3">
          <div className="p-3 bg-accent-goldLight rounded-2xl border-2 border-brand-dark text-brand-dark w-fit">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-display text-brand-dark">Infrastructure Feasibility</h3>
          <p className="text-xs text-brand-dark/80 leading-relaxed font-medium">
            Supabase provides production PostgreSQL persistence, built-in Auth, Storage buckets, and declarative Row Level Security without complex custom server code.
          </p>
        </div>

        <div className="card-tactile p-6 bg-white space-y-3">
          <div className="p-3 bg-accent-mintLight rounded-2xl border-2 border-brand-dark text-emerald-900 w-fit">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-display text-brand-dark">Operational Feasibility</h3>
          <p className="text-xs text-brand-dark/80 leading-relaxed font-medium">
            Zero behavioral shift required from physicians. Doctors continue writing natural prescriptions on paper; the assisted review UI integrates seamlessly into clinic desks.
          </p>
        </div>
      </div>

      {/* Risk Register Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black font-display text-brand-dark">
          Clinical Risk Mitigation Matrix
        </h2>

        <div className="card-tactile overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-canvas-dark border-b-2 border-brand-dark text-brand-dark font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Identified Risk</th>
                  <th className="py-3.5 px-4 text-center">Impact</th>
                  <th className="py-3.5 px-4">Mitigation Strategy</th>
                  <th className="py-3.5 px-4">Fallback Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/10">
                {RISKS.map((r) => (
                  <tr key={r.id} className="hover:bg-canvas/50">
                    <td className="py-4 px-4 font-mono font-bold text-brand-crimson">
                      {r.id}
                    </td>
                    <td className="py-4 px-4 font-bold text-brand-dark max-w-xs">
                      {r.risk}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          r.impact === 'High'
                            ? 'bg-red-100 text-red-900 border-red-300'
                            : 'bg-accent-goldLight text-amber-900 border-amber-300'
                        }`}
                      >
                        {r.impact}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-brand-dark/80 max-w-sm leading-relaxed">
                      {r.mitigation}
                    </td>
                    <td className="py-4 px-4 text-brand-dark/80 max-w-sm leading-relaxed">
                      {r.fallback}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
