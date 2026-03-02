package com.tsaocaacolumbus.api.model.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Value
@Builder
public class CouponResponse {
    Long id;
    String couponCode;
    String name;
    String description;
    String discountType;
    BigDecimal discountValue;
    BigDecimal minPurchase;
    String iconEmoji;
    String status;
    LocalDate weekStart;
    Instant wonAt;
    Instant redeemedAt;
    Instant expiresAt;
}
