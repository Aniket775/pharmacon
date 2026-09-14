import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { PrescriptionsRepository } from '../../lib/dataStore';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  FileCheck2,
  Cpu,
  Plus,
  ArrowRight,
  Clock,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRx() {
      try {
        const data = await PrescriptionsRepository.getAll();
        setRecentPrescriptions(data || []);
      } catch (err) {
        console.warn('DoctorDashboard prescriptions load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRx();
  }, []);

  const pendingCount = recentPrescriptions.filter((r) => r.status !== 'confirmed').length;
  const confirmedCount = recentPrescriptions.filter((r) => r.status === 'confirmed').length;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <Stethoscope className="w-3.5 h-3.5 text-brand-red" />
            Physician Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Doctor Dashboard: {profile?.name || 'Dr. A. Sharma'}
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Manage active prescription queues, upload handwriting calibration sheets, and track patient status.
          </p>
        </div>

        <Link
          to="/prototype"
          className="btn-tactile-red px-5 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-2 shadow-tactile-sm"
        >
          <Plus className="w-4 h-4" />
          Digitize New Prescription
        </Link>
      </div>

      {/* Doctor Calibration & Queue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calibration Card */}
        <div className="card-tactile p-6 bg-accent-goldLight space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-brand-dark">
              Handwriting LoRA Status
            </span>
            <Cpu className="w-5 h-5 text-brand-red" />
          </div>
          <h3 className="text-xl font-bold font-display text-brand-dark">
            14 / 20 Calibration Samples
          </h3>
          <p className="text-xs text-brand-dark/80 leading-relaxed">
            Your physician profile is actively training. 6 more sample prescription sheets required for full LoRA fine-tuning.
          </p>
          <Link
            to="/doctor-adaptation"
            className="btn-tactile-gold text-xs px-4 py-2 rounded-xl font-bold inline-flex items-center gap-1.5"
          >
            Manage Calibration →
          </Link>
        </div>

        {/* Prescription Stats */}
        <div className="card-tactile p-6 bg-white space-y-2">
          <span className="text-xs font-black uppercase text-brand-dark/60">
            Pending Staff Verification
          </span>
          <div className="text-3xl font-black font-display text-brand-crimson">{pendingCount}</div>
          <p className="text-xs text-brand-dark/70">
            Prescriptions currently flagged with low confidence awaiting clinic verification.
          </p>
        </div>

        <div className="card-tactile p-6 bg-white space-y-2">
          <span className="text-xs font-black uppercase text-brand-dark/60">
            Confirmed &amp; Dispensed
          </span>
          <div className="text-3xl font-black font-display text-emerald-800">{confirmedCount}</div>
          <p className="text-xs text-brand-dark/70">
            Prescriptions verified and synchronized with hospital pharmacy inventory.
          </p>
        </div>
      </div>

      {/* Prescription Queue Table */}
      <div className="card-tactile overflow-hidden bg-white">
        <div className="p-5 bg-canvas-dark border-b-2 border-brand-dark flex items-center justify-between">
          <h3 className="font-bold text-base text-brand-dark">
            Recent Patient Prescriptions
          </h3>
          <span className="text-xs font-mono font-bold text-brand-dark/60">
            Active Queue
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-brand-dark/10 text-brand-dark font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Rx ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/10">
              {recentPrescriptions.map((rx) => (
                <tr key={rx.id} className="hover:bg-canvas/50">
                  <td className="py-4 px-4 font-mono font-bold text-brand-crimson">
                    {rx.id}
                  </td>
                  <td className="py-4 px-4 font-bold text-brand-dark">
                    {rx.patient_name}
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={rx.status} />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      to={`/prescriptions/${rx.id}`}
                      className="btn-tactile-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      Review Rx →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
