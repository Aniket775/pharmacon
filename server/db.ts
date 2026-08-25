import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = process.env.DATA_DIR || __dirname;
const DB_PATH = join(DATA_DIR, 'pharmacon.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(db: Database.Database) {
  // ─── Schema ─────────────────────────────────────────────────────────

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('doctor','clinic-staff','pharmacist','patient','admin','instructor')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      focus TEXT NOT NULL,
      avatar TEXT NOT NULL,
      skills TEXT NOT NULL DEFAULT '',
      avatar_file_id TEXT DEFAULT NULL,
      github_url TEXT DEFAULT '',
      linkedin_url TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS versions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      authors TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('current','archived','future','draft')),
      change_summary TEXT NOT NULL DEFAULT '',
      commit_ref TEXT DEFAULT '',
      deployment_url TEXT DEFAULT '',
      parent_version_id TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (parent_version_id) REFERENCES versions(id)
    );

    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      uploaded_by TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS deliverables (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      version_id TEXT DEFAULT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draft','in-progress','published','archived')),
      description TEXT NOT NULL DEFAULT '',
      file_id TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (version_id) REFERENCES versions(id),
      FOREIGN KEY (file_id) REFERENCES files(id)
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY, medicine TEXT NOT NULL, strength TEXT NOT NULL, dosage_form TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL, pack_size TEXT NOT NULL, stock INTEGER NOT NULL, reorder_level INTEGER NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY, patient_id TEXT NOT NULL, patient_name TEXT NOT NULL, doctor_name TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draft','confirmed','dispensed')), created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS prescription_fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT, prescription_id TEXT NOT NULL, label TEXT NOT NULL, value TEXT NOT NULL,
      confidence INTEGER NOT NULL, needs_verification INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS refill_requests (
      id TEXT PRIMARY KEY, prescription_id TEXT NOT NULL, patient_id TEXT NOT NULL, patient_name TEXT NOT NULL,
      medicine TEXT NOT NULL, strength TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected','contacted')),
      requested_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
    );
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY, actor TEXT NOT NULL, role TEXT NOT NULL, action TEXT NOT NULL, entity TEXT NOT NULL,
      entity_id TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('success','warning','info')), details TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS page_content (
      id TEXT PRIMARY KEY,
      page TEXT NOT NULL,
      section TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(page, section)
    );

    CREATE TABLE IF NOT EXISTS presentation_decks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      file_path TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Ensure columns exist on team_members
  const columns = db.prepare("PRAGMA table_info(team_members)").all() as { name: string }[];
  if (!columns.some((c) => c.name === 'skills')) db.exec("ALTER TABLE team_members ADD COLUMN skills TEXT NOT NULL DEFAULT ''");
  if (!columns.some((c) => c.name === 'avatar_file_id')) db.exec("ALTER TABLE team_members ADD COLUMN avatar_file_id TEXT DEFAULT NULL");

  // ─── Seed or upgrade admin user accounts ───────────────────────────
  seedOrUpdateAdminAccounts(db);
  seedWorkflowData(db);
  seedPageContent(db);
  seedPresentationDecks(db);
}

