package com.tsaocaacolumbus.api.model.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Value
@Builder
public class MenuItemResponse {
    Long id;
    Long categoryId;
    String categoryName;
    String name;
    String description;
    BigDecimal basePrice;
    String imageUrl;
    Boolean isAvailable;
    Boolean isFeatured;
    Boolean isSeasonal;
    LocalDate seasonalStart;
    LocalDate seasonalEnd;
    Integer calories;
    List<String> tags;
    Integer displayOrder;
    List<CustomizationGroupResponse> customizationGroups;
    Instant createdAt;

    @Value
    @Builder
    public static class CustomizationGroupResponse {
        Long id;
        String name;
        String type;
        Boolean isRequired;
        Integer displayOrder;
        List<CustomizationOptionResponse> options;
    }

    @Value
    @Builder
    public static class CustomizationOptionResponse {
        Long id;
        String name;
        java.math.BigDecimal priceModifier;
        Boolean isDefault;
        Boolean isAvailable;
        Integer displayOrder;
    }
}
