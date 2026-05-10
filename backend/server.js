// ================================================================
// PIPMS — Node.js Backend Server
// Serves the API that the React frontend talks to.
// ================================================================

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ── MySQL Connection Pool ──
const pool = mysql.createPool({
  host:     process.env.MYSQL_HOST || 'localhost',
  user:     process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DB   || 'pipms',
  waitForConnections: true,
  connectionLimit: 10,
});

// ── Helper: run a query ──
const q = async (sql, params) => {
  const [rows] = await pool.execute(sql, params || []);
  return rows;
};

// ── Helper: snake_case row → camelCase object ──
function toCamel(row) {
  if (!row) return null;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v instanceof Date ? v.toISOString() : v;
  }
  return out;
}

// ── Helper: generate sparkline data ──
function sparkline(seed, len = 14) {
  return Array.from({ length: len }, (_, i) => ({
    x: i,
    y: Math.max(2, Math.round(Math.sin(i / 1.7 + seed) * 5 + seed * 2 + i / 3 + 6)),
  }));
}

// ── Helper: next ID ──
async function nextId(table, prefix, pad = 3) {
  const [rows] = await pool.execute(`SELECT id FROM ${table} ORDER BY id DESC LIMIT 1`);
  if (rows.length === 0) return `${prefix}001`;
  const last = rows[0].id;
  const num = parseInt(last.replace(/\D/g, ''), 10) + 1;
  return `${prefix}${String(num).padStart(pad, '0')}`;
}

// ================================================================
//  /api/me — current user (hardcoded for DBMS project)
// ================================================================
app.get('/api/me', (req, res) => {
  res.json({ name: 'Admin User', role: 'Administrator', initials: 'AU', email: 'admin@pipms.local' });
});