function seedOrUpdateAdminAccounts(db: Database.Database) {
  const hash = bcrypt.hashSync('admin123', 10);
  const altHash = bcrypt.hashSync('demo', 10);

  // Define all role accounts with RBAC access
  const allAccounts = [
    { id: 'U-007', username: 'aryan', name: 'Aryan Sharma', role: 'admin' },
    { id: 'U-010', username: 'aniket', name: 'Aniket Raj', role: 'admin' },
    { id: 'U-008', username: 'amitesh', name: 'Amitesh Kumar Singh', role: 'admin' },
    { id: 'U-009', username: 'chirag', name: 'Chirag Lamba', role: 'admin' },
    { id: 'U-005', username: 'admin', name: 'System Admin', role: 'admin' },
    { id: 'U-006', username: 'instructor', name: 'Sukhpal Singh (Instructor)', role: 'instructor' },
    { id: 'U-001', username: 'doctor', name: 'Dr. A. Sharma (Cardiologist)', role: 'doctor' },
    { id: 'U-002', username: 'pharmacy', name: 'Vikram Singh (Pharmacist)', role: 'pharmacist' },
    { id: 'U-003', username: 'staff', name: 'Priya Desai (Clinic Staff)', role: 'clinic-staff' },
    { id: 'U-004', username: 'patient', name: 'Rahul Kumar (Patient)', role: 'patient' },
  ];

  allAccounts.forEach(u => {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(u.username) as { id: string } | undefined;
    if (existing) {
      db.prepare('UPDATE users SET name = ?, role = ?, password_hash = ? WHERE username = ?').run(u.name, u.role, hash, u.username);
    } else {
      const existingId = db.prepare('SELECT id FROM users WHERE id = ?').get(u.id);
      const insertId = existingId ? `U-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` : u.id;
      db.prepare('INSERT INTO users (id, username, password_hash, name, role) VALUES (?, ?, ?, ?, ?)').run(insertId, u.username, hash, u.name, u.role);
    }
  });

  // Seed default team members with skills and focus if empty
  const teamCount = db.prepare('SELECT COUNT(*) as count FROM team_members').get() as { count: number };
  if (teamCount.count === 0) {
    const insertTeam = db.prepare(`
      INSERT INTO team_members (id, name, role, focus, avatar, skills, github_url, linkedin_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTeam.run(
      'T-001',
      'Aryan Sharma',
      'Frontend Lead',
      'UI/UX architecture, responsive design system, tactile component library, and interactive presentations.',
      'AS',
      'React, Vite, TypeScript, Tailwind CSS, UI/UX, Recharts',
      'https://github.com',
      'https://linkedin.com'
    );
    insertTeam.run(
      'T-002',
      'Aniket Raj',
      'Backend Lead',
      'Express API development, database persistence, S3/Supabase storage integrations, and permanent version publishing engine.',
      'AR',
      'Node.js, Express, SQLite, PostgreSQL, Supabase, REST APIs',
      'https://github.com',
      'https://linkedin.com'
    );
    insertTeam.run(
      'T-003',
      'Amitesh Kumar Singh',
      'AI / CV Engineer',
      'Handwriting segmentation pipeline, CNN-Transformer feature models, and doctor-adaptive calibration loops.',
      'AK',
      'Python, PyTorch, Computer Vision, OCR, CNN-Transformers',
      'https://github.com',
      'https://linkedin.com'
    );
    insertTeam.run(
      'T-004',
      'Chirag Lamba',
      'Integration Lead',
      'Formulary SKU matching algorithms, security audit controls, end-to-end reliability verification, and CI/CD pipelines.',
      'CL',
      'CI/CD, GitHub Actions, System Integration, Testing, Security Audit',
      'https://github.com',
      'https://linkedin.com'
    );
  }

  // Seed versions if empty
  const verCount = db.prepare('SELECT COUNT(*) as count FROM versions').get() as { count: number };
  if (verCount.count === 0) {
    const insertVersion = db.prepare(`
      INSERT INTO versions (id, name, date, authors, status, change_summary, commit_ref, deployment_url, parent_version_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertVersion.run(
      'V-001',
      'Planning V1',
      '2026-08-25',
      'Aryan Sharma, Aniket Raj, Amitesh Kumar Singh, Chirag Lamba',
      'current',
      'Initial project planning presentation covering scope, architecture, 8 required sections, and interactive Gantt chart.',
      '',
      '#/presentation/v1',
      null
    );
    insertVersion.run(
      'V-002',
      'Planning V2',
      '2026-09-10',
      'Team Pharmacon',
      'future',
      'Refined scope based on supervisor review, cloud S3 storage integration, and writer quotas.',
      '',
      '#/presentation/v2',
      'V-001'
    );
  }
}

function seedWorkflowData(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as count FROM inventory_items').get() as { count: number };
  if (count.count > 0) return;

  const inventory = db.prepare('INSERT INTO inventory_items (id, medicine, strength, dosage_form, sku, pack_size, stock, reorder_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  [
    ['INV-001', 'Amoxicillin', '500 mg', 'Tablet', 'AMX-500-TAB', '10 tablets', 124, 30],
    ['INV-002', 'Paracetamol', '650 mg', 'Tablet', 'PCM-650-TAB', '15 tablets', 256, 50],
    ['INV-003', 'Metformin', '500 mg', 'Tablet', 'MET-500-TAB', '10 tablets', 18, 25],
    ['INV-004', 'Azithromycin', '250 mg', 'Tablet', 'AZT-250-TAB', '6 tablets', 0, 20],
    ['INV-005', 'Omeprazole', '20 mg', 'Capsule', 'OMP-020-CAP', '10 capsules', 89, 25],
  ].forEach((row) => inventory.run(...row));

  db.prepare('INSERT INTO prescriptions (id, patient_id, patient_name, doctor_name, status) VALUES (?, ?, ?, ?, ?)')
    .run('RX-2024-0001', 'PT-1001', 'Rahul Kumar', 'Dr. A. Sharma', 'confirmed');
  const field = db.prepare('INSERT INTO prescription_fields (prescription_id, label, value, confidence, needs_verification) VALUES (?, ?, ?, ?, ?)');
  [
    ['Medicine', 'Amoxicillin', 94, 0], ['Strength', '500 mg', 97, 0], ['Dosage Form', 'Tablet', 96, 0],
    ['Frequency', '1-0-1', 86, 1], ['Route', 'Oral', 92, 0], ['Duration', '5 days', 91, 0], ['Instructions', 'After food', 88, 1],
  ].forEach((row) => field.run('RX-2024-0001', ...row));
  db.prepare('INSERT INTO refill_requests (id, prescription_id, patient_id, patient_name, medicine, strength, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('RF-001', 'RX-2024-0001', 'PT-1001', 'Rahul Kumar', 'Amoxicillin', '500 mg', 'pending');
  db.prepare('INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run('AE-001', 'System', 'System', 'Seeded persistent demo workflow', 'Prescription', 'RX-2024-0001', 'info', 'Initial demo data');
}

function seedPageContent(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as count FROM page_content').get() as { count: number };
  if (count.count > 0) return;

  const insert = db.prepare('INSERT INTO page_content (id, page, section, items) VALUES (?, ?, ?, ?)');
  let i = 0;
  const seed = (page: string, section: string, items: unknown[]) => {
    insert.run(`PC-${String(++i).padStart(3, '0')}`, page, section, JSON.stringify(items));
  };

  seed('software-grid', 'tools', [
    { category: 'Frontend', tool: 'React', version: '18.3', purpose: 'UI component library', license: 'MIT' },
    { category: 'Frontend', tool: 'TypeScript', version: '5.6', purpose: 'Type safety and developer experience', license: 'Apache 2.0' },
    { category: 'Frontend', tool: 'Vite', version: '6.0', purpose: 'Build tooling and dev server', license: 'MIT' },
    { category: 'Frontend', tool: 'Tailwind CSS', version: '3.4', purpose: 'Utility-first CSS framework', license: 'MIT' },
    { category: 'Frontend', tool: 'React Router', version: '6.28', purpose: 'Client-side routing', license: 'MIT' },
    { category: 'Frontend', tool: 'Lucide React', version: '0.460', purpose: 'Icon library', license: 'ISC' },
    { category: 'Frontend', tool: 'Recharts', version: '2.15', purpose: 'Data visualisation charts', license: 'MIT' },
    { category: 'Backend', tool: 'Node.js', version: '20.x', purpose: 'Server runtime', license: 'MIT' },
    { category: 'Backend', tool: 'Express', version: '4.21', purpose: 'HTTP server framework', license: 'MIT' },
    { category: 'Backend', tool: 'SQLite / Supabase', version: '3.x / 2.109', purpose: 'Relational database & cloud storage', license: 'MIT' },
  ]);
}

function seedPresentationDecks(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as count FROM presentation_decks').get() as { count: number };
  if (count.count > 0) return;

  const insert = db.prepare('INSERT INTO presentation_decks (id, title, description, file_path, sort_order) VALUES (?, ?, ?, ?, ?)');
  insert.run('DECK-001', 'Pharmacon Commitment Pitch', 'Revised scope, doctor-adaptive recognition strategy, roadmap and approval requirements.', '/presentations/Pharmacon_Commitment_Pitch.pptx', 0);
  insert.run('DECK-002', 'Merged Project Ideas Presentation', "Original team project-ideas deck, including the medication-scheduling concept that preceded Pharmacon's revised scope.", '/presentations/Merged_Presentation_from_Claude.pptx', 1);
}

export default getDb;
