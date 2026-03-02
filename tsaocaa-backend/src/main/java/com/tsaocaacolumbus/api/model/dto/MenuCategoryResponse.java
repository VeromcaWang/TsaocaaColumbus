package com.tsaocaacolumbus.api.model.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class MenuCategoryResponse {
    Long id;
    String name;
    String description;
    String iconUrl;
    Integer displayOrder;
    Instant createdAt;
}
