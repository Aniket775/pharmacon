import { useEffect, useState } from 'react';
import { patientSchedule } from '../../data/mockData';
import { api } from '../../api/client';
import { Pill, Sun, Moon, Clock, RefreshCw, CheckCircle, Phone, Info } from 'lucide-react';

export default function PatientDashboard() {
  const [refillRequested, setRefillRequested] = useState(false);
  const [refillError, setRefillError] = useState('');
  const [savedRefill, setSavedRefill] = useState<any>(null);
  const { patient, prescriptions, refills } = patientSchedule;

  useEffect(() => {
    api.get<{ refills: any[] }>('/refills').then(({ refills }) => {
      const pending = refills.find((refill) => refill.status === 'pending');
      if (pending) { setSavedRefill(pending); setRefillRequested(true); }
    }).catch(() => {});
  }, []);

  const requestRefill = () => {
    api.post<{ id: string }>('/refills').then(({ id }) => {
      setSavedRefill({ id, status: 'pending' });
      setRefillRequested(true);
      setRefillError('');
    }).catch((err) => setRefillError(err.message));
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Patient Portal</h1>
      <p className="page-subtitle">{patient.name} — Confirmed prescriptions and medicine schedule.</p>

      <div className="max-w-3xl space-y-8">
        {/* Confirmed Prescriptions */}
        <section className="animate-in">
          <h2 className="section-heading">Confirmed Prescriptions</h2>
          {prescriptions.map((rx) => (
            <div key={rx.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium text-slate-800">{rx.medicine} {rx.strength}</span>
                </div>
                <span className="badge-green">Confirmed</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Form</div>
                  <div className="text-slate-700">{rx.form}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Frequency</div>
                  <div className="text-slate-700">{rx.frequency}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Duration</div>
                  <div className="text-slate-700">{rx.duration}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Instructions</div>
                  <div className="text-slate-700">{rx.instructions}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-3">
                Prescribed by {rx.doctor} · {rx.date}
              </div>
            </div>
          ))}
        </section>

        {/* Today's Schedule */}
        <section className="animate-in-delay-1">
          <h2 className="section-heading">Today's Schedule</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { period: 'Morning', icon: Sun, time: 'After breakfast', active: prescriptions[0]?.schedule.morning },
              { period: 'Afternoon', icon: Clock, time: 'After lunch', active: prescriptions[0]?.schedule.afternoon },
              { period: 'Night', icon: Moon, time: 'After dinner', active: prescriptions[0]?.schedule.night },
            ].map((slot, i) => (
              <div key={i} className={`card p-4 ${slot.active ? 'border-primary-200 bg-primary-50/30' : 'opacity-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <slot.icon className={`w-4 h-4 ${slot.active ? 'text-primary-500' : 'text-slate-400'}`} />
                  <span className="text-sm font-medium text-slate-700">{slot.period}</span>
                </div>
                {slot.active ? (
                  <div>
                    <div className="text-sm text-slate-700">{prescriptions[0]?.medicine} {prescriptions[0]?.strength}</div>
                    <div className="text-xs text-slate-500">{slot.time}</div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">No medicine scheduled</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Refill */}
        <section className="animate-in-delay-2">
          <h2 className="section-heading">Refill Status</h2>
          <div className="card p-5">
            {refillRequested ? (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <div>
                  <div className="text-sm font-medium text-emerald-700">Refill requested</div>
                  <div className="text-xs text-slate-500">Your pharmacy will review this request{savedRefill?.id ? ` · ${savedRefill.id}` : ''}.</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-700">{prescriptions[0]?.medicine} {prescriptions[0]?.strength}</div>
                  <div className="text-xs text-slate-500">Request a refill when needed</div>
                </div>
                <button onClick={requestRefill} className="btn-primary text-xs gap-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Request Refill
                </button>
              </div>
            )}
            {refillError && <p className="text-xs text-red-600 mt-3">{refillError}</p>}
          </div>
        </section>

        {/* Clinic Contact */}
        <section>
          <h2 className="section-heading">Clinic Contact</h2>
          <div className="card p-4 flex items-center gap-3">
            <Phone className="w-4 h-4 text-slate-400" />
            <div>
              <div className="text-sm text-slate-700">City Health Clinic</div>
              <div className="text-xs text-slate-500">+91 98765 43210 · Open Mon–Sat, 9 AM – 6 PM</div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="flex gap-3 items-start p-4 bg-slate-50 rounded-lg border border-slate-200">
          <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-500 leading-relaxed">
            This dashboard displays confirmed prescription information only. It does not modify or optimise 
            the doctor's instructions. All information shown has been verified by authorised clinical staff.
          </p>
        </div>
      </div>
    </div>
  );
}
