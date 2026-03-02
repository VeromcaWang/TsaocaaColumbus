package com.tsaocaacolumbus.api.repository;

import com.tsaocaacolumbus.api.model.entity.CouponType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponTypeRepository extends JpaRepository<CouponType, Long> {
    List<CouponType> findByIsActiveTrueOrderByWinWeightDesc();
}
