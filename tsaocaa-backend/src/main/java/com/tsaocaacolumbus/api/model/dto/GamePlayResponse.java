package com.tsaocaacolumbus.api.model.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class GamePlayResponse {
    // "WIN" or "LOSE"
    String result;
    // "STORED", "BOOK_FULL", "NONE"
    String action;

    // The segment the wheel should land on
    SegmentResult segment;

    // Present if result == WIN and action == STORED
    CouponDetail coupon;

    // Present if result == WIN and action == BOOK_FULL
    PendingWin newCoupon;
    List<ReplaceableCoupon> replaceableCoupons;

    // Present if result == LOSE
    Integer playsRemainingToday;

    // User's current coupon book
    CouponBookSummary couponBook;

    @Value
    @Builder
    public static class SegmentResult {
        String label;
        String emoji;
        String color;
        int segmentIndex;
    }

    @Value
    @Builder
    public static class CouponDetail {
        Long id;
        String code;
        String type;
        String name;
        String description;
        String status;
        java.time.Instant expiresAt;
        java.time.Instant wonAt;
    }

    @Value
    @Builder
    public static class PendingWin {
        Long couponTypeId;
        String type;
        String name;
        String description;
        String iconEmoji;
    }

    @Value
    @Builder
    public static class ReplaceableCoupon {
        Long id;
        String code;
        String name;
        String iconEmoji;
        java.time.Instant wonAt;
    }

    @Value
    @Builder
    public static class CouponBookSummary {
        int slots;
        int used;
        List<CouponDetail> coupons;
    }
}
