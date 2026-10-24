package com.sneakerspa.model.strategy;

import com.sneakerspa.model.vo.Money;

/**
 * ============================================================================
 * OOP DESIGN PATTERN: STRATEGY PATTERN (Standard Strategy)
 * Standard pricing applies no discounts; total equals subtotal.
 * ============================================================================
 */
public class StandardPricing implements PricingStrategy {

    @Override
    public Money calculateDiscount(Money subtotal) {
        return Money.ZERO;
    }

    @Override
    public String getStrategyName() {
        return "STANDARD";
    }

    @Override
    public String getDescription() {
        return "Standard retail pricing without promotional discount";
    }
}
