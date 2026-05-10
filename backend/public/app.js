/* ================================================================
   PIPMS — Frontend Application Logic
   ================================================================ */

// ── Helpers ──
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const api = async (url, opts = {}) => {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Request failed');
    return data;
  } catch (e) {
    toast(e.message, 'error');
    throw e;
  }
};

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  $('#toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function openModal(title, bodyHTML) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = bodyHTML;
  $('#modalOverlay').classList.add('open');
}

function closeModal() {
  $('#modalOverlay').classList.remove('open');
}

$('#modalClose').addEventListener('click', closeModal);
$('#modalOverlay').addEventListener('click', (e) => {
  if (e.target === $('#modalOverlay')) closeModal();
});

// ── Sidebar Navigation ──
const navLinks = $$('.nav-link');
let currentPage = 'dashboard';

navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    if (page === currentPage) return;
    navLinks.forEach((l) => l.classList.remove('active'));
    link.classList.add('active');
    currentPage = page;
    $('#pageTitle').textContent = page.charAt(0).toUpperCase() + page.slice(1);
    loadPage(page);
    // close mobile sidebar
    $('#sidebar').classList.remove('open');
  });
});

$('#menuToggle').addEventListener('click', () => {
  $('#sidebar').classList.toggle('open');
});

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function pillHTML(status) {
  return `<span class="pill pill-${status}">${status}</span>`;
}

function stockPill(qty) {
  return qty < 20
    ? `<span class="pill pill-low">${qty} (Low)</span>`
    : `<span class="pill pill-ok">${qty}</span>`;
}

// ================================================================
//  PAGE ROUTER
// ================================================================
function loadPage(page) {
  const container = $('#pageContainer');
  container.style.animation = 'none';
  // trigger reflow
  void container.offsetHeight;
  container.style.animation = 'fadeIn 0.3s ease';

  switch (page) {
    case 'dashboard':     return renderDashboard();
    case 'drugs':         return renderDrugs();
    case 'patients':      return renderPatients();
    case 'doctors':       return renderDoctors();
    case 'prescriptions': return renderPrescriptions();
  }
}

// ================================================================
//  DASHBOARD
// ================================================================
async function renderDashboard() {
  const d = await api('/api/dashboard');
  $('#lowStockBadge').textContent = `${d.lowStockCount} alert${d.lowStockCount !== 1 ? 's' : ''}`;

  let rxRows = '';
  d.recentPrescriptions.forEach((r) => {
    rxRows += `<tr>
      <td style="color:var(--text-primary);font-weight:500">#${r.prescription_id}</td>
      <td>${r.patient}</td>
      <td>${r.doctor}</td>
      <td>${formatDate(r.issue_date)}</td>
      <td>${pillHTML(r.status)}</td>
    </tr>`;
  });

  $('#pageContainer').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon green">💊</div>
        <div class="stat-info">
          <span class="stat-value">${d.totalDrugs}</span>
          <span class="stat-label">Total Drugs</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">🧑‍🤝‍🧑</div>
        <div class="stat-info">
          <span class="stat-value">${d.totalPatients}</span>
          <span class="stat-label">Patients</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow">📋</div>
        <div class="stat-info">
          <span class="stat-value">${d.pendingCount}</span>
          <span class="stat-label">Pending Rx</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">⚠️</div>
        <div class="stat-info">
          <span class="stat-value">${d.lowStockCount}</span>
          <span class="stat-label">Low Stock</span>
        </div>
      </div>
    </div>

    <div class="section-header">
      <h2 class="section-title">Recent Prescriptions</h2>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th></tr>
        </thead>
        <tbody>${rxRows || '<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No prescriptions yet</div></div></td></tr>'}</tbody>
      </table>
    </div>
  `;
}

// ================================================================
//  DRUGS
// ================================================================
async function renderDrugs() {
  const drugs = await api('/api/drugs');
  let rows = '';
  drugs.forEach((d) => {
    rows += `<tr>
      <td style="color:var(--text-primary);font-weight:500">${d.name}</td>
      <td>${d.category}</td>
      <td>₹${Number(d.price).toFixed(2)}</td>
      <td>${stockPill(d.stock_quantity)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn-icon dispense-btn" title="Restock" onclick="openRestockModal(${d.drug_id},'${d.name.replace(/'/g, "\\'")}')">📦</button>
          <button class="btn-icon" title="Delete" onclick="deleteDrug(${d.drug_id})">🗑</button>
        </div>
      </td>
    </tr>`;
  });

  $('#pageContainer').innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Drug Inventory</h2>
      <button class="btn btn-primary" onclick="openAddDrugModal()">+ Add Drug</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">💊</div><div class="empty-state-text">No drugs found</div></div></td></tr>'}</tbody>
      </table>
    </div>
  `;
}

