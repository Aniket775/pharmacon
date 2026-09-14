import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { RefillsRepository } from '../../lib/dataStore';
import { useAuth } from '../../context/AuthContext';
import { logAuditEvent } from '../../lib/auditLogger';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Clock,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import Toast from '../../components/Toast';

export default function PharmacyDashboard() {
  const { profile, role, user } = useAuth();
  const [refills, setRefills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchRefills = async () => {
    setLoading(true);
    try {
      const data = await RefillsRepository.getAll();
      setRefills(data);
    } catch (e) {
      console.warn('Refills fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefills();
  }, []);

  const handleUpdateStatus = async (refillId, newStatus) => {
    try {
      const updated = await RefillsRepository.updateStatus(refillId, newStatus);

      setRefills((prev) =>
        prev.map((r) => (r.id === refillId ? (updated || { ...r, status: newStatus }) : r))
      );

      await logAuditEvent({
        actorName: profile?.name || user?.email || 'Pharmacist',
        actorRole: role || 'pharmacist',
        action: `Refill Status Updated: ${newStatus}`,
        entity: 'RefillRequest',
        entityId: refillId,
        details: `Updated refill ${refillId} status to ${newStatus}`,
      });

      setToast({ type: 'success', message: `Refill request ${refillId} marked as ${newStatus}.` });
    } catch (err) {
      console.error('Refill update error:', err);
      setToast({ type: 'error', message: `Update failed: ${err.message}` });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <Package className="w-3.5 h-3.5 text-brand-red" />
            Hospital Pharmacy Dispensary
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Pharmacy Dashboard: {profile?.name || 'Vikram Singh'}
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Formulary inventory levels, stock adjustments, and patient refill approvals.
          </p>
        </div>

        <Link
          to="/inventory"
          className="btn-tactile-red px-5 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-2 shadow-tactile-sm"
        >
          <Package className="w-4 h-4" />
          Full Inventory Catalog
        </Link>
      </div>

      {/* Refill Queue Section */}
      <div className="card-tactile p-6 bg-white space-y-6">
        <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-3">
          <h3 className="font-bold text-base text-brand-dark">
            Patient Medication Refill Requests ({refills.length})
          </h3>
          <span className="text-xs font-mono font-bold text-brand-dark/60">
            Real-time Supabase Sync
          </span>
        </div>

        <div className="space-y-4">
          {refills.map((refill) => (
            <div
              key={refill.id}
              className="p-4 rounded-2xl border-2 border-brand-dark/20 bg-canvas flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-brand-dark transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-brand-dark/30 text-brand-crimson">
                    {refill.id}
                  </span>
                  <span className="font-bold text-sm text-brand-dark">{refill.patient_name || 'Patient'}</span>
                  <StatusBadge status={refill.status} />
                </div>
                <div className="text-xs text-brand-dark/80 font-bold">
                  Medicine: <span className="text-brand-crimson">{refill.medicine} ({refill.strength})</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(refill.id, 'approved')}
                  disabled={refill.status === 'approved'}
                  className="btn-tactile-white px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-40"
                  title="Approve Refill"
                >
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => handleUpdateStatus(refill.id, 'contacted')}
                  disabled={refill.status === 'contacted'}
                  className="btn-tactile-white px-3 py-1.5 rounded-xl text-xs font-bold text-blue-800 hover:bg-blue-100 disabled:opacity-40"
                  title="Mark Contacted"
                >
                  <PhoneCall className="w-3.5 h-3.5 inline mr-1" />
                  Contacted
                </button>
                <button
                  onClick={() => handleUpdateStatus(refill.id, 'rejected')}
                  disabled={refill.status === 'rejected'}
                  className="btn-tactile-white px-3 py-1.5 rounded-xl text-xs font-bold text-red-800 hover:bg-red-100 disabled:opacity-40"
                  title="Reject Refill"
                >
                  <XCircle className="w-3.5 h-3.5 inline mr-1" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
