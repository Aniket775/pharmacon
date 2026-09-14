import React from 'react';
import {
  TrendingUp,
  AlertCircle,
  Cpu,
  ShieldCheck,
  Sparkles,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import BannerDemo from '../components/BannerDemo';

export default function EvaluationPage() {
  const comparisonStages = [
    {
      stage: 'Configuration 1',
      name: 'Generic Baseline Vision Model',
      description: 'TrOCR / CNN-Transformer trained only on public handwritten text corpora without clinical dictionary.',
      cer: 'Not measured yet (Planned)',
      wer: 'Not measured yet (Planned)',
      medAcc: 'Not measured yet (Planned)',
      skuAcc: 'Not measured yet (Planned)',
      status: 'Planned Baseline',
    },
    {
      stage: 'Configuration 2',
      name: 'Generic Base + Formulary Dictionary',
      description: 'Base model constrained by hospital formulary beam search and vocabulary token filters.',
      cer: 'Not measured yet (Planned)',
      wer: 'Not measured yet (Planned)',
      medAcc: 'Not measured yet (Planned)',
      skuAcc: 'Not measured yet (Planned)',
      status: 'Planned Benchmark',
    },
    {
      stage: 'Configuration 3',
      name: 'Doctor-Adapted Model (LoRA)',
      description: 'Few-shot fine-tuned LoRA adapter weights for specific physician handwriting styles.',
      cer: 'Not measured yet (Planned)',
      wer: 'Not measured yet (Planned)',
      medAcc: 'Not measured yet (Planned)',
      skuAcc: 'Not measured yet (Planned)',
      status: 'Target Architecture',
    },
    {
      stage: 'Configuration 4',
      name: 'Doctor-Adapted + Formulary + Correction Learning',
      description: 'Full Pharmacon pipeline: Adaptive LoRA + strict inventory matching + staff replay buffer.',
      cer: 'Not measured yet (Planned)',
      wer: 'Not measured yet (Planned)',
      medAcc: 'Not measured yet (Planned)',
      skuAcc: 'Not measured yet (Planned)',
      status: 'Full Production Spec',
    },
  ];

  const targetMetrics = [
    {
      name: 'Character Error Rate (CER)',
      description: 'Percentage of character-level insertions, deletions, and substitutions in raw cursive transcription.',
      target: 'Target < 6.0%',
    },
    {
      name: 'Word Error Rate (WER)',
      description: 'Word-level transcription discrepancy across clinical instructions and frequencies.',
      target: 'Target < 10.0%',
    },
    {
      name: 'Exact Medicine-Name Accuracy',
      description: 'Zero-tolerance metric requiring 100% exact drug name match before formulary lookups.',
      target: 'Target > 96.0%',
    },
    {
      name: 'Exact Strength & Dosage Accuracy',
      description: 'Correct extraction of numeric dosage (e.g. 500 mg, 10 ml) and dosage forms (Tablet, Capsule).',
      target: 'Target > 97.0%',
    },
    {
      name: 'Inventory SKU Mapping Accuracy',
      description: 'Direct mapping of validated medicine and strength to hospital pharmacy warehouse SKUs.',
      target: 'Target > 95.0%',
    },
    {
      name: 'Low-Confidence Abstention Rate',
      description: 'Safe fallback flagging any prediction with <90% confidence for mandatory human verification.',
      target: '100% human verification of flagged fields',
    },
    {
      name: 'Correction Time Reduction',
      description: 'Time saved by staff editing pre-filled forms compared to manual blank prescription re-typing.',
      target: 'Target > 60% time reduction',
    },
    {
      name: 'Improvement Per Doctor After Adaptation',
      description: 'Delta in accuracy for specific physician after ingesting 15+ calibration sheets.',
      target: 'Target > 15% CER reduction',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-brand-red" />
            Evaluation Methodology
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Planned Experimental Evaluation
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Rigorous 4-stage ablation methodology comparing generic OCR models against doctor-adapted and dictionary-constrained pipelines.
          </p>
        </div>
      </div>

      {/* Mandatory Honest Notice */}
      <BannerDemo
        title="ACADEMIC HONESTY: NO FABRICATED BENCHMARK DATA"
        message="The ML model is currently in training/planning. All performance columns below are explicitly marked 'Not measured yet'. We do not invent synthetic benchmark results."
      />

      {/* 4-Stage Ablation Table */}
      <div className="card-tactile overflow-hidden bg-white">
        <div className="p-5 bg-canvas-dark border-b-2 border-brand-dark flex items-center justify-between">
          <h3 className="font-bold text-base text-brand-dark">
            Ablation Study Architecture Matrix
          </h3>
          <span className="text-xs font-mono font-bold text-brand-dark/60">
            4 Experimental Configurations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas border-b-2 border-brand-dark/20 text-brand-dark font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Pipeline Configuration</th>
                <th className="py-3 px-4">CER</th>
                <th className="py-3 px-4">WER</th>
                <th className="py-3 px-4">Medicine Acc.</th>
                <th className="py-3 px-4">SKU Acc.</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/10">
              {comparisonStages.map((row) => (
                <tr key={row.stage} className="hover:bg-canvas/50">
                  <td className="py-4 px-4">
                    <div className="font-mono text-[10px] uppercase font-black text-brand-crimson">
                      {row.stage}
                    </div>
                    <div className="font-bold text-sm text-brand-dark">{row.name}</div>
                    <div className="text-[11px] text-brand-dark/65 font-medium mt-0.5 max-w-md">
                      {row.description}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs font-bold text-brand-dark/70">
                    {row.cer}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs font-bold text-brand-dark/70">
                    {row.wer}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs font-bold text-brand-dark/70">
                    {row.medAcc}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs font-bold text-brand-dark/70">
                    {row.skuAcc}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-block text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-canvas-dark border border-brand-dark text-brand-dark">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Metric Specifications */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold font-display text-brand-dark">
          Target Clinical &amp; Engineering Metrics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {targetMetrics.map((tm) => (
            <div
              key={tm.name}
              className="card-tactile p-5 bg-white flex flex-col justify-between space-y-3"
            >
              <div>
                <h4 className="font-bold text-sm text-brand-dark">{tm.name}</h4>
                <p className="text-xs text-brand-dark/75 leading-relaxed mt-1 font-medium">
                  {tm.description}
                </p>
              </div>
              <div className="pt-2 border-t border-brand-dark/10">
                <span className="inline-block text-[11px] font-mono font-bold text-emerald-800 bg-accent-mintLight px-2 py-0.5 rounded border border-emerald-400">
                  {tm.target}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
