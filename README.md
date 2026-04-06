# Pharmacy Inventory & Prescription Management System

A MySQL database project for managing pharmacy inventory, prescriptions, and dispensing records.

## Database: `pipms` (MySQL 8.0+)

### Schema Overview

- **Drug** – drug catalog with pricing
- **Batch** – inventory lots per drug with expiry tracking
- **Supplier** – supplier info and purchase orders
- **Patient / Doctor** – registered patients and doctors
- **Prescription / Prescription_Item** – prescriptions and their line items
- **Dispensing_Record** – tracks what was dispensed, when, and by whom

### Files

| File | Description |
|------|-------------|
| `01_schema.sql` | Table definitions |
| `02_triggers.sql` | Auto-expire batches, reorder flags, price history |
| `03_stored_procedures.sql` | Dispense items, receive POs, register patients/doctors |
| `04_views.sql` | Low stock, expired batches, and report procedures |
| `05_sample_data.sql` | Sample seed data |
| `06_sample_queries.sql` | Example queries |

## Setup

```sql
-- Run in order
source 01_schema.sql
source 02_triggers.sql
source 03_stored_procedures.sql
source 04_views.sql
source 05_sample_data.sql
```

## Usage

```sql
-- Dispense a prescription item
CALL dispense_item(item_id, batch_id, quantity, pharmacist_id);

-- Receive a purchase order
CALL receive_purchase_order(po_id);

-- Check low stock
SELECT * FROM vw_low_stock;

-- Check expired batches
SELECT * FROM vw_expired_batches;
```
