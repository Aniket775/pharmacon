import { ArrowDown, Info, User } from 'lucide-react';

const calibrationCategories = [
  { name: 'Characters', samples: '26 uppercase + 26 lowercase', count: 52 },
  { name: 'Numerals', samples: '0–9', count: 10 },
  { name: 'Medical Abbreviations', samples: 'Tab, Cap, Inj, Syr, etc.', count: 15 },
  { name: 'Dosage Patterns', samples: '1-0-1, 1-1-1, SOS, etc.', count: 12 },
  { name: 'Formulary Medicines', samples: 'Top 50 medicines from formulary', count: 50 },
];

const adaptationSteps = [
  'Generic Model',
  'Doctor Calibration Samples',
  'Doctor-Specific Adaptation',
  'Held-Out Evaluation',
];

export default function DoctorAdaptationPage() {
  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="page-title">Doctor Handwriting Adaptation</h1>
        <div className="prototype-banner">
          <Info className="w-3.5 h-3.5" />
          <span>Proposed Approach · Prototype</span>
        </div>
      </div>
      <p className="page-subtitle">Investigating whether doctor-specific calibration improves recognition.</p>

      <div className="max-w-4xl space-y-10">
        {/* Doctor Profile */}
        <section className="animate-in">
          <h2 className="section-heading">Sample Doctor Profile</h2>
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">Dr. A. Sharma</div>
                <div className="text-xs text-slate-500">General Practitioner</div>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <div className="stat-card">
                <div className="stat-value">24</div>
                <div className="stat-label">Calibration Samples</div>
              </div>
              <div className="stat-card">
                <span className="badge-yellow">Prototype</span>
                <div className="stat-label mt-1">Calibration Status</div>
              </div>
              <div className="stat-card">
                <div className="stat-value text-lg">—</div>
                <div className="stat-label">Evaluation Pending</div>
              </div>
            </div>
          </div>
        </section>

        {/* Calibration Categories */}
        <section className="animate-in-delay-1">
          <h2 className="section-heading">Calibration Sample Categories</h2>
          <div className="card divide-y divide-slate-100">
            {calibrationCategories.map((cat, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-700">{cat.name}</div>
                  <div className="text-xs text-slate-500">{cat.samples}</div>
                </div>
                <span className="text-sm font-medium text-slate-600">{cat.count} samples</span>
              </div>
            ))}
          </div>
        </section>

        {/* Adaptation Workflow */}
        <section className="animate-in-delay-2">
          <h2 className="section-heading">Adaptation Workflow</h2>
          <div className="card p-5">
            <div className="max-w-xs mx-auto">
              {adaptationSteps.map((step, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 py-2 px-3 rounded bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded bg-primary-100 flex items-center justify-center text-[10px] font-semibold text-primary-600">{i + 1}</span>
                    <span className="text-sm text-slate-700">{step}</span>
                  </div>
                  {i < adaptationSteps.length - 1 && (
                    <div className="flex justify-center py-1 text-slate-300">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Explanation */}
        <div className="card p-5 bg-slate-50">
          <p className="text-sm text-slate-600 leading-relaxed">
            "Different doctors have different handwriting styles. The proposed system will investigate whether 
            doctor-specific calibration improves recognition. This is a research question — results depend on 
            the quality and quantity of calibration samples and the underlying recognition model."
          </p>
        </div>
      </div>
    </div>
  );
}
