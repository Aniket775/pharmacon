import { AlertTriangle, CheckCircle, Info, Shield } from 'lucide-react';
import { risks } from '../data/mockData';

const techFeasibility = [
  { area: 'Web application', status: 'feasible', note: 'React + Node.js — well-established stack' },
  { area: 'Computer vision / handwriting recognition', status: 'research', note: 'Active research area; accuracy depends on calibration' },
  { area: 'API architecture', status: 'feasible', note: 'RESTful services with modular adapters' },
  { area: 'Database', status: 'feasible', note: 'SQLite for prototype; PostgreSQL for production' },
  { area: 'Role-based access', status: 'feasible', note: 'Standard authentication and authorization patterns' },
];

export default function FeasibilityPage() {
  const impactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'badge-red';
      case 'medium': return 'badge-yellow';
      case 'low': return 'badge-green';
      default: return 'badge-slate';
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Feasibility & Risk</h1>
      <p className="page-subtitle">Technical feasibility assessment and risk register.</p>

      <div className="max-w-4xl space-y-10">
        {/* Technical Feasibility */}
        <section className="animate-in">
          <h2 className="section-heading">Technical Feasibility</h2>
          <div className="card divide-y divide-slate-100">
            {techFeasibility.map((item, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">{item.area}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.note}</div>
                </div>
                <span className={item.status === 'feasible' ? 'badge-green' : 'badge-yellow'}>
                  {item.status === 'feasible' ? 'Feasible' : 'Requires Research'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Data Feasibility */}
        <section className="animate-in-delay-1">
          <h2 className="section-heading">Data Feasibility</h2>
          <div className="card p-5">
            <div className="flex gap-3 items-start">
              <Info className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-600 leading-relaxed">
                Appropriate handwritten prescription samples and participating writers will be required for training, 
                calibration and evaluation. The first operational priority is recruiting practitioners willing to provide 
                three calibration sheets. Held-out paper scans should be collected from every participating writer to 
                enable fair evaluation of doctor-specific adaptation.
              </p>
            </div>
          </div>
        </section>

        {/* Risk Register */}
        <section className="animate-in-delay-2">
          <h2 className="section-heading">Risk Register</h2>
          <div className="space-y-3">
            {risks.map((risk) => (
              <div key={risk.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{risk.id}</span>
                    <span className="text-sm font-medium text-slate-800">{risk.risk}</span>
                  </div>
                  <span className={impactColor(risk.impact)}>
                    {risk.impact} impact
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Mitigation</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{risk.mitigation}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Fallback</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{risk.fallback}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Safety Boundary */}
        <section className="animate-in-delay-3">
          <div className="card p-5 border-slate-300 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-700">Safety Boundary</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pharmacon is intended to digitise and connect confirmed prescriptions. It does not diagnose conditions, 
              recommend medicines, substitute medicines, change dosages, or override professional clinical judgement.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
