package com.tsaocaacolumbus.api.repository;

import com.tsaocaacolumbus.api.model.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByCategoryIdAndIsAvailableTrueOrderByDisplayOrderAsc(Long categoryId);

    List<MenuItem> findByIsFeaturedTrueAndIsAvailableTrueOrderByDisplayOrderAsc();

    @Query("SELECT m FROM MenuItem m WHERE m.isSeasonal = true AND m.isAvailable = true " +
           "AND (m.seasonalStart IS NULL OR m.seasonalStart <= :today) " +
           "AND (m.seasonalEnd IS NULL OR m.seasonalEnd >= :today) " +
           "ORDER BY m.displayOrder ASC")
    List<MenuItem> findActiveSeasonalItems(@Param("today") LocalDate today);

    @Query("SELECT m FROM MenuItem m WHERE m.isAvailable = true " +
           "AND (LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(m.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<MenuItem> searchByQuery(@Param("query") String query);
}
