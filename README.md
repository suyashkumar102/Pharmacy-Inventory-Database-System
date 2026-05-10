# Pharmacy Inventory & Prescription Management System (PIPMS)

A simplified MySQL database project with a **beautiful web UI** for managing pharmacy inventory and prescriptions.

## Database: `pipms_simplified` (MySQL 8.0+)

### 5 Core Entities

| # | Entity | Purpose |
|---|--------|---------|
| 1 | **Drug** | Drug catalog with pricing and stock levels |
| 2 | **Patient** | Patient demographics and contact info |
| 3 | **Doctor** | Doctor registry with specializations |
| 4 | **Prescription** | Prescriptions linking patients to doctors |
| 5 | **Prescription_Item** | Drugs prescribed with quantities |

### Advanced Features
- **Trigger**: Auto-completes prescriptions when all items are dispensed
- **Stored Procedures**: `dispense_item()`, `restock_drug()`, `cancel_prescription()`
- **Views**: `vw_low_stock`, `vw_prescription_details`

## Setup

### 1. Setup the Database
```sql
-- Run in MySQL in order
source 01_schema.sql
source 02_triggers.sql
source 03_stored_procedures.sql
source 04_views.sql
source 05_sample_data.sql
```

### 2. Configure the Web App
Edit `app/server.js` and set your MySQL root password:
```js
password: 'YOUR_PASSWORD_HERE',
```

### 3. Run the Web App
```bash
cd app
npm install
npm start
```
Open **http://localhost:3000** in your browser.

## SQL Files

| File | Description |
|------|-------------|
| `01_schema.sql` | Table definitions (5 entities) |
| `02_triggers.sql` | Auto-complete prescription trigger |
| `03_stored_procedures.sql` | Dispense, restock, cancel procedures |
| `04_views.sql` | Low stock & prescription detail views |
| `05_sample_data.sql` | Demo data (15 drugs, 8 patients, 5 doctors, 6 prescriptions) |
| `06_sample_queries.sql` | Example queries |

## Web UI Features
- **Dashboard** — Stats overview with low-stock alerts
-  **Drugs** — Full CRUD + restock via stored procedure
-  **Patients** — Register and manage patients
-  **Doctors** — Doctor registry
-  **Prescriptions** — Create multi-item prescriptions, dispense items, cancel
