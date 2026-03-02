-- =============================================
-- V4: Seed Initial Data
-- Store info, game config, coupon types, wheel segments
-- =============================================

-- TsaoCaa Columbus store info
INSERT INTO store_info (name, address, city, state, zip, phone, email, latitude, longitude,
                        instagram_url, tiktok_url, website_url)
VALUES ('TsaoCaa Columbus',
        '4740 Reed Rd, Suite 107',
        'Columbus', 'OH', '43220',
        '(614) 674-1996',
        'info@tsaocaacolumbus.com',
        39.9921,
        -83.0687,
        'https://www.instagram.com/tsaocaacolumbus',
        'https://www.tiktok.com/@tsaocaacolumbus',
        'https://tsaocaacolumbus.com');

-- Store hours: 0=Monday, 1=Tuesday, ..., 6=Sunday
INSERT INTO store_hours (store_id, day_of_week, open_time, close_time, is_closed)
SELECT id, 0, '12:00:00', '20:00:00', FALSE FROM store_info LIMIT 1; -- Monday
INSERT INTO store_hours (store_id, day_of_week, open_time, close_time, is_closed)
SELECT id, 1, '12:00:00', '20:00:00', FALSE FROM store_info LIMIT 1; -- Tuesday
INSERT INTO store_hours (store_id, day_of_week, open_time, close_time, is_closed)
SELECT id, 2, '12:00:00', '20:00:00', FALSE FROM store_info LIMIT 1; -- Wednesday
INSERT INTO store_hours (store_id, day_of_week, open_time, close_time, is_closed)
SELECT id, 3, '12:00:00', '20:00:00', FALSE FROM store_info LIMIT 1; -- Thursday
INSERT INTO store_hours (store_id, day_of_week, open_time, close_time, is_closed)
SELECT id, 4, '11:00:00', '21:00:00', FALSE FROM store_info LIMIT 1; -- Friday
INSERT INTO store_hours (store_id, day_of_week, open_time, close_time, is_closed)
SELECT id, 5, '11:00:00', '21:00:00', FALSE FROM store_info LIMIT 1; -- Saturday
INSERT INTO store_hours (store_id, day_of_week, open_time, close_time, is_closed)
SELECT id, 6, '11:00:00', '20:00:00', FALSE FROM store_info LIMIT 1; -- Sunday

-- Menu categories
INSERT INTO menu_categories (name, description, display_order, is_active) VALUES
('Signature Series', 'Our most beloved original creations', 1, TRUE),
('Milk Tea', 'Classic and creative milk tea blends', 2, TRUE),
('Fruit Tea', 'Refreshing tea with fresh fruit', 3, TRUE),
('Matcha & Latte', 'Smooth matcha and specialty lattes', 4, TRUE),
('Seasonal Specials', 'Limited-time seasonal offerings', 5, TRUE);

-- Sample menu items (Signature Series)
INSERT INTO menu_items (category_id, name, description, base_price, is_available, is_featured, display_order, tags)
SELECT id, 'Roasted Oolong Milk Tea',
    'Rich roasted oolong brewed to perfection, mixed with fresh milk. Our flagship drink.',
    6.75, TRUE, TRUE, 1,
    JSON_ARRAY('popular', 'bestseller', 'classic')
FROM menu_categories WHERE name = 'Signature Series' LIMIT 1;

INSERT INTO menu_items (category_id, name, description, base_price, is_available, is_featured, display_order, tags)
SELECT id, 'Pilgrimage Tea',
    'A transcendent blend honoring the tea pilgrimage tradition. Light floral notes with a clean finish.',
    7.25, TRUE, TRUE, 2,
    JSON_ARRAY('signature', 'premium', 'popular')
FROM menu_categories WHERE name = 'Signature Series' LIMIT 1;

-- Sample menu items (Milk Tea)
INSERT INTO menu_items (category_id, name, description, base_price, is_available, display_order, tags)
SELECT id, 'Classic Brown Sugar Milk Tea',
    'Freshly brewed black tea with brown sugar syrup and milk. Sweet, rich, and satisfying.',
    6.25, TRUE, 1,
    JSON_ARRAY('popular', 'sweet')
FROM menu_categories WHERE name = 'Milk Tea' LIMIT 1;

INSERT INTO menu_items (category_id, name, description, base_price, is_available, display_order, tags)
SELECT id, 'Taro Milk Tea',
    'Smooth taro root blended with milk for a naturally sweet, creamy drink.',
    6.50, TRUE, 2,
    JSON_ARRAY('popular', 'purple')
FROM menu_categories WHERE name = 'Milk Tea' LIMIT 1;

-- Customization groups (global — applies to all items)
-- Sweetness level
INSERT INTO customization_groups (menu_item_id, name, type, is_required, display_order)
VALUES (NULL, 'Sweetness', 'SINGLE_SELECT', TRUE, 1);

INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, '0% (Unsweetened)', 0.00, FALSE, 1 FROM customization_groups WHERE name = 'Sweetness' AND menu_item_id IS NULL LIMIT 1;
INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, '25%', 0.00, FALSE, 2 FROM customization_groups WHERE name = 'Sweetness' AND menu_item_id IS NULL LIMIT 1;
INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, '50%', 0.00, FALSE, 3 FROM customization_groups WHERE name = 'Sweetness' AND menu_item_id IS NULL LIMIT 1;
INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, '75%', 0.00, FALSE, 4 FROM customization_groups WHERE name = 'Sweetness' AND menu_item_id IS NULL LIMIT 1;
INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, '100% (Full Sweet)', 0.00, TRUE, 5 FROM customization_groups WHERE name = 'Sweetness' AND menu_item_id IS NULL LIMIT 1;

