import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UserCheck,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';

export default function ClinicDashboard() {
  const { profile } = useAuth();

  const pendingTasks = [
    {
      id: 'RX-2024-0002',
      patient: 'Meera Patel',
      doctor: 'Dr. R. Gupta',
      flaggedField: 'Frequency notation (74% confidence)',
      urgency: 'Medium',
    },
    {
      id: 'RX-2024-0001',
      patient: 'Rahul Kumar',
      doctor: 'Dr. A. Sharma',
      flaggedField: 'Instructions (88% confidence)',
      urgency: 'Low',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <UserCheck className="w-3.5 h-3.5 text-brand-red" />
            Clinic Staff Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Verification Queue: {profile?.name || 'Priya Desai'}
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Human-in-the-loop review station for low-confidence prescription tokens and formulary verification.
          </p>
        </div>

        <Link
          to="/prototype"
          className="btn-tactile-red px-5 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-2 shadow-tactile-sm"
        >
          <FileCheck2 className="w-4 h-4" />
          Open Review Station
        </Link>
      </div>

      {/* Verification Tasks */}
      <div className="card-tactile p-6 bg-white space-y-6">
        <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-brand-dark">
              Tasks Requiring Verification ({pendingTasks.length})
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-brand-dark/60">
            Safety Guard Active
          </span>
        </div>

        <div className="space-y-3">
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl border-2 border-brand-dark/20 bg-canvas flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-brand-dark transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-brand-dark/30 text-brand-crimson">
                    {task.id}
                  </span>
                  <span className="font-bold text-sm text-brand-dark">{task.patient}</span>
                </div>
                <div className="text-xs text-brand-dark/70 font-semibold">
                  Prescriber: {task.doctor} • Flagged: <strong className="text-amber-800">{task.flaggedField}</strong>
                </div>
              </div>

              <Link
                to={`/prescriptions/${task.id}`}
                className="btn-tactile-gold px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                Verify &amp; Confirm →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
