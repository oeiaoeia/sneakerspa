package com.sneakerspa.model.strategy;

import com.sneakerspa.model.vo.Money;

/**
 * ============================================================================
 * OOP DESIGN PATTERN: STRATEGY PATTERN
 * Defines a family of interchangeable pricing algorithms. The Order context
 * executes calculations through this interface without needing to know
 * the specific promotion or subscriber pricing rules applied.
 * ============================================================================
 */
public interface PricingStrategy {

    /**
     * Calculates the monetary discount on the given subtotal.
     * @param subtotal raw sum of services and add-ons
     * @return discount amount
     */
    Money calculateDiscount(Money subtotal);

    /**
     * Calculates the final payable amount after applying discount.
     * @param subtotal raw sum of services and add-ons
     * @return final payable money
     */
    default Money applyPricing(Money subtotal) {
        return subtotal.subtract(calculateDiscount(subtotal));
    }

    String getStrategyName();
    String getDescription();
}
