import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  UploadCloud,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import BannerDemo from '../components/BannerDemo';

export default function DoctorAdaptationPage() {
  const [selectedDoctor, setSelectedDoctor] = useState('DR-001');
  const [calibrationCount, setCalibrationCount] = useState(14);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const doctors = [
    {
      id: 'DR-001',
      name: 'Dr. A. Sharma',
      specialty: 'Cardiology',
      calibrationSamples: calibrationCount,
      targetSamples: 20,
      status: 'Calibration in Progress',
      writingStyle: 'Rapid cursive, connected ligatures, abbreviations',
    },
    {
      id: 'DR-002',
      name: 'Dr. R. Gupta',
      specialty: 'Internal Medicine',
      calibrationSamples: 20,
      targetSamples: 20,
      status: 'Calibrated (Ready for Evaluation)',
      writingStyle: 'Slanted script, compact dosage notations',
    },
    {
      id: 'DR-003',
      name: 'Dr. P. Varma',
      specialty: 'Pediatrics',
      calibrationSamples: 6,
      targetSamples: 20,
      status: 'Initial Calibration',
      writingStyle: 'Spaced cursive with metric notations',
    },
  ];

  const handleSimulateCalibration = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setCalibrationCount((prev) => Math.min(20, prev + 2));
      setIsCalibrating(false);
    }, 600);
  };

  const activeDoc = doctors.find((d) => d.id === selectedDoctor) || doctors[0];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <Cpu className="w-3.5 h-3.5 text-brand-red" />
            Adaptive ML Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Doctor Handwriting Adaptation
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Few-shot calibration pipeline adapting base OCR vision models to individual physician handwriting styles.
          </p>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <BannerDemo
        title="ML ARCHITECTURE: DEMONSTRATION &amp; PLANNING"
        message="The deep-learning doctor adaptation model (CNN-Transformer + LoRA adapters) is currently in training/planning. Metrics below represent the planned experimental methodology — no fabricated benchmark numbers are claimed."
      />

      {/* 4-Stage Adaptation Pipeline Visualization */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display text-brand-dark">
          Adaptation Pipeline Architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-tactile p-5 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-brand-dark/40">STAGE 1</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-canvas border border-brand-dark/20">
                Base
              </span>
            </div>
            <h3 className="font-bold text-sm text-brand-dark">1. Generic Base Model</h3>
            <p className="text-xs text-brand-dark/75 leading-relaxed">
              TrOCR / CNN-Transformer trained on general handwritten corpora (IAM dataset, synthesized scripts).
            </p>
          </div>

          <div className="card-tactile p-5 bg-accent-goldLight space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-brand-dark/40">STAGE 2</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-accent-gold border border-brand-dark">
                Calibration
              </span>
            </div>
            <h3 className="font-bold text-sm text-brand-dark">2. Doctor Calibration</h3>
            <p className="text-xs text-brand-dark/75 leading-relaxed">
              Physician uploads 15-20 paired sample prescriptions during clinic onboarding to isolate pen strokes.
            </p>
          </div>

          <div className="card-tactile p-5 bg-accent-mintLight space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-brand-dark/40">STAGE 3</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-accent-mint border border-brand-dark">
                Few-Shot LoRA
              </span>
            </div>
            <h3 className="font-bold text-sm text-brand-dark">3. Style Adapter Weights</h3>
            <p className="text-xs text-brand-dark/75 leading-relaxed">
              Lightweight low-rank adapter (LoRA) fine-tunes attention heads without modifying the frozen base encoder.
            </p>
          </div>

          <div className="card-tactile p-5 bg-accent-purpleLight space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-brand-dark/40">STAGE 4</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-accent-purple border border-brand-dark">
                Continuous
              </span>
            </div>
            <h3 className="font-bold text-sm text-brand-dark">4. Correction Learning</h3>
            <p className="text-xs text-brand-dark/75 leading-relaxed">
              Human staff corrections during verification feed back into doctor-specific replay buffers for online refinement.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Doctor Calibration Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Doctor Selection */}
        <div className="lg:col-span-5 card-tactile p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-3">
            <h3 className="font-bold text-base text-brand-dark flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-brand-red" />
              Doctor Calibration Profiles
            </h3>
            <span className="text-xs font-mono font-bold text-brand-dark/60">3 Registered</span>
          </div>

          <div className="space-y-3">
            {doctors.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoctor(doc.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-2 ${
                  selectedDoctor === doc.id
                    ? 'bg-accent-goldLight border-brand-dark shadow-tactile-sm'
                    : 'bg-white border-brand-dark/20 hover:bg-canvas'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-brand-dark">{doc.name}</h4>
                    <span className="text-xs text-brand-dark/60 font-semibold">{doc.specialty}</span>
                  </div>
                  <span className="text-xs font-mono font-bold">{doc.id}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-brand-dark/70">
                    <span>Calibration Progress:</span>
                    <span>{doc.calibrationSamples}/{doc.targetSamples} Samples</span>
                  </div>
                  <div className="w-full bg-brand-dark/10 h-2.5 rounded-full overflow-hidden border border-brand-dark/20">
                    <div
                      className="bg-brand-red h-full rounded-full transition-all"
                      style={{ width: `${(doc.calibrationSamples / doc.targetSamples) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Doctor Adaptation Details */}
        <div className="lg:col-span-7 card-tactile p-6 bg-white space-y-6">
          <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-3">
            <div>
              <h3 className="font-bold text-lg text-brand-dark">{activeDoc.name}</h3>
              <p className="text-xs text-brand-dark/60 font-medium">
                {activeDoc.specialty} • Writing Profile Analysis
              </p>
            </div>
            <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-accent-goldLight text-amber-900 border border-amber-400">
              {activeDoc.status}
            </span>
          </div>

          <div className="bg-canvas p-4 rounded-2xl border-2 border-brand-dark/20 space-y-3 text-xs">
            <div>
              <span className="font-black uppercase text-brand-dark/60">Stylistic Characteristics:</span>
              <p className="font-bold text-brand-dark mt-0.5">{activeDoc.writingStyle}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-brand-dark/10">
              <div>
                <span className="text-brand-dark/60 font-semibold">Base Model Accuracy:</span>
                <div className="font-bold text-brand-dark">Baseline (Generic)</div>
              </div>
              <div>
                <span className="text-brand-dark/60 font-semibold">Adapted Adapter Status:</span>
                <div className="font-bold text-emerald-800">
                  {activeDoc.calibrationSamples >= 15 ? 'Active (LoRA Attached)' : 'Awaiting 15+ Samples'}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive simulator button */}
          <div className="p-4 rounded-2xl border-2 border-dashed border-brand-dark/30 bg-canvas-light text-center space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-brand-dark">
              Simulate Calibration Sample Ingestion
            </h4>
            <p className="text-xs text-brand-dark/70 max-w-sm mx-auto">
              Simulate uploading handwritten prescription calibration sheets for {activeDoc.name}.
            </p>
            <button
              onClick={handleSimulateCalibration}
              disabled={isCalibrating || activeDoc.calibrationSamples >= 20}
              className="btn-tactile-red px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              {isCalibrating
                ? 'Processing Sample...'
                : activeDoc.calibrationSamples >= 20
                ? 'Calibration Complete (20/20)'
                : 'Upload 2 Calibration Samples'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
