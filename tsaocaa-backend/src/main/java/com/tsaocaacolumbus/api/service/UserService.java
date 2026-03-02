package com.tsaocaacolumbus.api.service;

import com.tsaocaacolumbus.api.exception.ResourceNotFoundException;
import com.tsaocaacolumbus.api.model.dto.RegisterRequest;
import com.tsaocaacolumbus.api.model.dto.UserProfileRequest;
import com.tsaocaacolumbus.api.model.dto.UserResponse;
import com.tsaocaacolumbus.api.model.entity.User;
import com.tsaocaacolumbus.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Called after Cognito sign-up to create the user record in our DB.
     * The Cognito sub (unique user ID) ties the two together.
     */
    @Transactional
    public UserResponse registerUser(Jwt jwt, RegisterRequest request) {
        String cognitoSub = jwt.getSubject();

        // Idempotent — if user already exists, return existing
        return userRepository.findByCognitoSub(cognitoSub)
            .map(this::toResponse)
            .orElseGet(() -> {
                User user = new User();
                user.setCognitoSub(cognitoSub);
                user.setEmail(request.getEmail() != null ? request.getEmail()
                    : jwt.getClaimAsString("email"));
                user.setDisplayName(request.getDisplayName());
                user.setPhone(request.getPhone());
                return toResponse(userRepository.save(user));
            });
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(Jwt jwt) {
        User user = findByJwt(jwt);
        return toResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(Jwt jwt, UserProfileRequest request) {
        User user = findByJwt(jwt);
        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void updatePushToken(Jwt jwt, String pushToken) {
        User user = findByJwt(jwt);
        user.setPushToken(pushToken);
        userRepository.save(user);
    }

    public User findByJwt(Jwt jwt) {
        String cognitoSub = jwt.getSubject();
        return userRepository.findByCognitoSub(cognitoSub)
            .orElseThrow(() -> new ResourceNotFoundException(
                "User not found. Please call /api/v1/auth/register first."));
    }

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .phone(user.getPhone())
            .displayName(user.getDisplayName())
            .profileImage(user.getProfileImage())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
