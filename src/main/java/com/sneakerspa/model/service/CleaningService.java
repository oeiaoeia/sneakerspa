package com.sneakerspa.model.service;

import com.sneakerspa.model.Payable;
import com.sneakerspa.model.vo.Money;
import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * ============================================================================
 * OOP PRINCIPLE: ABSTRACTION & INHERITANCE (JPA SINGLE_TABLE ENTITY)
 * CleaningService defines the abstract blueprint for all sneaker care services.
 * It is directly mapped as a JPA Entity using SINGLE_TABLE inheritance, eliminating
 * redundant database mapping classes.
 * ============================================================================
 */
@Entity
@Table(name = "services")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "service_type", discriminatorType = DiscriminatorType.STRING)
public abstract class CleaningService implements Payable, Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @Column(nullable = false)
    protected String id;

    @Column(nullable = false)
    protected String name;

    @Column(length = 1000, nullable = false)
    protected String description;

    @Column(nullable = false, precision = 10, scale = 2)
    protected BigDecimal basePrice;

    @Column(nullable = false)
    protected String duration;

    protected double rating;

    protected int reviewsCount;

    protected boolean popular;

    protected String iconName;

    protected String colorGradient;

    protected CleaningService() {}

    protected CleaningService(
            String id,
            String name,
            String description,
            BigDecimal basePrice,
            String duration,
            double rating,
            int reviewsCount,
            boolean popular,
            String iconName,
            String colorGradient
    ) {
        this.id = Objects.requireNonNull(id, "Service id cannot be null");
        this.name = Objects.requireNonNull(name, "Service name cannot be null");
        this.description = description;
        this.basePrice = Objects.requireNonNull(basePrice, "Base price cannot be null");
        this.duration = duration;
        this.rating = rating;
        this.reviewsCount = reviewsCount;
        this.popular = popular;
        this.iconName = iconName;
        this.colorGradient = colorGradient;
    }

    /**
     * ABSTRACT METHOD: Calculates total price polymorphically including chosen add-ons.
     */
    public abstract Money calculatePrice(Set<AddOn> addOns);

    /**
     * ABSTRACT METHOD: Returns list of features and steps included in this service.
     */
    public abstract List<String> getIncludes();

    /**
     * ABSTRACT METHOD: Returns estimated turnaround time (e.g. "1-2 days").
     */
    public abstract String getDuration();

    /**
     * Implementation of Payable: Default base total without add-ons.
     */
    @Override
    public Money calculateTotal() {
        return calculatePrice(Collections.emptySet());
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getReviewsCount() {
        return reviewsCount;
    }

    public void setReviewsCount(int reviewsCount) {
        this.reviewsCount = reviewsCount;
    }

    public boolean isPopular() {
        return popular;
    }

    public void setPopular(boolean popular) {
        this.popular = popular;
    }

    public String getIconName() {
        return iconName;
    }

    public void setIconName(String iconName) {
        this.iconName = iconName;
    }

    public String getColorGradient() {
        return colorGradient;
    }

    public void setColorGradient(String colorGradient) {
        this.colorGradient = colorGradient;
    }
}
