package com.tsaocaacolumbus.api.controller;

import com.tsaocaacolumbus.api.model.dto.AnnouncementResponse;
import com.tsaocaacolumbus.api.model.dto.StoreInfoResponse;
import com.tsaocaacolumbus.api.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping("/info")
    public ResponseEntity<StoreInfoResponse> getStoreInfo() {
        return ResponseEntity.ok(storeService.getStoreInfo());
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<AnnouncementResponse>> getAnnouncements() {
        return ResponseEntity.ok(storeService.getAnnouncements());
    }
}
