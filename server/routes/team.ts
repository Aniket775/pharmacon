import { Router } from 'express';
import { getDb } from '../db.js';
import { requireAuth, requireRole, AuthRequest } from '../auth.js';

const router = Router();

// GET /api/team — list all team members
router.get('/', (_req, res) => {
  const members = getDb().prepare(`SELECT t.*, f.id as avatar_file_id, f.filename as avatar_filename
    FROM team_members t LEFT JOIN files f ON t.avatar_file_id = f.id ORDER BY t.created_at ASC`).all();
  res.json({ members });
});

// GET /api/team/me — the signed-in member's own editable profile
router.get('/me/profile', requireAuth, (req: AuthRequest, res) => {
  const member = getDb().prepare(`SELECT t.*, f.filename as avatar_filename FROM team_members t
    LEFT JOIN files f ON t.avatar_file_id = f.id WHERE lower(t.name) = lower(?)`).get(req.user!.name);
  if (!member) return res.status(404).json({ error: 'No editable team profile is linked to this account.' });
  res.json({ member });
});

// PUT /api/team/me — a member can update only their own public profile
router.put('/me/profile', requireAuth, (req: AuthRequest, res) => {
  const db = getDb();
  const member = db.prepare('SELECT * FROM team_members WHERE lower(name) = lower(?)').get(req.user!.name) as any;
  if (!member) return res.status(404).json({ error: 'No editable team profile is linked to this account.' });
  const { role, focus, skills, githubUrl, linkedinUrl, avatarFileId } = req.body;
  if (avatarFileId) {
    const file = db.prepare('SELECT id, mime_type, uploaded_by FROM files WHERE id = ?').get(avatarFileId) as any;
    if (!file || !file.mime_type.startsWith('image/') || (file.uploaded_by !== req.user!.id && req.user!.role !== 'admin')) {
      return res.status(400).json({ error: 'Upload an image to your own account before selecting it as a profile photo.' });
    }
  }
  db.prepare(`UPDATE team_members SET role = COALESCE(?, role), focus = COALESCE(?, focus), skills = COALESCE(?, skills),
    github_url = COALESCE(?, github_url), linkedin_url = COALESCE(?, linkedin_url), avatar_file_id = COALESCE(?, avatar_file_id)
    WHERE id = ?`).run(role, focus, skills, githubUrl, linkedinUrl, avatarFileId, member.id);
  const updated = db.prepare(`SELECT t.*, f.filename as avatar_filename FROM team_members t LEFT JOIN files f ON t.avatar_file_id = f.id WHERE t.id = ?`).get(member.id);
  res.json({ member: updated });
});

// GET /api/team/:id — get a single team member
router.get('/:id', (req, res) => {
  const member = getDb().prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
  if (!member) {
    res.status(404).json({ error: 'Team member not found' });
    return;
  }
  res.json({ member });
});

// PUT /api/team/:id — update a team member (admin/instructor only)
router.put('/:id', requireAuth, requireRole('admin', 'instructor'), (req: AuthRequest, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);

  if (!existing) {
    res.status(404).json({ error: 'Team member not found' });
    return;
  }

  const { name, role, focus, avatar, githubUrl, linkedinUrl } = req.body;

  db.prepare(`
    UPDATE team_members SET
      name = COALESCE(?, name),
      role = COALESCE(?, role),
      focus = COALESCE(?, focus),
      avatar = COALESCE(?, avatar),
      github_url = COALESCE(?, github_url),
      linkedin_url = COALESCE(?, linkedin_url)
    WHERE id = ?
  `).run(name, role, focus, avatar, githubUrl, linkedinUrl, req.params.id);

  const member = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
  res.json({ member });
});

export default router;
