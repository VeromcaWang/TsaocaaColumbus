package com.tsaocaacolumbus.api.repository;

import com.tsaocaacolumbus.api.model.entity.UserCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {

    Optional<UserCoupon> findByIdAndUserId(Long id, Long userId);

    List<UserCoupon> findByUserIdAndWeekStartOrderByWonAtDesc(Long userId, LocalDate weekStart);

    @Query("SELECT COUNT(uc) FROM UserCoupon uc WHERE uc.user.id = :userId " +
           "AND uc.weekStart = :weekStart " +
           "AND uc.status IN ('ACTIVE', 'REDEEMED')")
    int countWeekSlots(@Param("userId") Long userId, @Param("weekStart") LocalDate weekStart);

    List<UserCoupon> findByUserIdAndWeekStartAndStatus(
        Long userId, LocalDate weekStart, UserCoupon.CouponStatus status);

    @Modifying
    @Query("UPDATE UserCoupon uc SET uc.status = 'EXPIRED' " +
           "WHERE uc.status = 'ACTIVE' AND uc.expiresAt <= :now")
    int expireActiveCouponsBefore(@Param("now") Instant now);

    Optional<UserCoupon> findByCouponCode(String couponCode);
}
