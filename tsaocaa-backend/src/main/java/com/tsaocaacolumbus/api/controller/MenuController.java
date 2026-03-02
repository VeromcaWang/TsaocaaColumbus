package com.tsaocaacolumbus.api.controller;

import com.tsaocaacolumbus.api.model.dto.MenuCategoryResponse;
import com.tsaocaacolumbus.api.model.dto.MenuItemResponse;
import com.tsaocaacolumbus.api.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/categories")
    public ResponseEntity<List<MenuCategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(menuService.getAllCategories());
    }

    @GetMapping("/categories/{id}/items")
    public ResponseEntity<List<MenuItemResponse>> getItemsByCategory(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getItemsByCategory(id));
    }

    @GetMapping("/items/featured")
    public ResponseEntity<List<MenuItemResponse>> getFeaturedItems() {
        return ResponseEntity.ok(menuService.getFeaturedItems());
    }

    @GetMapping("/items/seasonal")
    public ResponseEntity<List<MenuItemResponse>> getSeasonalItems() {
        return ResponseEntity.ok(menuService.getSeasonalItems());
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<MenuItemResponse> getItemDetail(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getItemDetail(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<MenuItemResponse>> searchItems(@RequestParam String q) {
        return ResponseEntity.ok(menuService.searchItems(q));
    }
}
