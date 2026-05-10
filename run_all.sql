-- ============================================================
-- PIPMS MASTER SETUP SCRIPT
-- Run this to setup the entire project in one click
-- ============================================================

-- 1. Create Database and Tables
source 01_schema.sql;

-- 2. Add Automation (Triggers)
source 02_triggers.sql;

-- 3. Add Logic (Procedures)
source 03_stored_procedures.sql;

-- 4. Add Reports (Views)
source 04_views.sql;

-- 5. Add Demo Data
source 05_sample_data.sql;

-- 6. Show initial state (Optional)
source 06_sample_queries.sql;

SELECT 'SUCCESS: PIPMS Project Setup Complete!' AS Status;
