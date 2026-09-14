import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { extractPrescription, EXTRACTION_ENGINE_STATUS } from '../lib/extractionEngine';
import { matchFormulary } from '../lib/formularyMatcher';
import { logAuditEvent } from '../lib/auditLogger';
import {
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  Package,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Edit2,
  RotateCcw,
  Check,
  Image as ImageIcon,
  Clock,
  Loader2,
} from 'lucide-react';
import BannerDemo from '../components/BannerDemo';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';

export default function PrototypePage() {
  const { role, profile, user } = useAuth();

  // Workflow Pipeline State (1: Upload -> 2: AI Extracting -> 3: Human Review -> 4: Formulary Match -> 5: Confirmed)
  const [stage, setStage] = useState(1);
  const [isExtracting, setIsExtracting] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [prescriptionId, setPrescriptionId] = useState('RX-2024-0001');

  // Fields State
  const [fields, setFields] = useState([]);
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [editFieldValue, setEditFieldValue] = useState('');

  // Inventory & Formulary Match State
  const [inventory, setInventory] = useState([]);
  const [formularyResult, setFormularyResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmedData, setConfirmedData] = useState(null);
  const [toast, setToast] = useState(null);

  // Load Inventory from Supabase for Formulary Matching
  useEffect(() => {
    async function loadInv() {
      if (!isSupabaseConfigured()) {
        setInventory([
          { id: 'INV-001', medicine: 'Amoxicillin', strength: '500 mg', dosage_form: 'Tablet', sku: 'AMX-500-TAB', pack_size: '10 tablets', stock: 124, reorder_level: 30 },
          { id: 'INV-002', medicine: 'Paracetamol', strength: '650 mg', dosage_form: 'Tablet', sku: 'PCM-650-TAB', pack_size: '15 tablets', stock: 256, reorder_level: 50 },
          { id: 'INV-003', medicine: 'Metformin', strength: '500 mg', dosage_form: 'Tablet', sku: 'MET-500-TAB', pack_size: '10 tablets', stock: 18, reorder_level: 25 },
        ]);
        return;
      }
      try {
        const { data } = await supabase.from('inventory_items').select('*');
        if (data) setInventory(data);
      } catch (err) {
        console.warn('Inventory fetch error in prototype:', err);
      }
    }
    loadInv();
  }, []);

  // Handle Prescription Image File Select
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPrescriptionImage(file);
    const localUrl = URL.createObjectURL(file);
    setImagePreviewUrl(localUrl);

    // Upload to Supabase Storage if configured
    if (isSupabaseConfigured()) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `rx-${Date.now()}.${fileExt}`;
        const filePath = `scans/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('prescriptions')
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabase.storage.from('prescriptions').getPublicUrl(filePath);
          if (data?.publicUrl) setImagePreviewUrl(data.publicUrl);
        }
      } catch (err) {
        console.warn('Storage upload note:', err);
      }
    }

    startExtraction(file);
  };

  // Run Sample Demo Prescription
  const handleUseSamplePrescription = () => {
    const sampleId = 'RX-' + Math.floor(1000 + Math.random() * 9000);
    setPrescriptionId(sampleId);
    setImagePreviewUrl(''); // Will display synthesized clinical sample SVG
    startExtraction('sample');
  };

  // Stage 2: Run Extraction Engine
  const startExtraction = async (source) => {
    setStage(2);
    setIsExtracting(true);

    try {
      const result = await extractPrescription(source);
      setFields(result.fields);

      // Perform initial formulary matching
      const match = matchFormulary(result.fields, inventory);
      setFormularyResult(match);

      setStage(3); // Advance to Human Verification stage
      setToast({ type: 'success', message: 'Prescription extracted! Review fields below.' });

      await logAuditEvent({
        actorName: profile?.name || user?.email || 'Dr. A. Sharma',
        actorRole: role || 'doctor',
        action: 'Prescription Extracted (Demo Engine)',
        entity: 'Prescription',
        entityId: prescriptionId,
        details: `Simulated OCR extraction completed for ${prescriptionId}`,
      });
    } catch (err) {
      console.error('Extraction error:', err);
      setToast({ type: 'error', message: 'Extraction failed.' });
      setStage(1);
    } finally {
      setIsExtracting(false);
    }
  };

  // Field Correction by Staff
  const handleSaveFieldEdit = (index) => {
    const updated = [...fields];
    const oldVal = updated[index].value;
    updated[index].value = editFieldValue;
    updated[index].needsVerification = false;
    updated[index].confidence = 100; // Marked 100% after human confirmation
    setFields(updated);
    setEditingFieldIndex(null);

    // Re-run formulary match
    const newMatch = matchFormulary(updated, inventory);
    setFormularyResult(newMatch);

    logAuditEvent({
      actorName: profile?.name || user?.email || 'Clinic Staff',
      actorRole: role || 'clinic-staff',
      action: 'Prescription Field Corrected',
      entity: 'PrescriptionField',
      entityId: prescriptionId,
      details: `Field "${updated[index].label}" adjusted from "${oldVal}" to "${editFieldValue}"`,
    });

    setToast({ type: 'success', message: `Field "${updated[index].label}" corrected.` });
  };

  // Stage 5: Final Prescription Confirmation & Inventory Reservation
  const handleConfirmPrescription = async () => {
    setConfirming(true);

    try {
      const medicineName = fields.find((f) => f.label.toLowerCase() === 'medicine')?.value || 'Amoxicillin';

      // 1. Supabase persistence
      if (isSupabaseConfigured()) {
        // Upsert Prescription record
        await supabase.from('prescriptions').upsert({
          id: prescriptionId,
          patient_id: 'PT-1001',
          patient_name: 'Rahul Kumar',
          doctor_name: 'Dr. A. Sharma',
          image_url: imagePreviewUrl,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        });

        // Insert fields
        await supabase.from('prescription_fields').delete().eq('prescription_id', prescriptionId);
        const fieldsPayload = fields.map((f) => ({
          prescription_id: prescriptionId,
          label: f.label,
          value: f.value,
          confidence: f.confidence,
          needs_verification: f.needsVerification,
        }));
        await supabase.from('prescription_fields').insert(fieldsPayload);

        // Deduct inventory stock if matched
        if (formularyResult?.matched && formularyResult?.item) {
          const item = formularyResult.item;
          const newStock = Math.max(0, item.stock - 1);
          await supabase
            .from('inventory_items')
            .update({ stock: newStock, updated_at: new Date().toISOString() })
            .eq('id', item.id);
        }
      }

      await logAuditEvent({
        actorName: profile?.name || user?.email || 'Clinic Staff',
        actorRole: role || 'clinic-staff',
        action: 'Prescription Confirmed & Stock Reserved',
        entity: 'Prescription',
        entityId: prescriptionId,
        details: `Confirmed prescription ${prescriptionId} for ${medicineName}. 1 pack reserved.`,
      });

      setConfirmedData({
        prescriptionId,
        patientName: 'Rahul Kumar',
        medicine: medicineName,
        confirmedAt: new Date().toLocaleTimeString(),
      });

      setStage(5);
      setToast({ type: 'success', message: 'Prescription confirmed and inventory synchronized!' });
    } catch (err) {
      console.error('Confirmation error:', err);
      setToast({ type: 'error', message: `Confirmation failed: ${err.message}` });
    } finally {
      setConfirming(false);
    }
  };

  const resetPipeline = () => {
    setStage(1);
    setPrescriptionImage(null);
    setImagePreviewUrl('');
    setFields([]);
    setFormularyResult(null);
    setConfirmedData(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-red" />
            Interactive End-to-End Pipeline
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Prescription Digitization Prototype
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Test the full clinical cycle: Image Upload → AI Extraction → Human Review → Formulary Match → Confirmation.
          </p>
        </div>

        <button
          onClick={resetPipeline}
          className="btn-tactile-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Workflow
        </button>
      </div>

      {/* Demo Banner */}
      <BannerDemo
        title="Prototype ML Interface (Isolated Engine)"
        message="Handwriting extraction currently uses simulated confidence scores and demonstration OCR outputs. Real doctor adaptation models will plug directly into `extractPrescription()`."
      />

      {/* Progress Tracker */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-white p-3 rounded-2xl border-2 border-brand-dark shadow-tactile-sm text-xs font-bold text-center">
        <div className={`p-2.5 rounded-xl border ${stage >= 1 ? 'bg-accent-gold text-brand-dark border-brand-dark' : 'bg-canvas text-brand-dark/40 border-transparent'}`}>
          1. Upload Photo
        </div>
        <div className={`p-2.5 rounded-xl border ${stage >= 2 ? 'bg-accent-gold text-brand-dark border-brand-dark' : 'bg-canvas text-brand-dark/40 border-transparent'}`}>
          2. AI Extract
        </div>
        <div className={`p-2.5 rounded-xl border ${stage >= 3 ? 'bg-accent-gold text-brand-dark border-brand-dark' : 'bg-canvas text-brand-dark/40 border-transparent'}`}>
          3. Human Review
        </div>
        <div className={`p-2.5 rounded-xl border ${stage >= 4 || (fields.length > 0 && stage >= 3) ? 'bg-accent-gold text-brand-dark border-brand-dark' : 'bg-canvas text-brand-dark/40 border-transparent'}`}>
          4. Formulary Match
        </div>
        <div className={`p-2.5 rounded-xl border ${stage === 5 ? 'bg-accent-mintLight text-emerald-900 border-emerald-500 font-black' : 'bg-canvas text-brand-dark/40 border-transparent'}`}>
          5. Confirmed
        </div>
      </div>

      {/* STAGE 1: UPLOAD */}
      {stage === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* File Upload Box */}
          <div className="card-tactile p-8 bg-white flex flex-col justify-between text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-brand-pink/20 rounded-2xl border-2 border-brand-dark flex items-center justify-center text-brand-crimson shadow-tactile-sm">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-display text-brand-dark">
                Upload Prescription Image
              </h3>
              <p className="text-xs text-brand-dark/70 max-w-sm mx-auto leading-relaxed">
                Select a physical prescription photo or scan (PNG, JPG, PDF) to begin OCR extraction and doctor style adaptation.
              </p>
            </div>

            <div>
              <label className="btn-tactile-red px-6 py-3.5 rounded-2xl text-sm font-black cursor-pointer inline-flex items-center gap-2 shadow-tactile">
                <UploadCloud className="w-5 h-5" />
                Select Prescription File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <div className="text-[11px] text-brand-dark/50 mt-2 font-semibold">
                Uploaded to Supabase Storage bucket: <code className="font-mono">prescriptions</code>
              </div>
            </div>
          </div>

          {/* Quick Demo Sample Option */}
          <div className="card-tactile p-8 bg-accent-goldLight flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block text-[11px] font-black uppercase px-2.5 py-1 bg-accent-gold rounded-md border border-brand-dark">
                Instant Evaluation Demo
              </span>
              <h3 className="text-xl font-bold font-display text-brand-dark">
                Use Sample Clinical Prescription
              </h3>
              <p className="text-xs text-brand-dark/80 leading-relaxed font-medium">
                Test the end-to-end extraction and human-in-the-loop verification pipeline immediately using a pre-configured sample prescription for <strong>Dr. A. Sharma</strong> (Cardiology).
              </p>

              {/* Sample card details */}
              <div className="bg-white p-4 rounded-xl border-2 border-brand-dark text-left space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-brand-dark/60">Doctor:</span>
                  <span>Dr. A. Sharma (Cardiology)</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-brand-dark/60">Patient:</span>
                  <span>Rahul Kumar (PT-1001)</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-brand-dark/60">Target Drug:</span>
                  <span className="text-brand-crimson">Amoxicillin 500 mg (Oral)</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleUseSamplePrescription}
              className="btn-tactile-gold w-full py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-brand-red" />
              Load Sample &amp; Run Extraction
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: EXTRACTING SPINNER */}
      {stage === 2 && isExtracting && (
        <div className="card-tactile p-16 bg-white text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl border-3 border-brand-dark bg-accent-gold flex items-center justify-center shadow-tactile animate-pulse">
            <Loader2 className="w-8 h-8 text-brand-dark animate-spin" />
          </div>
          <h3 className="text-2xl font-bold font-display text-brand-dark">
            Running Doctor-Adaptive OCR Extraction...
          </h3>
          <p className="text-xs text-brand-dark/70 max-w-md mx-auto">
            Segmenting handwriting lines, querying formulary vocabularies, and calculating field-level confidence scores.
          </p>
        </div>
      )}

      {/* STAGE 3 & 4: HUMAN REVIEW & FORMULARY MATCHING */}
      {(stage === 3 || stage === 4) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Prescription Image View */}
          <div className="lg:col-span-5 card-tactile p-6 bg-white space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-3">
              <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-pink" />
                Original Prescription Scan
              </h3>
              <span className="text-xs font-mono font-bold text-brand-dark/60">
                {prescriptionId}
              </span>
            </div>

            {imagePreviewUrl ? (
              <div className="rounded-2xl border-2 border-brand-dark overflow-hidden bg-canvas-dark max-h-96 flex items-center justify-center p-2">
                <img
                  src={imagePreviewUrl}
                  alt="Prescription Scan"
                  className="max-h-88 object-contain rounded-xl"
                />
              </div>
            ) : (
              /* High-fidelity synthesized prescription simulation */
              <div className="rounded-2xl border-2 border-brand-dark p-6 bg-canvas-light text-brand-dark space-y-4 shadow-inner">
                <div className="border-b-2 border-brand-dark/20 pb-3 text-center">
                  <h4 className="font-bold text-base tracking-tight">CITY CARE CLINIC</h4>
                  <p className="text-[10px] text-brand-dark/70">Dr. A. Sharma, M.D. (Cardiology) — Lic #MED-8842</p>
                </div>
                <div className="flex justify-between text-xs font-semibold text-brand-dark/80">
                  <span>Pt: Rahul Kumar (Age 32)</span>
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
                    <div className="font-serif italic text-xs font-bold">Dr. A. Sharma</div>
                    <div className="text-[9px] text-brand-dark/60">Signature Verified</div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-[11px] text-brand-dark/60 bg-canvas p-3 rounded-xl border border-brand-dark/20 leading-relaxed">
              <strong>Workflow Note:</strong> Clinician compares extracted fields on right against the handwriting image. Low confidence items require verification.
            </div>
          </div>

          {/* Right: Extracted Fields Review & Formulary Match */}
          <div className="lg:col-span-7 space-y-6">
            {/* Extracted Fields Card */}
            <div className="card-tactile p-6 bg-white space-y-4">
              <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-brand-crimson" />
                  <h3 className="font-bold text-base text-brand-dark">
                    Extracted Fields (Human Verification)
                  </h3>
                </div>
                <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded bg-accent-gold text-brand-dark border border-brand-dark">
                  {EXTRACTION_ENGINE_STATUS.label}
                </span>
              </div>

              <div className="space-y-3">
                {fields.map((field, idx) => {
                  const isEditing = editingFieldIndex === idx;
                  const isLowConfidence = field.confidence < 90 || field.needsVerification;

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
                                value={editFieldValue}
                                onChange={(e) => setEditFieldValue(e.target.value)}
                                className="px-3 py-1.5 rounded-xl border-2 border-brand-dark bg-white text-xs font-bold flex-1"
                              />
                              <button
                                onClick={() => handleSaveFieldEdit(idx)}
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

                        {/* Confidence score & edit button */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`text-xs font-black ${field.confidence >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {field.confidence}%
                            </div>
                            <div className="text-[9px] text-brand-dark/50">confidence</div>
                          </div>

                          {!isEditing && (
                            <button
                              onClick={() => {
                                setEditingFieldIndex(idx);
                                setEditFieldValue(field.value);
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

            {/* Formulary Match Card */}
            <div className="card-tactile p-6 bg-white space-y-4">
              <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-bold text-base text-brand-dark">
                    Formulary Inventory Match
                  </h3>
                </div>
                {formularyResult?.matched ? (
                  <span className="text-xs font-bold uppercase bg-accent-mintLight text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-400">
                    Match Found
                  </span>
                ) : (
                  <span className="text-xs font-bold uppercase bg-red-100 text-red-800 px-2.5 py-1 rounded-full border border-red-400">
                    No Match
                  </span>
                )}
              </div>

              {formularyResult?.matched && formularyResult?.item ? (
                <div className="bg-accent-mintLight p-4 rounded-2xl border-2 border-emerald-600/30 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-brand-dark/60 font-semibold">Matched Medicine:</span>
                      <div className="font-black text-sm text-brand-dark">{formularyResult.item.medicine}</div>
                    </div>
                    <div>
                      <span className="text-brand-dark/60 font-semibold">SKU:</span>
                      <div className="font-mono font-bold text-brand-crimson">{formularyResult.item.sku}</div>
                    </div>
                    <div>
                      <span className="text-brand-dark/60 font-semibold">Strength &amp; Form:</span>
                      <div className="font-bold text-brand-dark">{formularyResult.item.strength} ({formularyResult.item.dosage_form})</div>
                    </div>
                    <div>
                      <span className="text-brand-dark/60 font-semibold">Current Stock:</span>
                      <div className="font-extrabold text-emerald-800">{formularyResult.item.stock} available</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-xs text-red-900 leading-relaxed">
                  No matching SKU found in formulary. (Strict rule: No drug substitution or clinical decisions are made autonomously).
                </div>
              )}

              {/* Confirm Prescription CTA */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleConfirmPrescription}
                  disabled={confirming}
                  className="btn-tactile-red px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 shadow-tactile"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Confirming in Supabase...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm Prescription &amp; Reserve Inventory
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 5: CONFIRMED & PATIENT REFILL */}
      {stage === 5 && confirmedData && (
        <div className="max-w-2xl mx-auto card-tactile p-8 bg-white text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent-mintLight border-2 border-emerald-600 flex items-center justify-center text-emerald-700 shadow-tactile-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black font-display text-brand-dark">
              Prescription Confirmed &amp; Synchronized!
            </h3>
            <p className="text-xs text-brand-dark/70 max-w-md mx-auto">
              Prescription <strong>{confirmedData.prescriptionId}</strong> status set to <strong>confirmed</strong>. 1 unit deducted from Supabase inventory and audit trail recorded.
            </p>
          </div>

          {/* Details summary */}
          <div className="bg-canvas p-4 rounded-2xl border-2 border-brand-dark/20 text-left space-y-2 text-xs">
            <div className="flex justify-between font-bold">
              <span className="text-brand-dark/60">Prescription ID:</span>
              <span className="font-mono text-brand-crimson">{confirmedData.prescriptionId}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-brand-dark/60">Patient:</span>
              <span>{confirmedData.patientName}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-brand-dark/60">Dispensed Medicine:</span>
              <span>{confirmedData.medicine}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-brand-dark/60">Timestamp:</span>
              <span>{confirmedData.confirmedAt}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={resetPipeline}
              className="btn-tactile-red px-5 py-2.5 rounded-xl text-xs font-black"
            >
              Test Another Prescription
            </button>
            <a
              href="#/inventory"
              className="btn-tactile-white px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Package className="w-4 h-4 text-brand-pink" />
              Check Inventory Updates
            </a>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
