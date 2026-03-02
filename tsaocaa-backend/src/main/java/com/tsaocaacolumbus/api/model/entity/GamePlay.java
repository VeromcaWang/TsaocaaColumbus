package com.tsaocaacolumbus.api.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "game_plays")
@Getter
@Setter
@NoArgsConstructor
public class GamePlay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "game_type", length = 15)
    private GameType gameType = GameType.SPIN_WHEEL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 4)
    private GameResult result;

    @Column(name = "coupon_type_id")
    private Long couponTypeId;

    @Column(name = "user_coupon_id")
    private Long userCouponId;

    @Enumerated(EnumType.STRING)
    @Column(name = "outcome_action", length = 20)
    private OutcomeAction outcomeAction = OutcomeAction.NONE;

    @CreationTimestamp
    @Column(name = "played_at", nullable = false)
    private Instant playedAt;

    @Column(name = "week_start", nullable = false)
    private LocalDate weekStart;

    public enum GameType {
        SPIN_WHEEL, BUBBLE_POP, CARD_FLIP
    }

    public enum GameResult {
        WIN, LOSE
    }

    public enum OutcomeAction {
        STORED, REPLACED, DISCARDED, PENDING_DECISION, NONE
    }
}
