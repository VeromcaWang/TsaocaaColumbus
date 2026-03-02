package com.tsaocaacolumbus.api.model.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Value
@Builder
public class StoreInfoResponse {
    Long id;
    String name;
    String address;
    String city;
    String state;
    String zip;
    String phone;
    String email;
    BigDecimal latitude;
    BigDecimal longitude;
    String instagramUrl;
    String tiktokUrl;
    String websiteUrl;
    Boolean isOpenNow;
    TodayHoursResponse todayHours;
    List<StoreHoursResponse> weeklyHours;

    @Value
    @Builder
    public static class TodayHoursResponse {
        String dayName;
        LocalTime openTime;
        LocalTime closeTime;
        Boolean isClosed;
    }

    @Value
    @Builder
    public static class StoreHoursResponse {
        Integer dayOfWeek;
        String dayName;
        LocalTime openTime;
        LocalTime closeTime;
        Boolean isClosed;
    }
}
