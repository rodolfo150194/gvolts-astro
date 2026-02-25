-- GVolts Database Schema (MySQL)
-- Run: mysql -u user -p gvolts < sql/schema.sql

CREATE TABLE IF NOT EXISTS subscriber (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contacts (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  phone      VARCHAR(50)  NOT NULL,
  service    VARCHAR(50)  NOT NULL,
  zip        VARCHAR(20)  NOT NULL,
  company    VARCHAR(255),
  address    TEXT,
  subject    VARCHAR(255) NOT NULL,
  message    TEXT         NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS promotions (
  id                  CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
  title               VARCHAR(255)  NOT NULL,
  description         TEXT          NOT NULL,
  discount_type       ENUM('percentage','fixed') NOT NULL,
  discount_value      DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  promo_code          VARCHAR(50)   UNIQUE,
  applicable_services JSON          NOT NULL DEFAULT ('[]'),
  start_date          DATETIME      NOT NULL,
  end_date            DATETIME      NOT NULL,
  is_active           TINYINT(1)    NOT NULL DEFAULT 1,
  banner_image        VARCHAR(500),
  terms               TEXT,
  max_uses            INT UNSIGNED,
  current_uses        INT UNSIGNED  NOT NULL DEFAULT 0,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT valid_dates CHECK (end_date > start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_promotions_active ON promotions (is_active, start_date, end_date);
CREATE INDEX idx_promotions_code   ON promotions (promo_code);
