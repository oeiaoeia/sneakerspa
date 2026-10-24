package com.sneakerspa.model.service;

import com.sneakerspa.model.vo.Money;
import java.util.List;
import java.util.Set;

/**
 * ============================================================================
 * OOP PRINCIPLE: INHERITANCE & POLYMORPHISM
 * PremiumRestoration provides complete aesthetic and structural restoration.
 * ============================================================================
 */
public class PremiumRestoration extends CleaningService {
    private static final long serialVersionUID = 1L;

    public static final String ID = "premium-restoration";
    public static final Money PRICE = Money.of(75);
    public static final String DURATION = "3-5 days";

    public PremiumRestoration() {
        super(
                ID,
                "Premium Restoration",
                "Complete restoration including color touch-up, re-gluing, and protective coating.",
                PRICE,
                5.0,
                189,
                false,
                "SprayCan",
                "from-amber-500/20 to-orange-500/10"
        );
    }

    @Override
    public Money calculatePrice(Set<AddOn> addOns) {
        Money total = getBasePrice();
        if (addOns != null) {
            for (AddOn addOn : addOns) {
                total = total.add(addOn.getPrice());
            }
        }
        return total;
    }

    @Override
    public List<String> getIncludes() {
        return List.of(
                "Everything in Deep Clean",
                "Color touch-up & repainting",
                "Re-gluing & structural repair",
                "Premium protective coating",
                "Before/after photo report"
        );
    }

    @Override
    public String getDuration() {
        return DURATION;
    }
}
