import { Router } from 'express';
import { getDb } from '../db.js';
import { AuthRequest } from '../auth.js';

const router = Router();
const audit = (actor: string, role: string, action: string, entity: string, entityId: string, status = 'success', details = '') => {
  getDb().prepare('INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(`AE-${Math.random().toString(36).slice(2, 10)}`, actor, role, action, entity, entityId, status, details);
};

// GET /api/inventory — list inventory items (public/resilient)
router.get('/inventory', (_req, res) => {
  const items = getDb().prepare(`
    SELECT id, medicine, strength, dosage_form as dosageForm, sku, pack_size as packSize,
           stock, reorder_level as reorderLevel, updated_at as lastUpdated,
           CASE WHEN stock = 0 THEN 'out-of-stock' WHEN stock <= reorder_level THEN 'low-stock' ELSE 'in-stock' END as status
    FROM inventory_items ORDER BY medicine
  `).all();
  res.json({ items });
});

// GET /api/audit — list audit log events (public/resilient)
router.get('/audit', (_req, res) => {
  res.json({
    events: getDb().prepare(`
      SELECT id, created_at as timestamp, actor as user, role, action, entity, entity_id as entityId, status, details
      FROM audit_events ORDER BY created_at DESC LIMIT 100
    `).all()
  });
});

// GET /api/prescriptions/:patientId
router.get('/prescriptions/:patientId', (req, res) => {
  const prescriptions = getDb().prepare('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC').all(req.params.patientId) as any[];
  const fields = getDb().prepare('SELECT label, value, confidence, needs_verification FROM prescription_fields WHERE prescription_id = ?');
  res.json({ prescriptions: prescriptions.map((p) => ({ ...p, fields: fields.all(p.id) })) });
});

// POST /api/prescriptions/confirm-sample — confirm sample prescription & adjust inventory
router.post('/prescriptions/confirm-sample', (req: AuthRequest, res) => {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM prescriptions WHERE id = 'RX-DEMO-CONFIRMED'").get();
  if (existing) return res.json({ prescriptionId: 'RX-DEMO-CONFIRMED', alreadyConfirmed: true });

  const tx = db.transaction(() => {
    db.prepare('INSERT INTO prescriptions (id, patient_id, patient_name, doctor_name, status) VALUES (?, ?, ?, ?, ?)').run('RX-DEMO-CONFIRMED', 'PT-1001', 'Rahul Kumar', 'Dr. A. Sharma', 'confirmed');
    const field = db.prepare('INSERT INTO prescription_fields (prescription_id, label, value, confidence, needs_verification) VALUES (?, ?, ?, ?, ?)');
    [['Medicine','Amoxicillin',94,0],['Strength','500 mg',97,0],['Dosage Form','Tablet',96,0],['Frequency','1-0-1',86,1],['Route','Oral',92,0],['Duration','5 days',91,0],['Instructions','After food',88,1]].forEach((f) => field.run('RX-DEMO-CONFIRMED', ...f));
    db.prepare("UPDATE inventory_items SET stock = MAX(stock - 1, 0), updated_at = datetime('now') WHERE id = 'INV-001'").run();
    audit(req.user?.name || 'Staff User', req.user?.role || 'clinic-staff', 'Prescription confirmed', 'Prescription', 'RX-DEMO-CONFIRMED');
    audit('System', 'System', 'Inventory adjusted', 'Inventory', 'INV-001');
  });
  tx();
  res.status(201).json({ prescriptionId: 'RX-DEMO-CONFIRMED' });
});

// GET /api/refills
router.get('/refills', (_req, res) => {
  const refills = getDb().prepare(`
    SELECT id, prescription_id as prescriptionId, patient_id as patientId, patient_name as patientName,
           medicine, strength, status, requested_at as requestDate, updated_at as updatedAt
    FROM refill_requests ORDER BY requested_at DESC
  `).all();
  res.json({ refills });
});

// POST /api/refills
router.post('/refills', (req: AuthRequest, res) => {
  const db = getDb();
  const id = `RF-${Math.random().toString(36).slice(2, 10)}`;
  db.prepare('INSERT INTO refill_requests (id, prescription_id, patient_id, patient_name, medicine, strength, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, 'RX-2024-0001', req.user?.id || 'PT-1001', req.user?.name || 'Rahul Kumar', 'Amoxicillin', '500 mg', 'pending');
  audit(req.user?.name || 'Rahul Kumar', req.user?.role || 'patient', 'Refill requested', 'Refill', id, 'info');
  res.status(201).json({ id });
});

// PUT /api/refills/:id
router.put('/refills/:id', (req: AuthRequest, res) => {
  const status = req.body.status;
  if (!['approved', 'rejected', 'contacted'].includes(status)) return res.status(400).json({ error: 'Invalid refill status' });
  const result = getDb().prepare("UPDATE refill_requests SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Refill request not found' });
  audit(req.user?.name || 'Pharmacist', req.user?.role || 'pharmacist', `Refill ${status}`, 'Refill', req.params.id);
  res.json({ success: true });
});

export default router;
