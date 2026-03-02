package com.tsaocaacolumbus.api.model.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserProfileRequest {

    @Size(max = 100)
    private String displayName;

    @Size(max = 20)
    private String phone;
}
