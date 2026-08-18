import { useState } from 'react';
import { Info, Upload, CheckCircle, AlertTriangle, ChevronRight, Package, Eye, FileText } from 'lucide-react';
import { samplePrescription, samplePrescriptionFields, inventoryItems } from '../data/mockData';
import type { PrescriptionField } from '../data/mockData';
import { api } from '../api/client';

type Stage = 'idle' | 'loaded' | 'extracted' | 'reviewing' | 'confirmed';

function ConfidenceBadge({ confidence }: { confidence: number }) {
  if (confidence >= 90) return <span className="text-xs font-medium confidence-high">{confidence}%</span>;
  if (confidence >= 85) return <span className="text-xs font-medium confidence-medium">{confidence}%</span>;
  return <span className="text-xs font-medium confidence-low">{confidence}%</span>;
}

function PrescriptionImage() {
  return (
    <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-6 font-mono text-sm leading-relaxed relative">
      <div className="absolute top-2 right-2 badge-yellow text-[10px]">Sample Image</div>
      <div className="text-slate-400 text-xs mb-3">— Handwritten Prescription —</div>
      <div className="space-y-1.5 text-slate-700" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive" }}>
        <p><span className="text-slate-400 text-xs font-sans">Pt:</span> Rahul Kumar</p>
        <p className="mt-2"><span className="text-slate-400 text-xs font-sans">Rx:</span></p>
        <p className="ml-4">Tab. Amoxicillin 500mg</p>
        <p className="ml-4">1-0-1 × 5 days</p>
        <p className="ml-4">After food, Oral</p>
        <div className="mt-4 pt-2 border-t border-amber-200">
          <p className="text-right">Dr. A. Sharma</p>
          <p className="text-right text-xs text-slate-400 font-sans">15/11/2024</p>
        </div>
      </div>
    </div>
  );
}

export default function PrototypePage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [fields, setFields] = useState<PrescriptionField[]>(samplePrescriptionFields);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleLoadSample = () => {
    setIsProcessing(true);
    setStage('loaded');
    setTimeout(() => {
      setStage('extracted');
      setIsProcessing(false);
    }, 1500);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    setSaveError('');
    try {
      await api.post('/prescriptions/confirm-sample');
      setStage('confirmed');
    } catch (err: any) {
      setSaveError(err.message || 'Could not save the prescription.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStage('idle');
    setFields(samplePrescriptionFields);
  };

  const matchedItem = inventoryItems.find(i => i.medicine === 'Amoxicillin' && i.strength === '500 mg');

  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="page-title">Interactive Prototype</h1>
        <div className="prototype-banner">
          <Info className="w-3.5 h-3.5" />
          <span>Prototype / Demonstration Data</span>
        </div>
      </div>
      <p className="page-subtitle">Experience the proposed prescription digitisation workflow.</p>

      <div className="max-w-5xl">
        {/* Stage indicator */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {[
            { label: 'Upload', stage: 'loaded' as Stage },
            { label: 'Extract', stage: 'extracted' as Stage },
            { label: 'Review', stage: 'reviewing' as Stage },
            { label: 'Confirm', stage: 'confirmed' as Stage },
          ].map((step, i) => {
            const isActive = stage === step.stage || 
              (stage === 'extracted' && step.stage === 'loaded') ||
              (stage === 'confirmed' && ['loaded', 'extracted', 'reviewing'].includes(step.stage));
            const isPast = 
              (stage === 'extracted' && step.stage === 'loaded') ||
              (stage === 'confirmed');
            return (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                <span className={`text-xs font-medium px-2.5 py-1 rounded ${
                  isPast ? 'bg-emerald-50 text-emerald-700' :
                  isActive ? 'bg-primary-50 text-primary-700' :
                  'bg-slate-50 text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Idle state */}
        {stage === 'idle' && (
          <div className="card p-12 text-center animate-in">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-medium text-slate-700 mb-2">Load Sample Prescription</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              Click below to load a fictional sample handwritten prescription and see the proposed extraction workflow.
            </p>
            <button onClick={handleLoadSample} className="btn-primary">
              Load Sample Prescription
            </button>
            <p className="text-[10px] text-slate-400 mt-3">This uses fictional demonstration data only.</p>
          </div>
        )}

        {/* Processing */}
        {stage === 'loaded' && isProcessing && (
          <div className="card p-12 text-center animate-in">
            <div className="w-10 h-10 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-600">Processing prescription image...</p>
            <p className="text-xs text-slate-400 mt-1">Simulating AI-assisted extraction</p>
          </div>
        )}

        {/* Extracted - Side by side */}
        {(stage === 'extracted') && (
          <div className="space-y-6 animate-in">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left: Image */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Original Prescription</div>
                <PrescriptionImage />
              </div>

              {/* Right: Extraction */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">AI-Assisted Extraction</div>
                <div className="card divide-y divide-slate-100">
                  {fields.map((field, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">{field.label}</div>
                        <div className="text-sm font-medium text-slate-800 mt-0.5">{field.value}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ConfidenceBadge confidence={field.confidence} />
                        {field.needsVerification && (
                          <span className="badge-yellow text-[10px] whitespace-nowrap">
                            <AlertTriangle className="w-3 h-3 mr-0.5" />
                            Needs verification
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Formulary Match */}
            {matchedItem && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Formulary / Inventory Match</div>
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700">Exact formulary match found</span>
                  </div>
                  <div className="grid sm:grid-cols-4 gap-3">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Medicine</div>
                      <div className="text-sm font-medium text-slate-700">{matchedItem.medicine}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">SKU</div>
                      <div className="text-sm font-mono text-slate-600">{matchedItem.sku}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Stock</div>
                      <div className="text-sm font-medium text-slate-700">{matchedItem.stock} units</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Status</div>
                      <span className="badge-green text-[10px]">In Stock</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setStage('idle')} className="btn-secondary">
                Request Correction
              </button>
              <button onClick={handleConfirm} disabled={isProcessing} className="btn-primary">
                {isProcessing ? 'Saving...' : 'Confirm Prescription'}
              </button>
            </div>
            {saveError && <p className="text-xs text-red-600">{saveError}</p>}
          </div>
        )}

        {/* Confirmed */}
        {stage === 'confirmed' && (
          <div className="space-y-6 animate-in">
            <div className="card p-6 border-emerald-200 bg-emerald-50/30">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-medium text-emerald-800">Prescription confirmed in prototype</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">The following records have been updated in the demonstration:</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: FileText, label: 'Digital Prescription', desc: 'Stored securely' },
                  { icon: Package, label: 'Inventory', desc: 'Stock adjusted' },
                  { icon: Eye, label: 'Patient Dashboard', desc: 'Schedule updated' },
                  { icon: FileText, label: 'Audit Trail', desc: 'Event logged' },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-md border border-emerald-100 p-3">
                    <item.icon className="w-4 h-4 text-emerald-500 mb-1.5" />
                    <div className="text-sm font-medium text-slate-700">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Confirmed Prescription Summary</h3>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                {fields.map((field, i) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-xs text-slate-400">{field.label}</span>
                    <span className="text-sm text-slate-700 font-medium">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleReset} className="btn-secondary">
              Reset Demo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
