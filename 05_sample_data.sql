-- ============================================================
-- PIPMS - Sample Data (MySQL 8.0+)
-- ============================================================

USE pipms;

-- Suppliers
INSERT INTO Supplier (supplier_name, contact_person, phone, email) VALUES
('MedLine Pharma',  'Ravi Kumar',   '9876543210', 'ravi@medline.com'),
('HealthPlus Dist', 'Priya Sharma', '9123456780', 'priya@healthplus.com');

-- Drugs
INSERT INTO Drug (generic_name, brand_name, category, unit_of_measure, unit_price) VALUES
('Paracetamol',  'Crocin',   'Analgesic',    'Tablet',  2.50),
('Amoxicillin',  'Mox',      'Antibiotic',   'Capsule', 8.00),
('Metformin',    'Glycomet', 'Antidiabetic', 'Tablet',  3.75),
('Atorvastatin', 'Lipitor',  'Statin',       'Tablet',  15.00),
('Omeprazole',   'Omez',     'Antacid',      'Capsule', 5.50);

-- Batches
-- batch_id 3 (Metformin): qty 80 < reorder 100 → needs_reorder flagged by trigger
-- batch_id 4 (Atorvastatin): expiry in past → is_expired flagged by trigger
INSERT INTO Batch (drug_id, supplier_id, batch_number, quantity_on_hand, reorder_level, expiry_date) VALUES
(1, 1, 'BATCH-P001', 500, 100, '2026-12-31'),
(2, 1, 'BATCH-A001', 200,  50, '2026-06-30'),
(3, 2, 'BATCH-M001',  80, 100, '2027-03-31'),
(4, 2, 'BATCH-L001', 150,  30, '2024-01-01'),
(5, 1, 'BATCH-O001', 300,  60, '2026-09-30');

-- Patients
INSERT INTO Patient (full_name, date_of_birth, contact_number, address) VALUES
('Arjun Mehta',  '1985-04-12', '9001122334', '12 MG Road, Bangalore'),
('Sunita Rao',   '1972-08-25', '9005566778', '45 Anna Nagar, Chennai'),
('Vikram Singh', '1990-11-03', '9009988776', '7 Civil Lines, Delhi');

-- Doctors
INSERT INTO Doctor (full_name, license_number, specialization, contact_number) VALUES
('Dr. Anita Desai', 'MCI-10234', 'General Physician', '9111222333'),
('Dr. Ramesh Nair', 'MCI-20567', 'Cardiologist',      '9222333444');

-- Prescriptions
INSERT INTO Prescription (patient_id, doctor_id, issue_date, status) VALUES
(1, 1, '2026-03-20', 'pending'),
(2, 2, '2026-03-22', 'pending'),
(3, 1, '2026-03-23', 'dispensed');

-- Prescription Items
INSERT INTO Prescription_Item (prescription_id, drug_id, prescribed_quantity, dosage_instructions, is_dispensed) VALUES
(1, 1, 10, 'Take 1 tablet twice daily after meals', 0),
(1, 5,  5, 'Take 1 capsule before breakfast',       0),
(2, 4, 30, 'Take 1 tablet at night',                0),
(3, 3, 60, 'Take 1 tablet twice daily',             1);

-- Purchase Orders
INSERT INTO Purchase_Order (supplier_id, drug_id, batch_number, quantity_ordered, unit_cost, order_date, status) VALUES
(1, 3, 'BATCH-M001', 200, 3.00, '2026-03-18', 'received'),
(2, 1, 'BATCH-P002', 500, 2.00, '2026-03-24', 'pending');

-- Dispensing Record (for prescription 3 — already dispensed)
INSERT INTO Dispensing_Record (item_id, batch_id, quantity_dispensed, dispensing_date, pharmacist_id) VALUES
(4, 3, 60, '2026-03-23', 1);
