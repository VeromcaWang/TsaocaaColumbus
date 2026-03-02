package com.tsaocaacolumbus.api.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "coupon_types")
@Getter
@Setter
@NoArgsConstructor
public class CouponType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType;

    @Column(name = "discount_value", precision = 6, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "min_purchase", precision = 6, scale = 2)
    private BigDecimal minPurchase = BigDecimal.ZERO;

    @Column(name = "icon_emoji", length = 10)
    private String iconEmoji = "🎫";

    @Column(name = "wheel_color", length = 7)
    private String wheelColor = "#FF6B6B";

    @Column(name = "win_weight")
    private Integer winWeight = 10;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public enum DiscountType {
        PERCENT_OFF, FIXED_DISCOUNT, FREE_ITEM, FREE_TOPPING, FREE_SIZE_UP, BOGO, CUSTOM
    }
}
