-- ============================================================
-- PIPMS - Triggers (MySQL 8.0+)
-- SIMPLIFIED
-- ============================================================

USE pipms_simplified;

DELIMITER $$

-- Trigger 1: Auto-complete prescription when all items are dispensed
CREATE TRIGGER trg_auto_complete_prescription
AFTER UPDATE ON Prescription_Item
FOR EACH ROW
BEGIN
    DECLARE v_prescription_id INT;
    DECLARE v_undispensed     INT;

    -- Only check if is_dispensed changed to 1
    IF NEW.is_dispensed = 1 AND OLD.is_dispensed = 0 THEN
        SET v_prescription_id = NEW.prescription_id;

        -- Count remaining undispensed items
        SELECT COUNT(*) INTO v_undispensed
        FROM Prescription_Item
        WHERE prescription_id = v_prescription_id
          AND is_dispensed = 0;

        -- Auto-complete if all items dispensed
        IF v_undispensed = 0 THEN
            UPDATE Prescription
            SET status = 'dispensed'
            WHERE prescription_id = v_prescription_id;
        END IF;
    END IF;
END$$

DELIMITER ;
