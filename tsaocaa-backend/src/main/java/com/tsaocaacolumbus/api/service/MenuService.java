package com.tsaocaacolumbus.api.service;

import com.tsaocaacolumbus.api.exception.ResourceNotFoundException;
import com.tsaocaacolumbus.api.model.dto.MenuCategoryResponse;
import com.tsaocaacolumbus.api.model.dto.MenuItemResponse;
import com.tsaocaacolumbus.api.model.entity.CustomizationGroup;
import com.tsaocaacolumbus.api.model.entity.CustomizationOption;
import com.tsaocaacolumbus.api.model.entity.MenuCategory;
import com.tsaocaacolumbus.api.model.entity.MenuItem;
import com.tsaocaacolumbus.api.repository.MenuCategoryRepository;
import com.tsaocaacolumbus.api.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {

    private final MenuCategoryRepository categoryRepository;
    private final MenuItemRepository itemRepository;

    public List<MenuCategoryResponse> getAllCategories() {
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
            .stream()
            .map(this::toCategoryResponse)
            .collect(Collectors.toList());
    }

    public MenuCategoryResponse getCategoryWithItems(Long categoryId) {
        MenuCategory category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Menu category", categoryId));

        List<MenuItem> items = itemRepository
            .findByCategoryIdAndIsAvailableTrueOrderByDisplayOrderAsc(categoryId);

        MenuCategoryResponse response = toCategoryResponse(category);
        // Items are fetched separately; attach to response via a richer response if needed
        return response;
    }

    public List<MenuItemResponse> getItemsByCategory(Long categoryId) {
        categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Menu category", categoryId));

        return itemRepository.findByCategoryIdAndIsAvailableTrueOrderByDisplayOrderAsc(categoryId)
            .stream()
            .map(item -> toItemResponse(item, false))
            .collect(Collectors.toList());
    }

    public MenuItemResponse getItemDetail(Long itemId) {
        MenuItem item = itemRepository.findById(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Menu item", itemId));
        return toItemResponse(item, true);
    }

    public List<MenuItemResponse> getFeaturedItems() {
        return itemRepository.findByIsFeaturedTrueAndIsAvailableTrueOrderByDisplayOrderAsc()
            .stream()
            .map(item -> toItemResponse(item, false))
            .collect(Collectors.toList());
    }

    public List<MenuItemResponse> getSeasonalItems() {
        return itemRepository.findActiveSeasonalItems(LocalDate.now())
            .stream()
            .map(item -> toItemResponse(item, false))
            .collect(Collectors.toList());
    }

    public List<MenuItemResponse> searchItems(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        return itemRepository.searchByQuery(query.trim())
            .stream()
            .map(item -> toItemResponse(item, false))
            .collect(Collectors.toList());
    }

    // ── Mappers ────────────────────────────────────────────────────────────

    private MenuCategoryResponse toCategoryResponse(MenuCategory category) {
        return MenuCategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .description(category.getDescription())
            .iconUrl(category.getIconUrl())
            .displayOrder(category.getDisplayOrder())
            .createdAt(category.getCreatedAt())
            .build();
    }

    MenuItemResponse toItemResponse(MenuItem item, boolean includeCustomizations) {
        MenuItemResponse.MenuItemResponseBuilder builder = MenuItemResponse.builder()
            .id(item.getId())
            .categoryId(item.getCategory().getId())
            .categoryName(item.getCategory().getName())
            .name(item.getName())
            .description(item.getDescription())
            .basePrice(item.getBasePrice())
            .imageUrl(item.getImageUrl())
            .isAvailable(item.getIsAvailable())
            .isFeatured(item.getIsFeatured())
            .isSeasonal(item.getIsSeasonal())
            .seasonalStart(item.getSeasonalStart())
            .seasonalEnd(item.getSeasonalEnd())
            .calories(item.getCalories())
            .tags(item.getTags())
            .displayOrder(item.getDisplayOrder())
            .createdAt(item.getCreatedAt());

        if (includeCustomizations) {
            builder.customizationGroups(
                item.getCustomizationGroups().stream()
                    .map(this::toGroupResponse)
                    .collect(Collectors.toList())
            );
        }

        return builder.build();
    }

    private MenuItemResponse.CustomizationGroupResponse toGroupResponse(CustomizationGroup group) {
        return MenuItemResponse.CustomizationGroupResponse.builder()
            .id(group.getId())
            .name(group.getName())
            .type(group.getType().name())
            .isRequired(group.getIsRequired())
            .displayOrder(group.getDisplayOrder())
            .options(group.getOptions().stream()
                .map(this::toOptionResponse)
                .collect(Collectors.toList()))
            .build();
    }

    private MenuItemResponse.CustomizationOptionResponse toOptionResponse(CustomizationOption option) {
        return MenuItemResponse.CustomizationOptionResponse.builder()
            .id(option.getId())
            .name(option.getName())
            .priceModifier(option.getPriceModifier())
            .isDefault(option.getIsDefault())
            .isAvailable(option.getIsAvailable())
            .displayOrder(option.getDisplayOrder())
            .build();
    }
}
