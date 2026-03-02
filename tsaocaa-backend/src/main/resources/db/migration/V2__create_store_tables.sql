-- =============================================
-- V2: Store Info, Hours, Announcements, Push Log
-- =============================================

CREATE TABLE IF NOT EXISTS store_info (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    address         VARCHAR(500),
    city            VARCHAR(100),
    state           VARCHAR(50),
    zip             VARCHAR(20),
    phone           VARCHAR(20),
    email           VARCHAR(255),
    latitude        DECIMAL(10,7),
    longitude       DECIMAL(10,7),
    instagram_url   VARCHAR(500),
    tiktok_url      VARCHAR(500),
    website_url     VARCHAR(500),
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_hours (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id        BIGINT NOT NULL,
    day_of_week     TINYINT NOT NULL COMMENT '0=Monday, 6=Sunday',
    open_time       TIME NOT NULL,
    close_time      TIME NOT NULL,
    is_closed       BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (store_id) REFERENCES store_info(id) ON DELETE CASCADE,
    UNIQUE KEY uk_store_day (store_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS announcements (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    body            TEXT,
    image_url       VARCHAR(500),
    link_url        VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    start_date      DATE,
    end_date        DATE,
    display_order   INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_active_dates (is_active, start_date, end_date)
);

CREATE TABLE IF NOT EXISTS push_notifications_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200),
    body            TEXT,
    target          ENUM('ALL', 'SEGMENT', 'INDIVIDUAL') DEFAULT 'ALL',
    sent_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_count      INT DEFAULT 0
);
