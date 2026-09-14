import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { logAuditEvent } from '../lib/auditLogger';
import {
  Presentation,
  UploadCloud,
  Download,
  Eye,
  FileSpreadsheet,
  Plus,
  Loader2,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const DEFAULT_DECKS = [
  {
    id: 'DECK-001',
    title: 'Pharmacon Commitment Pitch (V1)',
    description: 'Revised project scope, doctor-adaptive handwriting OCR strategy, formulary constraints, roadmap, and milestone approvals.',
    file_path: '/presentations/Pharmacon_Commitment_Pitch.pptx',
    file_url: './presentations/Pharmacon_Commitment_Pitch.pptx',
    web_viewer_url: '/presentation/v1',
    created_at: '2026-08-25',
  },
  {
    id: 'DECK-002',
    title: 'Merged Project Ideas Presentation (V2)',
    description: 'Original team project-ideas deck, including the medication-scheduling and formulary integration concept preceding Pharmacon.',
    file_path: '/presentations/Merged_Presentation_from_Claude.pptx',
    file_url: './presentations/Merged_Presentation_from_Claude.pptx',
    web_viewer_url: '/presentation/v2',
    created_at: '2026-09-10',
  },
];

export default function PresentationsPage() {
  const { role, profile, user } = useAuth();
  const [decks, setDecks] = useState(DEFAULT_DECKS);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
  });

  const isAdmin = role === 'admin' || role === 'instructor';

  const fetchDecks = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setDecks(DEFAULT_DECKS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('presentation_decks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setDecks(DEFAULT_DECKS);
      } else {
        // Map data with fallback public URLs if needed
        const mapped = data.map((d) => ({
          ...d,
          file_url: d.file_url || d.file_path || `./presentations/${d.file_path.split('/').pop()}`,
          web_viewer_url: d.id.includes('002') ? '/presentation/v2' : '/presentation/v1',
        }));
        setDecks(mapped);
      }
    } catch (err) {
      console.warn('Decks fetch exception:', err);
      setDecks(DEFAULT_DECKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleUploadDeck = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      setToast({ type: 'error', message: 'Please select a PPT / PPTX file.' });
      return;
    }

    setUploading(true);
    try {
      const file = formData.file;
      const fileExt = file.name.split('.').pop();
      const fileName = `deck-${Date.now()}.${fileExt}`;
      const filePath = `decks/${fileName}`;

      let publicUrl = `./presentations/${file.name}`;

      if (isSupabaseConfigured()) {
        const { error: uploadError } = await supabase.storage
          .from('presentations')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('presentations')
          .getPublicUrl(filePath);

        publicUrl = urlData?.publicUrl || publicUrl;

        const newDeckRecord = {
          id: 'DECK-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
          title: formData.title,
          description: formData.description,
          file_path: filePath,
          file_url: publicUrl,
          created_at: new Date().toISOString(),
        };

        const { error: dbError } = await supabase
          .from('presentation_decks')
          .insert([newDeckRecord]);

        if (dbError) throw dbError;
      }

      await logAuditEvent({
        actorName: profile?.name || user?.email || 'Admin',
        actorRole: role || 'admin',
        action: 'Uploaded Presentation Deck',
        entity: 'PresentationDeck',
        entityId: formData.title,
        details: `Uploaded PPT file: ${file.name}`,
      });

      setToast({ type: 'success', message: 'Presentation uploaded to Supabase Storage successfully!' });
      setIsUploadModalOpen(false);
      setFormData({ title: '', description: '', file: null });
      await fetchDecks();
    } catch (err) {
      console.error('Deck upload error:', err);
      setToast({ type: 'error', message: `Upload failed: ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <Presentation className="w-3.5 h-3.5 text-brand-red" />
            Project Pitch Decks
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Planning Presentations &amp; Slide Decks
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Download official PowerPoint (.pptx) deliverables or launch the built-in interactive browser slide viewers.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-tactile-red px-4 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-2 shadow-tactile-sm"
          >
            <Plus className="w-4 h-4" />
            Upload New Deck (.pptx)
          </button>
        )}
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="card-tactile p-6 bg-white flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-transform"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="p-3 bg-brand-pink/20 rounded-2xl border-2 border-brand-dark text-brand-crimson shadow-tactile-sm">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-brand-dark/50 bg-canvas px-2.5 py-1 rounded-md border border-brand-dark/20">
                  {deck.id}
                </span>
              </div>

              <h3 className="text-xl font-bold font-display text-brand-dark">
                {deck.title}
              </h3>
              <p className="text-xs text-brand-dark/75 leading-relaxed font-medium">
                {deck.description}
              </p>
            </div>

            <div className="pt-4 border-t-2 border-brand-dark/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-dark/60">
                <Calendar className="w-3.5 h-3.5 text-brand-pink" />
                <span>Published: {new Date(deck.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Real Download Button */}
                <a
                  href={deck.file_url}
                  download
                  className="btn-tactile-red px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-tactile-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PPTX
                </a>

                {/* Built-in Web Slide Deck Viewer Link */}
                {deck.web_viewer_url && (
                  <Link
                    to={deck.web_viewer_url}
                    className="btn-tactile-gold px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Launch Web Slides
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Presentation Deck (PPTX)"
      >
        <form onSubmit={handleUploadDeck} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-brand-dark mb-1">
              Deck Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Phase 2 Architecture & Demonstration Pitch"
              className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-brand-dark mb-1">
              Description &amp; Key Focus Areas
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of presentation slides, clinical scope, and evaluation milestones..."
              className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-brand-dark mb-1">
              Presentation File (.pptx, .ppt, .pdf) *
            </label>
            <input
              type="file"
              required
              accept=".pptx,.ppt,.pdf"
              onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
              className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-medium"
            />
            <span className="text-[10px] text-brand-dark/50 mt-1 block">
              Uploaded directly to Supabase Storage bucket: <code className="font-mono">presentations</code>
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-dark/10">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="btn-tactile-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="btn-tactile-red px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading to Supabase...
                </>
              ) : (
                'Publish & Save Deck'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
