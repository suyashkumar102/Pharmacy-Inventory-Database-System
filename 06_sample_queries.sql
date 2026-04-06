-- ============================================================
-- PIPMS - Sample Queries for 1st Review Demo (MySQL 8.0+)
-- ============================================================

USE pipms;

-- Q1: Full drug catalog
SELECT drug_id, generic_name, brand_name, category, unit_price
FROM Drug
ORDER BY category, generic_name;

-- Q2: Current inventory status
SELECT
    d.generic_name,
    d.brand_name,
    b.batch_number,
    b.quantity_on_hand,
    b.reorder_level,
    b.expiry_date,
    b.is_expired,
    b.needs_reorder
FROM Batch b
JOIN Drug d ON d.drug_id = b.drug_id
ORDER BY d.generic_name;

-- Q3: Low stock alert
SELECT * FROM vw_low_stock;

-- Q4: Expired batches
SELECT * FROM vw_expired_batches;

-- Q5: All prescriptions with patient and doctor names
SELECT
    p.prescription_id,
    pt.full_name  AS patient,
    dr.full_name  AS doctor,
    p.issue_date,
    p.status
FROM Prescription p
JOIN Patient pt ON pt.patient_id = p.patient_id
JOIN Doctor  dr ON dr.doctor_id  = p.doctor_id
ORDER BY p.issue_date DESC;

-- Q6: Prescription items detail
SELECT
    pi.item_id,
    p.prescription_id,
    pt.full_name       AS patient,
    d.generic_name     AS drug,
    pi.prescribed_quantity,
    pi.dosage_instructions,
    pi.is_dispensed
FROM Prescription_Item pi
JOIN Prescription p  ON p.prescription_id  = pi.prescription_id
JOIN Patient      pt ON pt.patient_id      = p.patient_id
JOIN Drug         d  ON d.drug_id          = pi.drug_id
ORDER BY p.prescription_id;

-- Q7: Dispensing history for patient 3 (Vikram Singh)
CALL fn_dispensing_history(3);

-- Q8: Prescription activity for March 2026
CALL fn_prescription_activity('2026-03-01', '2026-03-31');

-- Q9: Batches expiring in next 6 months
CALL fn_expiry_report(CURDATE(), DATE_ADD(CURDATE(), INTERVAL 6 MONTH));

-- Q10: Supplier purchase report for supplier 1
CALL fn_supplier_purchases(1);

-- Q11: Dispense an item (prescription 1, item 1, batch 1, qty 10, pharmacist 1)
CALL dispense_item(1, 1, 10, 1);

-- Q12: Price history after a price update
UPDATE Drug SET unit_price = 3.00 WHERE drug_id = 1;
SELECT * FROM Drug_Price_History WHERE drug_id = 1;
