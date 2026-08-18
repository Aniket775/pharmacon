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
  `);
  const columns = db.prepare("PRAGMA table_info(team_members)").all() as { name: string }[];
  if (!columns.some((column) => column.name === 'skills')) db.exec("ALTER TABLE team_members ADD COLUMN skills TEXT NOT NULL DEFAULT ''");
  if (!columns.some((column) => column.name === 'avatar_file_id')) db.exec("ALTER TABLE team_members ADD COLUMN avatar_file_id TEXT DEFAULT NULL");

  // ─── Seed data (only if tables are empty) ───────────────────────────

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedData(db);
  }
  seedWorkflowData(db);
  seedTeamAccounts(db);
}

function seedTeamAccounts(db: Database.Database) {
  const hash = bcrypt.hashSync('demo', 10);
  const insert = db.prepare('INSERT OR IGNORE INTO users (id, username, password_hash, name, role) VALUES (?, ?, ?, ?, ?)');
  insert.run('U-010', 'aniket', hash, 'Aniket Raj', 'patient');
  insert.run('U-007', 'aryan', hash, 'Aryan Sharma', 'patient');
  insert.run('U-008', 'amitesh', hash, 'Amitesh Kumar Singh', 'patient');
  insert.run('U-009', 'chirag', hash, 'Chirag Lamba', 'patient');
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

function seedData(db: Database.Database) {
  const hash = bcrypt.hashSync('demo', 10);

  const insertUser = db.prepare(
    'INSERT INTO users (id, username, password_hash, name, role) VALUES (?, ?, ?, ?, ?)'
  );

  insertUser.run('U-001', 'doctor', hash, 'Dr. A. Sharma', 'doctor');
  insertUser.run('U-002', 'clinic', hash, 'Priya Desai', 'clinic-staff');
  insertUser.run('U-003', 'pharmacy', hash, 'Vikram Singh', 'pharmacist');
  insertUser.run('U-004', 'patient', hash, 'Rahul Kumar', 'patient');
  insertUser.run('U-005', 'admin', hash, 'System Admin', 'admin');
  insertUser.run('U-006', 'instructor', hash, 'Prof. Instructor', 'instructor');

  // Team members
  const insertTeam = db.prepare(
    'INSERT INTO team_members (id, name, role, focus, avatar, github_url, linkedin_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  insertTeam.run('T-001', 'Aryan Sharma', 'Frontend Lead', 'UI/UX design, React components, and user-facing features', 'AS', '', '');
  insertTeam.run('T-002', 'Aniket Raj', 'Backend Lead', 'API development, database design, and server architecture', 'AR', '', '');
  insertTeam.run('T-003', 'Amitesh Kumar Singh', 'AI/CV Engineer', 'Handwriting recognition, model training, and evaluation', 'AK', '', '');
  insertTeam.run('T-004', 'Chirag Lamba', 'Integration Lead', 'System integration, deployment, and testing', 'CL', '', '');

  // Versions
  const insertVersion = db.prepare(
    'INSERT INTO versions (id, name, date, authors, status, change_summary, commit_ref, deployment_url, parent_version_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  insertVersion.run('V-001', 'Planning V1', '2024-11-15', 'Team', 'current',
    'Initial project direction, proposed system architecture, prototype, validation and evaluation plans.',
    '', '', null);
  insertVersion.run('V-002', 'Planning V2', 'TBD', 'Team', 'future',
    'Refined scope based on professor and team feedback.',
    '', '', 'V-001');
  insertVersion.run('V-003', 'Mid-Sem', 'TBD', 'Team', 'future',
    'Mid-semester deliverable with functional prototype and initial evaluation.',
    '', '', 'V-002');
  insertVersion.run('V-004', 'Final', 'TBD', 'Team', 'future',
    'Final deliverable with complete evaluation results and documentation.',
    '', '', 'V-003');

  // Deliverables
  const insertDeliverable = db.prepare(
    'INSERT INTO deliverables (id, title, type, version_id, date, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  insertDeliverable.run('D-001', 'Planning V1', 'Report', 'V-001', '2024-11-15', 'in-progress',
    'Initial planning document covering team, problem analysis, proposed system, validation, feasibility, and evaluation plans.');
  insertDeliverable.run('D-002', 'Software Grid', 'Spreadsheet', 'V-001', '2024-11-15', 'draft',
    'Technology stack and tools overview for the project.');
  insertDeliverable.run('D-003', 'Planning V1 Presentation', 'Slides', 'V-001', 'TBD', 'draft',
    'Presentation slides for the Planning V1 deliverable.');
  insertDeliverable.run('D-004', 'Mid-Sem Report', 'Document', 'V-003', 'TBD', 'draft',
    'Mid-semester report with prototype progress and initial findings.');
  insertDeliverable.run('D-005', 'Prototype Demo', 'Demo', 'V-001', '2024-11-15', 'in-progress',
    'Live prototype demonstrating the proposed prescription digitisation workflow.');
  insertDeliverable.run('D-006', 'Mid-Sem Presentation', 'Slides', 'V-003', 'TBD', 'draft',
    'Mid-semester presentation slides.');
}

export default getDb;
