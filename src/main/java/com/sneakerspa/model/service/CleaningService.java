package com.sneakerspa.model.service;

import com.sneakerspa.model.Payable;
import com.sneakerspa.model.vo.Money;
import java.io.Serializable;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * ============================================================================
 * OOP PRINCIPLE: ABSTRACTION
 * CleaningService defines the abstract blueprint for all sneaker care services.
 * It hides internal calculation mechanisms and forces concrete subclasses
 * to specify their unique pricing rules and service scope.
 * ============================================================================
 */
public abstract class CleaningService implements Payable, Serializable {
    private static final long serialVersionUID = 1L;

    private final String id;
    private final String name;
    private final String description;
    private final Money basePrice;
    private final double rating;
    private final int reviewsCount;
    private final boolean popular;
    private final String iconName;
    private final String colorGradient;

    protected CleaningService(
            String id,
            String name,
            String description,
            Money basePrice,
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

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Money getBasePrice() {
        return basePrice;
    }

    public double getRating() {
        return rating;
    }

    public int getReviewsCount() {
        return reviewsCount;
    }

    public boolean isPopular() {
        return popular;
    }

    public String getIconName() {
        return iconName;
    }

    public String getColorGradient() {
        return colorGradient;
    }
}
