import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { RefillsRepository } from '../../lib/dataStore';
import { useAuth } from '../../context/AuthContext';
import { logAuditEvent } from '../../lib/auditLogger';
import {
  HeartHandshake,
  Pill,
  Clock,
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sun,
  Moon,
  Sunset,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const DEFAULT_PATIENT_MEDS = [
  {
    id: 'RX-2024-0001',
    medicine: 'Amoxicillin',
    strength: '500 mg',
    dosage_form: 'Tablet',
    frequency: '1-0-1',
    route: 'Oral',
    duration: '5 days',
    instructions: 'After food',
    doctor: 'Dr. A. Sharma',
    date: '2024-11-15',
    schedule: { morning: true, afternoon: false, night: true },
  },
];

export default function PatientDashboard() {
  const { profile, user, role } = useAuth();
  const [meds, setMeds] = useState(DEFAULT_PATIENT_MEDS);
  const [refills, setRefills] = useState([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [refillForm, setRefillForm] = useState({
    medicine: 'Amoxicillin',
    strength: '500 mg',
  });

  const fetchPatientData = async () => {
    try {
      const data = await RefillsRepository.getAll();
      setRefills(data);
    } catch (e) {
      console.warn('Patient fetch error:', e);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  const handleRequestRefill = async (e) => {
    e.preventDefault();

    try {
      const newRefill = await RefillsRepository.addRequest({
        prescription_id: 'RX-2024-0001',
        patient_id: profile?.id || 'PT-1001',
        patient_name: profile?.name || 'Rahul Kumar',
        medicine: refillForm.medicine,
        strength: refillForm.strength,
        status: 'pending',
      });

      setRefills((prev) => [newRefill, ...prev]);

      await logAuditEvent({
        actorName: profile?.name || user?.email || 'Rahul Kumar',
        actorRole: 'patient',
        action: 'Patient Requested Refill',
        entity: 'RefillRequest',
        entityId: newRefill.id,
        details: `Requested refill for ${newRefill.medicine} (${newRefill.strength})`,
      });

      setToast({ type: 'success', message: 'Refill request submitted to hospital pharmacy!' });
      setIsRequestModalOpen(false);
    } catch (err) {
      console.error('Request refill error:', err);
      setToast({ type: 'error', message: `Refill request failed: ${err.message}` });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <HeartHandshake className="w-3.5 h-3.5 text-brand-red" />
            Patient Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Hello, {profile?.name || 'Rahul Kumar'}
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            View your active prescription schedule, dosage reminders, and request pharmacy refills.
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="btn-tactile-red px-5 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-2 shadow-tactile-sm"
        >
          <Plus className="w-4 h-4" />
          Request Medication Refill
        </button>
      </div>

      {/* Active Prescription Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display text-brand-dark">
          Current Active Medications
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meds.map((med) => (
            <div
              key={med.id}
              className="card-tactile p-6 bg-white flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-pink/20 rounded-2xl border-2 border-brand-dark text-brand-crimson shadow-tactile-sm">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-display text-brand-dark">
                        {med.medicine}
                      </h3>
                      <span className="text-xs font-bold text-brand-dark/60">
                        {med.strength} • {med.dosage_form}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-dark/40">
                    {med.id}
                  </span>
                </div>

                {/* Daily Schedule Badges */}
                <div className="bg-canvas p-3.5 rounded-xl border border-brand-dark/20 space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-brand-dark/60 block">
                    Daily Schedule ({med.frequency}):
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                    <div className={`p-2 rounded-lg border ${med.schedule.morning ? 'bg-accent-goldLight border-accent-gold text-brand-dark' : 'bg-canvas-dark text-brand-dark/30 border-transparent'}`}>
                      <Sun className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                      Morning (1)
                    </div>
                    <div className={`p-2 rounded-lg border ${med.schedule.afternoon ? 'bg-accent-goldLight border-accent-gold text-brand-dark' : 'bg-canvas-dark text-brand-dark/30 border-transparent'}`}>
                      <Sunset className="w-4 h-4 mx-auto mb-1 text-amber-700" />
                      Afternoon (0)
                    </div>
                    <div className={`p-2 rounded-lg border ${med.schedule.night ? 'bg-accent-purpleLight border-accent-purple text-brand-dark' : 'bg-canvas-dark text-brand-dark/30 border-transparent'}`}>
                      <Moon className="w-4 h-4 mx-auto mb-1 text-purple-700" />
                      Night (1)
                    </div>
                  </div>
                </div>

                <div className="text-xs text-brand-dark/80 space-y-1">
                  <div><strong>Duration:</strong> {med.duration}</div>
                  <div><strong>Instructions:</strong> {med.instructions}</div>
                  <div><strong>Prescribed by:</strong> {med.doctor}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refill Request Statuses */}
      <div className="card-tactile p-6 bg-white space-y-4">
        <h3 className="font-bold text-base text-brand-dark">
          Refill Request History
        </h3>

        <div className="space-y-3">
          {refills.map((ref) => (
            <div
              key={ref.id}
              className="p-4 rounded-xl border border-brand-dark/20 bg-canvas flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-sm text-brand-dark block">
                  {ref.medicine} ({ref.strength})
                </span>
                <span className="text-[11px] text-brand-dark/60">
                  Refill ID: {ref.id} • Requested on: {new Date(ref.created_at).toLocaleDateString()}
                </span>
              </div>
              <StatusBadge status={ref.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Request Refill Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Request Medication Refill"
      >
        <form onSubmit={handleRequestRefill} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-brand-dark mb-1">
              Select Prescribed Medicine
            </label>
            <select
              value={refillForm.medicine}
              onChange={(e) => setRefillForm({ ...refillForm, medicine: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-bold"
            >
              <option value="Amoxicillin">Amoxicillin (500 mg)</option>
              <option value="Metformin">Metformin (500 mg)</option>
              <option value="Paracetamol">Paracetamol (650 mg)</option>
            </select>
          </div>

          <div className="text-xs text-brand-dark/70 leading-relaxed bg-canvas p-3 rounded-xl border border-brand-dark/20">
            <strong>Clinical Safety Notice:</strong> Refill requests are sent to hospital pharmacy staff for review. Dosage and active ingredients cannot be modified by patients.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-dark/10">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              className="btn-tactile-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile-red px-5 py-2 rounded-xl text-xs font-black"
            >
              Submit Refill Request
            </button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
