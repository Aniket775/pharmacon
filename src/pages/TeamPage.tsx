import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Loader2, Github, Linkedin, Save, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FileUploader from '../components/FileUploader';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  focus: string;
  avatar: string;
  github_url: string;
  linkedin_url: string;
  skills?: string;
  avatar_filename?: string | null;
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TeamMember | null>(null);
  const [form, setForm] = useState({ role: '', focus: '', skills: '', githubUrl: '', linkedinUrl: '', avatarFileId: '' });
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    api.get<{ members: TeamMember[] }>('/team')
      .then((data) => setTeam(data.members))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get<{ member: TeamMember }>('/team/me/profile').then(({ member }) => {
      setProfile(member);
      setForm({ role: member.role, focus: member.focus, skills: member.skills || '', githubUrl: member.github_url || '', linkedinUrl: member.linkedin_url || '', avatarFileId: '' });
    }).catch(() => setProfile(null));
  }, [isAuthenticated]);

  const saveProfile = async () => {
    setSaving(true);
    setProfileMessage('');
    try {
      const { member } = await api.put<{ member: TeamMember }>('/team/me/profile', form);
      setProfile(member);
      setProfileMessage('Profile saved.');
      setTeam((members) => members.map((item) => item.id === member.id ? member : item));
      setForm((current) => ({ ...current, avatarFileId: '' }));
    } catch (err: any) { setProfileMessage(err.message || 'Could not save profile.'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Team</h1>
      <p className="page-subtitle">Meet the team behind Pharmacon.</p>

      <div className="max-w-4xl space-y-8">
        {profile && (
          <section className="card p-5 animate-in">
            <div className="flex items-center gap-2 mb-4">
              <UserRound className="w-4 h-4 text-primary-500" />
              <h2 className="text-sm font-semibold text-slate-800">Edit My Team Profile</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Profile photo</label>
                <div className="flex items-center gap-4">
                  {profile.avatar_filename ? <img src={`/uploads/${profile.avatar_filename}`} className="w-14 h-14 rounded-xl object-cover border border-slate-200" alt="Your profile" /> : <div className="w-14 h-14 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-semibold">{profile.avatar}</div>}
                  <FileUploader maxFiles={1} accept="image/png,image/jpeg,image/webp" onUploadComplete={(files) => setForm((current) => ({ ...current, avatarFileId: files[0]?.id || '' }))} />
                </div>
                {form.avatarFileId && <p className="text-xs text-emerald-600 mt-2">New photo uploaded—save the profile to apply it.</p>}
              </div>
              <div>
                <label className="label">Team role</label>
                <input className="input" value={form.role} placeholder="e.g., Backend Lead" onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
              <div>
                <label className="label">Focus / bio</label>
                <textarea className="input" rows={3} value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })} />
              </div>
              <div>
                <label className="label">Skills</label>
                <textarea className="input" rows={3} placeholder="React, Node.js, Figma…" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
              </div>
              <div>
                <label className="label">GitHub URL</label>
                <input className="input" type="url" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
              </div>
              <div>
                <label className="label">LinkedIn URL</label>
                <input className="input" type="url" value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button onClick={saveProfile} disabled={saving} className="btn-primary text-xs gap-2"><Save className="w-3.5 h-3.5" />{saving ? 'Saving…' : 'Save profile'}</button>
              {profileMessage && <span className={`text-xs ${profileMessage === 'Profile saved.' ? 'text-emerald-600' : 'text-red-600'}`}>{profileMessage}</span>}
            </div>
          </section>
        )}
        {/* Team grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {team.map((member, i) => (
            <div key={member.id} className="card-hover p-6 animate-in" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex items-start gap-4">
                {member.avatar_filename ? <img src={`/uploads/${member.avatar_filename}`} className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0" alt={`${member.name}'s profile`} /> : <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-base font-semibold text-primary-600 flex-shrink-0">{member.avatar}</div>}
                <div className="flex-1">
                  <div className="text-base font-semibold text-slate-800">{member.name}</div>
                  <div className="text-sm text-primary-600 font-medium mt-0.5">{member.role}</div>
                  <p className="text-sm text-slate-500 leading-relaxed mt-2">{member.focus}</p>
                  {member.skills && <p className="text-xs text-slate-500 leading-relaxed mt-2"><span className="font-medium text-slate-600">Skills:</span> {member.skills}</p>}

                  {/* Links */}
                  {(member.github_url || member.linkedin_url) && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                      {member.github_url && (
                        <a
                          href={member.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <Github className="w-3.5 h-3.5" />
                          GitHub
                        </a>
                      )}
                      {member.linkedin_url && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contribution areas */}
        <section className="animate-in-delay-1">
          <h2 className="section-heading">Contribution Areas</h2>
          <div className="card divide-y divide-slate-100">
            {[
              { area: 'Frontend', desc: 'React web application, UI/UX design, responsive layouts, and component architecture' },
              { area: 'Backend', desc: 'Express API server, SQLite database, authentication, file management, and version control' },
              { area: 'AI / CV', desc: 'Handwriting recognition research, model training, doctor-specific adaptation, and evaluation' },
              { area: 'Integration', desc: 'System integration, formulary/inventory adapters, deployment pipeline, and testing' },
            ].map((item, i) => (
              <div key={i} className="px-5 py-3 flex gap-4">
                <span className="text-sm font-medium text-slate-700 w-24 flex-shrink-0">{item.area}</span>
                <span className="text-sm text-slate-500">{item.desc}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
