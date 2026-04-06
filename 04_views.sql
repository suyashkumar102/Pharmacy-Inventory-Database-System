-- ============================================================
-- PIPMS - Views and Stored Functions for Reports (MySQL 8.0+)
-- ============================================================

USE pipms;

-- View 1: Low stock batches
CREATE OR REPLACE VIEW vw_low_stock AS
SELECT
    b.batch_id,
    d.generic_name,
    d.brand_name,
    b.batch_number,
    b.quantity_on_hand,
    b.reorder_level,
    b.expiry_date
FROM Batch b
JOIN Drug d ON d.drug_id = b.drug_id
WHERE b.quantity_on_hand <= b.reorder_level;


-- View 2: Expired batches
CREATE OR REPLACE VIEW vw_expired_batches AS
SELECT
    b.batch_id,
    d.generic_name,
    d.brand_name,
    b.batch_number,
    b.expiry_date,
    b.quantity_on_hand
FROM Batch b
JOIN Drug d ON d.drug_id = b.drug_id
WHERE b.is_expired = 1;


DELIMITER $$

-- Function: Prescription activity report for a date range
CREATE PROCEDURE fn_prescription_activity(
    IN p_start DATE,
    IN p_end   DATE
)
BEGIN
    SELECT status, COUNT(*) AS prescription_count
    FROM Prescription
    WHERE issue_date BETWEEN p_start AND p_end
    GROUP BY status;
END$$


-- Function: Dispensing history for a patient
CREATE PROCEDURE fn_dispensing_history(IN p_patient_id INT)
BEGIN
    SELECT
        pr.prescription_id,
        d.generic_name   AS drug_name,
        dr.quantity_dispensed,
        dr.dispensing_date
    FROM Dispensing_Record dr
    JOIN Prescription_Item pi ON pi.item_id        = dr.item_id
    JOIN Prescription      pr ON pr.prescription_id = pi.prescription_id
    JOIN Drug              d  ON d.drug_id          = pi.drug_id
    WHERE pr.patient_id = p_patient_id
    ORDER BY dr.dispensing_date DESC;
END$$


-- Function: Expiry report for a date range
CREATE PROCEDURE fn_expiry_report(
    IN p_start DATE,
    IN p_end   DATE
)
BEGIN
    SELECT
        b.batch_id,
        d.generic_name,
        b.batch_number,
        b.expiry_date,
        b.quantity_on_hand
    FROM Batch b
    JOIN Drug d ON d.drug_id = b.drug_id
    WHERE b.expiry_date BETWEEN p_start AND p_end
    ORDER BY b.expiry_date;
END$$


-- Function: Supplier purchase report
CREATE PROCEDURE fn_supplier_purchases(IN p_supplier_id INT)
BEGIN
    SELECT
        po.po_id,
        d.generic_name,
        po.batch_number,
        po.quantity_ordered,
        po.unit_cost,
        po.order_date,
        po.status
    FROM Purchase_Order po
    JOIN Drug d ON d.drug_id = po.drug_id
    WHERE po.supplier_id = p_supplier_id
    ORDER BY po.order_date DESC;
END$$

DELIMITER ;