window.openAddDrugModal = () => {
  openModal('Add New Drug', `
    <form id="addDrugForm" class="form-grid">
      <div class="form-group full">
        <label class="form-label">Drug Name</label>
        <input class="form-input" name="name" required placeholder="e.g. Amoxicillin 500mg" />
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <input class="form-input" name="category" required placeholder="e.g. Antibiotic" />
      </div>
      <div class="form-group">
        <label class="form-label">Price (₹)</label>
        <input class="form-input" name="price" type="number" step="0.01" min="0.01" required />
      </div>
      <div class="form-group">
        <label class="form-label">Initial Stock</label>
        <input class="form-input" name="stock_quantity" type="number" min="0" value="0" required />
      </div>
      <div class="form-group form-actions full">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add Drug</button>
      </div>
    </form>
  `);
  $('#addDrugForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api('/api/drugs', {
      method: 'POST',
      body: { name: fd.get('name'), category: fd.get('category'), price: fd.get('price'), stock_quantity: fd.get('stock_quantity') },
    });
    closeModal();
    toast('Drug added successfully');
    renderDrugs();
  });
};

window.openRestockModal = (id, name) => {
  openModal(`Restock — ${name}`, `
    <form id="restockForm" class="form-grid">
      <div class="form-group full">
        <label class="form-label">Quantity to Add</label>
        <input class="form-input" name="quantity" type="number" min="1" required autofocus />
      </div>
      <div class="form-group form-actions full">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Restock</button>
      </div>
    </form>
  `);
  $('#restockForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const qty = new FormData(e.target).get('quantity');
    await api(`/api/drugs/${id}/restock`, { method: 'POST', body: { quantity: qty } });
    closeModal();
    toast(`Restocked ${name} with ${qty} units`);
    renderDrugs();
  });
};

window.deleteDrug = async (id) => {
  if (!confirm('Delete this drug?')) return;
  await api(`/api/drugs/${id}`, { method: 'DELETE' });
  toast('Drug deleted');
  renderDrugs();
};

// ================================================================
//  PATIENTS
// ================================================================
async function renderPatients() {
  const patients = await api('/api/patients');
  let rows = '';
  patients.forEach((p) => {
    rows += `<tr>
      <td style="color:var(--text-primary);font-weight:500">${p.full_name}</td>
      <td>${p.contact_number || '—'}</td>
      <td>${p.address || '—'}</td>
      <td>
        <button class="btn-icon" title="Delete" onclick="deletePatient(${p.patient_id})">🗑</button>
      </td>
    </tr>`;
  });

  $('#pageContainer').innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Patient Records</h2>
      <button class="btn btn-primary" onclick="openAddPatientModal()">+ Add Patient</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Name</th><th>Contact</th><th>Address</th><th>Actions</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="4"><div class="empty-state"><div class="empty-state-icon">🧑‍🤝‍🧑</div><div class="empty-state-text">No patients found</div></div></td></tr>'}</tbody>
      </table>
    </div>
  `;
}

window.openAddPatientModal = () => {
  openModal('Register New Patient', `
    <form id="addPatientForm" class="form-grid">
      <div class="form-group full">
        <label class="form-label">Full Name</label>
        <input class="form-input" name="full_name" required />
      </div>
      <div class="form-group">
        <label class="form-label">Contact Number</label>
        <input class="form-input" name="contact_number" />
      </div>
      <div class="form-group">
        <label class="form-label">Address</label>
        <input class="form-input" name="address" />
      </div>
      <div class="form-group form-actions full">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Register</button>
      </div>
    </form>
  `);
  $('#addPatientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api('/api/patients', { method: 'POST', body: { full_name: fd.get('full_name'), contact_number: fd.get('contact_number'), address: fd.get('address') } });
    closeModal();
    toast('Patient registered');
    renderPatients();
  });
};

window.deletePatient = async (id) => {
  if (!confirm('Delete this patient?')) return;
  await api(`/api/patients/${id}`, { method: 'DELETE' });
  toast('Patient deleted');
  renderPatients();
};

// ================================================================
//  DOCTORS
// ================================================================
async function renderDoctors() {
  const doctors = await api('/api/doctors');
  let rows = '';
  doctors.forEach((d) => {
    rows += `<tr>
      <td style="color:var(--text-primary);font-weight:500">${d.full_name}</td>
      <td>${d.specialization || '—'}</td>
      <td>${d.contact_number || '—'}</td>
      <td>
        <button class="btn-icon" title="Delete" onclick="deleteDoctor(${d.doctor_id})">🗑</button>
      </td>
    </tr>`;
  });

  $('#pageContainer').innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Doctor Registry</h2>
      <button class="btn btn-primary" onclick="openAddDoctorModal()">+ Add Doctor</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Name</th><th>Specialization</th><th>Contact</th><th>Actions</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="4"><div class="empty-state"><div class="empty-state-icon">🩺</div><div class="empty-state-text">No doctors found</div></div></td></tr>'}</tbody>
      </table>
    </div>
  `;
}

