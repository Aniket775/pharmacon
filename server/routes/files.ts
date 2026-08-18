import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { getDb } from '../db.js';
import { requireAuth, requireRole, AuthRequest } from '../auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOADS_DIR = join(process.env.DATA_DIR || join(__dirname, '..'), 'uploads');

// Ensure uploads directory exists
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/x-zip-compressed',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

const router = Router();

// POST /api/files/upload — upload one or more files
router.post('/upload', requireAuth, upload.array('files', 20), (req: AuthRequest, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No files provided' });
    return;
  }

  const db = getDb();
  const insertFile = db.prepare(
    'INSERT INTO files (id, filename, original_name, mime_type, size, path, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const results = files.map((file) => {
    const id = `F-${uuidv4().slice(0, 8)}`;
    insertFile.run(id, file.filename, file.originalname, file.mimetype, file.size, file.path, req.user!.id);
    return {
      id,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: req.user!.name,
      createdAt: new Date().toISOString(),
    };
  });

  res.json({ files: results });
});

// GET /api/files — list all files
router.get('/', requireAuth, (_req: AuthRequest, res) => {
  const files = getDb().prepare(`
    SELECT f.id, f.filename, f.original_name, f.mime_type, f.size, f.uploaded_by, f.created_at,
           u.name as uploader_name
    FROM files f
    LEFT JOIN users u ON f.uploaded_by = u.id
    ORDER BY f.created_at DESC
  `).all();

  res.json({ files });
});

// GET /api/files/:id — get file info
router.get('/:id', (req, res) => {
  const file = getDb().prepare(`
    SELECT f.*, u.name as uploader_name
    FROM files f
    LEFT JOIN users u ON f.uploaded_by = u.id
    WHERE f.id = ?
  `).get(req.params.id) as any;

  if (!file) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  res.json({ file });
});

// GET /api/files/:id/download — download a file
router.get('/:id/download', (req, res) => {
  const file = getDb().prepare('SELECT * FROM files WHERE id = ?').get(req.params.id) as any;

  if (!file) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  const filePath = join(UPLOADS_DIR, file.filename);
  if (!existsSync(filePath)) {
    res.status(404).json({ error: 'File not found on disk' });
    return;
  }

  res.download(filePath, file.original_name);
});

// DELETE /api/files/:id — delete a file (admin/instructor only)
router.delete('/:id', requireAuth, requireRole('admin', 'instructor'), (req: AuthRequest, res) => {
  const db = getDb();
  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(req.params.id) as any;

  if (!file) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  // Remove from disk
  const filePath = join(UPLOADS_DIR, file.filename);
  if (existsSync(filePath)) {
    try { unlinkSync(filePath); } catch { /* ignore */ }
  }

  // Unlink from deliverables
  db.prepare('UPDATE deliverables SET file_id = NULL WHERE file_id = ?').run(file.id);

  // Remove from DB
  db.prepare('DELETE FROM files WHERE id = ?').run(file.id);

  res.json({ success: true });
});

export default router;
