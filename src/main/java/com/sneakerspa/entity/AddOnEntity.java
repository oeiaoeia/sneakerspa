package com.sneakerspa.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * ============================================================================
 * JPA Entity for optional add-ons (Express, Coating, Laces).
 * ============================================================================
 */
@Entity
@Table(name = "addons")
public class AddOnEntity {

    @Id
    private String id; // "express", "coating", "laces"

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    private String description;

    public AddOnEntity() {}

    public AddOnEntity(String id, String name, BigDecimal price, String description) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
