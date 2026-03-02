package com.tsaocaacolumbus.api.controller;

import com.tsaocaacolumbus.api.model.dto.CouponResponse;
import com.tsaocaacolumbus.api.model.dto.ReplaceRequest;
import com.tsaocaacolumbus.api.model.entity.User;
import com.tsaocaacolumbus.api.service.CouponService;
import com.tsaocaacolumbus.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<CouponResponse>> getUserCoupons(@AuthenticationPrincipal Jwt jwt) {
        User user = userService.findByJwt(jwt);
        return ResponseEntity.ok(couponService.getUserCoupons(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CouponResponse> getCouponDetail(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {
        User user = userService.findByJwt(jwt);
        return ResponseEntity.ok(couponService.getCouponDetail(user.getId(), id));
    }

    @PostMapping("/{id}/redeem")
    public ResponseEntity<CouponResponse> redeemCoupon(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {
        User user = userService.findByJwt(jwt);
        return ResponseEntity.ok(couponService.redeemCoupon(user.getId(), id));
    }

    @PostMapping("/replace")
    public ResponseEntity<CouponResponse> replaceCoupon(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ReplaceRequest request) {
        User user = userService.findByJwt(jwt);
        return ResponseEntity.ok(couponService.replaceCoupon(
            user, request.getExistingCouponId(), request.getCouponTypeId()));
    }

    /**
     * Discard the newly won coupon — user keeps existing coupon book as-is.
     * The pending game play record is already saved; nothing to update here.
     * This endpoint exists to give the frontend a clear UX action.
     */
    @PostMapping("/discard-new")
    public ResponseEntity<Void> discardNew(@AuthenticationPrincipal Jwt jwt) {
        // No DB action needed — the PENDING_DECISION play was already recorded.
        // The frontend simply dismisses the replacement UI.
        return ResponseEntity.noContent().build();
    }
}
