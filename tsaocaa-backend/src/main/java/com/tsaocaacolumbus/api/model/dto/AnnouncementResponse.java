package com.tsaocaacolumbus.api.model.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.time.LocalDate;

@Value
@Builder
public class AnnouncementResponse {
    Long id;
    String title;
    String body;
    String imageUrl;
    String linkUrl;
    LocalDate startDate;
    LocalDate endDate;
    Integer displayOrder;
    Instant createdAt;
}
