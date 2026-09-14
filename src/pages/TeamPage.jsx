import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { logAuditEvent } from '../lib/auditLogger';
import {
  Users,
  Edit3,
  Github,
  Linkedin,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const DEFAULT_TEAM = [
  {
    id: 'T-001',
    name: 'Aryan Sharma',
    role: 'Frontend Lead',
    focus: 'UI/UX architecture, responsive design system, tactile component library, and interactive presentations.',
    skills: 'React, JavaScript, Tailwind CSS, Lucide Icons, Vite',
    avatar_url: '',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
  },
  {
    id: 'T-002',
    name: 'Aniket Raj',
    role: 'Backend Lead',
    focus: 'Supabase architecture, PostgreSQL persistence, storage integrations, and release publishing engine.',
    skills: 'PostgreSQL, Supabase JS, REST APIs, Storage, RLS',
    avatar_url: '',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
  },
  {
    id: 'T-003',
    name: 'Amitesh Kumar Singh',
    role: 'AI / CV Engineer',
    focus: 'Handwriting segmentation pipeline, CNN-Transformer feature models, and doctor-adaptive calibration loops.',
    skills: 'Python, PyTorch, Computer Vision, OCR, Few-Shot LoRA',
    avatar_url: '',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
  },
  {
    id: 'T-004',
    name: 'Chirag Lamba',
    role: 'Integration Lead',
    focus: 'Formulary SKU matching algorithms, security audit controls, end-to-end reliability verification, and CI/CD pipelines.',
    skills: 'CI/CD, GitHub Actions, System Testing, Security Audit',
    avatar_url: '',
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com',
  },
];

export default function TeamPage() {
  const { role, profile, user } = useAuth();
  const [members, setMembers] = useState(DEFAULT_TEAM);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState(null);

  // Edit Modal State
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAdmin = role === 'admin' || role === 'instructor';

  // Fetch Team Members from Supabase
  const fetchTeamMembers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (!isSupabaseConfigured()) {
        // Fallback default
        setMembers(DEFAULT_TEAM);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.warn('Supabase fetch team error:', error.message);
        setMembers(DEFAULT_TEAM);
      } else if (data && data.length > 0) {
        setMembers(data);
      } else {
        setMembers(DEFAULT_TEAM);
      }
    } catch (err) {
      console.warn('Team fetch error:', err);
      setMembers(DEFAULT_TEAM);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const openEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      id: member.id,
      name: member.name || '',
      role: member.role || '',
      focus: member.focus || '',
      skills: member.skills || '',
      avatar_url: member.avatar_url || '',
      github_url: member.github_url || '',
      linkedin_url: member.linkedin_url || '',
    });
  };

  // Image Upload to Supabase Storage 'team-assets' bucket
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      if (!isSupabaseConfigured()) {
        // Create local object URL for preview in offline mode
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, avatar_url: previewUrl }));
        setToast({ type: 'info', message: 'Loaded local preview image.' });
        setUploadingImage(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('team-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('team-assets')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl || '';
      setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
      setToast({ type: 'success', message: 'Profile image uploaded to Supabase Storage!' });
    } catch (err) {
      console.error('Storage upload error:', err);
      setToast({ type: 'error', message: `Image upload failed: ${err.message}` });
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Team Member Changes to Supabase
  const handleSaveMember = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedPayload = {
        name: formData.name,
        role: formData.role,
        focus: formData.focus,
        skills: formData.skills,
        avatar_url: formData.avatar_url,
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url,
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('team_members')
          .update(updatedPayload)
          .eq('id', formData.id);

        if (error) throw error;
      } else {
        // Offline state update
        setMembers((prev) =>
          prev.map((m) => (m.id === formData.id ? { ...m, ...updatedPayload } : m))
        );
      }

      await logAuditEvent({
        actorName: profile?.name || user?.email || 'Admin',
        actorRole: role || 'admin',
        action: 'Updated Team Profile',
        entity: 'TeamMember',
        entityId: formData.id,
        details: `Updated details for ${formData.name} (${formData.role})`,
      });

      setToast({ type: 'success', message: `Updated profile for ${formData.name} successfully!` });
      setEditingMember(null);
      await fetchTeamMembers();
    } catch (err) {
      console.error('Save member error:', err);
      setToast({ type: 'error', message: `Save failed: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <Users className="w-3.5 h-3.5 text-brand-red" />
            Engineering Team
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Pharmacon Development Team
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            4-person team engineering the prescription digitization &amp; doctor-adaptive formulary pipeline.
          </p>
        </div>

        {isAdmin ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-brand-dark bg-accent-mintLight text-xs font-bold text-emerald-950 shadow-tactile-sm">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            Admin Mode: Profiles are fully editable
          </div>
        ) : (
          <div className="text-xs text-brand-dark/60 font-semibold">
            (Switch to Admin role to edit profiles &amp; upload pictures)
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-pink mb-3" />
          <p className="font-bold text-sm text-brand-dark">Loading team profiles from Supabase...</p>
        </div>
      )}

      {/* Team Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {members.map((member) => (
            <div
              key={member.id}
              className="card-tactile p-6 bg-white flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-transform"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Avatar / Initials */}
                  <div className="flex items-center gap-4">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        className="w-16 h-16 rounded-2xl border-2 border-brand-dark object-cover shadow-tactile-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl border-2 border-brand-dark bg-brand-pink text-white flex items-center justify-center font-black font-display text-xl shadow-tactile-sm">
                        {getInitials(member.name)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold font-display text-brand-dark">
                        {member.name}
                      </h3>
                      <span className="inline-block text-xs font-black uppercase tracking-wider text-brand-crimson bg-brand-pink/15 px-2.5 py-0.5 rounded-md border border-brand-pink/30 mt-1">
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* Admin Edit Button */}
                  {isAdmin && (
                    <button
                      onClick={() => openEditModal(member)}
                      className="btn-tactile-white p-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-brand-crimson" />
                      Edit
                    </button>
                  )}
                </div>

                {/* Focus / Description */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-dark/50 mb-1">
                    Primary Focus
                  </h4>
                  <p className="text-sm text-brand-dark/85 leading-relaxed font-medium">
                    {member.focus}
                  </p>
                </div>

                {/* Skills Tags */}
                {member.skills && (
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-dark/50 mb-2">
                      Core Skills &amp; Stack
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {member.skills.split(',').map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-canvas border border-brand-dark/20 text-brand-dark"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Social links */}
              <div className="pt-4 border-t-2 border-brand-dark/10 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-brand-dark/40">
                  {member.id}
                </span>
                <div className="flex items-center gap-2">
                  {member.github_url && (
                    <a
                      href={member.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-brand-dark/30 bg-canvas hover:bg-brand-dark hover:text-white transition-colors"
                      title="GitHub Profile"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {member.linkedin_url && (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-brand-dark/30 bg-canvas hover:bg-brand-dark hover:text-white transition-colors"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        title={`Edit Team Profile: ${formData.name}`}
      >
        <form onSubmit={handleSaveMember} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-brand-dark mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-brand-dark mb-1">
              Role Title
            </label>
            <input
              type="text"
              required
              value={formData.role || ''}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-brand-dark mb-1">
              Primary Focus &amp; Responsibilities
            </label>
            <textarea
              rows={3}
              required
              value={formData.focus || ''}
              onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-brand-dark mb-1">
              Skills (comma separated)
            </label>
            <input
              type="text"
              value={formData.skills || ''}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="React, PostgreSQL, Supabase, ML"
              className="w-full px-3.5 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-sm font-medium"
            />
          </div>

          {/* Avatar Upload to Supabase Storage */}
          <div>
            <label className="block text-xs font-black uppercase text-brand-dark mb-1">
              Profile Avatar Image (Supabase Storage)
            </label>
            <div className="flex items-center gap-3">
              {formData.avatar_url && (
                <img
                  src={formData.avatar_url}
                  alt="Avatar preview"
                  className="w-12 h-12 rounded-xl border-2 border-brand-dark object-cover"
                />
              )}
              <label className="btn-tactile-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-brand-crimson" />
                {uploadingImage ? 'Uploading to Supabase...' : 'Choose New Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={formData.github_url || ''}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedin_url || ''}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-dark/10">
            <button
              type="button"
              onClick={() => setEditingMember(null)}
              className="btn-tactile-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="btn-tactile-red px-5 py-2 rounded-xl text-xs font-black"
            >
              {saving ? 'Saving to Supabase...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
