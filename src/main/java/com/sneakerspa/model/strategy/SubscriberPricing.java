package com.sneakerspa.model.strategy;

import com.sneakerspa.model.vo.Money;

/**
 * ============================================================================
 * OOP DESIGN PATTERN: STRATEGY PATTERN (Subscriber Strategy)
 * Offers active monthly cleaning plan subscribers 20% off all services.
 * ============================================================================
 */
public class SubscriberPricing implements PricingStrategy {

    private final double discountPercentage;

    public SubscriberPricing() {
        this(20.0);
    }

    public SubscriberPricing(double discountPercentage) {
        if (discountPercentage <= 0 || discountPercentage > 100) {
            throw new IllegalArgumentException("Discount percentage must be between 0 and 100");
        }
        this.discountPercentage = discountPercentage;
    }

    @Override
    public Money calculateDiscount(Money subtotal) {
        if (subtotal == null) return Money.ZERO;
        return subtotal.discountByPercent(discountPercentage);
    }

    @Override
    public String getStrategyName() {
        return "SUBSCRIBER_BENEFIT";
    }

    @Override
    public String getDescription() {
        return "Monthly Cleaning Plan Subscriber (" + (int) discountPercentage + "% off)";
    }
}