// ================================================================
//  DASHBOARD
// ================================================================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [[{ c: drugCount }]]    = await pool.execute('SELECT COUNT(*) AS c FROM drugs');
    const [[{ c: patientCount }]] = await pool.execute('SELECT COUNT(*) AS c FROM patients');
    const [[{ c: pendingCount }]] = await pool.execute("SELECT COUNT(*) AS c FROM prescriptions WHERE status='pending'");
    const [[{ c: alertCount }]]   = await pool.execute('SELECT COUNT(*) AS c FROM drugs WHERE stock < 20');

    res.json([
      { id: 'drugs',    label: 'Total Drugs',           value: drugCount,    delta: 12.5, direction: 'up',   period: 'from last month', color: 'green',  icon: 'Pill',           series: sparkline(2) },
      { id: 'patients', label: 'Patients',              value: patientCount, delta: 8.3,  direction: 'up',   period: 'from last month', color: 'blue',   icon: 'Users',          series: sparkline(3) },
      { id: 'pending',  label: 'Pending Prescriptions', value: pendingCount, delta: 20,   direction: 'down', period: 'from last month', color: 'purple', icon: 'FileText',       series: sparkline(1) },
      { id: 'alerts',   label: 'Low Stock Alerts',      value: alertCount,   delta: 100,  direction: 'up',   period: 'from last month', color: 'orange', icon: 'AlertTriangle',  series: sparkline(4) },
    ]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/dashboard/recent-prescriptions', async (req, res) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit) || 5);
    const rows = await q(
      `SELECT rx.id, p.name AS patient, d.name AS doctor,
              DATE_FORMAT(rx.issued_at, '%e %b %Y') AS date, rx.status
       FROM prescriptions rx
       JOIN patients p ON p.id = rx.patient_id
       JOIN doctors  d ON d.id = rx.doctor_id
       ORDER BY rx.issued_at DESC LIMIT ${limit}`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/dashboard/low-stock', async (req, res) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit) || 5);
    const rows = await q(
      `SELECT id, name, stock AS units FROM drugs WHERE stock < 20 ORDER BY stock ASC LIMIT ${limit}`
    );
    res.json(rows.map(r => ({ ...r, status: 'low' })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/dashboard/inventory-overview', async (req, res) => {
  try {
    const [[{ total }]]      = await pool.execute('SELECT COUNT(*) AS total FROM drugs');
    const [[{ inStock }]]    = await pool.execute('SELECT COUNT(*) AS inStock FROM drugs WHERE stock >= 20');
    const [[{ lowStock }]]   = await pool.execute('SELECT COUNT(*) AS lowStock FROM drugs WHERE stock > 0 AND stock < 20');
    const [[{ outOfStock }]] = await pool.execute('SELECT COUNT(*) AS outOfStock FROM drugs WHERE stock = 0');
    res.json({ total, inStock, lowStock, outOfStock });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/dashboard/system-summary', async (req, res) => {
  try {
    const [[{ d }]] = await pool.execute('SELECT COUNT(*) AS d FROM drugs');
    const [[{ p }]] = await pool.execute('SELECT COUNT(*) AS p FROM patients');
    const [[{ doc }]] = await pool.execute('SELECT COUNT(*) AS doc FROM doctors');
    const [[{ rx }]] = await pool.execute('SELECT COUNT(*) AS rx FROM prescriptions');
    res.json([
      { label: 'Drugs',         value: d,   color: 'green' },
      { label: 'Patients',      value: p,   color: 'blue' },
      { label: 'Doctors',       value: doc, color: 'purple' },
      { label: 'Prescriptions', value: rx,  color: 'orange' },
    ]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/dashboard/notifications', async (req, res) => {
  try {
    const lowStockDrugs = await q('SELECT id, name, stock FROM drugs WHERE stock < 20 ORDER BY stock ASC LIMIT 5');
    const recentRx = await q(
      `SELECT rx.id, d.name AS doctor FROM prescriptions rx
       JOIN doctors d ON d.id = rx.doctor_id
       ORDER BY rx.issued_at DESC LIMIT 3`
    );
    const notifications = [];
    lowStockDrugs.forEach((d, i) => {
      notifications.push({ id: i + 1, title: `${d.name} low stock (${d.stock} left)`, time: `${i + 1}m ago`, type: 'warning' });
    });
    recentRx.forEach((r, i) => {
      notifications.push({ id: 100 + i, title: `New prescription from ${r.doctor}`, time: `${i + 1}h ago`, type: 'info' });
    });
    res.json(notifications);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================================================================
//  DRUGS — CRUD + KPI series
// ================================================================
app.get('/api/drugs', async (req, res) => {
  try {
    const rows = await q('SELECT * FROM drugs ORDER BY added_at DESC');
    res.json(rows.map(r => toCamel(r)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/drugs/kpi-series', (req, res) => {
  res.json({
    total:      sparkline(2),
    inStock:    sparkline(3),
    lowStock:   sparkline(4),
    outOfStock: Array.from({ length: 14 }, (_, i) => ({ x: i, y: 0 })),
    value:      sparkline(5),
  });
});

app.post('/api/drugs', async (req, res) => {
  try {
    const { name, categoryId, price, stock } = req.body;
    const id = await nextId('drugs', 'drg-');
    const addedAt = new Date().toISOString().slice(0, 10);
    await q(
      'INSERT INTO drugs (id, name, category_id, price, stock, added_at) VALUES (?,?,?,?,?,?)',
      [id, name, categoryId, parseFloat(price), parseInt(stock) || 0, addedAt]
    );
    res.json({ id, name, categoryId, price: parseFloat(price), stock: parseInt(stock) || 0, addedAt });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/drugs/:id', async (req, res) => {
  try {
    const { name, categoryId, price, stock } = req.body;
    const sets = [];
    const vals = [];
    if (name !== undefined)       { sets.push('name=?');        vals.push(name); }
    if (categoryId !== undefined) { sets.push('category_id=?'); vals.push(categoryId); }
    if (price !== undefined)      { sets.push('price=?');       vals.push(parseFloat(price)); }
    if (stock !== undefined)      { sets.push('stock=?');       vals.push(parseInt(stock)); }
    if (sets.length === 0) return res.json({ ok: true });
    vals.push(req.params.id);
    await q(`UPDATE drugs SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/drugs/:id', async (req, res) => {
  try {
    await q('DELETE FROM drugs WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================================================================
//  PATIENTS — CRUD
// ================================================================
app.get('/api/patients', async (req, res) => {
  try {
    const rows = await q('SELECT * FROM patients ORDER BY registered_at DESC');
    res.json(rows.map(r => toCamel(r)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/patients', async (req, res) => {
  try {
    const { name, gender, age, phone, email, addressLine, city, state } = req.body;
    const id = await nextId('patients', 'P');
    const registeredAt = new Date().toISOString().replace('Z','');
    await q(
      `INSERT INTO patients (id, name, gender, age, phone, email, address_line, city, state, registered_at, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,'active')`,
      [id, name, gender, parseInt(age), phone, email, addressLine || null, city, state, registeredAt]
    );
    res.json({ id, name, gender, age: parseInt(age), phone, email, addressLine, city, state, registeredAt, status: 'active' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/patients/:id', async (req, res) => {
  try {
    const fields = { name: 'name', gender: 'gender', age: 'age', phone: 'phone', email: 'email', addressLine: 'address_line', city: 'city', state: 'state', status: 'status' };
    const sets = [];
    const vals = [];
    for (const [js, sql] of Object.entries(fields)) {
      if (req.body[js] !== undefined) { sets.push(`${sql}=?`); vals.push(req.body[js]); }
    }
    if (sets.length === 0) return res.json({ ok: true });
    vals.push(req.params.id);
    await q(`UPDATE patients SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    await q('DELETE FROM patients WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================================================================
//  DOCTORS — CRUD + KPI series
// ================================================================
app.get('/api/doctors', async (req, res) => {
  try {
    const rows = await q('SELECT * FROM doctors ORDER BY added_at DESC');
    res.json(rows.map(r => toCamel(r)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/doctors/kpi-series', (req, res) => {
  res.json({
    total:           sparkline(2),
    specializations: sparkline(3),
    active:          sparkline(4),
    thisMonth:       sparkline(5),
  });
});

app.post('/api/doctors', async (req, res) => {
  try {
    const { name, qualification, specializationId, phone, email, status } = req.body;
    const id = await nextId('doctors', 'D');
    const addedAt = new Date().toISOString().replace('Z','');
    await q(
      `INSERT INTO doctors (id, name, qualification, specialization_id, phone, email, added_at, status)
       VALUES (?,?,?,?,?,?,?,?)`,
      [id, name, qualification, specializationId, phone, email, addedAt, status || 'active']
    );
    res.json({ id, name, qualification, specializationId, phone, email, addedAt, status: status || 'active' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/doctors/:id', async (req, res) => {
  try {
    const fields = { name: 'name', qualification: 'qualification', specializationId: 'specialization_id', phone: 'phone', email: 'email', status: 'status' };
    const sets = [];
    const vals = [];
    for (const [js, sql] of Object.entries(fields)) {
      if (req.body[js] !== undefined) { sets.push(`${sql}=?`); vals.push(req.body[js]); }
    }
    if (sets.length === 0) return res.json({ ok: true });
    vals.push(req.params.id);
    await q(`UPDATE doctors SET ${sets.join(',')} WHERE id=?`, vals);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/doctors/:id', async (req, res) => {
  try {
    await q('DELETE FROM doctors WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================================================================
//  PRESCRIPTIONS — CRUD + KPI series
// ================================================================
app.get('/api/prescriptions', async (req, res) => {
  try {
    // Get all prescriptions
    const rxRows = await q(
      `SELECT rx.*, p.name AS patient_name, p.gender AS patient_gender, p.age AS patient_age,
              p.phone AS patient_phone, p.email AS patient_email,
              p.address_line AS patient_address_line, p.city AS patient_city, p.state AS patient_state,
              p.registered_at AS patient_registered_at, p.status AS patient_status,
              doc.name AS doctor_name, doc.qualification AS doctor_qualification,
              doc.specialization_id AS doctor_specialization_id, doc.phone AS doctor_phone,
              doc.email AS doctor_email, doc.added_at AS doctor_added_at, doc.status AS doctor_status
       FROM prescriptions rx
       JOIN patients p   ON p.id = rx.patient_id
       JOIN doctors  doc ON doc.id = rx.doctor_id
       ORDER BY rx.issued_at DESC`
    );

    // Get all medicines
    const medRows = await q(
      `SELECT pm.*, d.name AS drug_name, d.category_id, d.price AS drug_price, d.stock AS drug_stock, d.added_at AS drug_added_at
       FROM prescription_medicines pm
       JOIN drugs d ON d.id = pm.drug_id
       ORDER BY pm.prescription_id, pm.position`
    );

    // Group medicines by prescription
    const medsByRx = {};
    for (const m of medRows) {
      if (!medsByRx[m.prescription_id]) medsByRx[m.prescription_id] = [];
      medsByRx[m.prescription_id].push(m);
    }

    // Build enriched response
    const result = rxRows.map(rx => ({
      id: rx.id,
      patientId: rx.patient_id,
      doctorId: rx.doctor_id,
      issuedAt: rx.issued_at instanceof Date ? rx.issued_at.toISOString() : rx.issued_at,
      status: rx.status,
      notes: rx.notes || '',
      medicines: (medsByRx[rx.id] || []).map(m => ({
        drugId: m.drug_id,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
      })),
      // Patient object for enrichPrescription
      patient: {
        id: rx.patient_id,
        name: rx.patient_name,
        gender: rx.patient_gender,
        age: rx.patient_age,
        phone: rx.patient_phone,
        email: rx.patient_email,
        addressLine: rx.patient_address_line,
        city: rx.patient_city,
        state: rx.patient_state,
        registeredAt: rx.patient_registered_at instanceof Date ? rx.patient_registered_at.toISOString() : rx.patient_registered_at,
        status: rx.patient_status,
      },
      // Doctor object
      doctor: {
        id: rx.doctor_id,
        name: rx.doctor_name,
        qualification: rx.doctor_qualification,
        specializationId: rx.doctor_specialization_id,
        phone: rx.doctor_phone,
        email: rx.doctor_email,
        addedAt: rx.doctor_added_at instanceof Date ? rx.doctor_added_at.toISOString() : rx.doctor_added_at,
        status: rx.doctor_status,
      },
      // Medicine details (enriched)
      medicineDetails: (medsByRx[rx.id] || []).map(m => ({
        drugId: m.drug_id,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        drug: {
          id: m.drug_id,
          name: m.drug_name,
          categoryId: m.category_id,
          price: parseFloat(m.drug_price),
          stock: m.drug_stock,
          addedAt: m.drug_added_at instanceof Date ? m.drug_added_at.toISOString().slice(0,10) : m.drug_added_at,
        },
        categoryColor: getCategoryColor(m.category_id),
      })),
    }));

    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/prescriptions/kpi-series', (req, res) => {
  res.json({
    total:     sparkline(2, 16),
    pending:   sparkline(4, 16),
    completed: sparkline(3, 16),
    cancelled: sparkline(5, 16),
  });
});

app.post('/api/prescriptions', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { patientId, doctorId, issuedAt, status, notes, medicines } = req.body;
    const id = await nextId('prescriptions', 'RX');
    const issuedDate = issuedAt || new Date().toISOString().replace('Z','');

    await conn.execute(
      'INSERT INTO prescriptions (id, patient_id, doctor_id, issued_at, status, notes) VALUES (?,?,?,?,?,?)',
      [id, patientId, doctorId, issuedDate, status || 'pending', notes || '']
    );

    if (medicines && medicines.length > 0) {
      for (let i = 0; i < medicines.length; i++) {
        const m = medicines[i];
        await conn.execute(
          'INSERT INTO prescription_medicines (prescription_id, drug_id, dosage, frequency, duration, position) VALUES (?,?,?,?,?,?)',
          [id, m.drugId, m.dosage, m.frequency, m.duration, i]
        );
      }
    }

    await conn.commit();
    res.json({ id, patientId, doctorId, issuedAt: issuedDate, status: status || 'pending', notes: notes || '', medicines: medicines || [] });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

app.patch('/api/prescriptions/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { status, notes } = req.body;

    if (status) {
      // Use stored procedure for completing/cancelling
      if (status === 'completed') {
        await conn.execute('CALL complete_prescription(?)', [req.params.id]);
      } else if (status === 'cancelled') {
        await conn.execute('CALL cancel_prescription(?)', [req.params.id]);
      } else {
        await conn.execute('UPDATE prescriptions SET status=? WHERE id=?', [status, req.params.id]);
      }
    }
    if (notes !== undefined) {
      await conn.execute('UPDATE prescriptions SET notes=? WHERE id=?', [notes, req.params.id]);
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// Get all patients (for prescription form dropdown)
app.get('/api/prescriptions/patients', async (req, res) => {
  try {
    const rows = await q("SELECT id, name, phone FROM patients WHERE status='active' ORDER BY name");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Category color helper ──
function getCategoryColor(catId) {
  const map = {
    antibiotic: 'pink', cardiovascular: 'blue', painkiller: 'green',
    antidiabetic: 'amber', respiratory: 'cyan', neurological: 'purple',
    vitamin: 'orange', other: 'slate',
  };
  return map[catId] || 'slate';
}

// ── Health check ──
app.get('/api/', (req, res) => {
  res.json({ message: 'PIPMS API is running', status: 'ok' });
});

// ── Start ──
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`\n  ✅  PIPMS API running at  http://localhost:${PORT}\n`);
});
