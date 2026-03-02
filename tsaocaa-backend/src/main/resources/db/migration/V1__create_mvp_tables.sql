-- =============================================
-- V1: Core MVP Tables
-- users, menu categories, items, customizations
-- =============================================

CREATE TABLE IF NOT EXISTS users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    cognito_sub     VARCHAR(255) UNIQUE NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(20),
    display_name    VARCHAR(100),
    profile_image   VARCHAR(500),
    push_token      VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cognito_sub (cognito_sub),
    INDEX idx_email (email)
);

CREATE TABLE IF NOT EXISTS menu_categories (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(500),
    icon_url        VARCHAR(500),
    display_order   INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_active_order (is_active, display_order)
);

CREATE TABLE IF NOT EXISTS menu_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id     BIGINT NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    base_price      DECIMAL(6,2) NOT NULL,
    image_url       VARCHAR(500),
    is_available    BOOLEAN DEFAULT TRUE,
    is_featured     BOOLEAN DEFAULT FALSE,
    is_seasonal     BOOLEAN DEFAULT FALSE,
    seasonal_start  DATE,
    seasonal_end    DATE,
    calories        INT,
    tags            JSON,
    display_order   INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE RESTRICT,
    INDEX idx_category_order (category_id, display_order),
    INDEX idx_featured (is_featured),
    INDEX idx_seasonal (is_seasonal, seasonal_start, seasonal_end),
    FULLTEXT INDEX idx_search (name, description)
);

CREATE TABLE IF NOT EXISTS customization_groups (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id    BIGINT,
    name            VARCHAR(100) NOT NULL,
    type            ENUM('SINGLE_SELECT', 'MULTI_SELECT') DEFAULT 'SINGLE_SELECT',
    is_required     BOOLEAN DEFAULT FALSE,
    display_order   INT DEFAULT 0,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    INDEX idx_item (menu_item_id)
);

CREATE TABLE IF NOT EXISTS customization_options (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id        BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    price_modifier  DECIMAL(5,2) DEFAULT 0.00,
    is_default      BOOLEAN DEFAULT FALSE,
    is_available    BOOLEAN DEFAULT TRUE,
    display_order   INT DEFAULT 0,
    FOREIGN KEY (group_id) REFERENCES customization_groups(id) ON DELETE CASCADE,
    INDEX idx_group (group_id)
);