window.openAddDoctorModal = () => {
  openModal('Register New Doctor', `
    <form id="addDoctorForm" class="form-grid">
      <div class="form-group full">
        <label class="form-label">Full Name</label>
        <input class="form-input" name="full_name" required />
      </div>
      <div class="form-group">
        <label class="form-label">Specialization</label>
        <input class="form-input" name="specialization" />
      </div>
      <div class="form-group">
        <label class="form-label">Contact Number</label>
        <input class="form-input" name="contact_number" />
      </div>
      <div class="form-group form-actions full">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Register</button>
      </div>
    </form>
  `);
  $('#addDoctorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api('/api/doctors', { method: 'POST', body: { full_name: fd.get('full_name'), specialization: fd.get('specialization'), contact_number: fd.get('contact_number') } });
    closeModal();
    toast('Doctor registered');
    renderDoctors();
  });
};

window.deleteDoctor = async (id) => {
  if (!confirm('Delete this doctor?')) return;
  await api(`/api/doctors/${id}`, { method: 'DELETE' });
  toast('Doctor deleted');
  renderDoctors();
};

// ================================================================
//  PRESCRIPTIONS
// ================================================================
async function renderPrescriptions() {
  const rxs = await api('/api/prescriptions');
  let rows = '';
  rxs.forEach((r) => {
    const actions = [];
    actions.push(`<button class="btn-icon dispense-btn" title="View Items" onclick="viewPrescription(${r.prescription_id})">👁</button>`);
    if (r.status === 'pending') {
      actions.push(`<button class="btn-icon" title="Cancel" onclick="cancelPrescription(${r.prescription_id})">✖</button>`);
    }
    rows += `<tr>
      <td style="color:var(--text-primary);font-weight:500">#${r.prescription_id}</td>
      <td>${r.patient_name}</td>
      <td>${r.doctor_name}</td>
      <td>${formatDate(r.issue_date)}</td>
      <td>${pillHTML(r.status)}</td>
      <td><div style="display:flex;gap:6px">${actions.join('')}</div></td>
    </tr>`;
  });

  $('#pageContainer').innerHTML = `
    <div class="section-header">
      <h2 class="section-title">Prescriptions</h2>
      <button class="btn btn-primary" onclick="openNewPrescriptionModal()">+ New Prescription</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No prescriptions found</div></div></td></tr>'}</tbody>
      </table>
    </div>
  `;
}

window.viewPrescription = async (id) => {
  const rxs = await api('/api/prescriptions');
  const rx = rxs.find((r) => r.prescription_id === id);
  const items = await api(`/api/prescriptions/${id}/items`);

  let itemRows = '';
  items.forEach((it) => {
    const dispBtn = !it.is_dispensed && rx.status === 'pending'
      ? `<button class="btn btn-primary btn-sm" onclick="dispenseItem(${it.item_id}, ${id})">Dispense</button>`
      : it.is_dispensed ? pillHTML('dispensed') : '—';
    itemRows += `<tr>
      <td style="color:var(--text-primary);font-weight:500">${it.drug_name}</td>
      <td>${it.quantity}</td>
      <td>${stockPill(it.available_stock)}</td>
      <td>${dispBtn}</td>
    </tr>`;
  });

  openModal(`Prescription #${id}`, `
    <div class="rx-detail-header">
      <div class="rx-detail-field">
        <span class="rx-detail-label">Patient</span>
        <span class="rx-detail-value">${rx.patient_name}</span>
      </div>
      <div class="rx-detail-field">
        <span class="rx-detail-label">Doctor</span>
        <span class="rx-detail-value">${rx.doctor_name}</span>
      </div>
      <div class="rx-detail-field">
        <span class="rx-detail-label">Date</span>
        <span class="rx-detail-value">${formatDate(rx.issue_date)}</span>
      </div>
      <div class="rx-detail-field">
        <span class="rx-detail-label">Status</span>
        <span class="rx-detail-value">${pillHTML(rx.status)}</span>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Drug</th><th>Qty</th><th>Stock</th><th>Action</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>
  `);
};

