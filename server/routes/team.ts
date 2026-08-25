import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// GET /api/team — list all team members
router.get('/', (_req, res) => {
  const members = getDb().prepare(`
    SELECT t.*, f.id as avatar_file_id, f.filename as avatar_filename
    FROM team_members t
    LEFT JOIN files f ON t.avatar_file_id = f.id
    ORDER BY t.created_at ASC
  `).all();
  res.json({ members });
});

// GET /api/team/:id — get single member
router.get('/:id', (req, res) => {
  const member = getDb().prepare(`
    SELECT t.*, f.filename as avatar_filename
    FROM team_members t
    LEFT JOIN files f ON t.avatar_file_id = f.id
    WHERE t.id = ?
  `).get(req.params.id);

  if (!member) {
    return res.status(404).json({ error: 'Team member not found' });
  }
  res.json({ member });
});

// PUT /api/team/:id — update ANY team member (All admins / team members can edit and persist instantly)
router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id) as any;

  if (!existing) {
    return res.status(404).json({ error: 'Team member not found' });
  }

  const {
    name,
    role,
    focus,
    skills,
    avatar,
    github_url,
    githubUrl,
    linkedin_url,
    linkedinUrl,
    avatarFileId,
    avatar_file_id,
  } = req.body;

  const resolvedGithub = github_url !== undefined ? github_url : (githubUrl !== undefined ? githubUrl : existing.github_url);
  const resolvedLinkedin = linkedin_url !== undefined ? linkedin_url : (linkedinUrl !== undefined ? linkedinUrl : existing.linkedin_url);
  const resolvedAvatar = avatar !== undefined ? avatar : existing.avatar;
  const resolvedFileId = avatar_file_id !== undefined ? avatar_file_id : (avatarFileId !== undefined ? avatarFileId : existing.avatar_file_id);

  db.prepare(`
    UPDATE team_members SET
      name = COALESCE(?, name),
      role = COALESCE(?, role),
      focus = COALESCE(?, focus),
      skills = COALESCE(?, skills),
      avatar = ?,
      github_url = ?,
      linkedin_url = ?,
      avatar_file_id = ?
    WHERE id = ?
  `).run(
    name !== undefined ? name : existing.name,
    role !== undefined ? role : existing.role,
    focus !== undefined ? focus : existing.focus,
    skills !== undefined ? skills : existing.skills,
    resolvedAvatar,
    resolvedGithub,
    resolvedLinkedin,
    resolvedFileId,
    req.params.id
  );

  const member = db.prepare(`
    SELECT t.*, f.filename as avatar_filename
    FROM team_members t
    LEFT JOIN files f ON t.avatar_file_id = f.id
    WHERE t.id = ?
  `).get(req.params.id);

  res.json({ member });
});

// POST /api/team/sync — batch update/sync all team members
router.post('/sync', (req, res) => {
  const db = getDb();
  const { members } = req.body;

  if (Array.isArray(members)) {
    const update = db.prepare(`
      UPDATE team_members SET
        name = ?, role = ?, focus = ?, skills = ?, avatar = ?,
        github_url = ?, linkedin_url = ?
      WHERE id = ?
    `);

    members.forEach((m: any) => {
      update.run(
        m.name,
        m.role,
        m.focus,
        m.skills || '',
        m.avatar || '',
        m.github_url || m.githubUrl || '',
        m.linkedin_url || m.linkedinUrl || '',
        m.id
      );
    });
  }

  const all = db.prepare(`
    SELECT t.*, f.filename as avatar_filename
    FROM team_members t
    LEFT JOIN files f ON t.avatar_file_id = f.id
    ORDER BY t.created_at ASC
  `).all();

  res.json({ members: all });
});

export default router;
