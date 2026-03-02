package com.tsaocaacolumbus.api.controller;

import com.tsaocaacolumbus.api.model.dto.RegisterRequest;
import com.tsaocaacolumbus.api.model.dto.UserProfileRequest;
import com.tsaocaacolumbus.api.model.dto.UserResponse;
import com.tsaocaacolumbus.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * Called by the mobile app immediately after Cognito sign-up succeeds.
     * Creates the user record in our database, tied to the Cognito sub.
     */
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.registerUser(jwt, request));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getProfile(jwt));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UserProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(jwt, request));
    }
}
