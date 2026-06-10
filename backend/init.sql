-- MediSync Production Database Schema
-- Version: 1.0.0
-- =============================================
-- CREATE DATABASE & USER
-- =============================================
CREATE DATABASE IF NOT EXISTS medisync_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'medisync_user' @'%' IDENTIFIED BY 'MediSync@Pass2024';
GRANT ALL PRIVILEGES ON medisync_db.* TO 'medisync_user' @'%';
FLUSH PRIVILEGES;
USE medisync_db;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
-- =============================================
-- ROLES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT INTO roles (name, description)
VALUES ('super_admin', 'Full system access'),
    ('doctor', 'Doctor workspace access'),
    ('patient', 'Patient portal access'),
    ('staff', 'Administrative staff access') ON DUPLICATE KEY
UPDATE description =
VALUES(description);
-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_image VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    refresh_token_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_email (email),
    INDEX idx_role (role_id),
    INDEX idx_active (is_active),
    INDEX idx_deleted (deleted_at)
);
-- =============================================
-- SPECIALIZATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS specializations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO specializations (name, description, icon)
VALUES (
        'General Physician',
        'Primary care and general medicine',
        'medical_services'
    ),
    (
        'Cardiologist',
        'Heart and cardiovascular system',
        'favorite'
    ),
    (
        'Dermatologist',
        'Skin, hair, and nail conditions',
        'spa'
    ),
    (
        'Orthopedist',
        'Bones, joints, and musculoskeletal system',
        'accessibility'
    ),
    (
        'Neurologist',
        'Brain and nervous system',
        'psychology'
    ),
    (
        'Pediatrician',
        'Children healthcare',
        'child_care'
    ),
    (
        'Gynecologist',
        'Women reproductive health',
        'pregnant_woman'
    ),
    (
        'Psychiatrist',
        'Mental health and behavioral disorders',
        'self_improvement'
    ),
    (
        'Ophthalmologist',
        'Eye care and vision',
        'visibility'
    ),
    (
        'ENT Specialist',
        'Ear, nose, and throat',
        'hearing'
    ),
    (
        'Gastroenterologist',
        'Digestive system',
        'local_hospital'
    ),
    (
        'Oncologist',
        'Cancer diagnosis and treatment',
        'biotech'
    ),
    (
        'Endocrinologist',
        'Hormones and metabolic disorders',
        'science'
    ),
    (
        'Pulmonologist',
        'Lungs and respiratory system',
        'air'
    ),
    (
        'Urologist',
        'Urinary tract and male reproductive system',
        'water_drop'
    ) ON DUPLICATE KEY
UPDATE description =
VALUES(description);
-- =============================================
-- HOSPITALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS hospitals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
INSERT INTO hospitals (name, address, city, state, pincode, phone)
VALUES (
        'MediSync General Hospital',
        '42, Anna Salai, Teynampet',
        'Chennai',
        'Tamil Nadu',
        '600018',
        '+91-44-28500000'
    ),
    (
        'MediSync Specialty Center',
        '15, Velachery Main Road',
        'Chennai',
        'Tamil Nadu',
        '600042',
        '+91-44-22500000'
    ) ON DUPLICATE KEY
UPDATE name =
VALUES(name);
-- =============================================
-- DOCTORS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    specialization_id INT NOT NULL,
    hospital_id INT,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    qualification VARCHAR(500),
    experience_years INT DEFAULT 0,
    consultation_fee DECIMAL(10, 2) DEFAULT 500.00,
    bio TEXT,
    languages VARCHAR(255) DEFAULT 'English',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    total_consultations INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    available_days VARCHAR(255) DEFAULT 'Monday,Tuesday,Wednesday,Thursday,Friday',
    slot_duration_minutes INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (specialization_id) REFERENCES specializations(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    INDEX idx_specialization (specialization_id),
    INDEX idx_available (is_available),
    INDEX idx_rating (rating)
);
-- =============================================
-- DOCTOR AVAILABILITY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS doctor_availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_id INT NOT NULL,
    day_of_week ENUM(
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    ) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    UNIQUE KEY unique_doctor_day (doctor_id, day_of_week)
);
-- =============================================
-- PATIENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other', 'Prefer not to say'),
    blood_group VARCHAR(5),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    allergies TEXT,
    chronic_conditions TEXT,
    current_medications TEXT,
    insurance_provider VARCHAR(200),
    insurance_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id)
);
-- =============================================
-- APPOINTMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_number VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    hospital_id INT,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM(
        'pending',
        'confirmed',
        'completed',
        'cancelled',
        'no_show'
    ) DEFAULT 'pending',
    appointment_type ENUM('in_person', 'video', 'phone') DEFAULT 'in_person',
    reason_for_visit TEXT,
    cancellation_reason TEXT,
    cancelled_by ENUM('patient', 'doctor', 'admin'),
    fee_amount DECIMAL(10, 2),
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status),
    INDEX idx_appointment_number (appointment_number)
);
-- =============================================
-- CONSULTATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS consultations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT UNIQUE NOT NULL,
    chief_complaint TEXT,
    diagnosis TEXT,
    prescription TEXT,
    notes TEXT,
    follow_up_date DATE,
    follow_up_notes TEXT,
    vital_signs JSON,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    INDEX idx_appointment (appointment_id)
);
-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM(
        'appointment',
        'reminder',
        'system',
        'payment',
        'general'
    ) DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    extra_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
);
-- =============================================
-- AUDIT LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);
-- =============================================
-- SYSTEM SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR(500),
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT INTO system_settings (key_name, value, description)
VALUES ('app_name', 'MediSync', 'Application name'),
    (
        'appointment_booking_days_ahead',
        '30',
        'How many days ahead patients can book'
    ),
    (
        'cancellation_hours_before',
        '2',
        'Hours before appointment allowed to cancel'
    ),
    (
        'consultation_fee_default',
        '500',
        'Default consultation fee in INR'
    ),
    ('timezone', 'Asia/Kolkata', 'System timezone') ON DUPLICATE KEY
UPDATE value =
VALUES(value);
-- =============================================
-- DOCTOR REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS doctor_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    appointment_id INT UNIQUE NOT NULL,
    rating TINYINT NOT NULL CHECK (
        rating BETWEEN 1 AND 5
    ),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_rating (rating)
);
SET FOREIGN_KEY_CHECKS = 1;