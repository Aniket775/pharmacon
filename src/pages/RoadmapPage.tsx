import { CheckCircle2, Circle, ClipboardCheck, FileText, Users } from 'lucide-react';

const phases = [
  { title: 'Phase 0 · Writer recruitment & baseline', detail: 'Recruit participating medical practitioners, collect three paper calibration sheets per writer, and establish a generic-model baseline.', status: 'now' },
  { title: 'Phase 1 · Adaptation proof of concept', detail: 'Test whether doctor-adapted recognition outperforms the generic model on held-out prescription samples.', status: 'next' },
  { title: 'Phase 2 · Field extraction & correction loop', detail: 'Extract medicine, dose and timing; route uncertainty to staff review; retain verified corrections for learning.', status: 'planned' },
  { title: 'Phase 3 · Inventory mapping', detail: 'Connect confirmed medicines to formulary stock through a documented adapter/API.', status: 'planned' },
  { title: 'Phase 4 · Multi-tenant clinic platform', detail: 'Add clinic-level separation, role-based workflows and patient records.', status: 'planned' },
  { title: 'Phase 5 · Patient experience', detail: 'Provide prescription history, schedules, refill requests and caregiver-aware views.', status: 'planned' },
  { title: 'Phase 6 · Evaluation & hardening', detail: 'Report results, complete end-to-end testing and harden the workflow for demonstration.', status: 'planned' },
];

export default function RoadmapPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">Revised Scope & Roadmap</h1>
      <p className="page-subtitle">A staged plan focused first on reliable, doctor-adaptive handwriting recognition.</p>

      <div className="max-w-4xl space-y-10">
        <section className="animate-in">
          <h2 className="section-heading">Commitment for the Next Stage</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: Users, title: 'Real writers', desc: 'Recruit medical practitioners and collect paper samples from the start.' },
              { icon: ClipboardCheck, title: 'Human safety check', desc: 'Any uncertain field stays with staff until it is confirmed.' },
              { icon: FileText, title: 'Measured results', desc: 'Compare generic and adapted recognition on held-out samples.' },
            ].map((item) => (
              <div key={item.title} className="card p-4">
                <item.icon className="w-4 h-4 text-primary-500 mb-3" />
                <h3 className="text-sm font-medium text-slate-800 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="animate-in-delay-1">
          <h2 className="section-heading">Delivery Plan</h2>
          <div className="card divide-y divide-slate-100">
            {phases.map((phase, index) => (
              <div key={phase.title} className="px-5 py-4 flex gap-4">
                {phase.status === 'now' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 mt-0.5 shrink-0" />}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-slate-800">{phase.title}</h3>
                    {index === 0 && <span className="badge-green">Current focus</span>}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{phase.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="animate-in-delay-2">
          <h2 className="section-heading">Guidance Needed</h2>
          <div className="card p-5">
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>Approval to proceed with the revised handwriting-recognition scope.</li>
              <li>Confirmation that participating medical practitioners are valid handwriting contributors.</li>
              <li>Guidance on the minimum number of writers expected for evaluation.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
