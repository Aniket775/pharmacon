import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';
import { requireAuth, requireRole, AuthRequest } from '../auth.js';

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
    ORDER BY d.created_at ASC
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
    res.status(404).json({ error: 'Deliverable not found' });
    return;
  }

  // Get version history for this deliverable (other deliverables sharing same title pattern)
  const history = getDb().prepare(`
    SELECT d.id, d.title, d.date, d.status, v.name as version_name
    FROM deliverables d
    LEFT JOIN versions v ON d.version_id = v.id
    WHERE d.title LIKE ? AND d.id != ?
    ORDER BY d.created_at ASC
  `).all(`%${deliverable.title.split(' ')[0]}%`, deliverable.id);

  res.json({ deliverable, history });
});

// POST /api/deliverables — create a deliverable (admin/instructor only)
router.post('/', requireAuth, requireRole('admin', 'instructor'), (req: AuthRequest, res) => {
  const { title, type, versionId, date, status, description, fileId } = req.body;

  if (!title || !type || !date) {
    res.status(400).json({ error: 'Title, type, and date are required' });
    return;
  }

  const id = `D-${uuidv4().slice(0, 8)}`;

  getDb().prepare(`
    INSERT INTO deliverables (id, title, type, version_id, date, status, description, file_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, type, versionId || null, date, status || 'draft', description || '', fileId || null);

  const deliverable = getDb().prepare(`
    SELECT d.*, f.original_name as file_name, v.name as version_name
    FROM deliverables d
    LEFT JOIN files f ON d.file_id = f.id
    LEFT JOIN versions v ON d.version_id = v.id
    WHERE d.id = ?
  `).get(id);

  res.json({ deliverable });
});

// PUT /api/deliverables/:id — update a deliverable (admin/instructor only)
router.put('/:id', requireAuth, requireRole('admin', 'instructor'), (req: AuthRequest, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM deliverables WHERE id = ?').get(req.params.id);

  if (!existing) {
    res.status(404).json({ error: 'Deliverable not found' });
    return;
  }

  const { title, type, versionId, date, status, description, fileId } = req.body;

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
  `).run(title, type, versionId, date, status, description, fileId, req.params.id);

  const deliverable = db.prepare(`
    SELECT d.*, f.original_name as file_name, v.name as version_name
    FROM deliverables d
    LEFT JOIN files f ON d.file_id = f.id
    LEFT JOIN versions v ON d.version_id = v.id
    WHERE d.id = ?
  `).get(req.params.id);

  res.json({ deliverable });
});

// DELETE /api/deliverables/:id — delete a deliverable (admin only)
router.delete('/:id', requireAuth, requireRole('admin', 'instructor'), (req: AuthRequest, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM deliverables WHERE id = ?').get(req.params.id);

  if (!existing) {
    res.status(404).json({ error: 'Deliverable not found' });
    return;
  }

  db.prepare('DELETE FROM deliverables WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
