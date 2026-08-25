import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// ─── Page Content ────────────────────────────────────────────────────────

// Get all sections for a page (public — anyone can view)
router.get('/page/:page', (req, res) => {
  const rows = getDb()
    .prepare('SELECT section, items FROM page_content WHERE page = ?')
    .all(req.params.page) as { section: string; items: string }[];
  const sections: Record<string, unknown[]> = {};
  rows.forEach((row) => {
    try {
      sections[row.section] = JSON.parse(row.items);
    } catch {
      sections[row.section] = [];
    }
  });
  res.json({ sections });
});

// Update a specific section's items (persists directly to SQLite)
router.put('/page/:page/:section', (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    res.status(400).json({ error: 'items must be an array' });
    return;
  }
  const db = getDb();
  const existing = db
    .prepare('SELECT id FROM page_content WHERE page = ? AND section = ?')
    .get(req.params.page, req.params.section) as { id: string } | undefined;

  if (existing) {
    db.prepare("UPDATE page_content SET items = ?, updated_at = datetime('now') WHERE page = ? AND section = ?")
      .run(JSON.stringify(items), req.params.page, req.params.section);
  } else {
    db.prepare('INSERT INTO page_content (id, page, section, items) VALUES (?, ?, ?, ?)')
      .run(`PC-${Math.random().toString(36).slice(2, 10)}`, req.params.page, req.params.section, JSON.stringify(items));
  }
  res.json({ success: true });
});

// ─── Presentation Decks ─────────────────────────────────────────────────

// List all decks (public)
router.get('/decks', (_req, res) => {
  const decks = getDb()
    .prepare('SELECT id, title, description, file_path as filePath, sort_order as sortOrder FROM presentation_decks ORDER BY sort_order')
    .all();
  res.json({ decks });
});

// Add a new deck
router.post('/decks', (req, res) => {
  const { title, description, filePath } = req.body;
  if (!title || !description) {
    res.status(400).json({ error: 'title and description are required' });
    return;
  }
  const db = getDb();
  const maxOrder = (db.prepare('SELECT MAX(sort_order) as m FROM presentation_decks').get() as { m: number | null })?.m ?? -1;
  const id = `DECK-${Math.random().toString(36).slice(2, 10)}`;
  db.prepare('INSERT INTO presentation_decks (id, title, description, file_path, sort_order) VALUES (?, ?, ?, ?, ?)')
    .run(id, title, description, filePath || '', maxOrder + 1);
  res.status(201).json({ id, title, description, filePath: filePath || '', sortOrder: maxOrder + 1 });
});

// Update a deck
router.put('/decks/:id', (req, res) => {
  const { title, description, filePath } = req.body;
  const result = getDb()
    .prepare("UPDATE presentation_decks SET title = COALESCE(?, title), description = COALESCE(?, description), file_path = COALESCE(?, file_path) WHERE id = ?")
    .run(title ?? null, description ?? null, filePath ?? null, req.params.id);
  if (!result.changes) {
    res.status(404).json({ error: 'Deck not found' });
    return;
  }
  res.json({ success: true });
});

// Delete a deck
router.delete('/decks/:id', (req, res) => {
  const result = getDb().prepare('DELETE FROM presentation_decks WHERE id = ?').run(req.params.id);
  if (!result.changes) {
    res.status(404).json({ error: 'Deck not found' });
    return;
  }
  res.json({ success: true });
});

export default router;
