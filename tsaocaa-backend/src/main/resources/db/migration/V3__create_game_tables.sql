-- =============================================
-- V3: Game Tab & Coupon System Tables
-- =============================================

CREATE TABLE IF NOT EXISTS coupon_types (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(50) UNIQUE NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     VARCHAR(500),
    discount_type   ENUM('PERCENT_OFF', 'FIXED_DISCOUNT', 'FREE_ITEM',
                         'FREE_TOPPING', 'FREE_SIZE_UP', 'BOGO', 'CUSTOM') NOT NULL,
    discount_value  DECIMAL(6,2),
    min_purchase    DECIMAL(6,2) DEFAULT 0.00,
    icon_emoji      VARCHAR(10) DEFAULT '🎫',
    wheel_color     VARCHAR(7) DEFAULT '#FF6B6B',
    win_weight      INT DEFAULT 10,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active)
);

CREATE TABLE IF NOT EXISTS wheel_segments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    label           VARCHAR(100) NOT NULL,
    icon_emoji      VARCHAR(10) DEFAULT '😅',
    wheel_color     VARCHAR(7) DEFAULT '#CCCCCC',
    weight          INT DEFAULT 20,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_coupons (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    coupon_type_id  BIGINT NOT NULL,
    status          ENUM('ACTIVE', 'REDEEMED', 'EXPIRED', 'REPLACED') NOT NULL DEFAULT 'ACTIVE',
    week_start      DATE NOT NULL,
    won_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    redeemed_at     TIMESTAMP NULL,
    replaced_at     TIMESTAMP NULL,
    replaced_by_id  BIGINT NULL,
    expires_at      TIMESTAMP NOT NULL,
    coupon_code     VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coupon_type_id) REFERENCES coupon_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (replaced_by_id) REFERENCES user_coupons(id) ON DELETE SET NULL,
    INDEX idx_user_week (user_id, week_start),
    INDEX idx_user_status (user_id, status),
    INDEX idx_expires (expires_at),
    INDEX idx_coupon_code (coupon_code)
);

CREATE TABLE IF NOT EXISTS game_plays (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    game_type       ENUM('SPIN_WHEEL', 'BUBBLE_POP', 'CARD_FLIP') DEFAULT 'SPIN_WHEEL',
    result          ENUM('WIN', 'LOSE') NOT NULL,
    coupon_type_id  BIGINT NULL,
    user_coupon_id  BIGINT NULL,
    outcome_action  ENUM('STORED', 'REPLACED', 'DISCARDED', 'PENDING_DECISION', 'NONE') DEFAULT 'NONE',
    played_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    week_start      DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coupon_type_id) REFERENCES coupon_types(id) ON DELETE SET NULL,
    FOREIGN KEY (user_coupon_id) REFERENCES user_coupons(id) ON DELETE SET NULL,
    INDEX idx_user_plays (user_id, week_start),
    INDEX idx_played_at (played_at)
);

CREATE TABLE IF NOT EXISTS game_config (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key      VARCHAR(100) UNIQUE NOT NULL,
    config_value    VARCHAR(500) NOT NULL,
    description     VARCHAR(500),
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
