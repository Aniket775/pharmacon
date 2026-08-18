import { ArrowDown, ArrowRight, Info } from 'lucide-react';

const manualSteps = [
  'Doctor writes prescription',
  'Staff interprets handwriting',
  'Manual data entry',
  'Inventory checked separately',
  'Prescription stored',
  'Patient manages medicines separately',
];

const proposedSteps = [
  'Prescription image',
  'AI-assisted extraction',
  'Confidence-aware review',
  'Formulary / inventory matching',
  'Human confirmation',
  'Digital prescription',
  'Patient dashboard',
];

const architectureComponents = [
  { label: 'Doctor', level: 0 },
  { label: 'Prescription Image', level: 1 },
  { label: 'Handwriting Recognition / CV Layer', level: 2 },
  { label: 'Structured Extraction', level: 3 },
  { label: 'Confidence & Verification', level: 4 },
  { label: 'Formulary / Inventory Adapter', level: 5 },
  { label: 'Prescription Service', level: 6 },
  { label: 'Database', level: 7 },
];

const portals = ['Clinic Portal', 'Pharmacy Portal', 'Patient Portal'];

const crossCutting = ['Authentication', 'Role-Based Access', 'Audit Logs', 'Evaluation Module'];

export default function ProposedSystemPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">Proposed System</h1>
      <p className="page-subtitle">Workflow comparison, architecture and system components.</p>

      <div className="max-w-5xl space-y-12">
        {/* Workflow Comparison */}
        <section className="animate-in">
          <h2 className="section-heading">What We Plan to Do Better</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Manual */}
            <div className="card p-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Current / Manual Workflow</div>
              <div className="space-y-0">
                {manualSteps.map((step, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 py-2 px-3 rounded bg-slate-50 border border-slate-100">
                      <span className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-500">{i + 1}</span>
                      <span className="text-sm text-slate-600">{step}</span>
                    </div>
                    {i < manualSteps.length - 1 && (
                      <div className="flex justify-center py-1 text-slate-300">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Proposed */}
            <div className="card p-5 border-primary-200 bg-primary-50/30">
              <div className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-4">Proposed Pharmacon Workflow</div>
              <div className="space-y-0">
                {proposedSteps.map((step, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 py-2 px-3 rounded bg-white border border-primary-100">
                      <span className="w-5 h-5 rounded bg-primary-100 flex items-center justify-center text-[10px] font-semibold text-primary-600">{i + 1}</span>
                      <span className="text-sm text-slate-700 font-medium">{step}</span>
                    </div>
                    {i < proposedSteps.length - 1 && (
                      <div className="flex justify-center py-1 text-primary-300">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-4 mt-4 bg-slate-50">
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>The proposed improvement is not simply OCR.</strong> The intended system connects recognition, 
              verification, inventory integration, prescription records and patient access into one workflow.
            </p>
          </div>
        </section>

        {/* Architecture */}
        <section className="animate-in-delay-1">
          <h2 className="section-heading">Proposed System Architecture</h2>
          <div className="card p-6">
            {/* Main pipeline */}
            <div className="max-w-sm mx-auto mb-6">
              {architectureComponents.map((comp, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 py-2 px-4 rounded-md bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">{comp.label}</span>
                  </div>
                  {i < architectureComponents.length - 1 && (
                    <div className="flex justify-center py-1 text-slate-300">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Portals fan-out */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
              {portals.map((portal, i) => (
                <div key={i} className="py-2 px-3 rounded-md bg-primary-50 border border-primary-200 text-center">
                  <span className="text-xs font-medium text-primary-700">{portal}</span>
                </div>
              ))}
            </div>

            {/* Cross-cutting */}
            <div className="border-t border-slate-100 pt-4">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">Cross-Cutting Concerns</div>
              <div className="flex flex-wrap justify-center gap-2">
                {crossCutting.map((item, i) => (
                  <span key={i} className="badge-slate">{item}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Modular Design</div>
              <p className="text-sm text-slate-500">The handwriting component is replaceable. The inventory system is represented as an API/adapter.</p>
            </div>
            <div className="card p-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Flexible Scope</div>
              <p className="text-sm text-slate-500">Components can be added, removed or swapped as the project scope evolves during the semester.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
