import React from 'react';
import { Layers, Check, X, Sparkles, HelpCircle } from 'lucide-react';

export default function SoftwareGridPage() {
  const comparison = [
    {
      feature: 'Handwritten Clinical Cursive Support',
      pharmacon: 'Yes (Doctor-Adaptive LoRA)',
      genericOcr: 'Poor (Generic Models Fail)',
      ehr: 'No (Requires Full Manual Typing)',
      eRx: 'No (Requires Digital Form Entry)',
    },
    {
      feature: 'Physician Workflow Disruption',
      pharmacon: 'Zero (Keep Natural Paper Writing)',
      genericOcr: 'High (Constant Correction Overhead)',
      ehr: 'High (Slow Computer Input During OPD)',
      eRx: 'Medium (Multi-Click Prescribing)',
    },
    {
      feature: 'Doctor-Specific Style Adaptation',
      pharmacon: 'Yes (Few-Shot Calibration)',
      genericOcr: 'No (Static Global Weights)',
      ehr: 'N/A',
      eRx: 'N/A',
    },
    {
      feature: 'Human-in-the-Loop Confidence Review',
      pharmacon: 'Yes (Mandatory Safety Thresholds)',
      genericOcr: 'Rarely Built-In',
      ehr: 'Manual Only',
      eRx: 'N/A',
    },
    {
      feature: 'Real-Time Hospital Formulary Matching',
      pharmacon: 'Yes (Direct SKU & Stock Sync)',
      genericOcr: 'No (Text Only)',
      ehr: 'Yes (Complex Enterprise EHR)',
      eRx: 'Yes (Limited to Connected Pharmacies)',
    },
    {
      feature: 'Continuous Staff Correction Learning',
      pharmacon: 'Yes (Replay Buffer Feedback)',
      genericOcr: 'No',
      ehr: 'No',
      eRx: 'No',
    },
    {
      feature: 'Multi-Role Clinical Access (RBAC)',
      pharmacon: 'Yes (Doctor, Staff, Pharmacist, Patient)',
      genericOcr: 'No',
      ehr: 'Yes (Complex Hospital Staff Roles)',
      eRx: 'Doctor & Patient Only',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <Layers className="w-3.5 h-3.5 text-brand-red" />
            Competitive Analysis
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Software Comparison Grid
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Contrasting Pharmacon’s doctor-adaptive human-in-the-loop pipeline against generic OCR and conventional EHR systems.
          </p>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="card-tactile overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas-dark border-b-2 border-brand-dark text-brand-dark font-extrabold uppercase tracking-wider">
                <th className="py-4 px-4 w-1/4">System Capability</th>
                <th className="py-4 px-4 bg-brand-pink/20 text-brand-crimson font-black">
                  Pharmacon Engine
                </th>
                <th className="py-4 px-4">Generic OCR (Tesseract / AWS)</th>
                <th className="py-4 px-4">Traditional Hospital EHR</th>
                <th className="py-4 px-4">Commercial e-Rx Apps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/10">
              {comparison.map((row, idx) => (
                <tr key={idx} className="hover:bg-canvas/50">
                  <td className="py-4 px-4 font-bold text-brand-dark">
                    {row.feature}
                  </td>
                  <td className="py-4 px-4 bg-brand-pink/10 font-black text-brand-crimson">
                    {row.pharmacon}
                  </td>
                  <td className="py-4 px-4 text-brand-dark/70 font-medium">
                    {row.genericOcr}
                  </td>
                  <td className="py-4 px-4 text-brand-dark/70 font-medium">
                    {row.ehr}
                  </td>
                  <td className="py-4 px-4 text-brand-dark/70 font-medium">
                    {row.eRx}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
