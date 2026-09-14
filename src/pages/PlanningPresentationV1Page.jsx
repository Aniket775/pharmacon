import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Download,
  Shield,
  Layers,
  CheckCircle,
  Users,
  Sparkles,
  Cpu,
  Clock,
  Calendar,
  AlertTriangle,
  Play,
  Package,
} from 'lucide-react';

export default function PlanningPresentationV1Page() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState('slides'); // 'slides' | 'document'

  const slides = [
    {
      id: 1,
      tag: 'Introduction',
      title: 'Pharmacon Commitment Pitch',
      subtitle: 'Doctor-Adaptive Clinical Prescription Digitization & Formulary Engine',
      content: (
        <div className="space-y-6 text-center max-w-2xl mx-auto py-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-brand-dark bg-accent-gold text-brand-dark text-xs font-black uppercase shadow-tactile-sm">
            <Sparkles className="w-4 h-4 text-brand-red" />
            UCS503 Software Engineering Capstone
          </div>
          <h2 className="text-4xl sm:text-5xl font-black font-display text-brand-dark leading-tight">
            Connecting Handwritten Prescriptions to Connected Care
          </h2>
          <p className="text-base text-brand-dark/80 leading-relaxed font-medium">
            Bridging the gap between physician handwriting and pharmacy dispensing with few-shot writer calibration, human-in-the-loop review, and PostgreSQL inventory matching.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3 text-xs font-bold text-brand-dark/70">
            <span className="bg-canvas-dark px-3 py-1 rounded-lg border border-brand-dark/20">
              Aryan Sharma
            </span>
            <span className="bg-canvas-dark px-3 py-1 rounded-lg border border-brand-dark/20">
              Aniket Raj
            </span>
            <span className="bg-canvas-dark px-3 py-1 rounded-lg border border-brand-dark/20">
              Amitesh Kumar Singh
            </span>
            <span className="bg-canvas-dark px-3 py-1 rounded-lg border border-brand-dark/20">
              Chirag Lamba
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      tag: 'Problem Statement',
      title: 'The Clinical Transcription Bottleneck',
      subtitle: 'Why generic OCR fails in healthcare workflows',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-red-100 border-2 border-brand-red text-red-950 space-y-2">
              <h4 className="font-bold text-sm">Key Failure Modes of Current Approaches:</h4>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-red-900 leading-relaxed">
                <li><strong>Idiosyncratic Cursive:</strong> Every physician develops unique handwriting ligatures and shorthand that general vision models fail on.</li>
                <li><strong>High Risk of Hallucination:</strong> Generic LLMs fabricate drug dosages when text is ambiguous.</li>
                <li><strong>Manual Re-Entry Overhead:</strong> Pharmacy staff spend 4–8 minutes re-typing each paper prescription.</li>
              </ul>
            </div>
          </div>
          <div className="card-tactile p-6 bg-canvas-light space-y-3">
            <h4 className="font-bold text-base text-brand-dark">The Pharmacon Solution:</h4>
            <p className="text-xs text-brand-dark/80 leading-relaxed font-medium">
              Rather than attempting full unsupervised autonomy, Pharmacon creates an assisted workflow: <strong>One photo → One review screen → One human verification</strong>, backed by doctor-specific LoRA adapters and strict dictionary constraints.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      tag: 'Architecture',
      title: '5-Stage Clinical Pipeline',
      subtitle: 'From physical prescription to pharmacy inventory synchronization',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border-2 border-brand-dark bg-accent-goldLight space-y-2">
            <span className="text-xs font-black text-brand-crimson">STAGE 1 &amp; 2</span>
            <h4 className="font-bold text-sm">Capture &amp; Doctor Adaptation</h4>
            <p className="text-xs text-brand-dark/75">Line segmentation followed by doctor-adapted CNN-Transformer character extraction.</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-brand-dark bg-accent-mintLight space-y-2">
            <span className="text-xs font-black text-emerald-800">STAGE 3</span>
            <h4 className="font-bold text-sm">Human Review &amp; Safety</h4>
            <p className="text-xs text-brand-dark/75">Confidence-aware highlighting. Clinician verifies or corrects ambiguous fields.</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-brand-dark bg-accent-purpleLight space-y-2">
            <span className="text-xs font-black text-purple-900">STAGE 4 &amp; 5</span>
            <h4 className="font-bold text-sm">Formulary Match &amp; Sync</h4>
            <p className="text-xs text-brand-dark/75">Matching SKU against real-time hospital inventory and updating patient schedule.</p>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      tag: 'Roles & RBAC',
      title: 'Multi-Role Clinical Access',
      subtitle: 'Row Level Security protecting patient data and operations',
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-xl border-2 border-brand-dark bg-white space-y-1">
            <span className="text-xs font-extrabold text-brand-red uppercase">Doctor</span>
            <p className="text-xs text-brand-dark/75">Uploads prescriptions, tracks calibration samples, views active patient queue.</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-brand-dark bg-white space-y-1">
            <span className="text-xs font-extrabold text-amber-700 uppercase">Clinic Staff</span>
            <p className="text-xs text-brand-dark/75">Reviews AI predictions, verifies low-confidence fields, confirms orders.</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-brand-dark bg-white space-y-1">
            <span className="text-xs font-extrabold text-emerald-700 uppercase">Pharmacist</span>
            <p className="text-xs text-brand-dark/75">Manages formulary inventory stock, reorder thresholds, and processes refills.</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-brand-dark bg-white space-y-1">
            <span className="text-xs font-extrabold text-blue-700 uppercase">Patient</span>
            <p className="text-xs text-brand-dark/75">Views active medication schedule, dosage instructions, and requests refills.</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-brand-dark bg-white space-y-1">
            <span className="text-xs font-extrabold text-purple-700 uppercase">Admin / Reviewer</span>
            <p className="text-xs text-brand-dark/75">Full audit trail oversight, team profile management, and release publishing.</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-brand-dark bg-accent-goldLight space-y-1">
            <span className="text-xs font-extrabold text-brand-dark uppercase">Security</span>
            <p className="text-xs text-brand-dark/75">Supabase RLS policies enforce role permissions at the database level.</p>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      tag: 'Evaluation',
      title: 'Planned Experimental Evaluation',
      subtitle: 'Comparing Generic vs Adapted vs Constrained models',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-canvas border border-brand-dark/20 rounded-xl">
              <div className="font-black text-xs text-brand-dark/60">Stage 1</div>
              <div className="font-bold text-xs">Generic Base</div>
              <div className="text-[10px] text-brand-dark/50 mt-1">Baseline TrOCR</div>
            </div>
            <div className="p-3 bg-canvas border border-brand-dark/20 rounded-xl">
              <div className="font-black text-xs text-brand-dark/60">Stage 2</div>
              <div className="font-bold text-xs">Base + Dictionary</div>
              <div className="text-[10px] text-brand-dark/50 mt-1">Formulary Filter</div>
            </div>
            <div className="p-3 bg-canvas border border-brand-dark/20 rounded-xl">
              <div className="font-black text-xs text-brand-dark/60">Stage 3</div>
              <div className="font-bold text-xs">Doctor-Adapted</div>
              <div className="text-[10px] text-brand-dark/50 mt-1">LoRA Fine-Tuned</div>
            </div>
            <div className="p-3 bg-accent-mintLight border border-emerald-400 rounded-xl">
              <div className="font-black text-xs text-emerald-800">Stage 4</div>
              <div className="font-bold text-xs">Adapted + Dict + CL</div>
              <div className="text-[10px] text-emerald-700 mt-1">Full Pharmacon</div>
            </div>
          </div>
          <p className="text-xs text-center text-brand-dark/60 font-semibold">
            Planned Metrics: Character Error Rate (CER), Word Error Rate (WER), Medicine Exact-Match Accuracy, Formulary SKU Mapping Accuracy.
          </p>
        </div>
      ),
    },
  ];

  const totalSlides = slides.length;
  const current = slides[currentSlide];

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-brand-dark/10">
        <div className="flex items-center gap-3">
          <Link
            to="/presentations"
            className="btn-tactile-white px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Decks
          </Link>
          <span className="font-display font-black text-lg text-brand-dark">
            Planning Presentation V1
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl border-2 border-brand-dark p-1 bg-white">
            <button
              onClick={() => setViewMode('slides')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'slides' ? 'bg-brand-dark text-white' : 'text-brand-dark'
              }`}
            >
              Slide Mode
            </button>
            <button
              onClick={() => setViewMode('document')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'document' ? 'bg-brand-dark text-white' : 'text-brand-dark'
              }`}
            >
              Doc View
            </button>
          </div>

          <a
            href="./presentations/Pharmacon_Commitment_Pitch.pptx"
            download
            className="btn-tactile-red px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-tactile-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download PPTX
          </a>
        </div>
      </div>

      {/* Slide View Mode */}
      {viewMode === 'slides' ? (
        <div className="space-y-6">
          {/* Main Slide Card */}
          <div className="card-tactile min-h-[420px] p-8 sm:p-12 bg-white flex flex-col justify-between relative overflow-hidden">
            {/* Slide Header */}
            <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-4 mb-6">
              <span className="text-xs font-black uppercase tracking-wider text-brand-crimson bg-brand-pink/15 px-3 py-1 rounded-full border border-brand-pink/30">
                {current.tag}
              </span>
              <span className="text-xs font-mono font-bold text-brand-dark/50">
                Slide {currentSlide + 1} of {totalSlides}
              </span>
            </div>

            {/* Slide Body */}
            <div className="my-auto">{current.content}</div>

            {/* Slide Footer */}
            <div className="flex items-center justify-between pt-6 border-t-2 border-brand-dark/10 text-xs text-brand-dark/50 font-bold">
              <span>Pharmacon • UCS503 Software Engineering</span>
              <span>Team Pharmacon</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-brand-dark shadow-tactile-sm">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="btn-tactile-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Slide
            </button>

            {/* Slide Dots */}
            <div className="flex items-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full border-2 border-brand-dark transition-all ${
                    currentSlide === idx ? 'bg-brand-red w-6' : 'bg-canvas'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))}
              disabled={currentSlide === totalSlides - 1}
              className="btn-tactile-red px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 disabled:opacity-40"
            >
              Next Slide
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Document View Mode */
        <div className="space-y-6">
          {slides.map((s, idx) => (
            <div key={s.id} className="card-tactile p-6 sm:p-8 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-brand-dark/10 pb-3">
                <span className="text-xs font-black uppercase text-brand-crimson">
                  Slide {idx + 1}: {s.tag}
                </span>
                <h3 className="font-bold text-base text-brand-dark">{s.title}</h3>
              </div>
              <div>{s.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
