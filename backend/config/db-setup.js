/**
 * CareConnect AI — Database Setup Script
 * Run: node config/db-setup.js
 * This creates all tables if they don't already exist.
 */

require("dotenv").config();
const mysql2 = require("mysql2/promise");

async function setup() {
  let conn;
  try {
    conn = await mysql2.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    console.log("🔌 Connected to MySQL server");

    // Create database
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || "careconnect_db"}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await conn.query(`USE \`${process.env.DB_NAME || "careconnect_db"}\``);
    console.log(
      `✅ Database \`${process.env.DB_NAME || "careconnect_db"}\` ready`
    );

    // ── USERS ───────────────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(120) NOT NULL,
        email       VARCHAR(180) NOT NULL UNIQUE,
        password    VARCHAR(255) NOT NULL,
        role        ENUM('admin','doctor','patient') NOT NULL DEFAULT 'patient',
        phone       VARCHAR(20),
        address     TEXT,
        dob         DATE,
        gender      ENUM('male','female','other'),
        is_active   TINYINT(1) NOT NULL DEFAULT 1,
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role  (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: users");

    // ── DOCTORS ─────────────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id         INT UNSIGNED UNIQUE,
        name            VARCHAR(120) NOT NULL,
        email           VARCHAR(180) NOT NULL UNIQUE,
        specialization  VARCHAR(120) NOT NULL,
        department      ENUM('dental','physiotherapy','general') NOT NULL DEFAULT 'general',
        experience_yrs  TINYINT UNSIGNED NOT NULL DEFAULT 0,
        bio             TEXT,
        available_days  VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
        consultation_fee DECIMAL(10,2) DEFAULT 0.00,
        is_active       TINYINT(1) NOT NULL DEFAULT 1,
        created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_dept (department)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: doctors");

    // ── APPOINTMENTS ─────────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        patient_id    INT UNSIGNED NOT NULL,
        doctor_id     INT UNSIGNED NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        department    ENUM('dental','physiotherapy','general') NOT NULL DEFAULT 'general',
        reason        TEXT,
        status        ENUM('pending','approved','rejected','completed','cancelled') NOT NULL DEFAULT 'pending',
        notes         TEXT,
        created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id)     ON DELETE CASCADE,
        FOREIGN KEY (doctor_id)  REFERENCES doctors(id)   ON DELETE CASCADE,
        INDEX idx_patient (patient_id),
        INDEX idx_doctor  (doctor_id),
        INDEX idx_date    (appointment_date),
        INDEX idx_status  (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: appointments");

    // ── DONATIONS ────────────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS donations (
        id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        donor_name    VARCHAR(120) NOT NULL,
        donor_email   VARCHAR(180),
        amount        DECIMAL(12,2) NOT NULL,
        message       TEXT,
        payment_ref   VARCHAR(80),
        status        ENUM('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
        donated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (donor_email),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: donations");

    // ── NGO REQUESTS ─────────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS ngo_requests (
        id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id           INT UNSIGNED,
        applicant_name    VARCHAR(120) NOT NULL,
        applicant_email   VARCHAR(180),
        applicant_phone   VARCHAR(20),
        age               TINYINT UNSIGNED NOT NULL,
        gender            ENUM('male','female','other'),
        income            DECIMAL(12,2) NOT NULL COMMENT 'Monthly household income in INR',
        family_size       TINYINT UNSIGNED NOT NULL,
        employment_status ENUM('employed','self','unemployed','informal') NOT NULL,
        medical_urgency   TINYINT UNSIGNED NOT NULL COMMENT '1-10 scale',
        disability        ENUM('none','partial','severe') NOT NULL DEFAULT 'none',
        medical_condition TEXT,
        priority_score    DECIMAL(5,2),
        priority_label    ENUM('high','medium','low'),
        subsidy_pct       TINYINT UNSIGNED COMMENT 'Recommended subsidy %',
        review_status     ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        reviewer_notes    TEXT,
        created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_priority  (priority_label),
        INDEX idx_review    (review_status),
        INDEX idx_score     (priority_score)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Table: ngo_requests");

    // ── SEED ADMIN ───────────────────────────────────────────────────────────
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash("Admin@123", 10);
    await conn.query(`
      INSERT IGNORE INTO users (name, email, password, role)
      VALUES ('Admin', 'admin@careconnect.ai', ?, 'admin')
    `, [hash]);
    console.log("✅ Admin seed: admin@careconnect.ai / Admin@123");

    console.log("\n🎉 Database setup complete!\n");
  } catch (err) {
    console.error("❌ Setup failed:", err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

setup();