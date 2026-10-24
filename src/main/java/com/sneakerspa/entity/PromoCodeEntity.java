package com.sneakerspa.entity;

import jakarta.persistence.*;

/**
 * ============================================================================
 * PromoCode entity validated server-side.
 * ============================================================================
 */
@Entity
@Table(name = "promo_codes")
public class PromoCodeEntity {

    @Id
    @Column(nullable = false, unique = true)
    private String code; // e.g. "CLEAN20"

    @Column(nullable = false)
    private double discountPercentage; // e.g. 20.0

    @Column(nullable = false)
    private boolean active = true;

    private Integer maxUses;

    @Column(nullable = false)
    private int timesUsed = 0;

    public PromoCodeEntity() {}

    public PromoCodeEntity(String code, double discountPercentage, boolean active) {
        this.code = code != null ? code.toUpperCase() : null;
        this.discountPercentage = discountPercentage;
        this.active = active;
        this.timesUsed = 0;
    }

    public boolean isValid() {
        if (!active) return false;
        if (maxUses != null && timesUsed >= maxUses) return false;
        return true;
    }

    public void incrementUsage() {
        this.timesUsed++;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code != null ? code.toUpperCase() : null;
    }

    public double getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Integer getMaxUses() {
        return maxUses;
    }

    public void setMaxUses(Integer maxUses) {
        this.maxUses = maxUses;
    }

    public int getTimesUsed() {
        return timesUsed;
    }

    public void setTimesUsed(int timesUsed) {
        this.timesUsed = timesUsed;
    }
}
