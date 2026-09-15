import { Router } from 'express';
import { getDb } from '../db.js';
import { AuthRequest } from '../auth.js';

const router = Router();
const audit = (actor: string, role: string, action: string, entity: string, entityId: string, status = 'success', details = '') => {
  getDb().prepare('INSERT INTO audit_events (id, actor, role, action, entity, entity_id, status, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(`AE-${Math.random().toString(36).slice(2, 10)}`, actor, role, action, entity, entityId, status, details);
};

// ─── Inventory Endpoints ──────────────────────────────────────────────────

// GET /api/inventory — list inventory items
router.get('/inventory', (_req, res) => {
  const items = getDb().prepare(`
    SELECT id, medicine, strength, dosage_form as dosageForm, sku, pack_size as packSize,
           stock, reorder_level as reorderLevel, updated_at as lastUpdated,
           CASE WHEN stock = 0 THEN 'out-of-stock' WHEN stock <= reorder_level THEN 'low-stock' ELSE 'in-stock' END as status
    FROM inventory_items ORDER BY medicine
  `).all();
  res.json({ items });
});

// POST /api/inventory — add a new medicine
router.post('/inventory', (req: AuthRequest, res) => {
  const { medicine, strength, dosageForm, sku, packSize, stock, reorderLevel } = req.body;
  if (!medicine || !strength) return res.status(400).json({ error: 'medicine and strength required' });
  
  const id = `INV-${Date.now().toString(36).toUpperCase()}`;
  const generatedSku = sku || `${medicine.slice(0, 3).toUpperCase()}-${strength.replace(/\s/g, '')}-${(dosageForm || 'TAB').slice(0, 3).toUpperCase()}`;
  const numStock = Number(stock) || 0;
  const numReorder = Number(reorderLevel) || 15;

  getDb().prepare(`
    INSERT INTO inventory_items (id, medicine, strength, dosage_form, sku, pack_size, stock, reorder_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, medicine, strength, dosageForm || 'Tablet', generatedSku, packSize || '100 tabs', numStock, numReorder);

  audit(req.user?.name || 'Pharmacist', req.user?.role || 'pharmacist', `Added item ${medicine} to formulary`, 'Inventory', id);

  const status = numStock === 0 ? 'out-of-stock' : numStock <= numReorder ? 'low-stock' : 'in-stock';
  res.status(201).json({
    id, medicine, strength, dosageForm: dosageForm || 'Tablet', sku: generatedSku,
    packSize: packSize || '100 tabs', stock: numStock, reorderLevel: numReorder, status,
  });
});

// PUT /api/inventory/:id/stock — adjust stock level
router.put('/inventory/:id/stock', (req: AuthRequest, res) => {
  const { delta, stock } = req.body;
  const db = getDb();
  const item = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(req.params.id) as any;
  if (!item) return res.status(404).json({ error: 'Item not found' });

  let newStock = typeof stock === 'number' ? stock : Math.max(0, item.stock + (Number(delta) || 0));
  db.prepare("UPDATE inventory_items SET stock = ?, updated_at = datetime('now') WHERE id = ?").run(newStock, req.params.id);
  audit(req.user?.name || 'Pharmacist', req.user?.role || 'pharmacist', `Adjusted stock for ${item.medicine} to ${newStock}`, 'Inventory', req.params.id);

  const status = newStock === 0 ? 'out-of-stock' : newStock <= item.reorder_level ? 'low-stock' : 'in-stock';
  res.json({ id: req.params.id, stock: newStock, status });
});

// ─── Prescription Endpoints ───────────────────────────────────────────────

// GET /api/prescriptions — list all prescriptions with their extracted fields
router.get('/prescriptions', (req, res) => {
  const db = getDb();
  const statusFilter = req.query.status as string;
  let query = 'SELECT * FROM prescriptions';
  const params: any[] = [];
  if (statusFilter) {
    query += ' WHERE status = ?';
    params.push(statusFilter);
  }
  query += ' ORDER BY created_at DESC';

  const prescriptions = db.prepare(query).all(...params) as any[];
  const getFields = db.prepare('SELECT id, label, value, confidence, needs_verification FROM prescription_fields WHERE prescription_id = ?');

  res.json({
    prescriptions: prescriptions.map((p) => ({
      ...p,
      fields: getFields.all(p.id).map((f: any) => ({
        ...f,
        needs_verification: Boolean(f.needs_verification),
      })),
    })),
  });
});

// GET /api/prescriptions/:patientId
router.get('/prescriptions/patient/:patientId', (req, res) => {
  const prescriptions = getDb().prepare('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC').all(req.params.patientId) as any[];
  const fields = getDb().prepare('SELECT id, label, value, confidence, needs_verification FROM prescription_fields WHERE prescription_id = ?');
  res.json({ prescriptions: prescriptions.map((p) => ({ ...p, fields: fields.all(p.id) })) });
});

// POST /api/prescriptions — create new prescription from Doctor or OCR intake
router.post('/prescriptions', (req: AuthRequest, res) => {
  const { id, patient_id, patient_name, doctor_name, status, fields } = req.body;
  const rxId = id || `RX-${Date.now().toString(36).toUpperCase()}`;
  const db = getDb();

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO prescriptions (id, patient_id, patient_name, doctor_name, status, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(rxId, patient_id || 'PT-1001', patient_name || 'Rahul Kumar', doctor_name || req.user?.name || 'Dr. A. Sharma', status || 'confirmed');

    if (Array.isArray(fields)) {
      const insertField = db.prepare(`
        INSERT INTO prescription_fields (prescription_id, label, value, confidence, needs_verification)
        VALUES (?, ?, ?, ?, ?)
      `);
      fields.forEach((f: any) => {
        insertField.run(rxId, f.label || '', f.value || '', Number(f.confidence) || 95, f.needs_verification ? 1 : 0);
      });
    }

    audit(req.user?.name || doctor_name || 'Doctor', req.user?.role || 'doctor', `Created prescription ${rxId}`, 'Prescription', rxId);
  });
  tx();

  const getFields = db.prepare('SELECT id, label, value, confidence, needs_verification FROM prescription_fields WHERE prescription_id = ?');
  res.status(201).json({
    id: rxId,
    patient_id: patient_id || 'PT-1001',
    patient_name: patient_name || 'Rahul Kumar',
    doctor_name: doctor_name || 'Dr. A. Sharma',
    status: status || 'confirmed',
    created_at: new Date().toISOString(),
    fields: getFields.all(rxId),
  });
});

// PUT /api/prescriptions/:id/status — update status (e.g. draft -> confirmed -> dispensed)
router.put('/prescriptions/:id/status', (req: AuthRequest, res) => {
  const { status } = req.body;
  const result = getDb().prepare('UPDATE prescriptions SET status = ? WHERE id = ?').run(status, req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Prescription not found' });
  audit(req.user?.name || 'Staff User', req.user?.role || 'clinic-staff', `Updated prescription ${req.params.id} status to ${status}`, 'Prescription', req.params.id);
  res.json({ success: true, id: req.params.id, status });
});

// PUT /api/prescriptions/:id/resolve-field — resolve flagged field in verification
router.put('/api/prescriptions/:id/resolve-field', (req: AuthRequest, res) => {
  const { fieldId, fieldLabel, resolvedValue } = req.body;
  const db = getDb();
  if (fieldId) {
    db.prepare('UPDATE prescription_fields SET needs_verification = 0, confidence = 99 WHERE id = ? AND prescription_id = ?').run(fieldId, req.params.id);
  } else if (fieldLabel) {
    db.prepare('UPDATE prescription_fields SET needs_verification = 0, confidence = 99, value = COALESCE(?, value) WHERE label = ? AND prescription_id = ?')
      .run(resolvedValue || null, fieldLabel, req.params.id);
  }
  audit(req.user?.name || 'Staff User', req.user?.role || 'clinic-staff', `Resolved verification field on ${req.params.id}`, 'PrescriptionField', req.params.id);
  res.json({ success: true });
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

// ─── Refill Endpoints ─────────────────────────────────────────────────────

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
  const db = getDb();
  const result = db.prepare("UPDATE refill_requests SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Refill request not found' });
  
  if (status === 'approved') {
    // Deduct stock for Amoxicillin or matched medicine
    db.prepare("UPDATE inventory_items SET stock = MAX(stock - 1, 0), updated_at = datetime('now') WHERE id = 'INV-001'").run();
  }

  audit(req.user?.name || 'Pharmacist', req.user?.role || 'pharmacist', `Refill ${status}`, 'Refill', req.params.id);
  res.json({ success: true });
});

// ─── Audit Trail Endpoints ────────────────────────────────────────────────

// GET /api/audit — list audit log events
router.get('/audit', (_req, res) => {
  res.json({
    events: getDb().prepare(`
      SELECT id, created_at as timestamp, actor as user, role, action, entity, entity_id as entityId, status, details
      FROM audit_events ORDER BY created_at DESC LIMIT 100
    `).all()
  });
});

export default router;

