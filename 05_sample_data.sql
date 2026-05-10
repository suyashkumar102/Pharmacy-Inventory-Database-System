-- ============================================================
-- PIPMS - Rich Demo Data
-- ============================================================

USE pipms_simplified;

-- ── Drugs (15 entries) ──
INSERT INTO Drug (name, category, price, stock_quantity) VALUES
('Amoxicillin 500mg',       'Antibiotic',        12.50, 120),
('Azithromycin 250mg',      'Antibiotic',        18.00,  45),
('Ciprofloxacin 500mg',     'Antibiotic',        22.00,  60),
('Ibuprofen 400mg',         'Painkiller',         8.00, 200),
('Paracetamol 500mg',       'Painkiller',         5.00, 350),
('Diclofenac 50mg',         'Painkiller',         9.50,  80),
('Lisinopril 10mg',         'Antihypertensive',  15.00,  55),
('Amlodipine 5mg',          'Antihypertensive',  13.00,  70),
('Metformin 500mg',         'Antidiabetic',      10.00,  15),
('Glimepiride 2mg',         'Antidiabetic',      14.00,  30),
('Omeprazole 20mg',         'Gastrointestinal',   7.50, 180),
('Cetirizine 10mg',         'Antihistamine',      6.00, 250),
('Salbutamol Inhaler',      'Respiratory',       28.00,  40),
('Atorvastatin 20mg',       'Cardiovascular',    20.00,   8),
('Metoprolol 50mg',         'Cardiovascular',    16.00,  12);

-- ── Patients (8 entries) ──
INSERT INTO Patient (full_name, contact_number, address) VALUES
('Rahul Sharma',      '9876543210', '12 MG Road, Bangalore'),
('Priya Patel',       '9123456780', '45 Park Street, Kolkata'),
('Amit Kumar',        '9988776655', '78 Civil Lines, Delhi'),
('Sneha Reddy',       '8877665544', '23 Jubilee Hills, Hyderabad'),
('Vikram Singh',      '7766554433', '90 Model Town, Lucknow'),
('Ananya Iyer',       '8899001122', '56 Anna Nagar, Chennai'),
('Rohit Mehta',       '9090909090', '34 Sector 17, Chandigarh'),
('Kavita Deshmukh',   '8080808080', '67 FC Road, Pune');

-- ── Doctors (5 entries) ──
INSERT INTO Doctor (full_name, specialization, contact_number) VALUES
('Dr. Meera Joshi',     'General Practice',    '9000100020'),
('Dr. Arjun Nair',      'Cardiology',          '9000200030'),
('Dr. Sunita Gupta',    'Endocrinology',       '9000300040'),
('Dr. Rajesh Verma',    'Pulmonology',         '9000400050'),
('Dr. Fatima Khan',     'Gastroenterology',    '9000500060');

-- ── Prescriptions (6 entries) ──
INSERT INTO Prescription (patient_id, doctor_id, issue_date, status) VALUES
(1, 1, '2025-05-01', 'pending'),
(2, 2, '2025-05-02', 'pending'),
(3, 3, '2025-05-03', 'dispensed'),
(4, 1, '2025-05-04', 'pending'),
(5, 4, '2025-05-05', 'cancelled'),
(6, 5, '2025-05-06', 'pending');

-- ── Prescription Items (10 entries) ──
INSERT INTO Prescription_Item (prescription_id, drug_id, quantity, is_dispensed) VALUES
(1, 1, 21, 0),   -- Rahul: Amoxicillin
(1, 4, 10, 0),   -- Rahul: Ibuprofen
(2, 7, 30, 0),   -- Priya: Lisinopril
(2, 14, 30, 0),  -- Priya: Atorvastatin
(3, 9, 60, 1),   -- Amit:  Metformin (dispensed)
(3, 10, 30, 1),  -- Amit:  Glimepiride (dispensed)
(4, 5, 15, 0),   -- Sneha: Paracetamol
(4, 12, 10, 0),  -- Sneha: Cetirizine
(5, 13, 1, 0),   -- Vikram: Salbutamol (cancelled rx)
(6, 11, 14, 0);  -- Ananya: Omeprazole
