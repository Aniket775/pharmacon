import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';

const router = Router();

// GET /api/versions — list all versions
router.get('/', (_req, res) => {
  const versions = getDb().prepare(`
    SELECT * FROM versions ORDER BY created_at DESC
  `).all();

  res.json({ versions });
});

// GET /api/versions/current — get the latest active version
router.get('/current', (_req, res) => {
  const version = getDb().prepare(`
    SELECT * FROM versions WHERE status = 'current' ORDER BY created_at DESC LIMIT 1
  `).get();

  res.json({ version });
});

// GET /api/versions/:id — get a single version with its deliverables
router.get('/:id', (req, res) => {
  const db = getDb();
  const version = db.prepare('SELECT * FROM versions WHERE id = ?').get(req.params.id) as any;

  if (!version) {
    return res.status(404).json({ error: 'Version not found' });
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

// POST /api/versions — create a new version (persists directly to SQLite)
router.post('/', (req, res) => {
  const {
    id: customId,
    name,
    date,
    authors,
    status = 'current',
    changeSummary,
    change_summary,
    commitRef,
    commit_ref,
    deploymentUrl,
    deployment_url,
    parentVersionId,
    parent_version_id
  } = req.body;

  if (!name || !date) {
    return res.status(400).json({ error: 'Name and date are required' });
  }

  const db = getDb();
  const id = customId || `V-${uuidv4().slice(0, 8)}`;

  // Automatically archive all older current versions when a new current version is uploaded!
  if (status === 'current') {
    db.prepare("UPDATE versions SET status = 'archived' WHERE status = 'current'").run();
  }

  db.prepare(`
    INSERT INTO versions (id, name, date, authors, status, change_summary, commit_ref, deployment_url, parent_version_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      date = excluded.date,
      authors = excluded.authors,
      status = excluded.status,
      change_summary = excluded.change_summary,
      commit_ref = excluded.commit_ref,
      deployment_url = excluded.deployment_url,
      parent_version_id = excluded.parent_version_id
  `).run(
    id,
    name,
    date,
    authors || 'Team Pharmacon',
    status,
    changeSummary || change_summary || '',
    commitRef || commit_ref || '',
    deploymentUrl || deployment_url || '',
    parentVersionId || parent_version_id || null
  );

  const version = db.prepare('SELECT * FROM versions WHERE id = ?').get(id);
  res.json({ version });
});

// PUT /api/versions/:id — update a version
router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM versions WHERE id = ?').get(req.params.id) as any;

  if (!existing) {
    return res.status(404).json({ error: 'Version not found' });
  }

  const {
    name,
    date,
    authors,
    status,
    changeSummary,
    change_summary,
    commitRef,
    commit_ref,
    deploymentUrl,
    deployment_url
  } = req.body;

  // If promoting to "current", archive other current versions
  if (status === 'current' && existing.status !== 'current') {
    db.prepare("UPDATE versions SET status = 'archived' WHERE status = 'current'").run();
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
  `).run(
    name,
    date,
    authors,
    status,
    changeSummary || change_summary,
    commitRef || commit_ref,
    deploymentUrl || deployment_url,
    req.params.id
  );

  const version = db.prepare('SELECT * FROM versions WHERE id = ?').get(req.params.id);
  res.json({ version });
});

export default router;
