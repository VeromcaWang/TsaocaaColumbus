package com.tsaocaacolumbus.api.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReplaceRequest {
    @NotNull
    private Long existingCouponId;

    @NotNull
    private Long couponTypeId;
}
