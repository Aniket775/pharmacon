import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { FileText, Eye, Loader2, ExternalLink } from 'lucide-react';

const suppliedDecks = [
  {
    title: 'Pharmacon Commitment Pitch',
    description: 'Revised scope, doctor-adaptive recognition strategy, roadmap and approval requirements.',
    file: '/presentations/Pharmacon_Commitment_Pitch.pptx',
  },
  {
    title: 'Merged Project Ideas Presentation',
    description: 'Original team project-ideas deck, including the medication-scheduling concept that preceded Pharmacon’s revised scope.',
    file: '/presentations/Merged_Presentation_from_Claude.pptx',
  },
];

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
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ deliverables: Deliverable[] }>('/deliverables')
      .then((data) => setDeliverables(data.deliverables))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <section className="animate-in">
          <h2 className="section-heading">Supplied Presentations</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {suppliedDecks.map((deck) => (
              <a key={deck.title} href={deck.file} download className="card-hover p-4 group">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="w-4 h-4 text-primary-500" />
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary-500" />
                </div>
                <h3 className="text-sm font-medium text-slate-800 mb-1">{deck.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{deck.description}</p>
                <span className="inline-block mt-3 text-xs font-medium text-primary-600">Download presentation</span>
              </a>
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
