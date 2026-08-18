import { CheckCircle, Clock, AlertTriangle, Shield, ClipboardCheck, Users, BarChart3 } from 'lucide-react';

const functionalTests = [
  { test: 'Login works', status: 'planned' },
  { test: 'Prescription upload works', status: 'prototype' },
  { test: 'Extraction works', status: 'prototype' },
  { test: 'Low-confidence fields are flagged', status: 'prototype' },
  { test: 'Confirmation works', status: 'prototype' },
  { test: 'Inventory state changes', status: 'planned' },
  { test: 'Patient dashboard updates', status: 'prototype' },
  { test: 'Audit event is created', status: 'prototype' },
];

const userTestingQuestions = [
  'Was the workflow understandable?',
  'Was the extracted information easy to verify?',
  'Was the confirmation step clear?',
  'Did the workflow reduce manual effort compared to full manual entry?',
  'Was the patient dashboard understandable?',
  'Were low-confidence indicators helpful?',
];

const evaluationCriteria = [
  { criterion: 'Calibration learning curve', desc: 'Compare results after one, two and three calibration sheets rather than assuming a single sheet is sufficient.' },
  { criterion: 'Adapted vs. generic recognition', desc: 'Measure doctor-adapted recognition against a generic baseline using held-out paper scans from each participating writer.' },
  { criterion: 'Workflow completion', desc: 'Can users complete the full prescription digitisation workflow?' },
  { criterion: 'Correction time', desc: 'How long does it take to correct flagged fields?' },
  { criterion: 'Extraction accuracy', desc: 'How accurately does the system extract prescription fields?' },
  { criterion: 'Matching accuracy', desc: 'How accurately does the system match to formulary items?' },
  { criterion: 'Task completion', desc: 'Can all user roles complete their assigned tasks?' },
  { criterion: 'Correct state transitions', desc: 'Do all system state changes (inventory, audit, patient records) occur correctly?' },
];

export default function ValidationPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">Validation</h1>
      <p className="page-subtitle">Planned testing and validation approach for the Pharmacon system.</p>

      <div className="max-w-4xl space-y-10">
        <section className="animate-in">
          <h2 className="section-heading flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-primary-500" />
            Recognition Study Design
          </h2>
          <div className="card p-5 text-sm text-slate-600 leading-relaxed">
            Collect real-world paper scans from participating practitioners. Reserve a portion of every writer’s samples as held-out test data, then compare the generic model with doctor-adapted models trained on one, two and three calibration sheets.
          </div>
        </section>
        {/* Functional Testing */}
        <section className="animate-in">
          <h2 className="section-heading flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-500" />
            Functional Testing
          </h2>
          <div className="card divide-y divide-slate-100">
            {functionalTests.map((test, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-slate-700">{test.test}</span>
                <span className={test.status === 'prototype' ? 'badge-blue' : 'badge-slate'}>
                  {test.status === 'prototype' ? 'Prototype' : 'Planned'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* User Testing */}
        <section className="animate-in-delay-1">
          <h2 className="section-heading flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-500" />
            User Testing Questions
          </h2>
          <div className="card p-5">
            <p className="text-sm text-slate-500 mb-4">
              Planned questions for user testing sessions to evaluate usability and effectiveness:
            </p>
            <ul className="space-y-2.5">
              {userTestingQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-500 flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Evaluation Criteria */}
        <section className="animate-in-delay-2">
          <h2 className="section-heading flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-500" />
            Evaluation Criteria
          </h2>
          <div className="card divide-y divide-slate-100">
            {evaluationCriteria.map((item, i) => (
              <div key={i} className="px-4 py-3">
                <div className="text-sm font-medium text-slate-700">{item.criterion}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
