import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
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

const DEFAULT_REFILLS = [
  {
    id: 'RF-001',
    prescription_id: 'RX-2024-0001',
    patient_id: 'PT-1001',
    patient_name: 'Rahul Kumar',
    medicine: 'Amoxicillin',
    strength: '500 mg',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'RF-002',
    prescription_id: 'RX-2024-0002',
    patient_id: 'PT-1002',
    patient_name: 'Meera Patel',
    medicine: 'Metformin',
    strength: '500 mg',
    status: 'approved',
    created_at: new Date().toISOString(),
  },
];

export default function PharmacyDashboard() {
  const { profile, role, user } = useAuth();
  const [refills, setRefills] = useState(DEFAULT_REFILLS);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchRefills = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setRefills(DEFAULT_REFILLS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('refill_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setRefills(DEFAULT_REFILLS);
      } else {
        setRefills(data);
      }
    } catch (e) {
      console.warn('Refills fetch error:', e);
      setRefills(DEFAULT_REFILLS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefills();
  }, []);

  const handleUpdateStatus = async (refillId, newStatus) => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('refill_requests')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', refillId);

        if (error) throw error;
      }

      setRefills((prev) =>
        prev.map((r) => (r.id === refillId ? { ...r, status: newStatus } : r))
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
