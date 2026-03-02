package com.tsaocaacolumbus.api.model.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class GameConfigResponse {
    int maxCouponsPerWeek;
    int maxPlaysPerDay;
    List<WheelSegmentResponse> segments;

    @Value
    @Builder
    public static class WheelSegmentResponse {
        Long id;
        String label;
        String iconEmoji;
        String wheelColor;
        // type: "WIN" or "LOSE"
        String type;
        // coupon details if type == WIN
        Long couponTypeId;
        String couponName;
        String couponCode;
    }
}
