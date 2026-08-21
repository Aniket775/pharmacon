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
  seedPageContent(db);
  seedPresentationDecks(db);
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

// ─── Seed: Page Content ──────────────────────────────────────────────────
// Seeds ALL hardcoded page content into the page_content table so every
// page becomes editable while keeping the exact same initial content.

function seedPageContent(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as count FROM page_content').get() as { count: number };
  if (count.count > 0) return; // Already seeded

  const insert = db.prepare('INSERT INTO page_content (id, page, section, items) VALUES (?, ?, ?, ?)');
  let i = 0;
  const seed = (page: string, section: string, items: unknown[]) => {
    insert.run(`PC-${String(++i).padStart(3, '0')}`, page, section, JSON.stringify(items));
  };

  // ── Software Grid ────────────────────────────────────────────────────
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
    { category: 'Backend', tool: 'SQLite', version: '3.x', purpose: 'Embedded relational database', license: 'Public Domain' },
    { category: 'Backend', tool: 'better-sqlite3', version: '11.6', purpose: 'Node.js SQLite driver', license: 'MIT' },
    { category: 'Backend', tool: 'Multer', version: '1.4', purpose: 'File upload middleware', license: 'MIT' },
    { category: 'Auth', tool: 'jsonwebtoken', version: '9.0', purpose: 'JWT token generation/validation', license: 'MIT' },
    { category: 'Auth', tool: 'bcryptjs', version: '2.4', purpose: 'Password hashing', license: 'MIT' },
    { category: 'DevOps', tool: 'Git', version: '—', purpose: 'Version control', license: 'GPL-2.0' },
    { category: 'DevOps', tool: 'tsx', version: '4.19', purpose: 'TypeScript execution for server', license: 'MIT' },
    { category: 'DevOps', tool: 'concurrently', version: '9.1', purpose: 'Run multiple dev processes', license: 'MIT' },
    { category: 'AI/CV', tool: 'TBD', version: '—', purpose: 'Handwriting recognition model (planned)', license: '—' },
  ]);

  // ── Roadmap ──────────────────────────────────────────────────────────
  seed('roadmap', 'phases', [
    { title: 'Phase 0 · Writer recruitment & baseline', detail: 'Recruit participating medical practitioners, collect three paper calibration sheets per writer, and establish a generic-model baseline.', status: 'now' },
    { title: 'Phase 1 · Adaptation proof of concept', detail: 'Test whether doctor-adapted recognition outperforms the generic model on held-out prescription samples.', status: 'next' },
    { title: 'Phase 2 · Field extraction & correction loop', detail: 'Extract medicine, dose and timing; route uncertainty to staff review; retain verified corrections for learning.', status: 'planned' },
    { title: 'Phase 3 · Inventory mapping', detail: 'Connect confirmed medicines to formulary stock through a documented adapter/API.', status: 'planned' },
    { title: 'Phase 4 · Multi-tenant clinic platform', detail: 'Add clinic-level separation, role-based workflows and patient records.', status: 'planned' },
    { title: 'Phase 5 · Patient experience', detail: 'Provide prescription history, schedules, refill requests and caregiver-aware views.', status: 'planned' },
    { title: 'Phase 6 · Evaluation & hardening', detail: 'Report results, complete end-to-end testing and harden the workflow for demonstration.', status: 'planned' },
  ]);

  seed('roadmap', 'commitments', [
    { title: 'Real writers', desc: 'Recruit medical practitioners and collect paper samples from the start.' },
    { title: 'Human safety check', desc: 'Any uncertain field stays with staff until it is confirmed.' },
    { title: 'Measured results', desc: 'Compare generic and adapted recognition on held-out samples.' },
  ]);

  seed('roadmap', 'guidance', [
    { value: 'Approval to proceed with the revised handwriting-recognition scope.' },
    { value: 'Confirmation that participating medical practitioners are valid handwriting contributors.' },
    { value: 'Guidance on the minimum number of writers expected for evaluation.' },
  ]);

  // ── Project Overview ─────────────────────────────────────────────────
  seed('project', 'overview', [
    { text: 'Pharmacon is a proposed platform for digitising handwritten medical prescriptions and connecting clinics, pharmacies and patients through a verified digital workflow.' },
    { text: 'The core idea is to use AI-assisted handwriting recognition — with human verification — to convert paper prescriptions into structured digital records, match them against a formulary/inventory system, and provide patients with a clear view of their confirmed prescriptions and medicine schedules.' },
  ]);

  seed('project', 'direction', [
    { value: 'Reliable digitisation of handwritten prescriptions using computer vision' },
    { value: 'Doctor-specific handwriting adaptation to improve recognition accuracy' },
    { value: 'Formulary and inventory integration for medicine matching' },
    { value: 'Patient dashboard for viewing confirmed prescriptions and schedules' },
    { value: 'Confidence-aware review workflow with human verification' },
    { value: 'Audit trail and role-based access for accountability' },
  ]);

  seed('project', 'why', [
    { text: 'In many clinical settings, doctors still write prescriptions by hand. Clinic and pharmacy staff then need to interpret and manually digitise these prescriptions — a process that can introduce errors, delays and disconnected records.' },
    { text: 'Pharmacon proposes to reduce this manual burden by providing an AI-assisted extraction step with human verification, connecting the digitised prescription to formulary/inventory systems, and giving patients visibility into their confirmed prescriptions.' },
  ]);

  seed('project', 'core_idea', [
    { text: '"One photo → one review screen → one confirmation — instead of full manual transcription."' },
  ]);

  seed('project', 'users', [
    { user: 'Doctors', desc: 'Write prescriptions; optionally calibrate handwriting' },
    { user: 'Clinic Staff', desc: 'Review AI-extracted prescriptions; confirm or correct' },
    { user: 'Pharmacists', desc: 'Manage inventory; confirm dispensing' },
    { user: 'Patients', desc: 'View confirmed prescriptions and medicine schedule' },
    { user: 'Administrators', desc: 'Manage users, clinics and system configuration' },
  ]);

  seed('project', 'engineering', [
    { area: 'Frontend', desc: 'React web application with role-based portals' },
    { area: 'Backend', desc: 'Node.js API with modular service architecture' },
    { area: 'AI / CV', desc: 'Handwriting recognition with doctor-specific adaptation' },
    { area: 'Integration', desc: 'Formulary/inventory adapter and matching service' },
    { area: 'Database', desc: 'Prescription, patient and audit data storage' },
    { area: 'Evaluation', desc: 'Systematic comparison of recognition approaches' },
  ]);

  // ── Proposed System ──────────────────────────────────────────────────
  seed('proposed-system', 'manual_steps', [
    { value: 'Doctor writes prescription' },
    { value: 'Staff interprets handwriting' },
    { value: 'Manual data entry' },
    { value: 'Inventory checked separately' },
    { value: 'Prescription stored' },
    { value: 'Patient manages medicines separately' },
  ]);

  seed('proposed-system', 'proposed_steps', [
    { value: 'Prescription image' },
    { value: 'AI-assisted extraction' },
    { value: 'Confidence-aware review' },
    { value: 'Formulary / inventory matching' },
    { value: 'Human confirmation' },
    { value: 'Digital prescription' },
    { value: 'Patient dashboard' },
  ]);

  seed('proposed-system', 'architecture', [
    { label: 'Doctor' },
    { label: 'Prescription Image' },
    { label: 'Handwriting Recognition / CV Layer' },
    { label: 'Structured Extraction' },
    { label: 'Confidence & Verification' },
    { label: 'Formulary / Inventory Adapter' },
    { label: 'Prescription Service' },
    { label: 'Database' },
  ]);

  seed('proposed-system', 'portals', [
    { value: 'Clinic Portal' },
    { value: 'Pharmacy Portal' },
    { value: 'Patient Portal' },
  ]);

  seed('proposed-system', 'cross_cutting', [
    { value: 'Authentication' },
    { value: 'Role-Based Access' },
    { value: 'Audit Logs' },
    { value: 'Evaluation Module' },
  ]);

  seed('proposed-system', 'modular_cards', [
    { title: 'Modular Design', desc: 'The handwriting component is replaceable. The inventory system is represented as an API/adapter.' },
    { title: 'Flexible Scope', desc: 'Components can be added, removed or swapped as the project scope evolves during the semester.' },
  ]);

  seed('proposed-system', 'improvement_note', [
    { text: 'The proposed improvement is not simply OCR. The intended system connects recognition, verification, inventory integration, prescription records and patient access into one workflow.' },
  ]);

  // ── Feasibility ──────────────────────────────────────────────────────
  seed('feasibility', 'tech_feasibility', [
    { area: 'Web application', status: 'feasible', note: 'React + Node.js — well-established stack' },
    { area: 'Computer vision / handwriting recognition', status: 'research', note: 'Active research area; accuracy depends on calibration' },
    { area: 'API architecture', status: 'feasible', note: 'RESTful services with modular adapters' },
    { area: 'Database', status: 'feasible', note: 'SQLite for prototype; PostgreSQL for production' },
    { area: 'Role-based access', status: 'feasible', note: 'Standard authentication and authorization patterns' },
  ]);

  seed('feasibility', 'data_feasibility', [
    { text: 'Appropriate handwritten prescription samples and participating writers will be required for training, calibration and evaluation. The first operational priority is recruiting practitioners willing to provide three calibration sheets. Held-out paper scans should be collected from every participating writer to enable fair evaluation of doctor-specific adaptation.' },
  ]);

  seed('feasibility', 'risks', [
    { id: 'R-01', risk: 'Handwriting recognition accuracy', impact: 'high', mitigation: 'Doctor-specific calibration; confidence-aware review; human verification step', fallback: 'Manual transcription with partial AI assistance' },
    { id: 'R-02', risk: 'Insufficient calibration samples', impact: 'medium', mitigation: 'Structured calibration workflow; minimum sample requirements', fallback: 'Fall back to generic model with lower confidence thresholds' },
    { id: 'R-03', risk: 'Medicine-name ambiguity', impact: 'high', mitigation: 'Formulary dictionary constraints; fuzzy matching with human confirmation', fallback: 'Manual medicine selection from formulary list' },
    { id: 'R-04', risk: 'Incorrect extraction', impact: 'high', mitigation: 'Mandatory human review; confidence flagging; audit trail', fallback: 'Full manual entry with AI suggestions only' },
    { id: 'R-05', risk: 'Inventory integration complexity', impact: 'medium', mitigation: 'API adapter pattern; mock inventory for prototype', fallback: 'Manual inventory lookup alongside prescription' },
    { id: 'R-06', risk: 'Prescription data privacy', impact: 'high', mitigation: 'Role-based access; encrypted storage; audit logging', fallback: 'Anonymised demo data; no real patient data in prototype' },
    { id: 'R-07', risk: 'Unauthorized access', impact: 'high', mitigation: 'Authentication; role-based permissions; session management', fallback: 'Restrict prototype to local/demo environment' },
    { id: 'R-08', risk: 'Medical safety concerns', impact: 'high', mitigation: 'System does not recommend/substitute medicines; human confirmation required', fallback: 'Clearly label all outputs as requiring professional verification' },
    { id: 'R-09', risk: 'Scope creep', impact: 'medium', mitigation: 'Modular architecture; clear scope boundaries; iterative planning', fallback: 'Prioritise core workflow; defer secondary features' },
  ]);

  // ── Evaluation ───────────────────────────────────────────────────────
  seed('evaluation', 'system_versions', [
    { v: 'V1', title: 'Generic', desc: 'Generic handwriting recognition model' },
    { v: 'V2', title: 'Generic + Dict', desc: 'Generic model + formulary/medicine dictionary constraints' },
    { v: 'V3', title: 'Adapted', desc: 'Doctor-adapted model using calibration samples' },
    { v: 'V4', title: 'Adapted + Dict + CL', desc: 'Doctor-adapted model + formulary constraints + correction-based learning' },
  ]);

  seed('evaluation', 'chart_data', [
    { name: 'V1: Generic', cer: 18.5, wer: 32.1, medicineAcc: 72.0, strengthAcc: 78.0, skuAcc: 65.0 },
    { name: 'V2: Generic + Dict', cer: 12.3, wer: 21.4, medicineAcc: 84.0, strengthAcc: 85.0, skuAcc: 78.0 },
    { name: 'V3: Adapted', cer: 8.1, wer: 14.2, medicineAcc: 91.0, strengthAcc: 92.0, skuAcc: 85.0 },
    { name: 'V4: Adapted + Dict + CL', cer: 5.2, wer: 9.8, medicineAcc: 96.0, strengthAcc: 97.0, skuAcc: 93.0 },
  ]);

  seed('evaluation', 'metrics', [
    { metric: 'Character Error Rate (CER)', desc: 'Percentage of characters incorrectly recognised' },
    { metric: 'Word Error Rate (WER)', desc: 'Percentage of words incorrectly recognised' },
    { metric: 'Medicine Name Accuracy', desc: 'Percentage of medicine names correctly extracted' },
    { metric: 'Strength/Dosage Accuracy', desc: 'Percentage of strength values correctly extracted' },
    { metric: 'Inventory SKU Mapping Accuracy', desc: 'Percentage of prescriptions correctly mapped to formulary SKUs' },
    { metric: 'Low-Confidence Abstention', desc: 'Rate at which the system correctly flags uncertain fields' },
    { metric: 'Correction Time', desc: 'Average time for staff to verify/correct a flagged field' },
    { metric: 'Improvement after Adaptation', desc: 'Delta improvement from generic to doctor-adapted model' },
  ]);

  seed('evaluation', 'eval_process', [
    { value: 'Calibration Samples' },
    { value: 'Doctor Adaptation' },
    { value: 'Held-Out Samples' },
    { value: 'Evaluation' },
    { value: 'Comparison' },
  ]);

  // ── Validation ───────────────────────────────────────────────────────
  seed('validation', 'recognition_study', [
    { text: 'Collect real-world paper scans from participating practitioners. Reserve a portion of every writer\'s samples as held-out test data, then compare the generic model with doctor-adapted models trained on one, two and three calibration sheets.' },
  ]);

  seed('validation', 'functional_tests', [
    { test: 'Login works', status: 'planned' },
    { test: 'Prescription upload works', status: 'prototype' },
    { test: 'Extraction works', status: 'prototype' },
    { test: 'Low-confidence fields are flagged', status: 'prototype' },
    { test: 'Confirmation works', status: 'prototype' },
    { test: 'Inventory state changes', status: 'planned' },
    { test: 'Patient dashboard updates', status: 'prototype' },
    { test: 'Audit event is created', status: 'prototype' },
  ]);

  seed('validation', 'user_testing_questions', [
    { value: 'Was the workflow understandable?' },
    { value: 'Was the extracted information easy to verify?' },
    { value: 'Was the confirmation step clear?' },
    { value: 'Did the workflow reduce manual effort compared to full manual entry?' },
    { value: 'Was the patient dashboard understandable?' },
    { value: 'Were low-confidence indicators helpful?' },
  ]);

  seed('validation', 'evaluation_criteria', [
    { criterion: 'Calibration learning curve', desc: 'Compare results after one, two and three calibration sheets rather than assuming a single sheet is sufficient.' },
    { criterion: 'Adapted vs. generic recognition', desc: 'Measure doctor-adapted recognition against a generic baseline using held-out paper scans from each participating writer.' },
    { criterion: 'Workflow completion', desc: 'Can users complete the full prescription digitisation workflow?' },
    { criterion: 'Correction time', desc: 'How long does it take to correct flagged fields?' },
    { criterion: 'Extraction accuracy', desc: 'How accurately does the system extract prescription fields?' },
    { criterion: 'Matching accuracy', desc: 'How accurately does the system match to formulary items?' },
    { criterion: 'Task completion', desc: 'Can all user roles complete their assigned tasks?' },
    { criterion: 'Correct state transitions', desc: 'Do all system state changes (inventory, audit, patient records) occur correctly?' },
  ]);

  // ── Doctor Adaptation ────────────────────────────────────────────────
  seed('doctor-adaptation', 'doctor_profile', [
    { name: 'Dr. A. Sharma', specialty: 'General Practitioner', samples: 24, status: 'Prototype' },
  ]);

  seed('doctor-adaptation', 'calibration_categories', [
    { name: 'Characters', samples: '26 uppercase + 26 lowercase', count: 52 },
    { name: 'Numerals', samples: '0–9', count: 10 },
    { name: 'Medical Abbreviations', samples: 'Tab, Cap, Inj, Syr, etc.', count: 15 },
    { name: 'Dosage Patterns', samples: '1-0-1, 1-1-1, SOS, etc.', count: 12 },
    { name: 'Formulary Medicines', samples: 'Top 50 medicines from formulary', count: 50 },
  ]);

  seed('doctor-adaptation', 'adaptation_steps', [
    { value: 'Generic Model' },
    { value: 'Doctor Calibration Samples' },
    { value: 'Doctor-Specific Adaptation' },
    { value: 'Held-Out Evaluation' },
  ]);

  seed('doctor-adaptation', 'explanation', [
    { text: '"Different doctors have different handwriting styles. The proposed system will investigate whether doctor-specific calibration improves recognition. This is a research question — results depend on the quality and quantity of calibration samples and the underlying recognition model."' },
  ]);

  // ── Problem & Users ──────────────────────────────────────────────────
  seed('problem-users', 'problem_intro', [
    { text: 'In many clinical environments, doctors write prescriptions by hand. Clinic and pharmacy staff then need to interpret and digitise these prescriptions — a process that can introduce several challenges:' },
  ]);

  seed('problem-users', 'problems', [
    { value: 'Handwriting ambiguity — different doctors write differently, and some handwriting is difficult to read' },
    { value: 'Manual data entry — staff must interpret and type prescription details manually' },
    { value: 'Transcription errors — manual entry can introduce mistakes in medicine names, dosages or frequencies' },
    { value: 'Repeated work — the same prescription may need to be entered multiple times across systems' },
    { value: 'Disconnected records — prescription data, inventory and patient records are often in separate systems' },
    { value: 'Limited patient visibility — patients may not have easy access to their prescription history or schedule' },
  ]);

  seed('problem-users', 'user_groups', [
    { name: 'Doctors', icon: 'Stethoscope', who: 'Medical professionals who write prescriptions during patient consultations.', need: 'A quick, non-disruptive way to have their handwritten prescriptions digitised accurately.', help: 'Pharmacon could provide optional handwriting calibration to improve recognition accuracy for their specific writing style, reducing downstream corrections.' },
    { name: 'Clinic Staff', icon: 'ClipboardList', who: 'Administrative or clinical staff who process prescriptions at the point of care.', need: 'A faster and more reliable way to digitise prescriptions without full manual re-entry.', help: 'Staff would review AI-extracted fields with confidence indicators, only correcting flagged items — instead of transcribing the entire prescription manually.' },
    { name: 'Pharmacists', icon: 'Package', who: 'Pharmacy professionals who dispense medicines and manage inventory.', need: 'Accurate digital prescriptions that map directly to their formulary and inventory.', help: 'Pharmacon could match confirmed prescriptions to formulary items, update inventory records, and surface stock alerts — reducing lookup time.' },
    { name: 'Patients', icon: 'User', who: 'Individuals who receive prescriptions from their doctors.', need: 'A clear view of their confirmed prescriptions, medicine schedule and refill status.', help: 'A patient dashboard could show confirmed medicines, dosing schedule (morning/afternoon/night), and allow refill requests — improving medication visibility.' },
    { name: 'Administrators', icon: 'Settings', who: 'System administrators who manage clinics, users and system configuration.', need: 'Oversight of system activity, user management and audit compliance.', help: 'An admin portal could provide user management, system status, audit trails and activity monitoring across all clinics and pharmacies.' },
  ]);

  seed('problem-users', 'problem_disclaimer', [
    { text: 'Note: These are potential challenges observed in general clinical workflows. We do not make specific unsupported medical or safety claims.' },
  ]);

  // ── Home Page ────────────────────────────────────────────────────────
  seed('home', 'workflow_steps', [
    { label: 'Handwritten Prescription', desc: 'Paper-based doctor prescription' },
    { label: 'AI-Assisted Extraction', desc: 'Computer vision + handwriting recognition' },
    { label: 'Human Verification', desc: 'Confidence-aware review by staff' },
    { label: 'Formulary / Inventory Match', desc: 'Automated medicine matching' },
    { label: 'Confirmed Digital Prescription', desc: 'Verified and stored securely' },
    { label: 'Patient Dashboard', desc: 'Accessible schedule and history' },
  ]);

  seed('home', 'key_points', [
    { title: 'Current Direction', desc: 'Exploring reliable handwriting digitisation with doctor-specific adaptation and formulary integration.' },
    { title: 'Prototype Stage', desc: 'Demonstrating the proposed workflow with fictional data. Exact scope is still being evaluated by our team.' },
    { title: 'Modular Architecture', desc: 'Designed for flexibility — components can be replaced, added or removed as the project scope evolves.' },
  ]);

  seed('home', 'status_cards', [
    { label: 'V1', title: 'Planning V1', subtitle: 'Current phase' },
    { label: 'prototype', title: 'Prototype Stage', subtitle: 'Demonstrating proposed workflow' },
    { label: 'evaluation', title: 'Under Evaluation', subtitle: 'Scope being refined' },
  ]);
}

// ─── Seed: Presentation Decks ────────────────────────────────────────────

function seedPresentationDecks(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as count FROM presentation_decks').get() as { count: number };
  if (count.count > 0) return;

  const insert = db.prepare('INSERT INTO presentation_decks (id, title, description, file_path, sort_order) VALUES (?, ?, ?, ?, ?)');
  insert.run('DECK-001', 'Pharmacon Commitment Pitch', 'Revised scope, doctor-adaptive recognition strategy, roadmap and approval requirements.', '/presentations/Pharmacon_Commitment_Pitch.pptx', 0);
  insert.run('DECK-002', 'Merged Project Ideas Presentation', "Original team project-ideas deck, including the medication-scheduling concept that preceded Pharmacon's revised scope.", '/presentations/Merged_Presentation_from_Claude.pptx', 1);
}

export default getDb;

