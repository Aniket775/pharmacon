import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { matchFormulary } from '../lib/formularyMatcher';
import { logAuditEvent } from '../lib/auditLogger';
import {
  FileCheck2,
  ChevronLeft,
  CheckCircle2,
  Package,
  Edit2,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import BannerDemo from '../components/BannerDemo';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';

export default function PrescriptionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, profile, user } = useAuth();

  const [prescription, setPrescription] = useState(null);
  const [fields, setFields] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [formularyResult, setFormularyResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Editing Field State
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let rx = null;
        let rxFields = [];
        let inv = [];

        if (isSupabaseConfigured()) {
          // Fetch Prescription
          const { data: rxData } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('id', id)
            .single();

          if (rxData) rx = rxData;

          // Fetch Fields
          const { data: fieldData } = await supabase
            .from('prescription_fields')
            .select('*')
            .eq('prescription_id', id);

          if (fieldData) rxFields = fieldData;

          // Fetch Inventory
          const { data: invData } = await supabase.from('inventory_items').select('*');
          if (invData) inv = invData;
        }

        // Fallback default sample if not found or offline
        if (!rx) {
          rx = {
            id: id || 'RX-2024-0001',
            patient_id: 'PT-1001',
            patient_name: 'Rahul Kumar',
            doctor_name: 'Dr. A. Sharma',
            image_url: '',
            status: 'draft',
            created_at: new Date().toISOString(),
          };

          rxFields = [
            { label: 'Medicine', value: 'Amoxicillin', confidence: 94, needs_verification: false },
            { label: 'Strength', value: '500 mg', confidence: 97, needs_verification: false },
            { label: 'Dosage Form', value: 'Tablet', confidence: 96, needs_verification: false },
            { label: 'Frequency', value: '1-0-1', confidence: 86, needs_verification: true },
            { label: 'Route', value: 'Oral', confidence: 92, needs_verification: false },
            { label: 'Duration', value: '5 days', confidence: 91, needs_verification: false },
            { label: 'Instructions', value: 'After food', confidence: 88, needs_verification: true },
          ];

          inv = [
            { id: 'INV-001', medicine: 'Amoxicillin', strength: '500 mg', dosage_form: 'Tablet', sku: 'AMX-500-TAB', pack_size: '10 tablets', stock: 124, reorder_level: 30 },
          ];
        }

        setPrescription(rx);
        setFields(rxFields);
        setInventory(inv);

        // Formulary Match
        const match = matchFormulary(rxFields, inv);
        setFormularyResult(match);
      } catch (err) {
        console.warn('Prescription detail load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleSaveField = async (index) => {
    const updated = [...fields];
    const oldVal = updated[index].value;
    updated[index].value = editValue;
    updated[index].needs_verification = false;
    updated[index].confidence = 100;
    setFields(updated);
    setEditingFieldIndex(null);

    // Update in Supabase
    if (isSupabaseConfigured() && updated[index].id) {
      await supabase
        .from('prescription_fields')
        .update({ value: editValue, needs_verification: false, confidence: 100 })
        .eq('id', updated[index].id);
    }

    // Recalculate Formulary match
    const newMatch = matchFormulary(updated, inventory);
    setFormularyResult(newMatch);

    await logAuditEvent({
      actorName: profile?.name || user?.email || 'Clinic Staff',
      actorRole: role || 'clinic-staff',
      action: 'Field Corrected',
      entity: 'PrescriptionField',
      entityId: prescription?.id,
      details: `Field "${updated[index].label}" adjusted from "${oldVal}" to "${editValue}"`,
    });

    setToast({ type: 'success', message: `Field "${updated[index].label}" updated.` });
  };

  const handleConfirmPrescription = async () => {
    setConfirming(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase
          .from('prescriptions')
          .update({ status: 'confirmed', updated_at: new Date().toISOString() })
          .eq('id', prescription.id);

        if (formularyResult?.matched && formularyResult?.item) {
          const item = formularyResult.item;
          const newStock = Math.max(0, item.stock - 1);
          await supabase
            .from('inventory_items')
            .update({ stock: newStock, updated_at: new Date().toISOString() })
            .eq('id', item.id);
        }
      }

      setPrescription((prev) => ({ ...prev, status: 'confirmed' }));

      await logAuditEvent({
        actorName: profile?.name || user?.email || 'Clinic Staff',
        actorRole: role || 'clinic-staff',
        action: 'Prescription Confirmed',
        entity: 'Prescription',
        entityId: prescription.id,
        details: `Confirmed ${prescription.id} in Supabase`,
      });

      setToast({ type: 'success', message: 'Prescription confirmed and inventory synchronized!' });
    } catch (err) {
      console.error('Confirmation error:', err);
      setToast({ type: 'error', message: `Confirmation failed: ${err.message}` });
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-pink mb-3" />
        <p className="font-bold text-sm text-brand-dark">Loading prescription record...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div className="flex items-center gap-3">
          <Link
            to="/prototype"
            className="btn-tactile-white px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-brand-dark">
              Review Prescription: {prescription?.id}
            </h1>
            <p className="text-xs text-brand-dark/70 font-semibold">
              Patient: {prescription?.patient_name} • Prescriber: {prescription?.doctor_name}
            </p>
          </div>
        </div>

        <StatusBadge status={prescription?.status} />
      </div>

      {/* Side-by-side Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Image Scan View */}
        <div className="lg:col-span-5 card-tactile p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-3">
            <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-pink" />
              Original Prescription Scan
            </h3>
            <span className="text-xs font-mono font-bold text-brand-dark/50">
              {prescription?.id}
            </span>
          </div>

          {prescription?.image_url ? (
            <div className="rounded-2xl border-2 border-brand-dark overflow-hidden bg-canvas-dark p-2">
              <img
                src={prescription.image_url}
                alt="Prescription Scan"
                className="max-h-80 object-contain mx-auto rounded-xl"
              />
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-brand-dark p-6 bg-canvas-light text-brand-dark space-y-4 shadow-inner">
              <div className="border-b-2 border-brand-dark/20 pb-3 text-center">
                <h4 className="font-bold text-base tracking-tight">CITY CARE CLINIC</h4>
                <p className="text-[10px] text-brand-dark/70">{prescription?.doctor_name} — Lic #MED-8842</p>
              </div>
              <div className="flex justify-between text-xs font-semibold text-brand-dark/80">
                <span>Pt: {prescription?.patient_name}</span>
                <span>Date: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="py-4 border-y-2 border-dashed border-brand-dark/20 space-y-2">
                <span className="font-display font-black text-2xl text-brand-dark">Rx</span>
                <div className="font-serif italic text-lg leading-relaxed text-brand-crimson pl-4">
                  Amoxicillin 500mg tab<br />
                  1-0-1 p.o. x 5 days (after food)
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <div className="text-right">
                  <div className="font-serif italic text-xs font-bold">{prescription?.doctor_name}</div>
                  <div className="text-[9px] text-brand-dark/60">Signature Verified</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Extracted Fields Review & Formulary */}
        <div className="lg:col-span-7 space-y-6">
          {/* Extracted Fields */}
          <div className="card-tactile p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-brand-crimson" />
                <h3 className="font-bold text-base text-brand-dark">
                  Extracted Fields (Human Verification)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-brand-dark/60">
                {fields.length} Fields
              </span>
            </div>

            <div className="space-y-3">
              {fields.map((field, idx) => {
                const isEditing = editingFieldIndex === idx;
                const isLowConfidence = field.confidence < 90 || field.needs_verification;

                return (
                  <div
                    key={field.label}
                    className={`p-3.5 rounded-2xl border-2 transition-all ${
                      isLowConfidence
                        ? 'bg-accent-goldLight/70 border-accent-gold'
                        : 'bg-canvas-light border-brand-dark/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-brand-dark/60">
                            {field.label}
                          </span>
                          {isLowConfidence && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-pink text-white border border-brand-dark">
                              Needs Verification
                            </span>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-1.5">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="px-3 py-1.5 rounded-xl border-2 border-brand-dark bg-white text-xs font-bold flex-1"
                            />
                            <button
                              onClick={() => handleSaveField(idx)}
                              className="btn-tactile-red px-3 py-1.5 rounded-xl text-xs font-bold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="font-black text-sm text-brand-dark mt-0.5">
                            {field.value}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`text-xs font-black ${field.confidence >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {field.confidence}%
                          </div>
                          <div className="text-[9px] text-brand-dark/50">confidence</div>
                        </div>

                        {!isEditing && prescription?.status !== 'confirmed' && (
                          <button
                            onClick={() => {
                              setEditingFieldIndex(idx);
                              setEditValue(field.value);
                            }}
                            className="p-1.5 rounded-xl border border-brand-dark/30 bg-white hover:bg-brand-pink hover:text-white transition-colors"
                            title="Edit Field"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formulary Match & Confirmation */}
          <div className="card-tactile p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-base text-brand-dark">
                  Formulary Inventory Match
                </h3>
              </div>
              <span className="text-xs font-bold uppercase bg-accent-mintLight text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-400">
                {formularyResult?.matched ? 'Match Found' : 'No Match'}
              </span>
            </div>

            {formularyResult?.matched && formularyResult?.item && (
              <div className="bg-accent-mintLight p-4 rounded-2xl border-2 border-emerald-600/30 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-brand-dark/60 font-semibold">Matched Medicine:</span>
                    <div className="font-black text-sm text-brand-dark">{formularyResult.item.medicine}</div>
                  </div>
                  <div>
                    <span className="text-brand-dark/60 font-semibold">SKU:</span>
                    <div className="font-mono font-bold text-brand-crimson">{formularyResult.item.sku}</div>
                  </div>
                </div>
              </div>
            )}

            {prescription?.status !== 'confirmed' && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleConfirmPrescription}
                  disabled={confirming}
                  className="btn-tactile-red px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 shadow-tactile"
                >
                  {confirming ? 'Saving to Supabase...' : 'Confirm Prescription & Reserve Stock'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
