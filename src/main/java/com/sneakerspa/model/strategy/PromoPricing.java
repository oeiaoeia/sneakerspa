package com.sneakerspa.model.strategy;

import com.sneakerspa.model.vo.Money;
import java.util.Objects;

/**
 * ============================================================================
 * OOP DESIGN PATTERN: STRATEGY PATTERN (Promo Strategy)
 * Applies a promotional coupon discount (e.g. CLEAN20 = 20% off).
 * ============================================================================
 */
public class PromoPricing implements PricingStrategy {

    private final String promoCode;
    private final double discountPercentage;

    public PromoPricing(String promoCode, double discountPercentage) {
        this.promoCode = Objects.requireNonNull(promoCode, "Promo code cannot be null");
        if (discountPercentage <= 0 || discountPercentage > 100) {
            throw new IllegalArgumentException("Discount percentage must be between 0 and 100");
        }
        this.discountPercentage = discountPercentage;
    }

    public static PromoPricing ofClean20() {
        return new PromoPricing("CLEAN20", 20.0);
    }

    @Override
    public Money calculateDiscount(Money subtotal) {
        if (subtotal == null) return Money.ZERO;
        return subtotal.discountByPercent(discountPercentage);
    }

    @Override
    public String getStrategyName() {
        return "PROMO_" + promoCode.toUpperCase();
    }

    @Override
    public String getDescription() {
        return "Promotional code " + promoCode + " (" + (int) discountPercentage + "% off)";
    }

    public String getPromoCode() {
        return promoCode;
    }

    public double getDiscountPercentage() {
        return discountPercentage;
    }
}
