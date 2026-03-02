package com.tsaocaacolumbus.api.controller;

import com.tsaocaacolumbus.api.exception.ResourceNotFoundException;
import com.tsaocaacolumbus.api.model.dto.AnnouncementResponse;
import com.tsaocaacolumbus.api.model.dto.CouponResponse;
import com.tsaocaacolumbus.api.model.dto.MenuItemResponse;
import com.tsaocaacolumbus.api.model.dto.SendNotificationRequest;
import com.tsaocaacolumbus.api.model.entity.*;
import com.tsaocaacolumbus.api.repository.*;
import com.tsaocaacolumbus.api.service.MenuService;
import com.tsaocaacolumbus.api.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final MenuItemRepository menuItemRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final AnnouncementRepository announcementRepository;
    private final CouponTypeRepository couponTypeRepository;
    private final GameConfigRepository gameConfigRepository;
    private final GamePlayRepository gamePlayRepository;
    private final UserCouponRepository userCouponRepository;
    private final NotificationService notificationService;
    private final MenuService menuService;

    // ── Menu Management ────────────────────────────────────────────────────

    @PostMapping("/menu/items")
    public ResponseEntity<MenuItemResponse> createMenuItem(@RequestBody Map<String, Object> body) {
        Long categoryId = Long.parseLong(body.get("categoryId").toString());
        MenuCategory category = menuCategoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Menu category", categoryId));

        MenuItem item = new MenuItem();
        item.setCategory(category);
        item.setName(body.get("name").toString());
        item.setDescription((String) body.get("description"));
        item.setBasePrice(new BigDecimal(body.get("basePrice").toString()));
        item.setImageUrl((String) body.get("imageUrl"));
        item.setIsAvailable(Boolean.parseBoolean(body.getOrDefault("isAvailable", "true").toString()));
        item.setIsFeatured(Boolean.parseBoolean(body.getOrDefault("isFeatured", "false").toString()));
        item.setIsSeasonal(Boolean.parseBoolean(body.getOrDefault("isSeasonal", "false").toString()));
        item.setDisplayOrder(Integer.parseInt(body.getOrDefault("displayOrder", "0").toString()));

        return ResponseEntity.ok(menuService.toItemResponse(menuItemRepository.save(item), false));
    }

    @PutMapping("/menu/items/{id}")
    public ResponseEntity<MenuItemResponse> updateMenuItem(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        MenuItem item = menuItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Menu item", id));

        if (body.containsKey("name")) item.setName(body.get("name").toString());
        if (body.containsKey("description")) item.setDescription((String) body.get("description"));
        if (body.containsKey("basePrice"))
            item.setBasePrice(new BigDecimal(body.get("basePrice").toString()));
        if (body.containsKey("imageUrl")) item.setImageUrl((String) body.get("imageUrl"));
        if (body.containsKey("isAvailable"))
            item.setIsAvailable(Boolean.parseBoolean(body.get("isAvailable").toString()));
        if (body.containsKey("isFeatured"))
            item.setIsFeatured(Boolean.parseBoolean(body.get("isFeatured").toString()));

        return ResponseEntity.ok(menuService.toItemResponse(menuItemRepository.save(item), false));
    }

    @DeleteMapping("/menu/items/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        if (!menuItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Menu item", id);
        }
        menuItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Announcements ──────────────────────────────────────────────────────

    @PostMapping("/announcements")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(@RequestBody Map<String, Object> body) {
        Announcement a = new Announcement();
        a.setTitle(body.get("title").toString());
        a.setBody((String) body.get("body"));
        a.setImageUrl((String) body.get("imageUrl"));
        a.setIsActive(Boolean.parseBoolean(body.getOrDefault("isActive", "true").toString()));
        a.setDisplayOrder(Integer.parseInt(body.getOrDefault("displayOrder", "0").toString()));

        Announcement saved = announcementRepository.save(a);
        return ResponseEntity.ok(AnnouncementResponse.builder()
            .id(saved.getId())
            .title(saved.getTitle())
            .body(saved.getBody())
            .imageUrl(saved.getImageUrl())
            .displayOrder(saved.getDisplayOrder())
            .createdAt(saved.getCreatedAt())
            .build());
    }

    // ── Game Configuration ─────────────────────────────────────────────────

    @GetMapping("/game/config")
    public ResponseEntity<List<Map<String, String>>> getGameConfigs() {
        return ResponseEntity.ok(gameConfigRepository.findAll().stream()
            .map(c -> Map.of(
                "key", c.getConfigKey(),
                "value", c.getConfigValue(),
                "description", Objects.toString(c.getDescription(), "")
            ))
            .collect(Collectors.toList()));
    }

    @PutMapping("/game/config/{key}")
    public ResponseEntity<Map<String, String>> updateGameConfig(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {
        GameConfig config = gameConfigRepository.findByConfigKey(key)
            .orElseThrow(() -> new ResourceNotFoundException("Config key not found: " + key));
        config.setConfigValue(body.get("value"));
        gameConfigRepository.save(config);
        return ResponseEntity.ok(Map.of("key", key, "value", config.getConfigValue()));
    }

    // ── Coupon Types ───────────────────────────────────────────────────────

    @GetMapping("/coupon-types")
    public ResponseEntity<List<CouponType>> getCouponTypes() {
        return ResponseEntity.ok(couponTypeRepository.findAll());
    }

    @PutMapping("/coupon-types/{id}")
    public ResponseEntity<CouponType> updateCouponType(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        CouponType ct = couponTypeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Coupon type", id));

        if (body.containsKey("winWeight"))
            ct.setWinWeight(Integer.parseInt(body.get("winWeight").toString()));
        if (body.containsKey("isActive"))
            ct.setIsActive(Boolean.parseBoolean(body.get("isActive").toString()));
        if (body.containsKey("name")) ct.setName(body.get("name").toString());
        if (body.containsKey("description")) ct.setDescription((String) body.get("description"));

        return ResponseEntity.ok(couponTypeRepository.save(ct));
    }

    // ── Analytics ──────────────────────────────────────────────────────────

    @GetMapping("/game/stats")
    public ResponseEntity<Map<String, Object>> getGameStats() {
        LocalDate weekStart = LocalDate.now().with(
            java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));

        long totalPlays = gamePlayRepository.countTotalPlaysForWeek(weekStart);
        long totalWins = gamePlayRepository.countWinsForWeek(weekStart);
        double winRate = totalPlays > 0 ? (double) totalWins / totalPlays * 100 : 0;

        return ResponseEntity.ok(Map.of(
            "weekStart", weekStart.toString(),
            "totalPlays", totalPlays,
            "totalWins", totalWins,
            "winRatePercent", Math.round(winRate * 10) / 10.0
        ));
    }

    @GetMapping("/coupons/lookup")
    public ResponseEntity<CouponResponse> lookupCoupon(@RequestParam String code) {
        UserCoupon uc = userCouponRepository.findByCouponCode(code.toUpperCase())
            .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + code));

        CouponType ct = uc.getCouponType();
        return ResponseEntity.ok(CouponResponse.builder()
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
            .build());
    }

    // ── Push Notifications ─────────────────────────────────────────────────

    @PostMapping("/notifications/send")
    public ResponseEntity<Map<String, Object>> sendNotification(
            @Valid @RequestBody SendNotificationRequest request) {
        int sentCount = notificationService.sendToAll(request.getTitle(), request.getBody());
        return ResponseEntity.ok(Map.of(
            "sent", true,
            "recipientCount", sentCount,
            "title", request.getTitle()
        ));
    }
}
