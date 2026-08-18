import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, FileText, FlaskConical, Info, Users, GitBranch, ExternalLink, Loader2 } from 'lucide-react';
import { api } from '../api/client';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus: string;
  avatar: string;
  github_url: string;
  linkedin_url: string;
  avatar_filename?: string | null;
}

const workflowSteps = [
  { label: 'Handwritten Prescription', desc: 'Paper-based doctor prescription' },
  { label: 'AI-Assisted Extraction', desc: 'Computer vision + handwriting recognition' },
  { label: 'Human Verification', desc: 'Confidence-aware review by staff' },
  { label: 'Formulary / Inventory Match', desc: 'Automated medicine matching' },
  { label: 'Confirmed Digital Prescription', desc: 'Verified and stored securely' },
  { label: 'Patient Dashboard', desc: 'Accessible schedule and history' },
];

const quickLinks = [
  { label: 'Project Overview', path: '/project', icon: FileText },
  { label: 'Software Grid', path: '/software-grid', icon: ExternalLink },
  { label: 'Prototype Demo', path: '/prototype', icon: FlaskConical },
  { label: 'Presentations', path: '/presentations', icon: FileText },
  { label: 'Version History', path: '/versions', icon: GitBranch },
  { label: 'Team', path: '/team', icon: Users },
];

export default function HomePage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [teamLoaded, setTeamLoaded] = useState(false);

  useEffect(() => {
    api.get<{ members: TeamMember[] }>('/team')
      .then((data) => setTeam(data.members))
      .catch(() => {})
      .finally(() => setTeamLoaded(true));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="page-container py-16 lg:py-24">
        <div className="max-w-2xl animate-in">
          <div className="prototype-banner mb-6">
            <Info className="w-3.5 h-3.5" />
            <span>Proposed System · Prototype Stage</span>
          </div>
          
          <h1 className="text-3xl lg:text-[2.5rem] font-semibold text-slate-900 leading-tight tracking-tight mb-4">
            Connecting Handwritten Prescriptions to Connected Care
          </h1>
          
          <p className="text-base lg:text-lg text-slate-500 leading-relaxed mb-8 max-w-xl">
            A proposed platform for digitising handwritten prescriptions and connecting clinics, 
            pharmacies and patients through a verified digital workflow.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Link to="/prototype" className="btn-primary gap-2">
              <FlaskConical className="w-4 h-4" />
              Explore Prototype
            </Link>
            <Link to="/project" className="btn-secondary gap-2">
              <FileText className="w-4 h-4" />
              View Project
            </Link>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="border-t border-slate-100 bg-slate-50/50">
        <div className="page-container py-12">
          <div className="text-center mb-8 animate-in">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Current Status</h2>
            <p className="text-sm text-slate-500">Project phase and recent progress</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto animate-in-delay-1">
            <div className="card p-5 text-center">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-semibold text-emerald-600">V1</span>
              </div>
              <div className="text-sm font-semibold text-slate-800">Planning V1</div>
              <div className="text-xs text-slate-500 mt-1">Current phase</div>
            </div>
            <div className="card p-5 text-center">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <FlaskConical className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-slate-800">Prototype Stage</div>
              <div className="text-xs text-slate-500 mt-1">Demonstrating proposed workflow</div>
            </div>
            <div className="card p-5 text-center">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-3">
                <Info className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-sm font-semibold text-slate-800">Under Evaluation</div>
              <div className="text-xs text-slate-500 mt-1">Scope being refined</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="border-t border-slate-100">
        <div className="page-container py-12">
          <div className="text-center mb-8 animate-in">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Meet the Team</h2>
            <p className="text-sm text-slate-500">The people behind Pharmacon</p>
          </div>

          {teamLoaded ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {team.map((member, i) => (
                <div key={member.id} className="card-hover p-5 text-center animate-in" style={{ animationDelay: `${i * 0.06}s` }}>
                  {member.avatar_filename ? <img src={`/uploads/${member.avatar_filename}`} className="w-12 h-12 rounded-full object-cover mx-auto mb-3 border border-slate-200" alt={`${member.name}'s profile`} /> : <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3 text-sm font-semibold text-primary-600">{member.avatar}</div>}
                  <div className="text-sm font-medium text-slate-800">{member.name}</div>
                  <div className="text-xs text-primary-600 font-medium mt-0.5">{member.role}</div>
                  <div className="text-xs text-slate-500 mt-2 leading-relaxed">{member.focus}</div>
                  {(member.github_url || member.linkedin_url) && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                      {member.github_url && (
                        <a href={member.github_url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">GitHub</a>
                      )}
                      {member.linkedin_url && (
                        <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">LinkedIn</a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="border-t border-slate-100 bg-slate-50/50">
        <div className="page-container py-12">
          <div className="text-center mb-8 animate-in">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Quick Links</h2>
            <p className="text-sm text-slate-500">Navigate to key sections of the project</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {quickLinks.map((link, i) => (
              <Link
                key={i}
                to={link.path}
                className="card-hover p-4 flex items-center gap-3 animate-in"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <link.icon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700">{link.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow */}
      <div className="border-t border-slate-100">
        <div className="page-container py-16">
          <div className="text-center mb-10 animate-in">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Proposed Workflow</h2>
            <p className="text-sm text-slate-500">End-to-end prescription digitisation pipeline</p>
          </div>

          <div className="max-w-md mx-auto space-y-0">
            {workflowSteps.map((step, i) => (
              <div key={i} className="animate-in" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="workflow-step">
                  <div className="w-8 h-8 rounded-md bg-primary-50 flex items-center justify-center text-primary-600 text-sm font-semibold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{step.label}</div>
                    <div className="text-xs text-slate-500">{step.desc}</div>
                  </div>
                </div>
                {i < workflowSteps.length - 1 && (
                  <div className="workflow-arrow py-1.5">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key points */}
      <div className="border-t border-slate-100 bg-slate-50/50">
        <div className="page-container py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Current Direction', desc: 'Exploring reliable handwriting digitisation with doctor-specific adaptation and formulary integration.' },
              { title: 'Prototype Stage', desc: 'Demonstrating the proposed workflow with fictional data. Exact scope is still being evaluated by our team.' },
              { title: 'Modular Architecture', desc: 'Designed for flexibility — components can be replaced, added or removed as the project scope evolves.' },
            ].map((item, i) => (
              <div key={i} className="card p-5 animate-in" style={{ animationDelay: `${i * 0.06}s` }}>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety */}
      <div className="border-t border-slate-100">
        <div className="page-container py-8">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex gap-3 items-start">
            <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Pharmacon is intended to digitise and connect confirmed prescriptions. It does not diagnose conditions, 
              recommend medicines, substitute medicines, change dosages, or override professional clinical judgement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
