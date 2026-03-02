package com.tsaocaacolumbus.api.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "customization_options")
@Getter
@Setter
@NoArgsConstructor
public class CustomizationOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private CustomizationGroup group;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "price_modifier", precision = 5, scale = 2)
    private BigDecimal priceModifier = BigDecimal.ZERO;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "display_order")
    private Integer displayOrder = 0;
}
