import { useState } from 'react';
import { Upload, ClipboardList, Users, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClinicDashboard() {
  return (
    <div className="page-container">
      <h1 className="page-title">Clinic Portal</h1>
      <p className="page-subtitle">Priya Desai — Scan, review and manage prescriptions.</p>

      <div className="max-w-4xl space-y-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 animate-in">
          <div className="stat-card">
            <div className="stat-value">3</div>
            <div className="stat-label">Pending Review</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">28</div>
            <div className="stat-label">Confirmed Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">2</div>
            <div className="stat-label">Flagged Fields</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">156</div>
            <div className="stat-label">Total Patients</div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-3 gap-4 animate-in-delay-1">
          <Link to="/prototype" className="card-hover p-5 flex flex-col items-center text-center">
            <Upload className="w-6 h-6 text-primary-500 mb-2" />
            <div className="text-sm font-medium text-slate-700">Scan Prescription</div>
            <div className="text-xs text-slate-500">Upload and process a new prescription</div>
          </Link>
          <div className="card-hover p-5 flex flex-col items-center text-center">
            <ClipboardList className="w-6 h-6 text-primary-500 mb-2" />
            <div className="text-sm font-medium text-slate-700">Review Queue</div>
            <div className="text-xs text-slate-500">3 prescriptions pending review</div>
          </div>
          <div className="card-hover p-5 flex flex-col items-center text-center">
            <Users className="w-6 h-6 text-primary-500 mb-2" />
            <div className="text-sm font-medium text-slate-700">Patient Records</div>
            <div className="text-xs text-slate-500">Search and view patient history</div>
          </div>
        </div>

        {/* Review Queue */}
        <section className="animate-in-delay-2">
          <h2 className="section-heading">Review Queue</h2>
          <div className="card divide-y divide-slate-100">
            {[
              { id: 'RX-2024-0050', patient: 'Sunil Reddy', doctor: 'Dr. A. Sharma', flags: 1, time: '2 min ago' },
              { id: 'RX-2024-0049', patient: 'Kavita Nair', doctor: 'Dr. R. Gupta', flags: 2, time: '8 min ago' },
              { id: 'RX-2024-0048', patient: 'Deepak Verma', doctor: 'Dr. A. Sharma', flags: 0, time: '15 min ago' },
            ].map((item, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-700">{item.patient}</div>
                  <div className="text-xs text-slate-500">{item.id} · {item.doctor} · {item.time}</div>
                </div>
                <div className="flex items-center gap-2">
                  {item.flags > 0 && (
                    <span className="badge-yellow text-[10px]">
                      <AlertTriangle className="w-3 h-3 mr-0.5" />
                      {item.flags} flagged
                    </span>
                  )}
                  <button className="btn-ghost text-xs gap-1">
                    <Eye className="w-3 h-3" />
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
