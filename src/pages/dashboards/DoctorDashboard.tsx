import { FileText, User, Clock, CheckCircle } from 'lucide-react';
import { samplePrescription } from '../../data/mockData';

export default function DoctorDashboard() {
  return (
    <div className="page-container">
      <h1 className="page-title">Doctor Portal</h1>
      <p className="page-subtitle">Dr. A. Sharma — Prescriptions, calibration and history.</p>

      <div className="max-w-4xl space-y-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 animate-in">
          <div className="stat-card">
            <div className="stat-value">12</div>
            <div className="stat-label">Prescriptions This Week</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">24</div>
            <div className="stat-label">Calibration Samples</div>
          </div>
          <div className="stat-card">
            <span className="badge-yellow">Prototype</span>
            <div className="stat-label mt-1">Calibration Status</div>
          </div>
        </div>

        {/* Prescriptions */}
        <section className="animate-in-delay-1">
          <h2 className="section-heading">Recent Prescriptions</h2>
          <div className="card divide-y divide-slate-100">
            {[
              { id: 'RX-2024-0001', patient: 'Rahul Kumar', medicine: 'Amoxicillin 500mg', date: '2024-11-15', status: 'confirmed' },
              { id: 'RX-2024-0042', patient: 'Meera Patel', medicine: 'Metformin 500mg', date: '2024-11-14', status: 'confirmed' },
              { id: 'RX-2024-0038', patient: 'Arun Joshi', medicine: 'Paracetamol 650mg', date: '2024-11-13', status: 'confirmed' },
            ].map((rx, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-700">{rx.patient}</div>
                    <div className="text-xs text-slate-500">{rx.medicine} · {rx.date}</div>
                  </div>
                </div>
                <span className="badge-green">Confirmed</span>
              </div>
            ))}
          </div>
        </section>

        {/* Calibration */}
        <section className="animate-in-delay-2">
          <h2 className="section-heading">Calibration</h2>
          <div className="card p-5">
            <p className="text-sm text-slate-600 mb-3">
              Submit handwriting samples to improve recognition accuracy for your writing style.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {['Characters & Numerals', 'Medical Abbreviations', 'Dosage Patterns', 'Formulary Medicines'].map((cat, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-sm text-slate-600">{cat}</span>
                  <span className="badge-slate text-[10px]">Prototype</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
