package com.tsaocaacolumbus.api.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendNotificationRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String body;
}
