import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';
import { requireAuth, requireRole, AuthRequest } from '../auth.js';

const router = Router();

// GET /api/versions — list all versions
router.get('/', (_req, res) => {
  const versions = getDb().prepare(`
    SELECT * FROM versions ORDER BY created_at ASC
  `).all();

  res.json({ versions });
});

// GET /api/versions/:id — get a single version with its deliverables
router.get('/:id', (req, res) => {
  const db = getDb();
  const version = db.prepare('SELECT * FROM versions WHERE id = ?').get(req.params.id) as any;

  if (!version) {
    res.status(404).json({ error: 'Version not found' });
    return;
  }

  const deliverables = db.prepare(`
    SELECT d.*, f.original_name as file_name, f.mime_type as file_mime_type, f.size as file_size
    FROM deliverables d
    LEFT JOIN files f ON d.file_id = f.id
    WHERE d.version_id = ?
    ORDER BY d.created_at ASC
  `).all(version.id);

  res.json({ version, deliverables });
});

// POST /api/versions — create a new version (admin/instructor only)
router.post('/', requireAuth, requireRole('admin', 'instructor'), (req: AuthRequest, res) => {
  const { name, date, authors, status, changeSummary, commitRef, deploymentUrl, parentVersionId } = req.body;

  if (!name || !date || !authors) {
    res.status(400).json({ error: 'Name, date, and authors are required' });
    return;
  }

  const db = getDb();
  const id = `V-${uuidv4().slice(0, 8)}`;

  // If a parent version exists and the new version is "current", archive the parent
  if (parentVersionId && status === 'current') {
    db.prepare('UPDATE versions SET status = ? WHERE id = ?').run('archived', parentVersionId);
  }

  db.prepare(`
    INSERT INTO versions (id, name, date, authors, status, change_summary, commit_ref, deployment_url, parent_version_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, date, authors, status || 'draft', changeSummary || '', commitRef || '', deploymentUrl || '', parentVersionId || null);

  const version = db.prepare('SELECT * FROM versions WHERE id = ?').get(id);
  res.json({ version });
});

// PUT /api/versions/:id — update a version (admin/instructor only)
router.put('/:id', requireAuth, requireRole('admin', 'instructor'), (req: AuthRequest, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM versions WHERE id = ?').get(req.params.id) as any;

  if (!existing) {
    res.status(404).json({ error: 'Version not found' });
    return;
  }

  const { name, date, authors, status, changeSummary, commitRef, deploymentUrl } = req.body;

  // If promoting to "current", archive the previous current version
  if (status === 'current' && existing.status !== 'current') {
    db.prepare('UPDATE versions SET status = ? WHERE status = ?').run('archived', 'current');
  }

  db.prepare(`
    UPDATE versions SET
      name = COALESCE(?, name),
      date = COALESCE(?, date),
      authors = COALESCE(?, authors),
      status = COALESCE(?, status),
      change_summary = COALESCE(?, change_summary),
      commit_ref = COALESCE(?, commit_ref),
      deployment_url = COALESCE(?, deployment_url)
    WHERE id = ?
  `).run(name, date, authors, status, changeSummary, commitRef, deploymentUrl, req.params.id);

  const version = db.prepare('SELECT * FROM versions WHERE id = ?').get(req.params.id);
  res.json({ version });
});

export default router;