window.dispenseItem = async (itemId, rxId) => {
  try {
    await api(`/api/dispense/${itemId}`, { method: 'POST' });
    toast('Item dispensed successfully');
    // refresh modal
    viewPrescription(rxId);
    // also refresh badge
    renderDashboardBadge();
  } catch (e) { /* toast already shown */ }
};

window.cancelPrescription = async (id) => {
  if (!confirm('Cancel this prescription?')) return;
  await api(`/api/prescriptions/${id}/cancel`, { method: 'POST' });
  toast('Prescription cancelled');
  renderPrescriptions();
};

window.openNewPrescriptionModal = async () => {
  const patients = await api('/api/patients');
  const doctors = await api('/api/doctors');
  const drugs = await api('/api/drugs');

  const patientOpts = patients.map((p) => `<option value="${p.patient_id}">${p.full_name}</option>`).join('');
  const doctorOpts = doctors.map((d) => `<option value="${d.doctor_id}">${d.full_name}</option>`).join('');
  const drugOpts = drugs.map((d) => `<option value="${d.drug_id}">${d.name} (Stock: ${d.stock_quantity})</option>`).join('');

  openModal('New Prescription', `
    <form id="newRxForm">
      <div class="form-grid" style="margin-bottom:20px">
        <div class="form-group">
          <label class="form-label">Patient</label>
          <select class="form-input form-select" name="patient_id" required>${patientOpts}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Doctor</label>
          <select class="form-input form-select" name="doctor_id" required>${doctorOpts}</select>
        </div>
      </div>

      <label class="form-label" style="margin-bottom:8px;display:block">Prescribed Items</label>
      <div class="rx-items-list" id="rxItemsList">
        <div class="rx-item-row">
          <div class="form-group">
            <select class="form-input form-select" name="drug_id_0">${drugOpts}</select>
          </div>
          <div class="form-group">
            <input class="form-input" name="qty_0" type="number" min="1" value="1" placeholder="Qty" required />
          </div>
          <div></div>
        </div>
      </div>
      <button type="button" class="add-item-btn" id="addItemBtn">+ Add Another Drug</button>

      <div class="form-actions">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Create Prescription</button>
      </div>
    </form>
  `);

  let itemCount = 1;
  $('#addItemBtn').addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'rx-item-row';
    row.innerHTML = `
      <div class="form-group">
        <select class="form-input form-select" name="drug_id_${itemCount}">${drugOpts}</select>
      </div>
      <div class="form-group">
        <input class="form-input" name="qty_${itemCount}" type="number" min="1" value="1" placeholder="Qty" required />
      </div>
      <button type="button" class="btn-icon" onclick="this.parentElement.remove()" title="Remove">🗑</button>
    `;
    $('#rxItemsList').appendChild(row);
    itemCount++;
  });

  $('#newRxForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const items = [];
    for (let i = 0; i < itemCount; i++) {
      const drugId = fd.get(`drug_id_${i}`);
      const qty = fd.get(`qty_${i}`);
      if (drugId && qty) items.push({ drug_id: parseInt(drugId), quantity: parseInt(qty) });
    }
    if (items.length === 0) { toast('Add at least one drug', 'error'); return; }

    await api('/api/prescriptions', {
      method: 'POST',
      body: { patient_id: fd.get('patient_id'), doctor_id: fd.get('doctor_id'), items },
    });
    closeModal();
    toast('Prescription created');
    renderPrescriptions();
  });
};

// ── Update badge without re-rendering entire dashboard ──
async function renderDashboardBadge() {
  try {
    const d = await api('/api/dashboard');
    $('#lowStockBadge').textContent = `${d.lowStockCount} alert${d.lowStockCount !== 1 ? 's' : ''}`;
  } catch (e) { /* silent */ }
}

// ── Initial load ──
loadPage('dashboard');
