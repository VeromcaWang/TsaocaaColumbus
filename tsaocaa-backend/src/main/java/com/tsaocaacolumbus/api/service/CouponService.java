package com.tsaocaacolumbus.api.service;

import com.tsaocaacolumbus.api.exception.InvalidOperationException;
import com.tsaocaacolumbus.api.exception.ResourceNotFoundException;
import com.tsaocaacolumbus.api.model.dto.CouponResponse;
import com.tsaocaacolumbus.api.model.entity.CouponType;
import com.tsaocaacolumbus.api.model.entity.User;
import com.tsaocaacolumbus.api.model.entity.UserCoupon;
import com.tsaocaacolumbus.api.repository.CouponTypeRepository;
import com.tsaocaacolumbus.api.repository.UserCouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponService {

    private final UserCouponRepository userCouponRepository;
    private final CouponTypeRepository couponTypeRepository;
    private final GameService gameService;

    // ── Coupon Book ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CouponResponse> getUserCoupons(Long userId) {
        LocalDate weekStart = gameService.getCurrentWeekStart();
        return userCouponRepository
            .findByUserIdAndWeekStartOrderByWonAtDesc(userId, weekStart)
            .stream()
            .filter(uc -> uc.getStatus() == UserCoupon.CouponStatus.ACTIVE
                       || uc.getStatus() == UserCoupon.CouponStatus.REDEEMED)
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CouponResponse getCouponDetail(Long userId, Long couponId) {
        UserCoupon coupon = userCouponRepository.findByIdAndUserId(couponId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Coupon", couponId));
        return toResponse(coupon);
    }

    // ── Redemption ─────────────────────────────────────────────────────────

    @Transactional
    public CouponResponse redeemCoupon(Long userId, Long couponId) {
        UserCoupon coupon = userCouponRepository.findByIdAndUserId(couponId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Coupon", couponId));

        if (coupon.getStatus() != UserCoupon.CouponStatus.ACTIVE) {
            throw new InvalidOperationException(
                "Coupon cannot be redeemed (current status: " + coupon.getStatus() + ")");
        }

        if (coupon.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidOperationException("This coupon has already expired");
        }

        coupon.setStatus(UserCoupon.CouponStatus.REDEEMED);
        coupon.setRedeemedAt(Instant.now());
        return toResponse(userCouponRepository.save(coupon));
    }

    // ── Replace / Discard ──────────────────────────────────────────────────

    /**
     * Replace an existing ACTIVE coupon with a newly won one.
     * Called when the coupon book is full and the user chooses to swap.
     */
    @Transactional
    public CouponResponse replaceCoupon(User user, Long existingCouponId, Long couponTypeId) {
        UserCoupon existing = userCouponRepository.findByIdAndUserId(existingCouponId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Coupon", existingCouponId));

        if (existing.getStatus() != UserCoupon.CouponStatus.ACTIVE) {
            throw new InvalidOperationException(
                "Only unredeemed (ACTIVE) coupons can be replaced. " +
                "Redeemed coupons occupy their slot permanently until the weekly reset.");
        }

        CouponType newType = couponTypeRepository.findById(couponTypeId)
            .orElseThrow(() -> new ResourceNotFoundException("Coupon type", couponTypeId));

        // Mark existing as replaced
        existing.setStatus(UserCoupon.CouponStatus.REPLACED);
        existing.setReplacedAt(Instant.now());
        userCouponRepository.save(existing);

        // Create the new coupon in the freed slot
        LocalDate weekStart = gameService.getCurrentWeekStart();
        UserCoupon newCoupon = new UserCoupon();
        newCoupon.setUser(user);
        newCoupon.setCouponType(newType);
        newCoupon.setStatus(UserCoupon.CouponStatus.ACTIVE);
        newCoupon.setWeekStart(weekStart);
        newCoupon.setExpiresAt(gameService.getNextWeekStart());
        newCoupon.setReplacedById(existing.getId());
        newCoupon.setCouponCode(generateCode());
        userCouponRepository.save(newCoupon);

        return toResponse(newCoupon);
    }

    private String generateCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        java.util.Random rng = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder("TSA-");
        for (int i = 0; i < 4; i++) {
            sb.append(chars.charAt(rng.nextInt(chars.length())));
        }
        return sb.toString();
    }

    // ── Weekly Reset Scheduler ─────────────────────────────────────────────

    /**
     * Runs every Monday at 00:00 America/New_York.
     * Expires all ACTIVE coupons from prior weeks.
     */
    @Scheduled(cron = "0 0 0 * * MON", zone = "America/New_York")
    @Transactional
    public void weeklyReset() {
        log.info("Running weekly coupon reset...");
        int expired = userCouponRepository.expireActiveCouponsBefore(Instant.now());
        log.info("Weekly reset complete: expired {} active coupons", expired);
    }

    // ── Mapper ─────────────────────────────────────────────────────────────

    CouponResponse toResponse(UserCoupon uc) {
        CouponType ct = uc.getCouponType();
        return CouponResponse.builder()
            .id(uc.getId())
            .couponCode(uc.getCouponCode())
            .name(ct.getName())
            .description(ct.getDescription())
            .discountType(ct.getDiscountType().name())
            .discountValue(ct.getDiscountValue())
            .minPurchase(ct.getMinPurchase())
            .iconEmoji(ct.getIconEmoji())
            .status(uc.getStatus().name())
            .weekStart(uc.getWeekStart())
            .wonAt(uc.getWonAt())
            .redeemedAt(uc.getRedeemedAt())
            .expiresAt(uc.getExpiresAt())
            .build();
    }
}
