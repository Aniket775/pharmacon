import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import VersionTimeline from '../components/VersionTimeline';
import { GitBranch, Plus, Loader2, X } from 'lucide-react';

interface Version {
  id: string;
  name: string;
  date: string;
  authors: string;
  status: string;
  change_summary: string;
  commit_ref: string;
  deployment_url: string;
  parent_version_id: string | null;
}

export default function VersionsPage() {
  const { isAdmin } = useAuth();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '', date: '', authors: 'Team', status: 'draft',
    changeSummary: '', commitRef: '', deploymentUrl: '', parentVersionId: '',
  });

  useEffect(() => {
    api.get<{ versions: Version[] }>('/versions')
      .then((data) => setVersions(data.versions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const createVersion = async () => {
    setCreating(true);
    try {
      const result = await api.post<{ version: Version }>('/versions', form);
      setVersions((prev) => [...prev, result.version]);
      setShowCreate(false);
      setForm({ name: '', date: '', authors: 'Team', status: 'draft', changeSummary: '', commitRef: '', deploymentUrl: '', parentVersionId: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
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
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="page-title">Version History</h1>
        {isAdmin && (
          <button onClick={() => setShowCreate(!showCreate)} className="btn-secondary gap-2 text-xs">
            {showCreate ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showCreate ? 'Cancel' : 'New Version'}
          </button>
        )}
      </div>
      <p className="page-subtitle">All versions remain accessible. Creating a new version archives the previous one.</p>

      <div className="max-w-3xl space-y-8">
        {/* Create form */}
        {showCreate && (
          <section className="animate-in">
            <h2 className="section-heading">Create New Version</h2>
            <div className="card p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Version Name</label>
                  <input type="text" className="input" placeholder="e.g., Planning V2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input type="date" className="input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div>
                  <label className="label">Authors</label>
                  <input type="text" className="input" placeholder="Team" value={form.authors} onChange={e => setForm({...form, authors: e.target.value})} />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="draft">Draft</option>
                    <option value="current">Current</option>
                    <option value="future">Future</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Change Summary</label>
                <textarea className="input" rows={3} placeholder="What changed in this version..." value={form.changeSummary} onChange={e => setForm({...form, changeSummary: e.target.value})} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Commit Reference (URL)</label>
                  <input type="url" className="input" placeholder="https://github.com/..." value={form.commitRef} onChange={e => setForm({...form, commitRef: e.target.value})} />
                </div>
                <div>
                  <label className="label">Deployment URL</label>
                  <input type="url" className="input" placeholder="https://..." value={form.deploymentUrl} onChange={e => setForm({...form, deploymentUrl: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label">Parent Version</label>
                <select className="select" value={form.parentVersionId} onChange={e => setForm({...form, parentVersionId: e.target.value})}>
                  <option value="">None</option>
                  {versions.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                <button onClick={createVersion} disabled={creating || !form.name || !form.date} className="btn-primary gap-2">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {creating ? 'Creating...' : 'Create Version'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Timeline */}
        <section className="animate-in">
          <VersionTimeline
            versions={versions}
            selectedId={selectedId}
            onSelect={(v) => setSelectedId(v.id === selectedId ? undefined : v.id)}
          />
        </section>

        {/* Detail panel */}
        {selectedId && (() => {
          const v = versions.find(ver => ver.id === selectedId);
          if (!v) return null;
          return (
            <section className="animate-in">
              <h2 className="section-heading">Version Detail: {v.name}</h2>
              <div className="card p-5">
                <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Version</div>
                    <div className="text-slate-700 font-medium">{v.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Date</div>
                    <div className="text-slate-700">{v.date}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Authors</div>
                    <div className="text-slate-700">{v.authors}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Status</div>
                    <div className="text-slate-700 capitalize">{v.status}</div>
                  </div>
                </div>
                {v.change_summary && (
                  <div className="border-t border-slate-100 pt-3 mt-3">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">What Changed</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{v.change_summary}</p>
                  </div>
                )}
                {(v.commit_ref || v.deployment_url) && (
                  <div className="border-t border-slate-100 pt-3 mt-3 flex gap-4">
                    {v.commit_ref && (
                      <a href={v.commit_ref} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">
                        View Commit →
                      </a>
                    )}
                    {v.deployment_url && (
                      <a href={v.deployment_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">
                        View Deployment →
                      </a>
                    )}
                  </div>
                )}
              </div>
            </section>
          );
        })()}
      </div>
    </div>
  );
}
