import { Stethoscope, ClipboardList, Package, User, Settings, AlertCircle } from 'lucide-react';

const userGroups = [
  {
    icon: Stethoscope,
    name: 'Doctors',
    who: 'Medical professionals who write prescriptions during patient consultations.',
    need: 'A quick, non-disruptive way to have their handwritten prescriptions digitised accurately.',
    help: 'Pharmacon could provide optional handwriting calibration to improve recognition accuracy for their specific writing style, reducing downstream corrections.',
  },
  {
    icon: ClipboardList,
    name: 'Clinic Staff',
    who: 'Administrative or clinical staff who process prescriptions at the point of care.',
    need: 'A faster and more reliable way to digitise prescriptions without full manual re-entry.',
    help: 'Staff would review AI-extracted fields with confidence indicators, only correcting flagged items — instead of transcribing the entire prescription manually.',
  },
  {
    icon: Package,
    name: 'Pharmacists',
    who: 'Pharmacy professionals who dispense medicines and manage inventory.',
    need: 'Accurate digital prescriptions that map directly to their formulary and inventory.',
    help: 'Pharmacon could match confirmed prescriptions to formulary items, update inventory records, and surface stock alerts — reducing lookup time.',
  },
  {
    icon: User,
    name: 'Patients',
    who: 'Individuals who receive prescriptions from their doctors.',
    need: 'A clear view of their confirmed prescriptions, medicine schedule and refill status.',
    help: 'A patient dashboard could show confirmed medicines, dosing schedule (morning/afternoon/night), and allow refill requests — improving medication visibility.',
  },
  {
    icon: Settings,
    name: 'Administrators',
    who: 'System administrators who manage clinics, users and system configuration.',
    need: 'Oversight of system activity, user management and audit compliance.',
    help: 'An admin portal could provide user management, system status, audit trails and activity monitoring across all clinics and pharmacies.',
  },
];

const problems = [
  'Handwriting ambiguity — different doctors write differently, and some handwriting is difficult to read',
  'Manual data entry — staff must interpret and type prescription details manually',
  'Transcription errors — manual entry can introduce mistakes in medicine names, dosages or frequencies',
  'Repeated work — the same prescription may need to be entered multiple times across systems',
  'Disconnected records — prescription data, inventory and patient records are often in separate systems',
  'Limited patient visibility — patients may not have easy access to their prescription history or schedule',
];

export default function ProblemUsersPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">Problem & Users</h1>
      <p className="page-subtitle">Understanding the challenges and the people Pharmacon aims to help.</p>

      <div className="max-w-4xl space-y-10">
        {/* Problem */}
        <section className="animate-in">
          <h2 className="section-heading">The Problem Space</h2>
          <div className="card p-5">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              In many clinical environments, doctors write prescriptions by hand. Clinic and pharmacy staff 
              then need to interpret and digitise these prescriptions — a process that can introduce several challenges:
            </p>
            <ul className="space-y-2.5">
              {problems.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-600">
                  <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-400 mt-4 italic">
              Note: These are potential challenges observed in general clinical workflows. 
              We do not make specific unsupported medical or safety claims.
            </p>
          </div>
        </section>

        {/* User Groups */}
        <section className="animate-in-delay-1">
          <h2 className="section-heading">User Groups</h2>
          <div className="space-y-4">
            {userGroups.map((group, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-md bg-primary-50 flex items-center justify-center">
                    <group.icon className="w-4.5 h-4.5 text-primary-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">{group.name}</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Who they are</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{group.who}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">What they need</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{group.need}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">How Pharmacon could help</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{group.help}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
