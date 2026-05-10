-- ============================================================
-- PIPMS ALL-IN-ONE SETUP (FOR MYSQL WORKBENCH)
-- Run this ONCE to create everything.
-- ============================================================

DROP DATABASE IF EXISTS pipms;
CREATE DATABASE pipms;
USE pipms;

-- ───────────────────────────────────────────────────────────
-- 1. DRUGS
-- ───────────────────────────────────────────────────────────
CREATE TABLE drugs (
  id            VARCHAR(32)   NOT NULL,
  name          VARCHAR(150)  NOT NULL,
  category_id   VARCHAR(40)   NOT NULL,
  price         DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock         INT UNSIGNED  NOT NULL DEFAULT 0,
  added_at      DATE          NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_drugs_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────
-- 2. PATIENTS
-- ───────────────────────────────────────────────────────────
CREATE TABLE patients (
  id            VARCHAR(16)  NOT NULL,
  name          VARCHAR(150) NOT NULL,
  gender        ENUM('male','female','other') NOT NULL,
  age           TINYINT UNSIGNED NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  email         VARCHAR(150) NOT NULL,
  address_line  VARCHAR(255)     NULL,
  city          VARCHAR(100) NOT NULL,
  state         VARCHAR(100) NOT NULL,
  registered_at DATETIME     NOT NULL,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (id),
  INDEX idx_patients_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────
-- 3. DOCTORS
-- ───────────────────────────────────────────────────────────
CREATE TABLE doctors (
  id                 VARCHAR(16)  NOT NULL,
  name               VARCHAR(150) NOT NULL,
  qualification      VARCHAR(100) NOT NULL,
  specialization_id  VARCHAR(40)  NOT NULL,
  phone              VARCHAR(20)  NOT NULL,
  email              VARCHAR(150) NOT NULL,
  added_at           DATETIME     NOT NULL,
  status             ENUM('active','on_leave','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (id),
  INDEX idx_doctors_specialization (specialization_id),
  INDEX idx_doctors_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────
-- 4. PRESCRIPTIONS
-- ───────────────────────────────────────────────────────────
CREATE TABLE prescriptions (
  id          VARCHAR(16)  NOT NULL,
  patient_id  VARCHAR(16)  NOT NULL,
  doctor_id   VARCHAR(16)  NOT NULL,
  issued_at   DATETIME     NOT NULL,
  status      ENUM('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
  notes       TEXT             NULL,
  PRIMARY KEY (id),
  INDEX idx_rx_patient (patient_id),
  INDEX idx_rx_doctor  (doctor_id),
  INDEX idx_rx_status  (status),
  CONSTRAINT fk_rx_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
  CONSTRAINT fk_rx_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctors(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────
-- 5. PRESCRIPTION MEDICINES (line items)
-- ───────────────────────────────────────────────────────────
CREATE TABLE prescription_medicines (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  prescription_id VARCHAR(16) NOT NULL,
  drug_id         VARCHAR(32) NOT NULL,
  dosage          VARCHAR(50) NOT NULL,
  frequency       VARCHAR(50) NOT NULL,
  duration        VARCHAR(50) NOT NULL,
  position        INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  INDEX idx_pm_prescription (prescription_id),
  INDEX idx_pm_drug         (drug_id),
  CONSTRAINT fk_pm_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
  CONSTRAINT fk_pm_drug         FOREIGN KEY (drug_id)         REFERENCES drugs(id)         ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────
-- TRIGGER: Auto-deduct stock when prescription is completed
-- ───────────────────────────────────────────────────────────
DELIMITER $$
CREATE TRIGGER trg_deduct_stock_on_complete
AFTER UPDATE ON prescriptions
FOR EACH ROW
BEGIN
    IF OLD.status = 'pending' AND NEW.status = 'completed' THEN
        UPDATE drugs d
        JOIN prescription_medicines pm ON pm.drug_id = d.id
        SET d.stock = GREATEST(0, CAST(d.stock AS SIGNED) - 1)
        WHERE pm.prescription_id = NEW.id;
    END IF;
END$$
DELIMITER ;

-- ───────────────────────────────────────────────────────────
-- STORED PROCEDURES
-- ───────────────────────────────────────────────────────────
DELIMITER $$

-- Procedure: Complete a prescription (deducts stock)
CREATE PROCEDURE complete_prescription(IN p_id VARCHAR(16))
BEGIN
    UPDATE prescriptions SET status = 'completed' WHERE id = p_id AND status = 'pending';
END$$

-- Procedure: Cancel a prescription
CREATE PROCEDURE cancel_prescription(IN p_id VARCHAR(16))
BEGIN
    UPDATE prescriptions SET status = 'cancelled' WHERE id = p_id AND status = 'pending';
END$$

-- Procedure: Restock a drug
CREATE PROCEDURE restock_drug(IN p_id VARCHAR(32), IN p_qty INT)
BEGIN
    UPDATE drugs SET stock = stock + p_qty WHERE id = p_id;
END$$

DELIMITER ;

-- ───────────────────────────────────────────────────────────
-- VIEWS
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_low_stock AS
SELECT id, name, category_id, price, stock
FROM drugs WHERE stock < 20;

CREATE OR REPLACE VIEW vw_prescription_details AS
SELECT
    rx.id AS prescription_id,
    rx.issued_at,
    rx.status,
    rx.notes,
    p.id AS patient_id, p.name AS patient_name,
    d.id AS doctor_id,  d.name AS doctor_name, d.specialization_id,
    pm.drug_id, pm.dosage, pm.frequency, pm.duration, pm.position,
    dr.name AS drug_name, dr.category_id, dr.price AS drug_price, dr.stock AS drug_stock
FROM prescriptions rx
JOIN patients p ON p.id = rx.patient_id
JOIN doctors d  ON d.id = rx.doctor_id
LEFT JOIN prescription_medicines pm ON pm.prescription_id = rx.id
LEFT JOIN drugs dr ON dr.id = pm.drug_id;

-- ───────────────────────────────────────────────────────────
-- SEED DATA
-- ───────────────────────────────────────────────────────────

-- Drugs (15)
INSERT INTO drugs (id, name, category_id, price, stock, added_at) VALUES
('drg-001', 'Amoxicillin 500mg',   'antibiotic',      12.50,  120, '2026-04-12'),
('drg-002', 'Atorvastatin 20mg',   'cardiovascular',   20.00,    8, '2026-03-22'),
('drg-003', 'Ibuprofen 400mg',     'painkiller',        8.00,  200, '2026-04-30'),
('drg-004', 'Metformin 500mg',     'antidiabetic',     10.00,   15, '2026-04-02'),
('drg-005', 'Azithromycin 250mg',  'antibiotic',       18.00,   45, '2026-04-15'),
('drg-006', 'Ciprofloxacin 500mg', 'antibiotic',       22.00,   60, '2026-04-18'),
('drg-007', 'Paracetamol 500mg',   'painkiller',        5.00,  350, '2026-03-10'),
('drg-008', 'Diclofenac 50mg',     'painkiller',        9.50,   80, '2026-04-20'),
('drg-009', 'Lisinopril 10mg',     'cardiovascular',   15.00,   55, '2026-04-05'),
('drg-010', 'Amlodipine 5mg',      'cardiovascular',   13.00,   70, '2026-04-08'),
('drg-011', 'Omeprazole 20mg',     'other',             7.50,  180, '2026-04-22'),
('drg-012', 'Cetirizine 10mg',     'other',             6.00,  250, '2026-03-28'),
('drg-013', 'Salbutamol Inhaler',  'respiratory',      28.00,   40, '2026-04-25'),
('drg-014', 'Metoprolol 50mg',     'cardiovascular',   16.00,   12, '2026-03-15'),
('drg-015', 'Gabapentin 300mg',    'neurological',     14.00,   35, '2026-04-10');

-- Patients (8)
INSERT INTO patients (id, name, gender, age, phone, email, address_line, city, state, registered_at, status) VALUES
('P001', 'Priya Patel',       'female', 28, '9123456780', 'priya.patel@email.com',    '12, Lake Gardens',   'Kolkata',    'West Bengal',  '2026-05-07T10:30:00', 'active'),
('P002', 'Rahul Sharma',      'male',   32, '9876543210', 'rahul.sharma@email.com',   '44, MG Road',        'Bangalore',  'Karnataka',    '2026-05-07T10:15:00', 'active'),
('P003', 'Amit Mishra',       'male',   45, '9834567120', 'amit.mishra@email.com',    '78, Civil Lines',    'Delhi',      'Delhi',        '2026-05-06T09:00:00', 'active'),
('P004', 'Sneha Kapoor',      'female', 30, '9001234567', 'sneha.kapoor@email.com',   '23, Jubilee Hills',  'Hyderabad',  'Telangana',    '2026-05-05T14:30:00', 'active'),
('P005', 'Vikram Iyer',       'male',   55, '9011223344', 'vikram.iyer@email.com',    '90, Model Town',     'Lucknow',    'Uttar Pradesh','2026-05-04T11:00:00', 'active'),
('P006', 'Anjali Reddy',      'female', 38, '9977665544', 'anjali.reddy@email.com',   '56, Anna Nagar',     'Chennai',    'Tamil Nadu',   '2026-05-03T16:00:00', 'active'),
('P007', 'Karan Mehta',       'male',   42, '9888777666', 'karan.mehta@email.com',    '34, Sector 17',      'Chandigarh', 'Punjab',       '2026-05-02T08:30:00', 'active'),
('P008', 'Neha Verma',        'female', 26, '9876123450', 'neha.verma@email.com',     '67, FC Road',        'Pune',       'Maharashtra',  '2026-05-01T13:00:00', 'active');

-- Doctors (5)
INSERT INTO doctors (id, name, qualification, specialization_id, phone, email, added_at, status) VALUES
('D001', 'Dr. Arjun Nair',   'MBBS, MD',        'cardiology',     '9000200030', 'arjun.nair@hospital.com',  '2026-05-01T11:00:00', 'active'),
('D002', 'Dr. Meera Joshi',  'MBBS',            'general',        '9000100020', 'meera.joshi@clinic.com',   '2026-05-03T09:30:00', 'active'),
('D003', 'Dr. Sunita Gupta', 'MBBS, DM',        'endocrinology',  '9000300040', 'sunita.gupta@hospital.com','2026-04-20T10:00:00', 'active'),
('D004', 'Dr. Rajesh Verma', 'MBBS, MD',        'neurology',      '9000400050', 'rajesh.verma@hospital.com','2026-04-15T14:00:00', 'on_leave'),
('D005', 'Dr. Fatima Khan',  'MBBS, MS',        'orthopedics',    '9000500060', 'fatima.khan@hospital.com', '2026-04-10T11:30:00', 'active');

-- Prescriptions (28) — 7 pending, 18 completed, 3 cancelled
INSERT INTO prescriptions (id, patient_id, doctor_id, issued_at, status, notes) VALUES
('RX001', 'P002', 'D002', '2026-05-07T10:15:00', 'pending',   'Follow up in 1 week.'),
('RX002', 'P001', 'D001', '2026-05-06T16:30:00', 'completed', 'Blood pressure stable.'),
('RX003', 'P003', 'D002', '2026-05-05T11:20:00', 'cancelled', 'Patient cancelled appointment.'),
('RX004', 'P004', 'D001', '2026-05-04T14:45:00', 'pending',   'Initial consultation.'),
('RX005', 'P005', 'D003', '2026-05-03T09:00:00', 'pending',   ''),
('RX006', 'P006', 'D004', '2026-05-03T10:07:00', 'pending',   ''),
('RX007', 'P007', 'D005', '2026-05-03T11:14:00', 'pending',   ''),
('RX008', 'P008', 'D001', '2026-05-03T12:21:00', 'pending',   ''),
('RX009', 'P001', 'D002', '2026-05-03T13:28:00', 'pending',   ''),
('RX010', 'P002', 'D003', '2026-05-02T09:35:00', 'completed', ''),
('RX011', 'P003', 'D004', '2026-05-02T10:42:00', 'completed', ''),
('RX012', 'P004', 'D005', '2026-05-01T11:49:00', 'completed', ''),
('RX013', 'P005', 'D001', '2026-05-01T12:56:00', 'completed', ''),
('RX014', 'P006', 'D002', '2026-04-30T14:03:00', 'completed', ''),
('RX015', 'P007', 'D003', '2026-04-30T15:10:00', 'completed', ''),
('RX016', 'P008', 'D004', '2026-04-29T16:17:00', 'completed', ''),
('RX017', 'P001', 'D005', '2026-04-29T09:24:00', 'completed', ''),
('RX018', 'P002', 'D001', '2026-04-28T10:31:00', 'completed', ''),
('RX019', 'P003', 'D002', '2026-04-28T11:38:00', 'completed', ''),
('RX020', 'P004', 'D003', '2026-04-27T12:45:00', 'completed', ''),
('RX021', 'P005', 'D004', '2026-04-27T13:52:00', 'completed', ''),
('RX022', 'P006', 'D005', '2026-04-26T14:59:00', 'completed', ''),
('RX023', 'P007', 'D001', '2026-04-26T16:06:00', 'completed', ''),
('RX024', 'P008', 'D002', '2026-04-25T09:13:00', 'completed', ''),
('RX025', 'P001', 'D003', '2026-04-25T10:20:00', 'completed', ''),
('RX026', 'P002', 'D004', '2026-04-24T11:27:00', 'completed', ''),
('RX027', 'P003', 'D005', '2026-04-24T12:34:00', 'completed', ''),
('RX028', 'P004', 'D001', '2026-04-23T13:41:00', 'cancelled', '');

-- Prescription Medicines
INSERT INTO prescription_medicines (prescription_id, drug_id, dosage, frequency, duration, position) VALUES
-- RX001: 3 medicines
('RX001', 'drg-001', '1 tab',  'Once daily',     '5 days',  0),
('RX001', 'drg-002', '2 tabs', 'Twice daily',    '7 days',  1),
('RX001', 'drg-003', '5 ml',   'Thrice daily',   '3 days',  2),
-- RX002: 2 medicines
('RX002', 'drg-002', '2 tabs', 'Twice daily',    '10 days', 0),
('RX002', 'drg-003', '5 ml',   'Thrice daily',   '5 days',  1),
-- RX003: 4 medicines
('RX003', 'drg-003', '5 ml',   'Thrice daily',   '7 days',  0),
('RX003', 'drg-004', '1 cap',  'Every 8 hours',  '10 days', 1),
('RX003', 'drg-001', '1 tab',  'Once daily',     '14 days', 2),
('RX003', 'drg-002', '2 tabs', 'Twice daily',    '3 days',  3),
-- RX004: 1 medicine
('RX004', 'drg-004', '1 cap',  'Every 8 hours',  '10 days', 0),
-- RX005-RX009: 1-2 medicines each
('RX005', 'drg-001', '1 tab',  'Once daily',     '5 days',  0),
('RX006', 'drg-005', '1 tab',  'Twice daily',    '7 days',  0),
('RX007', 'drg-003', '5 ml',   'Thrice daily',   '3 days',  0),
('RX007', 'drg-007', '1 tab',  'Once daily',     '5 days',  1),
('RX008', 'drg-009', '1 tab',  'Once daily',     '14 days', 0),
('RX009', 'drg-004', '1 cap',  'Twice daily',    '7 days',  0),
-- RX010-RX028: 1 medicine each (completed/cancelled)
('RX010', 'drg-002', '1 tab',  'Once daily',     '10 days', 0),
('RX011', 'drg-007', '1 tab',  'Thrice daily',   '3 days',  0),
('RX012', 'drg-003', '5 ml',   'Twice daily',    '5 days',  0),
('RX013', 'drg-001', '1 tab',  'Once daily',     '7 days',  0),
('RX014', 'drg-004', '1 cap',  'Every 8 hours',  '5 days',  0),
('RX015', 'drg-005', '1 tab',  'Twice daily',    '7 days',  0),
('RX016', 'drg-008', '1 tab',  'Once daily',     '10 days', 0),
('RX017', 'drg-010', '1 tab',  'Once daily',     '14 days', 0),
('RX018', 'drg-011', '1 cap',  'Twice daily',    '7 days',  0),
('RX019', 'drg-012', '1 tab',  'Once daily',     '5 days',  0),
('RX020', 'drg-013', '2 puffs','Twice daily',    '30 days', 0),
('RX021', 'drg-014', '1 tab',  'Once daily',     '14 days', 0),
('RX022', 'drg-015', '1 cap',  'Thrice daily',   '7 days',  0),
('RX023', 'drg-009', '1 tab',  'Once daily',     '10 days', 0),
('RX024', 'drg-006', '1 tab',  'Twice daily',    '5 days',  0),
('RX025', 'drg-001', '1 tab',  'Once daily',     '7 days',  0),
('RX026', 'drg-003', '5 ml',   'Thrice daily',   '3 days',  0),
('RX027', 'drg-007', '1 tab',  'Once daily',     '5 days',  0),
('RX028', 'drg-002', '1 tab',  'Once daily',     '10 days', 0);

SELECT 'SUCCESS: PIPMS database created with all tables, triggers, procedures, views, and seed data!' AS Message;
