package com.tsaocaacolumbus.api.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "wheel_segments")
@Getter
@Setter
@NoArgsConstructor
public class WheelSegment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String label;

    @Column(name = "icon_emoji", length = 10)
    private String iconEmoji = "😅";

    @Column(name = "wheel_color", length = 7)
    private String wheelColor = "#CCCCCC";

    private Integer weight = 20;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
