package com.tsaocaacolumbus.api.repository;

import com.tsaocaacolumbus.api.model.entity.GamePlay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface GamePlayRepository extends JpaRepository<GamePlay, Long> {

    int countByUserIdAndPlayedAtAfter(Long userId, Instant since);

    List<GamePlay> findByUserIdAndWeekStartOrderByPlayedAtDesc(Long userId, LocalDate weekStart);

    @Query("SELECT COUNT(gp) FROM GamePlay gp WHERE gp.weekStart = :weekStart")
    long countTotalPlaysForWeek(@Param("weekStart") LocalDate weekStart);

    @Query("SELECT COUNT(gp) FROM GamePlay gp WHERE gp.weekStart = :weekStart AND gp.result = 'WIN'")
    long countWinsForWeek(@Param("weekStart") LocalDate weekStart);
}
