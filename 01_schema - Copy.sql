-- ============================================================
-- PIPMS - Pharmacy Inventory and Prescription Management System
-- Database: MySQL 8.0+
-- 1st Review: Schema DDL
-- ============================================================

CREATE DATABASE IF NOT EXISTS pipms;
USE pipms;

-- 1. DRUG CATALOG
CREATE TABLE Drug (
    drug_id         INT AUTO_INCREMENT PRIMARY KEY,
    generic_name    VARCHAR(100) NOT NULL,
    brand_name      VARCHAR(100) NOT NULL,
    category        VARCHAR(50)  NOT NULL,
    unit_of_measure VARCHAR(20)  NOT NULL,
    unit_price      DECIMAL(10,2) NOT NULL,
    CONSTRAINT chk_drug_price CHECK (unit_price > 0),
    CONSTRAINT uq_drug UNIQUE (generic_name, brand_name)
);

-- 2. DRUG PRICE HISTORY (audit log)
CREATE TABLE Drug_Price_History (
    history_id  INT AUTO_INCREMENT PRIMARY KEY,
    drug_id     INT NOT NULL,
    old_price   DECIMAL(10,2) NOT NULL,
    new_price   DECIMAL(10,2) NOT NULL,
    changed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dph_drug FOREIGN KEY (drug_id) REFERENCES Drug(drug_id)
);

-- 3. SUPPLIER
CREATE TABLE Supplier (
    supplier_id    INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name  VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone          VARCHAR(20),
    email          VARCHAR(100)
);

-- 4. BATCH (inventory per drug lot)
CREATE TABLE Batch (
    batch_id         INT AUTO_INCREMENT PRIMARY KEY,
    drug_id          INT NOT NULL,
    supplier_id      INT NOT NULL,
    batch_number     VARCHAR(50) NOT NULL,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    reorder_level    INT NOT NULL DEFAULT 50,
    expiry_date      DATE NOT NULL,
    is_expired       TINYINT(1) NOT NULL DEFAULT 0,
    needs_reorder    TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT chk_qty   CHECK (quantity_on_hand >= 0),
    CONSTRAINT chk_reord CHECK (reorder_level > 0),
    CONSTRAINT fk_batch_drug     FOREIGN KEY (drug_id)     REFERENCES Drug(drug_id),
    CONSTRAINT fk_batch_supplier FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id)
);

-- 5. PURCHASE ORDER
CREATE TABLE Purchase_Order (
    po_id            INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id      INT NOT NULL,
    drug_id          INT NOT NULL,
    batch_number     VARCHAR(50) NOT NULL,
    quantity_ordered INT NOT NULL,
    unit_cost        DECIMAL(10,2) NOT NULL,
    order_date       DATE NOT NULL DEFAULT (CURRENT_DATE),
    status           ENUM('pending','received','cancelled') NOT NULL DEFAULT 'pending',
    CONSTRAINT chk_po_qty  CHECK (quantity_ordered > 0),
    CONSTRAINT chk_po_cost CHECK (unit_cost > 0),
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id),
    CONSTRAINT fk_po_drug     FOREIGN KEY (drug_id)     REFERENCES Drug(drug_id)
);

-- 6. PATIENT
CREATE TABLE Patient (
    patient_id     INT AUTO_INCREMENT PRIMARY KEY,
    full_name      VARCHAR(150) NOT NULL,
    date_of_birth  DATE NOT NULL,
    contact_number VARCHAR(20),
    address        TEXT,
    CONSTRAINT uq_patient UNIQUE (full_name, date_of_birth)
);

-- 7. DOCTOR
CREATE TABLE Doctor (
    doctor_id      INT AUTO_INCREMENT PRIMARY KEY,
    full_name      VARCHAR(150) NOT NULL,
    license_number VARCHAR(50)  NOT NULL,
    specialization VARCHAR(100),
    contact_number VARCHAR(20),
    CONSTRAINT uq_doctor_license UNIQUE (license_number)
);

-- 8. PRESCRIPTION
CREATE TABLE Prescription (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id      INT NOT NULL,
    doctor_id       INT NOT NULL,
    issue_date      DATE NOT NULL DEFAULT (CURRENT_DATE),
    status          ENUM('pending','dispensed','cancelled') NOT NULL DEFAULT 'pending',
    CONSTRAINT fk_rx_patient FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
    CONSTRAINT fk_rx_doctor  FOREIGN KEY (doctor_id)  REFERENCES Doctor(doctor_id)
);

-- 9. PRESCRIPTION ITEM
CREATE TABLE Prescription_Item (
    item_id             INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id     INT NOT NULL,
    drug_id             INT NOT NULL,
    prescribed_quantity INT NOT NULL,
    dosage_instructions TEXT,
    is_dispensed        TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT chk_rx_qty CHECK (prescribed_quantity > 0),
    CONSTRAINT fk_item_rx   FOREIGN KEY (prescription_id) REFERENCES Prescription(prescription_id),
    CONSTRAINT fk_item_drug FOREIGN KEY (drug_id)         REFERENCES Drug(drug_id)
);

-- 10. DISPENSING RECORD
CREATE TABLE Dispensing_Record (
    record_id          INT AUTO_INCREMENT PRIMARY KEY,
    item_id            INT NOT NULL,
    batch_id           INT NOT NULL,
    quantity_dispensed INT NOT NULL,
    dispensing_date    DATE NOT NULL DEFAULT (CURRENT_DATE),
    pharmacist_id      INT NOT NULL,
    CONSTRAINT chk_disp_qty CHECK (quantity_dispensed > 0),
    CONSTRAINT fk_dr_item  FOREIGN KEY (item_id)   REFERENCES Prescription_Item(item_id),
    CONSTRAINT fk_dr_batch FOREIGN KEY (batch_id)  REFERENCES Batch(batch_id)
);
