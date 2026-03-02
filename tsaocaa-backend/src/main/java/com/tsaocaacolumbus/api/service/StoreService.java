package com.tsaocaacolumbus.api.service;

import com.tsaocaacolumbus.api.exception.ResourceNotFoundException;
import com.tsaocaacolumbus.api.model.dto.AnnouncementResponse;
import com.tsaocaacolumbus.api.model.dto.StoreInfoResponse;
import com.tsaocaacolumbus.api.model.entity.Announcement;
import com.tsaocaacolumbus.api.model.entity.StoreHours;
import com.tsaocaacolumbus.api.model.entity.StoreInfo;
import com.tsaocaacolumbus.api.repository.AnnouncementRepository;
import com.tsaocaacolumbus.api.repository.StoreInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StoreService {

    private static final ZoneId COLUMBUS_TZ = ZoneId.of("America/New_York");
    private static final String[] DAY_NAMES = {
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    };

    private final StoreInfoRepository storeInfoRepository;
    private final AnnouncementRepository announcementRepository;

    public StoreInfoResponse getStoreInfo() {
        StoreInfo store = storeInfoRepository.findAll().stream()
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Store info not configured"));

        ZonedDateTime now = ZonedDateTime.now(COLUMBUS_TZ);
        // DayOfWeek: MONDAY=1..SUNDAY=7; our DB: 0=Mon..6=Sun
        int todayIndex = now.getDayOfWeek().getValue() - 1;
        LocalTime currentTime = now.toLocalTime();

        StoreHours todayHours = store.getHours().stream()
            .filter(h -> h.getDayOfWeek() == todayIndex)
            .findFirst()
            .orElse(null);

        boolean isOpenNow = todayHours != null
            && !todayHours.getIsClosed()
            && currentTime.isAfter(todayHours.getOpenTime())
            && currentTime.isBefore(todayHours.getCloseTime());

        StoreInfoResponse.TodayHoursResponse todayResponse = todayHours != null
            ? StoreInfoResponse.TodayHoursResponse.builder()
                .dayName(DAY_NAMES[todayIndex])
                .openTime(todayHours.getOpenTime())
                .closeTime(todayHours.getCloseTime())
                .isClosed(todayHours.getIsClosed())
                .build()
            : null;

        List<StoreInfoResponse.StoreHoursResponse> weeklyHours = store.getHours().stream()
            .map(h -> StoreInfoResponse.StoreHoursResponse.builder()
                .dayOfWeek(h.getDayOfWeek())
                .dayName(DAY_NAMES[h.getDayOfWeek()])
                .openTime(h.getOpenTime())
                .closeTime(h.getCloseTime())
                .isClosed(h.getIsClosed())
                .build())
            .collect(Collectors.toList());

        return StoreInfoResponse.builder()
            .id(store.getId())
            .name(store.getName())
            .address(store.getAddress())
            .city(store.getCity())
            .state(store.getState())
            .zip(store.getZip())
            .phone(store.getPhone())
            .email(store.getEmail())
            .latitude(store.getLatitude())
            .longitude(store.getLongitude())
            .instagramUrl(store.getInstagramUrl())
            .tiktokUrl(store.getTiktokUrl())
            .websiteUrl(store.getWebsiteUrl())
            .isOpenNow(isOpenNow)
            .todayHours(todayResponse)
            .weeklyHours(weeklyHours)
            .build();
    }

    public List<AnnouncementResponse> getAnnouncements() {
        LocalDate today = LocalDate.now(COLUMBUS_TZ);
        return announcementRepository.findActiveAnnouncements(today)
            .stream()
            .map(this::toAnnouncementResponse)
            .collect(Collectors.toList());
    }

    private AnnouncementResponse toAnnouncementResponse(Announcement a) {
        return AnnouncementResponse.builder()
            .id(a.getId())
            .title(a.getTitle())
            .body(a.getBody())
            .imageUrl(a.getImageUrl())
            .linkUrl(a.getLinkUrl())
            .startDate(a.getStartDate())
            .endDate(a.getEndDate())
            .displayOrder(a.getDisplayOrder())
            .createdAt(a.getCreatedAt())
            .build();
    }
}
