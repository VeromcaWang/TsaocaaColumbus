package com.tsaocaacolumbus.api.repository;

import com.tsaocaacolumbus.api.model.entity.GameConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameConfigRepository extends JpaRepository<GameConfig, Long> {
    Optional<GameConfig> findByConfigKey(String configKey);
}