-- Ice level
INSERT INTO customization_groups (menu_item_id, name, type, is_required, display_order)
VALUES (NULL, 'Ice Level', 'SINGLE_SELECT', TRUE, 2);

INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, 'No Ice', 0.00, FALSE, 1 FROM customization_groups WHERE name = 'Ice Level' AND menu_item_id IS NULL LIMIT 1;
INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, 'Less Ice', 0.00, FALSE, 2 FROM customization_groups WHERE name = 'Ice Level' AND menu_item_id IS NULL LIMIT 1;
INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, 'Regular Ice', 0.00, TRUE, 3 FROM customization_groups WHERE name = 'Ice Level' AND menu_item_id IS NULL LIMIT 1;
INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, 'Extra Ice', 0.00, FALSE, 4 FROM customization_groups WHERE name = 'Ice Level' AND menu_item_id IS NULL LIMIT 1;

-- Size
INSERT INTO customization_groups (menu_item_id, name, type, is_required, display_order)
VALUES (NULL, 'Size', 'SINGLE_SELECT', TRUE, 3);

INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, 'Regular (16oz)', 0.00, TRUE, 1 FROM customization_groups WHERE name = 'Size' AND menu_item_id IS NULL LIMIT 1;
INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, 'Large (24oz)', 1.00, FALSE, 2 FROM customization_groups WHERE name = 'Size' AND menu_item_id IS NULL LIMIT 1;

-- Toppings (multi-select, optional)
INSERT INTO customization_groups (menu_item_id, name, type, is_required, display_order)
VALUES (NULL, 'Toppings', 'MULTI_SELECT', FALSE, 4);

INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, 'Tapioca Pearl (Boba)', 0.75, FALSE, 1 FROM customization_groups WHERE name = 'Toppings' AND menu_item_id IS NULL LIMIT 1;
INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, 'Pudding', 0.75, FALSE, 2 FROM customization_groups WHERE name = 'Toppings' AND menu_item_id IS NULL LIMIT 1;
INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, 'Jelly', 0.75, FALSE, 3 FROM customization_groups WHERE name = 'Toppings' AND menu_item_id IS NULL LIMIT 1;
INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, 'Coconut Jelly', 0.75, FALSE, 4 FROM customization_groups WHERE name = 'Toppings' AND menu_item_id IS NULL LIMIT 1;
INSERT INTO customization_options (group_id, name, price_modifier, is_default, display_order)
SELECT id, 'Aloe Vera', 0.75, FALSE, 5 FROM customization_groups WHERE name = 'Toppings' AND menu_item_id IS NULL LIMIT 1;

-- =============================================
-- Game Config defaults
-- =============================================
INSERT INTO game_config (config_key, config_value, description) VALUES
('max_coupons_per_week', '3', 'Maximum coupon slots per user per calendar week'),
('max_plays_per_day', '3', 'Maximum game plays per user per day'),
('weekly_reset_day', 'MONDAY', 'Day of week to reset coupons'),
('weekly_reset_hour', '0', 'Hour (0-23) for weekly reset in America/New_York timezone'),
('weekly_reset_timezone', 'America/New_York', 'Timezone for weekly reset (Columbus, OH)'),
('overall_win_rate', '40', 'Approximate win percentage (0-100, informational only — actual rate determined by weights)');

-- =============================================
-- Coupon Types (wheel prizes)
-- =============================================
INSERT INTO coupon_types (code, name, description, discount_type, discount_value, min_purchase, icon_emoji, wheel_color, win_weight, is_active)
VALUES
('PERCENT_10', '10% Off', '10% off any drink order', 'PERCENT_OFF', 10.00, 0.00, '🔟', '#FF6B6B', 15, TRUE),
('DOLLAR_1_OFF', '$1 Off', '$1 off any order over $5', 'FIXED_DISCOUNT', 1.00, 5.00, '💵', '#4ECDC4', 20, TRUE),
('FREE_TOPPING', 'Free Topping', 'Add any topping to your drink for free', 'FREE_TOPPING', 0.00, 0.00, '🧋', '#45B7D1', 25, TRUE),
('FREE_SIZE_UP', 'Free Size Upgrade', 'Upgrade your drink from Regular to Large for free', 'FREE_SIZE_UP', 0.00, 0.00, '⬆️', '#96CEB4', 15, TRUE),
('FREE_WAFFLE', 'Free Egg Waffle', 'One free Hong Kong Egg Waffle with any drink purchase', 'FREE_ITEM', 0.00, 0.00, '🧇', '#FFEAA7', 5, TRUE),
('BOGO_50', 'BOGO 50% Off', 'Buy one drink, get a second at 50% off', 'BOGO', 50.00, 0.00, '🎉', '#DDA0DD', 8, TRUE);

-- =============================================
-- Wheel Segments (non-winning)
-- =============================================
INSERT INTO wheel_segments (label, icon_emoji, wheel_color, weight, is_active) VALUES
('Try Again!', '😅', '#E0E0E0', 30, TRUE),
('Almost!', '🫣', '#D5D5D5', 25, TRUE),
('So Close!', '😮', '#CACACA', 20, TRUE),
('Next Time!', '🤞', '#BFBFBF', 15, TRUE);

-- Opening announcement
INSERT INTO announcements (title, body, is_active, display_order)
VALUES ('Welcome to TsaoCaa Columbus! 🧋',
        'We are now open! Come visit us at 4740 Reed Rd, Suite 107 and experience the tea pilgrimage tradition. Play our Lucky Spin game every day to win coupons!',
        TRUE, 1);
