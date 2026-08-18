import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { FileText, Download, ArrowLeft, Calendar, Users, GitBranch, Eye, File, Image, Loader2 } from 'lucide-react';

interface DeliverableDetail {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
  description: string;
  file_id: string | null;
  file_name: string | null;
  file_mime_type: string | null;
  file_size: number | null;
  file_disk_name: string | null;
  file_uploaded_at: string | null;
  version_name: string | null;
  version_status: string | null;
  version_date: string | null;
  version_authors: string | null;
  version_change_summary: string | null;
}

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  status: string;
  version_name: string | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

export default function DeliverableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [deliverable, setDeliverable] = useState<DeliverableDetail | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<{ deliverable: DeliverableDetail; history: HistoryItem[] }>(`/deliverables/${id}`)
      .then((data) => {
        setDeliverable(data.deliverable);
        setHistory(data.history);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error || !deliverable) {
    return (
      <div className="page-container">
        <div className="text-center py-16">
          <p className="text-sm text-slate-500 mb-4">{error || 'Deliverable not found'}</p>
          <Link to="/presentations" className="btn-secondary gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Deliverables
          </Link>
        </div>
      </div>
    );
  }

  const isImage = deliverable.file_mime_type?.startsWith('image/');
  const isPdf = deliverable.file_mime_type?.includes('pdf');

  return (
    <div className="page-container">
      {/* Back link */}
      <Link to="/presentations" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Deliverables
      </Link>

      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="animate-in">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="page-title mb-0">{deliverable.title}</h1>
            <span className={getStatusBadge(deliverable.status)}>
              {deliverable.status === 'in-progress' ? 'In Progress' :
               deliverable.status.charAt(0).toUpperCase() + deliverable.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-slate-500">{deliverable.type} · {deliverable.date}</p>
        </div>

        {/* Meta grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in-delay-1">
          <div className="card p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              Date
            </div>
            <div className="text-sm font-medium text-slate-700">{deliverable.date}</div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <FileText className="w-3.5 h-3.5" />
              Type
            </div>
            <div className="text-sm font-medium text-slate-700">{deliverable.type}</div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <GitBranch className="w-3.5 h-3.5" />
              Version
            </div>
            <div className="text-sm font-medium text-slate-700">{deliverable.version_name || '—'}</div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Users className="w-3.5 h-3.5" />
              Authors
            </div>
            <div className="text-sm font-medium text-slate-700">{deliverable.version_authors || 'Team'}</div>
          </div>
        </div>

        {/* Description */}
        {deliverable.description && (
          <section className="animate-in-delay-2">
            <h2 className="section-heading">Description</h2>
            <div className="card p-5">
              <p className="text-sm text-slate-600 leading-relaxed">{deliverable.description}</p>
            </div>
          </section>
        )}

        {/* Attached file */}
        {deliverable.file_id && (
          <section className="animate-in-delay-3">
            <h2 className="section-heading">Attached File</h2>
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isImage ? (
                    <Image className="w-5 h-5 text-slate-400" />
                  ) : (
                    <File className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-slate-700">{deliverable.file_name}</div>
                    <div className="text-xs text-slate-400">
                      {deliverable.file_size ? formatFileSize(deliverable.file_size) : '—'}
                      {deliverable.file_uploaded_at ? ` · Uploaded ${new Date(deliverable.file_uploaded_at).toLocaleDateString()}` : ''}
                    </div>
                  </div>
                </div>
                <a
                  href={`/api/files/${deliverable.file_id}/download`}
                  className="btn-secondary gap-2 text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>

              {/* Inline preview */}
              {isPdf && deliverable.file_disk_name && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <iframe
                    src={`/uploads/${deliverable.file_disk_name}`}
                    className="w-full h-[600px]"
                    title="PDF Preview"
                  />
                </div>
              )}
              {isImage && deliverable.file_disk_name && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-4">
                  <img
                    src={`/uploads/${deliverable.file_disk_name}`}
                    alt={deliverable.file_name || 'Preview'}
                    className="max-w-full max-h-[500px] object-contain rounded"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Version context */}
        {deliverable.version_name && (
          <section>
            <h2 className="section-heading">Version Context</h2>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <GitBranch className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-800">{deliverable.version_name}</span>
                <span className={
                  deliverable.version_status === 'current' ? 'badge-green' :
                  deliverable.version_status === 'archived' ? 'badge-slate' : 'badge-blue'
                }>
                  {deliverable.version_status}
                </span>
              </div>
              {deliverable.version_change_summary && (
                <p className="text-xs text-slate-500 leading-relaxed">{deliverable.version_change_summary}</p>
              )}
            </div>
          </section>
        )}

        {/* Related deliverables */}
        {history.length > 0 && (
          <section>
            <h2 className="section-heading">Related Versions</h2>
            <div className="space-y-2">
              {history.map((item) => (
                <Link
                  key={item.id}
                  to={`/deliverable/${item.id}`}
                  className="card-hover p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-700">{item.title}</div>
                    <div className="text-xs text-slate-500">
                      {item.version_name || '—'} · {item.date}
                    </div>
                  </div>
                  <span className={getStatusBadge(item.status)}>
                    {item.status === 'in-progress' ? 'In Progress' :
                     item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
