-- ============================================================
-- PIPMS - Pharmacy Inventory and Prescription Management System
-- Database: MySQL 8.0+
-- SIMPLIFIED SCHEMA (5 Entities)
-- ============================================================

CREATE DATABASE IF NOT EXISTS pipms_simplified;
USE pipms_simplified;

-- 1. DRUG
CREATE TABLE Drug (
    drug_id         INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    category        VARCHAR(50)  NOT NULL,
    price           DECIMAL(10,2) NOT NULL,
    stock_quantity  INT NOT NULL DEFAULT 0,
    CONSTRAINT chk_drug_price CHECK (price > 0),
    CONSTRAINT chk_qty CHECK (stock_quantity >= 0)
);

-- 2. PATIENT
CREATE TABLE Patient (
    patient_id     INT AUTO_INCREMENT PRIMARY KEY,
    full_name      VARCHAR(150) NOT NULL,
    contact_number VARCHAR(20),
    address        TEXT
);

-- 3. DOCTOR
CREATE TABLE Doctor (
    doctor_id      INT AUTO_INCREMENT PRIMARY KEY,
    full_name      VARCHAR(150) NOT NULL,
    specialization VARCHAR(100),
    contact_number VARCHAR(20)
);

-- 4. PRESCRIPTION
CREATE TABLE Prescription (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id      INT NOT NULL,
    doctor_id       INT NOT NULL,
    issue_date      DATE NOT NULL DEFAULT (CURRENT_DATE),
    status          ENUM('pending','dispensed','cancelled') NOT NULL DEFAULT 'pending',
    CONSTRAINT fk_rx_patient FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
    CONSTRAINT fk_rx_doctor  FOREIGN KEY (doctor_id)  REFERENCES Doctor(doctor_id)
);

-- 5. PRESCRIPTION ITEM
CREATE TABLE Prescription_Item (
    item_id             INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id     INT NOT NULL,
    drug_id             INT NOT NULL,
    quantity            INT NOT NULL,
    is_dispensed        TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT chk_rx_qty CHECK (quantity > 0),
    CONSTRAINT fk_item_rx   FOREIGN KEY (prescription_id) REFERENCES Prescription(prescription_id),
    CONSTRAINT fk_item_drug FOREIGN KEY (drug_id)         REFERENCES Drug(drug_id)
);
