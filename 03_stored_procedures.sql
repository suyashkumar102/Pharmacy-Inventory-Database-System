-- ============================================================
-- PIPMS - Stored Procedures (MySQL 8.0+)
-- ============================================================

USE pipms;

DELIMITER $$

-- Procedure 1: Dispense a prescription item
CREATE PROCEDURE dispense_item(
    IN p_item_id       INT,
    IN p_batch_id      INT,
    IN p_qty           INT,
    IN p_pharmacist_id INT
)
BEGIN
    DECLARE v_status     VARCHAR(20);
    DECLARE v_is_expired TINYINT(1);
    DECLARE v_stock      INT;

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

    -- Check batch expiry and stock
    SELECT is_expired, quantity_on_hand
    INTO v_is_expired, v_stock
    FROM Batch
    WHERE batch_id = p_batch_id;

    IF v_is_expired = 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Batch is expired and cannot be dispensed';
    END IF;

    IF v_stock < p_qty THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient stock for dispensing';
    END IF;

    -- Insert dispensing record (trigger handles auto-complete)
    INSERT INTO Dispensing_Record (item_id, batch_id, quantity_dispensed, dispensing_date, pharmacist_id)
    VALUES (p_item_id, p_batch_id, p_qty, CURDATE(), p_pharmacist_id);

    -- Decrement stock (trigger handles reorder flag)
    UPDATE Batch
    SET quantity_on_hand = quantity_on_hand - p_qty
    WHERE batch_id = p_batch_id;
END$$


-- Procedure 2: Receive a purchase order and update inventory
CREATE PROCEDURE receive_purchase_order(IN p_po_id INT)
BEGIN
    DECLARE v_drug_id    INT;
    DECLARE v_batch_no   VARCHAR(50);
    DECLARE v_qty        INT;
    DECLARE v_batch_id   INT;
    DECLARE v_found      INT DEFAULT 0;

    SELECT drug_id, batch_number, quantity_ordered
    INTO v_drug_id, v_batch_no, v_qty
    FROM Purchase_Order
    WHERE po_id = p_po_id;

    -- Update PO status
    UPDATE Purchase_Order SET status = 'received' WHERE po_id = p_po_id;

    -- Check if batch exists
    SELECT batch_id INTO v_batch_id
    FROM Batch
    WHERE drug_id = v_drug_id AND batch_number = v_batch_no
    LIMIT 1;

    IF v_batch_id IS NOT NULL THEN
        UPDATE Batch
        SET quantity_on_hand = quantity_on_hand + v_qty
        WHERE batch_id = v_batch_id;
    ELSE
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Batch not found for this drug and batch number';
    END IF;
END$$


-- Procedure 3: Cancel a prescription
CREATE PROCEDURE cancel_prescription(IN p_prescription_id INT)
BEGIN
    UPDATE Prescription
    SET status = 'cancelled'
    WHERE prescription_id = p_prescription_id;
END$$


-- Procedure 4: Register a patient (with duplicate check)
CREATE PROCEDURE register_patient(
    IN p_name    VARCHAR(150),
    IN p_dob     DATE,
    IN p_contact VARCHAR(20),
    IN p_address TEXT
)
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count
    FROM Patient
    WHERE full_name = p_name AND date_of_birth = p_dob;

    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Patient record already exists';
    END IF;

    INSERT INTO Patient (full_name, date_of_birth, contact_number, address)
    VALUES (p_name, p_dob, p_contact, p_address);
END$$


-- Procedure 5: Register a doctor (with duplicate check)
CREATE PROCEDURE register_doctor(
    IN p_name    VARCHAR(150),
    IN p_license VARCHAR(50),
    IN p_spec    VARCHAR(100),
    IN p_contact VARCHAR(20)
)
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count
    FROM Doctor WHERE license_number = p_license;

    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Doctor license number already registered';
    END IF;

    INSERT INTO Doctor (full_name, license_number, specialization, contact_number)
    VALUES (p_name, p_license, p_spec, p_contact);
END$$

DELIMITER ;
