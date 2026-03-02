package com.tsaocaacolumbus.api.repository;

import com.tsaocaacolumbus.api.model.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("SELECT a FROM Announcement a WHERE a.isActive = true " +
           "AND (a.startDate IS NULL OR a.startDate <= :today) " +
           "AND (a.endDate IS NULL OR a.endDate >= :today) " +
           "ORDER BY a.displayOrder ASC")
    List<Announcement> findActiveAnnouncements(@Param("today") LocalDate today);
}
