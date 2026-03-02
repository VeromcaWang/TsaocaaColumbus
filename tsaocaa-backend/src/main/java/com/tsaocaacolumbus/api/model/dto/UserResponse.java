package com.tsaocaacolumbus.api.model.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class UserResponse {
    Long id;
    String email;
    String phone;
    String displayName;
    String profileImage;
    Instant createdAt;
}
