import { Info, AlertTriangle } from 'lucide-react';

export default function ProjectPage() {
  return (
    <div className="page-container">
      <div className="prototype-banner mb-4">
        <Info className="w-3.5 h-3.5" />
        <span>Current Direction · Under Evaluation</span>
      </div>
      <h1 className="page-title">Project Overview</h1>
      <p className="page-subtitle">Understanding the Pharmacon concept and current engineering direction.</p>

      <div className="space-y-8 max-w-3xl">
        {/* Overview */}
        <section className="animate-in">
          <h2 className="section-heading">What is Pharmacon?</h2>
          <div className="card p-5 space-y-3">
            <p className="text-sm text-slate-600 leading-relaxed">
              Pharmacon is a <strong>proposed platform</strong> for digitising handwritten medical prescriptions 
              and connecting clinics, pharmacies and patients through a verified digital workflow.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              The core idea is to use AI-assisted handwriting recognition — with human verification — to convert 
              paper prescriptions into structured digital records, match them against a formulary/inventory system, 
              and provide patients with a clear view of their confirmed prescriptions and medicine schedules.
            </p>
          </div>
        </section>

        {/* Current Direction */}
        <section className="animate-in-delay-1">
          <h2 className="section-heading">Current Direction</h2>
          <div className="card p-5">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Based on our professor's guidance, we are currently exploring the following areas:
            </p>
            <ul className="space-y-2.5">
              {[
                'Reliable digitisation of handwritten prescriptions using computer vision',
                'Doctor-specific handwriting adaptation to improve recognition accuracy',
                'Formulary and inventory integration for medicine matching',
                'Patient dashboard for viewing confirmed prescriptions and schedules',
                'Confidence-aware review workflow with human verification',
                'Audit trail and role-based access for accountability',
              ].map((item, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Scope Notice */}
        <section className="animate-in-delay-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">Scope Under Evaluation</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                The exact final scope of Pharmacon is still being evaluated by our team. The information 
                presented here reflects our current direction, which may be refined as we progress. 
                No production deployment or clinical validation is claimed.
              </p>
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="animate-in-delay-3">
          <h2 className="section-heading">Why We Are Building It</h2>
          <div className="card p-5 space-y-3">
            <p className="text-sm text-slate-600 leading-relaxed">
              In many clinical settings, doctors still write prescriptions by hand. Clinic and pharmacy staff 
              then need to interpret and manually digitise these prescriptions — a process that can introduce 
              errors, delays and disconnected records.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pharmacon proposes to reduce this manual burden by providing an AI-assisted extraction step 
              with human verification, connecting the digitised prescription to formulary/inventory systems, 
              and giving patients visibility into their confirmed prescriptions.
            </p>
          </div>
        </section>

        {/* Core Idea */}
        <section>
          <h2 className="section-heading">Core Idea</h2>
          <div className="card p-5">
            <p className="text-sm text-slate-600 leading-relaxed italic">
              "One photo → one review screen → one confirmation — instead of full manual transcription."
            </p>
          </div>
        </section>

        {/* Users */}
        <section>
          <h2 className="section-heading">Proposed Users</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { user: 'Doctors', desc: 'Write prescriptions; optionally calibrate handwriting' },
              { user: 'Clinic Staff', desc: 'Review AI-extracted prescriptions; confirm or correct' },
              { user: 'Pharmacists', desc: 'Manage inventory; confirm dispensing' },
              { user: 'Patients', desc: 'View confirmed prescriptions and medicine schedule' },
              { user: 'Administrators', desc: 'Manage users, clinics and system configuration' },
            ].map((item, i) => (
              <div key={i} className="card p-4">
                <div className="text-sm font-medium text-slate-800 mb-1">{item.user}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Engineering Work */}
        <section>
          <h2 className="section-heading">Expected Engineering Work</h2>
          <div className="card divide-y divide-slate-100">
            {[
              { area: 'Frontend', desc: 'React web application with role-based portals' },
              { area: 'Backend', desc: 'Node.js API with modular service architecture' },
              { area: 'AI / CV', desc: 'Handwriting recognition with doctor-specific adaptation' },
              { area: 'Integration', desc: 'Formulary/inventory adapter and matching service' },
              { area: 'Database', desc: 'Prescription, patient and audit data storage' },
              { area: 'Evaluation', desc: 'Systematic comparison of recognition approaches' },
            ].map((item, i) => (
              <div key={i} className="px-5 py-3 flex gap-4">
                <span className="text-sm font-medium text-slate-700 w-24 flex-shrink-0">{item.area}</span>
                <span className="text-sm text-slate-500">{item.desc}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
