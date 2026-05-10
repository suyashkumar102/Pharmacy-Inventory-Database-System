-- ============================================================
-- PIPMS - Views (MySQL 8.0+)
-- SIMPLIFIED
-- ============================================================

USE pipms_simplified;

-- View 1: Low stock drugs (assumes < 20 is low)
CREATE OR REPLACE VIEW vw_low_stock AS
SELECT
    drug_id,
    name,
    category,
    price,
    stock_quantity
FROM Drug
WHERE stock_quantity < 20;

-- View 2: Detailed Prescription Info
CREATE OR REPLACE VIEW vw_prescription_details AS
SELECT
    pr.prescription_id,
    p.full_name AS patient_name,
    d.full_name AS doctor_name,
    pr.issue_date,
    pr.status,
    dr.name AS drug_name,
    pi.quantity,
    pi.is_dispensed
FROM Prescription pr
JOIN Patient p ON p.patient_id = pr.patient_id
JOIN Doctor d ON d.doctor_id = pr.doctor_id
JOIN Prescription_Item pi ON pi.prescription_id = pr.prescription_id
JOIN Drug dr ON dr.drug_id = pi.drug_id;
