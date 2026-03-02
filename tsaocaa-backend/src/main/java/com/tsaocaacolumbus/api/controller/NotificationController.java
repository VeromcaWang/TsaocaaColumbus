package com.tsaocaacolumbus.api.controller;

import com.tsaocaacolumbus.api.model.dto.NotificationRegisterRequest;
import com.tsaocaacolumbus.api.model.entity.User;
import com.tsaocaacolumbus.api.service.NotificationService;
import com.tsaocaacolumbus.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Void> registerToken(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody NotificationRegisterRequest request) {
        User user = userService.findByJwt(jwt);
        notificationService.registerDeviceToken(user.getId(), request.getPushToken());
        return ResponseEntity.ok().build();
    }
}
