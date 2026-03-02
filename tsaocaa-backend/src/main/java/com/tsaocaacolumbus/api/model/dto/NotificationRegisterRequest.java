package com.tsaocaacolumbus.api.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NotificationRegisterRequest {
    @NotBlank
    private String pushToken;
}
