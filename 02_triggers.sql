-- ============================================================
-- PIPMS - Triggers (MySQL 8.0+)
-- ============================================================

USE pipms;

DELIMITER $$

-- Trigger 1: Log price changes to Drug_Price_History
CREATE TRIGGER trg_price_history
AFTER UPDATE ON Drug
FOR EACH ROW
BEGIN
    IF NEW.unit_price <> OLD.unit_price THEN
        INSERT INTO Drug_Price_History (drug_id, old_price, new_price, changed_at)
        VALUES (OLD.drug_id, OLD.unit_price, NEW.unit_price, NOW());
    END IF;
END$$


-- Trigger 2: Flag batch as needing reorder when stock is updated
CREATE TRIGGER trg_batch_reorder
BEFORE UPDATE ON Batch
FOR EACH ROW
BEGIN
    IF NEW.quantity_on_hand <= NEW.reorder_level THEN
        SET NEW.needs_reorder = 1;
    ELSE
        SET NEW.needs_reorder = 0;
    END IF;
END$$


-- Trigger 3: Mark batch as expired on insert or update
CREATE TRIGGER trg_batch_expiry_insert
BEFORE INSERT ON Batch
FOR EACH ROW
BEGIN
    IF NEW.expiry_date < CURDATE() THEN
        SET NEW.is_expired = 1;
    END IF;
END$$

CREATE TRIGGER trg_batch_expiry_update
BEFORE UPDATE ON Batch
FOR EACH ROW
BEGIN
    IF NEW.expiry_date < CURDATE() THEN
        SET NEW.is_expired = 1;
    ELSE
        SET NEW.is_expired = 0;
    END IF;
END$$


-- Trigger 4: Auto-complete prescription when all items are dispensed
CREATE TRIGGER trg_auto_complete_prescription
AFTER INSERT ON Dispensing_Record
FOR EACH ROW
BEGIN
    DECLARE v_prescription_id INT;
    DECLARE v_undispensed     INT;

    -- Mark the item as dispensed
    UPDATE Prescription_Item
    SET is_dispensed = 1
    WHERE item_id = NEW.item_id;

    -- Find the prescription
    SELECT prescription_id INTO v_prescription_id
    FROM Prescription_Item
    WHERE item_id = NEW.item_id;

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
END$$

DELIMITER ;
