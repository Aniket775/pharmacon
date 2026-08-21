import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FileText, Eye, Loader2, ExternalLink, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface Deck {
  id: string;
  title: string;
  description: string;
  filePath: string;
  sortOrder: number;
}

interface Deliverable {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
  description: string;
  file_name: string | null;
  version_name: string | null;
  version_status: string | null;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'published': return 'badge-green';
    case 'in-progress': return 'badge-yellow';
    case 'draft': return 'badge-slate';
    case 'archived': return 'badge-slate';
    default: return 'badge-slate';
  }
}

export default function PresentationsPage() {
  const { isAuthenticated } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state for decks
  const [editingDeck, setEditingDeck] = useState<string | null>(null);
  const [deckDraft, setDeckDraft] = useState({ title: '', description: '', filePath: '' });
  const [addingDeck, setAddingDeck] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<{ decks: Deck[] }>('/content/decks'),
      api.get<{ deliverables: Deliverable[] }>('/deliverables'),
    ])
      .then(([deckData, delivData]) => {
        setDecks(deckData.decks);
        setDeliverables(delivData.deliverables);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startEditDeck = (deck: Deck) => {
    setEditingDeck(deck.id);
    setDeckDraft({ title: deck.title, description: deck.description, filePath: deck.filePath });
  };

  const saveDeck = async () => {
    if (!editingDeck) return;
    setSaving(true);
    try {
      await api.put(`/content/decks/${editingDeck}`, deckDraft);
      setDecks((prev) => prev.map((d) => d.id === editingDeck ? { ...d, ...deckDraft } : d));
      setEditingDeck(null);
    } finally {
      setSaving(false);
    }
  };

  const addDeck = async () => {
    setSaving(true);
    try {
      const newDeck = await api.post<Deck>('/content/decks', deckDraft);
      setDecks((prev) => [...prev, newDeck]);
      setAddingDeck(false);
      setDeckDraft({ title: '', description: '', filePath: '' });
    } finally {
      setSaving(false);
    }
  };

  const deleteDeck = async (id: string) => {
    await api.delete(`/content/decks/${id}`);
    setDecks((prev) => prev.filter((d) => d.id !== id));
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  // Group deliverables by version
  const byVersion: Record<string, Deliverable[]> = {};
  const noVersion: Deliverable[] = [];

  deliverables.forEach((d) => {
    if (d.version_name) {
      if (!byVersion[d.version_name]) byVersion[d.version_name] = [];
      byVersion[d.version_name].push(d);
    } else {
      noVersion.push(d);
    }
  });

  return (
    <div className="page-container">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="page-title">Presentations & Deliverables</h1>
      </div>
      <p className="page-subtitle">Each deliverable has its own page with full detail and file attachments.</p>

      <div className="max-w-4xl space-y-8">
        {/* Supplied Presentations — editable */}
        <section className="animate-in">
          <div className="flex items-center gap-2 group mb-3">
            <h2 className="section-heading flex-1">Supplied Presentations</h2>
            {isAuthenticated && !addingDeck && (
              <button
                onClick={() => { setAddingDeck(true); setDeckDraft({ title: '', description: '', filePath: '' }); }}
                className="edit-pencil-btn flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add new deck form */}
          {addingDeck && (
            <div className="card p-4 mb-3 border-primary-200 bg-primary-50/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">New Presentation</span>
                <div className="flex gap-1">
                  <button onClick={() => setAddingDeck(false)} className="edit-action-btn text-slate-500 hover:text-slate-700"><X className="w-4 h-4" /></button>
                  <button onClick={addDeck} disabled={saving || !deckDraft.title} className="edit-action-btn text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <input type="text" placeholder="Title" value={deckDraft.title} onChange={(e) => setDeckDraft((d) => ({ ...d, title: e.target.value }))} className="editable-input" />
              <textarea placeholder="Description" value={deckDraft.description} onChange={(e) => setDeckDraft((d) => ({ ...d, description: e.target.value }))} className="editable-textarea" rows={2} />
              <input type="text" placeholder="File path (e.g. /presentations/file.pptx)" value={deckDraft.filePath} onChange={(e) => setDeckDraft((d) => ({ ...d, filePath: e.target.value }))} className="editable-input" />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {decks.map((deck) => (
              editingDeck === deck.id ? (
                <div key={deck.id} className="card p-4 border-primary-200 bg-primary-50/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Editing</span>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingDeck(null)} className="edit-action-btn text-slate-500 hover:text-slate-700"><X className="w-4 h-4" /></button>
                      <button onClick={saveDeck} disabled={saving} className="edit-action-btn text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <input type="text" value={deckDraft.title} onChange={(e) => setDeckDraft((d) => ({ ...d, title: e.target.value }))} className="editable-input" />
                  <textarea value={deckDraft.description} onChange={(e) => setDeckDraft((d) => ({ ...d, description: e.target.value }))} className="editable-textarea" rows={2} />
                  <input type="text" value={deckDraft.filePath} onChange={(e) => setDeckDraft((d) => ({ ...d, filePath: e.target.value }))} className="editable-input" placeholder="File path" />
                </div>
              ) : (
                <div key={deck.id} className="card-hover p-4 group relative">
                  <a href={deck.filePath} download className="block">
                    <div className="flex items-center justify-between mb-3">
                      <FileText className="w-4 h-4 text-primary-500" />
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary-500" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-800 mb-1">{deck.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{deck.description}</p>
                    <span className="inline-block mt-3 text-xs font-medium text-primary-600">Download presentation</span>
                  </a>
                  {isAuthenticated && (
                    <div className="absolute top-2 right-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.preventDefault(); startEditDeck(deck); }} className="edit-pencil-btn"><Pencil className="w-3 h-3" /></button>
                      <button onClick={(e) => { e.preventDefault(); deleteDeck(deck.id); }} className="edit-pencil-btn text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        </section>

        {/* Planning V1 section */}
        {Object.entries(byVersion).map(([versionName, items], vi) => (
          <section key={versionName} className="animate-in" style={{ animationDelay: `${vi * 0.05}s` }}>
            <h2 className="section-heading">{versionName}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((d) => (
                <Link
                  key={d.id}
                  to={`/deliverable/${d.id}`}
                  className="card-hover p-4 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className={getStatusBadge(d.status)}>
                      {d.status === 'in-progress' ? 'In Progress' : d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-800 mb-1 group-hover:text-primary-600 transition-colors">
                    {d.title}
                  </h3>
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <div>Type: {d.type}</div>
                    <div>Date: {d.date}</div>
                    {d.file_name && <div className="text-primary-600">📎 {d.file_name}</div>}
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-xs text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-3 h-3" />
                    View Details
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* Unversioned deliverables */}
        {noVersion.length > 0 && (
          <section className="animate-in">
            <h2 className="section-heading">Other Deliverables</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {noVersion.map((d) => (
                <Link
                  key={d.id}
                  to={`/deliverable/${d.id}`}
                  className="card-hover p-4 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className={getStatusBadge(d.status)}>
                      {d.status === 'in-progress' ? 'In Progress' : d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-800 mb-1 group-hover:text-primary-600 transition-colors">
                    {d.title}
                  </h3>
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <div>Type: {d.type}</div>
                    <div>Date: {d.date}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick navigation */}
        <section className="animate-in-delay-1">
          <h2 className="section-heading">Quick Navigation</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link to="/software-grid" className="card-hover p-4 flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-primary-500" />
              <div>
                <div className="text-sm font-medium text-slate-800">Software Grid</div>
                <div className="text-xs text-slate-500">Technology stack overview</div>
              </div>
            </Link>
            <Link to="/versions" className="card-hover p-4 flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-primary-500" />
              <div>
                <div className="text-sm font-medium text-slate-800">Version History</div>
                <div className="text-xs text-slate-500">All versions and changes</div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
