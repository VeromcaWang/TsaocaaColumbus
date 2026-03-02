package com.tsaocaacolumbus.api.service;

import com.tsaocaacolumbus.api.exception.InvalidOperationException;
import com.tsaocaacolumbus.api.exception.PlayLimitExceededException;
import com.tsaocaacolumbus.api.model.dto.GameConfigResponse;
import com.tsaocaacolumbus.api.model.dto.GamePlayResponse;
import com.tsaocaacolumbus.api.model.entity.*;
import com.tsaocaacolumbus.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private static final ZoneId COLUMBUS_TZ = ZoneId.of("America/New_York");
    private static final String COUPON_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

    private final GamePlayRepository gamePlayRepository;
    private final UserCouponRepository userCouponRepository;
    private final CouponTypeRepository couponTypeRepository;
    private final WheelSegmentRepository wheelSegmentRepository;
    private final GameConfigRepository gameConfigRepository;
    private final UserRepository userRepository;

    private final Random secureRandom = new SecureRandom();

    // ── Game Config ────────────────────────────────────────────────────────

    public GameConfigResponse getGameConfig() {
        int maxCoupons = getConfigInt("max_coupons_per_week");
        int maxPlays = getConfigInt("max_plays_per_day");

        List<CouponType> couponTypes = couponTypeRepository.findByIsActiveTrueOrderByWinWeightDesc();
        List<WheelSegment> segments = wheelSegmentRepository.findByIsActiveTrueOrderByWeightDesc();

        // Build a combined, shuffled wheel layout (alternating wins and losses for visual appeal)
        List<GameConfigResponse.WheelSegmentResponse> wheelLayout = new ArrayList<>();

        // Add winning segments
        for (CouponType ct : couponTypes) {
            wheelLayout.add(GameConfigResponse.WheelSegmentResponse.builder()
                .id(ct.getId())
                .label(ct.getName())
                .iconEmoji(ct.getIconEmoji())
                .wheelColor(ct.getWheelColor())
                .type("WIN")
                .couponTypeId(ct.getId())
                .couponName(ct.getName())
                .couponCode(ct.getCode())
                .build());
        }

        // Add losing segments
        for (WheelSegment ws : segments) {
            wheelLayout.add(GameConfigResponse.WheelSegmentResponse.builder()
                .id(ws.getId())
                .label(ws.getLabel())
                .iconEmoji(ws.getIconEmoji())
                .wheelColor(ws.getWheelColor())
                .type("LOSE")
                .build());
        }

        // Shuffle for visual variety
        java.util.Collections.shuffle(wheelLayout, secureRandom);

        return GameConfigResponse.builder()
            .maxCouponsPerWeek(maxCoupons)
            .maxPlaysPerDay(maxPlays)
            .segments(wheelLayout)
            .build();
    }

    // ── Play Logic ─────────────────────────────────────────────────────────

    @Transactional
    public GamePlayResponse play(Long userId, String gameTypeStr) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new InvalidOperationException("User not found"));

        GamePlay.GameType gameType = parseGameType(gameTypeStr);

        // 1. Check daily play limit
        int maxPlays = getConfigInt("max_plays_per_day");
        Instant todayStart = LocalDate.now(COLUMBUS_TZ)
            .atStartOfDay(COLUMBUS_TZ).toInstant();
        int todayPlays = gamePlayRepository.countByUserIdAndPlayedAtAfter(userId, todayStart);

        if (todayPlays >= maxPlays) {
            throw new PlayLimitExceededException(
                "You've used all " + maxPlays + " plays for today. Come back tomorrow!");
        }

        // 2. Build weighted outcome pool and pick result
        WheelOutcome outcome = pickWeightedOutcome();

        LocalDate weekStart = getCurrentWeekStart();

        if (!outcome.isWin()) {
            // LOSE path
            GamePlay play = createGamePlay(user, gameType, GamePlay.GameResult.LOSE,
                null, null, GamePlay.OutcomeAction.NONE, weekStart);
            gamePlayRepository.save(play);

            int playsRemaining = maxPlays - todayPlays - 1;
            return buildLoseResponse(outcome, playsRemaining);
        }

        // WIN path
        int slotsUsed = userCouponRepository.countWeekSlots(userId, weekStart);
        int maxSlots = getConfigInt("max_coupons_per_week");

        if (slotsUsed < maxSlots) {
            // Slot available — store the coupon
            UserCoupon coupon = createCoupon(user, outcome.couponType(), weekStart);
            userCouponRepository.save(coupon);

            GamePlay play = createGamePlay(user, gameType, GamePlay.GameResult.WIN,
                outcome.couponType().getId(), coupon.getId(),
                GamePlay.OutcomeAction.STORED, weekStart);
            gamePlayRepository.save(play);

            List<UserCoupon> currentCoupons = userCouponRepository
                .findByUserIdAndWeekStartOrderByWonAtDesc(userId, weekStart);

            return buildWinStoredResponse(outcome, coupon, currentCoupons, maxSlots);
        } else {
            // Book full — record PENDING_DECISION, return replaceable coupons
            GamePlay play = createGamePlay(user, gameType, GamePlay.GameResult.WIN,
                outcome.couponType().getId(), null,
                GamePlay.OutcomeAction.PENDING_DECISION, weekStart);
            gamePlayRepository.save(play);

            List<UserCoupon> replaceable = userCouponRepository
                .findByUserIdAndWeekStartAndStatus(userId, weekStart, UserCoupon.CouponStatus.ACTIVE);

            return buildBookFullResponse(outcome, replaceable, play.getId());
        }
    }

    public List<GamePlayResponse.CouponDetail> getPlayHistory(Long userId) {
        LocalDate weekStart = getCurrentWeekStart();
        List<GamePlay> plays = gamePlayRepository
            .findByUserIdAndWeekStartOrderByPlayedAtDesc(userId, weekStart);
        // Return a simplified history — just coupon details for wins
        return List.of(); // detailed history can be expanded later
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    public LocalDate getCurrentWeekStart() {
        return LocalDate.now(COLUMBUS_TZ)
            .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    public Instant getNextWeekStart() {
        LocalDate nextMonday = getCurrentWeekStart().plusWeeks(1);
        return nextMonday.atStartOfDay(COLUMBUS_TZ).toInstant();
    }

    private WheelOutcome pickWeightedOutcome() {
        List<CouponType> couponTypes = couponTypeRepository.findByIsActiveTrueOrderByWinWeightDesc();
        List<WheelSegment> loseSegments = wheelSegmentRepository.findByIsActiveTrueOrderByWeightDesc();

        // Build weighted pool
        List<WeightedItem> pool = new ArrayList<>();
        int segmentIndex = 0;

        for (CouponType ct : couponTypes) {
            pool.add(new WeightedItem(ct.getWinWeight(), true, ct, null, segmentIndex++));
        }
        for (WheelSegment ws : loseSegments) {
            pool.add(new WeightedItem(ws.getWeight(), false, null, ws, segmentIndex++));
        }

        int totalWeight = pool.stream().mapToInt(w -> w.weight).sum();
        int pick = secureRandom.nextInt(totalWeight);

        int cumulative = 0;
        for (WeightedItem item : pool) {
            cumulative += item.weight;
            if (pick < cumulative) {
                if (item.isWin) {
                    return new WheelOutcome(true, item.couponType, null, item.segmentIndex,
                        item.couponType.getName(), item.couponType.getIconEmoji(),
                        item.couponType.getWheelColor());
                } else {
                    return new WheelOutcome(false, null, item.wheelSegment, item.segmentIndex,
                        item.wheelSegment.getLabel(), item.wheelSegment.getIconEmoji(),
                        item.wheelSegment.getWheelColor());
                }
            }
        }

        // Fallback to last item (shouldn't happen)
        WeightedItem last = pool.get(pool.size() - 1);
        return new WheelOutcome(false, null, last.wheelSegment, last.segmentIndex,
            "Try Again!", "😅", "#E0E0E0");
    }

    private UserCoupon createCoupon(User user, CouponType couponType, LocalDate weekStart) {
        UserCoupon coupon = new UserCoupon();
        coupon.setUser(user);
        coupon.setCouponType(couponType);
        coupon.setStatus(UserCoupon.CouponStatus.ACTIVE);
        coupon.setWeekStart(weekStart);
        coupon.setExpiresAt(getNextWeekStart());
        coupon.setCouponCode(generateUniqueCouponCode());
        return coupon;
    }

    private String generateUniqueCouponCode() {
        // Retry loop to handle collision (extremely unlikely but safe)
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder("TSA-");
            for (int i = 0; i < 4; i++) {
                sb.append(COUPON_CHARS.charAt(secureRandom.nextInt(COUPON_CHARS.length())));
            }
            String code = sb.toString();
            if (userCouponRepository.findByCouponCode(code).isEmpty()) {
                return code;
            }
        }
        // Extend to 6 chars if all 4-char codes somehow collide
        StringBuilder sb = new StringBuilder("TSA-");
        for (int i = 0; i < 6; i++) {
            sb.append(COUPON_CHARS.charAt(secureRandom.nextInt(COUPON_CHARS.length())));
        }
        return sb.toString();
    }

    private GamePlay createGamePlay(User user, GamePlay.GameType gameType, GamePlay.GameResult result,
                                    Long couponTypeId, Long userCouponId,
                                    GamePlay.OutcomeAction action, LocalDate weekStart) {
        GamePlay play = new GamePlay();
        play.setUser(user);
        play.setGameType(gameType);
        play.setResult(result);
        play.setCouponTypeId(couponTypeId);
        play.setUserCouponId(userCouponId);
        play.setOutcomeAction(action);
        play.setWeekStart(weekStart);
        return play;
    }

    private int getConfigInt(String key) {
        return gameConfigRepository.findByConfigKey(key)
            .map(c -> Integer.parseInt(c.getConfigValue()))
            .orElse(switch (key) {
                case "max_plays_per_day" -> 3;
                case "max_coupons_per_week" -> 3;
                default -> 0;
            });
    }

    private GamePlay.GameType parseGameType(String str) {
        if (str == null) return GamePlay.GameType.SPIN_WHEEL;
        return switch (str.toUpperCase()) {
            case "BUBBLE_POP" -> GamePlay.GameType.BUBBLE_POP;
            case "CARD_FLIP" -> GamePlay.GameType.CARD_FLIP;
            default -> GamePlay.GameType.SPIN_WHEEL;
        };
    }

    // ── Response builders ──────────────────────────────────────────────────

    private GamePlayResponse buildLoseResponse(WheelOutcome outcome, int playsRemaining) {
        return GamePlayResponse.builder()
            .result("LOSE")
            .action("NONE")
            .segment(GamePlayResponse.SegmentResult.builder()
                .label(outcome.label())
                .emoji(outcome.emoji())
                .color(outcome.color())
                .segmentIndex(outcome.segmentIndex())
                .build())
            .playsRemainingToday(playsRemaining)
            .build();
    }

    private GamePlayResponse buildWinStoredResponse(WheelOutcome outcome, UserCoupon coupon,
                                                    List<UserCoupon> allCoupons, int maxSlots) {
        return GamePlayResponse.builder()
            .result("WIN")
            .action("STORED")
            .segment(GamePlayResponse.SegmentResult.builder()
                .label(outcome.label())
                .emoji(outcome.emoji())
                .color(outcome.color())
                .segmentIndex(outcome.segmentIndex())
                .build())
            .coupon(toCouponDetail(coupon))
            .couponBook(buildCouponBook(allCoupons, maxSlots))
            .build();
    }

    private GamePlayResponse buildBookFullResponse(WheelOutcome outcome, List<UserCoupon> replaceable,
                                                   Long pendingPlayId) {
        List<GamePlayResponse.ReplaceableCoupon> replaceableDto = replaceable.stream()
            .map(uc -> GamePlayResponse.ReplaceableCoupon.builder()
                .id(uc.getId())
                .code(uc.getCouponCode())
                .name(uc.getCouponType().getName())
                .iconEmoji(uc.getCouponType().getIconEmoji())
                .wonAt(uc.getWonAt())
                .build())
            .collect(Collectors.toList());

        return GamePlayResponse.builder()
            .result("WIN")
            .action("BOOK_FULL")
            .segment(GamePlayResponse.SegmentResult.builder()
                .label(outcome.label())
                .emoji(outcome.emoji())
                .color(outcome.color())
                .segmentIndex(outcome.segmentIndex())
                .build())
            .newCoupon(GamePlayResponse.PendingWin.builder()
                .couponTypeId(outcome.couponType().getId())
                .type(outcome.couponType().getDiscountType().name())
                .name(outcome.couponType().getName())
                .description(outcome.couponType().getDescription())
                .iconEmoji(outcome.couponType().getIconEmoji())
                .build())
            .replaceableCoupons(replaceableDto)
            .build();
    }

    GamePlayResponse.CouponDetail toCouponDetail(UserCoupon uc) {
        return GamePlayResponse.CouponDetail.builder()
            .id(uc.getId())
            .code(uc.getCouponCode())
            .type(uc.getCouponType().getDiscountType().name())
            .name(uc.getCouponType().getName())
            .description(uc.getCouponType().getDescription())
            .status(uc.getStatus().name())
            .expiresAt(uc.getExpiresAt())
            .wonAt(uc.getWonAt())
            .build();
    }

    private GamePlayResponse.CouponBookSummary buildCouponBook(List<UserCoupon> coupons, int maxSlots) {
        List<GamePlayResponse.CouponDetail> details = coupons.stream()
            .filter(uc -> uc.getStatus() == UserCoupon.CouponStatus.ACTIVE
                       || uc.getStatus() == UserCoupon.CouponStatus.REDEEMED)
            .map(this::toCouponDetail)
            .collect(Collectors.toList());

        return GamePlayResponse.CouponBookSummary.builder()
            .slots(maxSlots)
            .used(details.size())
            .coupons(details)
            .build();
    }

    // ── Internal types ─────────────────────────────────────────────────────

    private record WheelOutcome(boolean isWin, CouponType couponType, WheelSegment wheelSegment,
                                int segmentIndex, String label, String emoji, String color) {}

    private record WeightedItem(int weight, boolean isWin, CouponType couponType,
                                WheelSegment wheelSegment, int segmentIndex) {}
}
