import { Info, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { evaluationData } from '../data/mockData';

const metricDescriptions = [
  { metric: 'Character Error Rate (CER)', desc: 'Percentage of characters incorrectly recognised' },
  { metric: 'Word Error Rate (WER)', desc: 'Percentage of words incorrectly recognised' },
  { metric: 'Medicine Name Accuracy', desc: 'Percentage of medicine names correctly extracted' },
  { metric: 'Strength/Dosage Accuracy', desc: 'Percentage of strength values correctly extracted' },
  { metric: 'Inventory SKU Mapping Accuracy', desc: 'Percentage of prescriptions correctly mapped to formulary SKUs' },
  { metric: 'Low-Confidence Abstention', desc: 'Rate at which the system correctly flags uncertain fields' },
  { metric: 'Correction Time', desc: 'Average time for staff to verify/correct a flagged field' },
  { metric: 'Improvement after Adaptation', desc: 'Delta improvement from generic to doctor-adapted model' },
];

const chartData = evaluationData.versions.map(v => ({
  name: v.name,
  CER: v.cer,
  WER: v.wer,
  'Medicine Acc.': v.medicineAcc,
  'Strength Acc.': v.strengthAcc,
  'SKU Acc.': v.skuAcc,
}));

const evaluationProcess = [
  'Calibration Samples',
  'Doctor Adaptation',
  'Held-Out Samples',
  'Evaluation',
  'Comparison',
];

export default function EvaluationPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">Evaluation</h1>
      <p className="page-subtitle">Proposed evaluation methodology and illustrative results.</p>

      <div className="max-w-5xl space-y-10">
        {/* Disclaimer */}
        <div className="prototype-banner animate-in">
          <Info className="w-3.5 h-3.5" />
          <span>{evaluationData.disclaimer}</span>
        </div>

        {/* System Versions */}
        <section className="animate-in">
          <h2 className="section-heading">Proposed System Versions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { v: 'V1', title: 'Generic', desc: 'Generic handwriting recognition model' },
              { v: 'V2', title: 'Generic + Dict', desc: 'Generic model + formulary/medicine dictionary constraints' },
              { v: 'V3', title: 'Adapted', desc: 'Doctor-adapted model using calibration samples' },
              { v: 'V4', title: 'Adapted + Dict + CL', desc: 'Doctor-adapted model + formulary constraints + correction-based learning' },
            ].map((item, i) => (
              <div key={i} className="card p-4">
                <span className="badge-blue text-[10px] mb-2">{item.v}</span>
                <div className="text-sm font-medium text-slate-800 mb-1">{item.title}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Charts */}
        <section className="animate-in-delay-1">
          <h2 className="section-heading">Illustrative Error Rates</h2>
          <div className="card p-5">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-4">Illustrative Prototype Data</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barGap={2} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="CER" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="WER" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <h2 className="section-heading">Illustrative Accuracy Comparison</h2>
          <div className="card p-5">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-4">Illustrative Prototype Data</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" domain={[50, 100]} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Medicine Acc." stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Strength Acc." stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="SKU Acc." stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Metrics */}
        <section>
          <h2 className="section-heading">Evaluation Metrics</h2>
          <div className="card divide-y divide-slate-100">
            {metricDescriptions.map((item, i) => (
              <div key={i} className="px-4 py-3">
                <div className="text-sm font-medium text-slate-700">{item.metric}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Evaluation Process */}
        <section>
          <h2 className="section-heading">Intended Evaluation Process</h2>
          <div className="card p-5">
            <div className="max-w-xs mx-auto">
              {evaluationProcess.map((step, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 py-2 px-3 rounded bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded bg-primary-100 flex items-center justify-center text-[10px] font-semibold text-primary-600">{i + 1}</span>
                    <span className="text-sm text-slate-700">{step}</span>
                  </div>
                  {i < evaluationProcess.length - 1 && (
                    <div className="flex justify-center py-1 text-slate-300">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">
              Held-out samples should be collected from every participating writer.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
