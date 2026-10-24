package com.sneakerspa.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * ============================================================================
 * JPA Entity representation of available cleaning catalog services.
 * ============================================================================
 */
@Entity
@Table(name = "services")
public class CleaningServiceEntity {

    @Id
    private String id; // "basic-clean", "deep-clean", "premium-restoration", "suede-care"

    @Column(nullable = false)
    private String name;

    @Column(length = 1000, nullable = false)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(nullable = false)
    private String duration;

    private double rating;

    private int reviewsCount;

    private boolean popular;

    private String iconName;

    private String colorGradient;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "service_includes", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "include_item")
    private List<String> includes = new ArrayList<>();

    public CleaningServiceEntity() {}

    public CleaningServiceEntity(
            String id,
            String name,
            String description,
            BigDecimal basePrice,
            String duration,
            double rating,
            int reviewsCount,
            boolean popular,
            String iconName,
            String colorGradient,
            List<String> includes
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.basePrice = basePrice;
        this.duration = duration;
        this.rating = rating;
        this.reviewsCount = reviewsCount;
        this.popular = popular;
        this.iconName = iconName;
        this.colorGradient = colorGradient;
        this.includes = includes != null ? new ArrayList<>(includes) : new ArrayList<>();
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

    public String getDuration() {
        return duration;
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

    public List<String> getIncludes() {
        return includes;
    }

    public void setIncludes(List<String> includes) {
        this.includes = includes;
    }
}
