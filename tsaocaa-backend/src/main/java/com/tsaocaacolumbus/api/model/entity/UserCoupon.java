package com.tsaocaacolumbus.api.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "user_coupons")
@Getter
@Setter
@NoArgsConstructor
public class UserCoupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "coupon_type_id", nullable = false)
    private CouponType couponType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private CouponStatus status = CouponStatus.ACTIVE;

    @Column(name = "week_start", nullable = false)
    private LocalDate weekStart;

    @CreationTimestamp
    @Column(name = "won_at", nullable = false)
    private Instant wonAt;

    @Column(name = "redeemed_at")
    private Instant redeemedAt;

    @Column(name = "replaced_at")
    private Instant replacedAt;

    @Column(name = "replaced_by_id")
    private Long replacedById;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "coupon_code", unique = true, nullable = false, length = 20)
    private String couponCode;

    public enum CouponStatus {
        ACTIVE, REDEEMED, EXPIRED, REPLACED
    }
}
