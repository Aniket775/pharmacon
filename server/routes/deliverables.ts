import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';

const router = Router();

// GET /api/deliverables — list all deliverables
router.get('/', (_req, res) => {
  const deliverables = getDb().prepare(`
    SELECT d.*,
           f.original_name as file_name, f.mime_type as file_mime_type, f.size as file_size, f.filename as file_disk_name,
           v.name as version_name, v.status as version_status
    FROM deliverables d
    LEFT JOIN files f ON d.file_id = f.id
    LEFT JOIN versions v ON d.version_id = v.id
    ORDER BY d.created_at DESC
  `).all();

  res.json({ deliverables });
});

// GET /api/deliverables/:id — get a single deliverable
router.get('/:id', (req, res) => {
  const deliverable = getDb().prepare(`
    SELECT d.*,
           f.id as file_id, f.original_name as file_name, f.mime_type as file_mime_type,
           f.size as file_size, f.filename as file_disk_name, f.created_at as file_uploaded_at,
           v.name as version_name, v.status as version_status, v.date as version_date,
           v.authors as version_authors, v.change_summary as version_change_summary
    FROM deliverables d
    LEFT JOIN files f ON d.file_id = f.id
    LEFT JOIN versions v ON d.version_id = v.id
    WHERE d.id = ?
  `).get(req.params.id) as any;

  if (!deliverable) {
    return res.status(404).json({ error: 'Deliverable not found' });
  }

  // Get version history for this deliverable
  const history = getDb().prepare(`
    SELECT d.id, d.title, d.date, d.status, v.name as version_name
    FROM deliverables d
    LEFT JOIN versions v ON d.version_id = v.id
    WHERE d.id != ?
    ORDER BY d.created_at DESC
  `).all(deliverable.id);

  res.json({ deliverable, history });
});

// POST /api/deliverables — create a deliverable (persists directly to SQLite)
router.post('/', (req, res) => {
  const { id: customId, title, type, versionId, version_id, date, status, description, fileId, file_id, fileName, file_name } = req.body;

  if (!title || !type || !date) {
    return res.status(400).json({ error: 'Title, type, and date are required' });
  }

  const id = customId || `D-${uuidv4().slice(0, 8)}`;
  const resolvedVersionId = versionId || version_id || null;
  const resolvedFileId = fileId || file_id || null;

  getDb().prepare(`
    INSERT INTO deliverables (id, title, type, version_id, date, status, description, file_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      type = excluded.type,
      version_id = excluded.version_id,
      date = excluded.date,
      status = excluded.status,
      description = excluded.description,
      file_id = excluded.file_id
  `).run(id, title, type, resolvedVersionId, date, status || 'published', description || '', resolvedFileId);

  const deliverable = getDb().prepare(`
    SELECT d.*, f.original_name as file_name, v.name as version_name
    FROM deliverables d
    LEFT JOIN files f ON d.file_id = f.id
    LEFT JOIN versions v ON d.version_id = v.id
    WHERE d.id = ?
  `).get(id);

  res.json({ deliverable });
});

// PUT /api/deliverables/:id — update a deliverable
router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM deliverables WHERE id = ?').get(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: 'Deliverable not found' });
  }

  const { title, type, versionId, version_id, date, status, description, fileId, file_id } = req.body;

  db.prepare(`
    UPDATE deliverables SET
      title = COALESCE(?, title),
      type = COALESCE(?, type),
      version_id = COALESCE(?, version_id),
      date = COALESCE(?, date),
      status = COALESCE(?, status),
      description = COALESCE(?, description),
      file_id = COALESCE(?, file_id)
    WHERE id = ?
  `).run(title, type, versionId || version_id, date, status, description, fileId || file_id, req.params.id);

  const deliverable = db.prepare(`
    SELECT d.*, f.original_name as file_name, v.name as version_name
    FROM deliverables d
    LEFT JOIN files f ON d.file_id = f.id
    LEFT JOIN versions v ON d.version_id = v.id
    WHERE d.id = ?
  `).get(req.params.id);

  res.json({ deliverable });
});

// DELETE /api/deliverables/:id — delete a deliverable
router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM deliverables WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
