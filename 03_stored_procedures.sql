-- ============================================================
-- PIPMS - Stored Procedures (MySQL 8.0+)
-- SIMPLIFIED
-- ============================================================

USE pipms_simplified;

DELIMITER $$

-- Procedure 1: Dispense a prescription item
CREATE PROCEDURE dispense_item(
    IN p_item_id INT
)
BEGIN
    DECLARE v_status     VARCHAR(20);
    DECLARE v_stock      INT;
    DECLARE v_req_qty    INT;
    DECLARE v_drug_id    INT;

    -- Check prescription is not cancelled
    SELECT p.status INTO v_status
    FROM Prescription p
    JOIN Prescription_Item pi ON pi.prescription_id = p.prescription_id
    WHERE pi.item_id = p_item_id
    LIMIT 1;

    IF v_status = 'cancelled' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Prescription is cancelled';
    END IF;

    -- Get item info
    SELECT drug_id, quantity INTO v_drug_id, v_req_qty
    FROM Prescription_Item
    WHERE item_id = p_item_id;

    -- Get current stock
    SELECT stock_quantity INTO v_stock
    FROM Drug
    WHERE drug_id = v_drug_id;

    IF v_stock < v_req_qty THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient stock for dispensing';
    END IF;

    -- Decrement stock
    UPDATE Drug
    SET stock_quantity = stock_quantity - v_req_qty
    WHERE drug_id = v_drug_id;

    -- Mark item as dispensed
    UPDATE Prescription_Item
    SET is_dispensed = 1
    WHERE item_id = p_item_id;

END$$


-- Procedure 2: Cancel a prescription
CREATE PROCEDURE cancel_prescription(IN p_prescription_id INT)
BEGIN
    UPDATE Prescription
    SET status = 'cancelled'
    WHERE prescription_id = p_prescription_id;
END$$


-- Procedure 3: Restock a drug
CREATE PROCEDURE restock_drug(
    IN p_drug_id INT,
    IN p_qty INT
)
BEGIN
    UPDATE Drug
    SET stock_quantity = stock_quantity + p_qty
    WHERE drug_id = p_drug_id;
END$$

DELIMITER ;
