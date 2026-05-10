-- ============================================================
-- PIPMS - Sample Queries
-- SIMPLIFIED
-- ============================================================

USE pipms_simplified;

-- 1. View all available drugs and their stock
SELECT * FROM Drug ORDER BY name;

-- 2. View low stock drugs (using the view)
SELECT * FROM vw_low_stock;

-- 3. View detailed prescription information
SELECT * FROM vw_prescription_details;

-- 4. Dispense an item (Test Procedure)
-- Dispensing item 1 (Amoxicillin for John Doe)
CALL dispense_item(1);

-- 5. Restock a drug (Test Procedure)
-- Restock Metformin
CALL restock_drug(4, 50);

-- 6. Cancel a prescription (Test Procedure)
CALL cancel_prescription(2);

-- 7. Check updated status after dispensing and cancelling
SELECT * FROM vw_prescription_details;
