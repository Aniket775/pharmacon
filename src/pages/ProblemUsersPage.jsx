import React from 'react';
import { Users, AlertTriangle, CheckCircle2, Stethoscope, UserCheck, Pill, HeartHandshake } from 'lucide-react';

export default function ProblemUsersPage() {
  const personas = [
    {
      role: 'Physician / Doctor',
      icon: Stethoscope,
      color: 'bg-brand-pink/20',
      textColor: 'text-brand-crimson',
      painPoints: [
        'Writing speed constraints prevent slow, block-letter manuscript entry during busy OPDs.',
        'Electronic Health Record (EHR) typing degrades patient-doctor eye contact and rapport.',
        'High administrative burden trying to re-explain illegible notes to staff later.',
      ],
      solution: 'Doctor continues writing naturally on paper or digital pad; Pharmacon adapts to their specific handwriting style with few-shot calibration.',
    },
    {
      role: 'Clinic Staff / Nurse',
      icon: UserCheck,
      color: 'bg-accent-goldLight',
      textColor: 'text-amber-900',
      painPoints: [
        'Spending 4–8 minutes deciphering and re-typing handwritten prescriptions into billing systems.',
        'Fear of liability from misinterpreting dosage frequencies or look-alike drug names.',
        'Repeatedly interrupting doctors to clarify ambiguous cursive lines.',
      ],
      solution: 'Assisted verification interface pre-fills extracted tokens and highlights only low-confidence fields for instant 30-second review.',
    },
    {
      role: 'Hospital Pharmacist',
      icon: Pill,
      color: 'bg-accent-mintLight',
      textColor: 'text-emerald-900',
      painPoints: [
        'Dispensing errors resulting from similar-sounding generic drug abbreviations.',
        'Manual inventory reconciliation and stockouts when unrecorded medicines are handed out.',
        'Refill request confusion without clear dosage history.',
      ],
      solution: 'Direct matching against hospital formulary SKUs with atomic stock reservation and verified refill request approval queues.',
    },
    {
      role: 'Patient / Caregiver',
      icon: HeartHandshake,
      color: 'bg-accent-purpleLight',
      textColor: 'text-purple-900',
      painPoints: [
        'Misreading complex dosage instructions (e.g. 1-0-1 vs 1-1-0) after leaving the clinic.',
        'Losing physical paper prescription slips before subsequent refill cycles.',
        'Waiting in long pharmacy queues for manual prescription transcription.',
      ],
      solution: 'Clean patient dashboard with personalized medication schedules, dosage instructions, and 1-click refill requests.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <Users className="w-3.5 h-3.5 text-brand-red" />
            Clinical Stakeholders
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Problem Statement &amp; User Personas
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Understanding the real-world healthcare bottlenecks across physicians, clinic staff, pharmacists, and patients.
          </p>
        </div>
      </div>

      {/* Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {personas.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.role}
              className="card-tactile p-6 bg-white flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-transform"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl border-2 border-brand-dark ${p.color} ${p.textColor} shadow-tactile-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-brand-dark">
                    {p.role}
                  </h3>
                </div>

                {/* Pain Points */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-brand-red flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Clinical Pain Points:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-brand-dark/80 font-medium">
                    {p.painPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-brand-red font-black">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Solution */}
              <div className="pt-4 border-t-2 border-brand-dark/10 bg-canvas p-3.5 rounded-xl border border-brand-dark/20 space-y-1">
                <h4 className="text-[11px] font-black uppercase text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pharmacon Impact:
                </h4>
                <p className="text-xs text-brand-dark/85 leading-relaxed font-semibold">
                  {p.solution}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
