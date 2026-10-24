package com.sneakerspa.model.service;

import com.sneakerspa.model.vo.Money;
import java.util.List;
import java.util.Set;

/**
 * ============================================================================
 * OOP PRINCIPLE: INHERITANCE & POLYMORPHISM
 * SuedeCare provides delicate material brushing and waterproof nano-coating.
 * ============================================================================
 */
public class SuedeCare extends CleaningService {
    private static final long serialVersionUID = 1L;

    public static final String ID = "suede-care";
    public static final Money PRICE = Money.of(55);
    public static final String DURATION = "2-4 days";

    public SuedeCare() {
        super(
                ID,
                "Suede Care",
                "Specialized suede and nubuck treatment with waterproof protection.",
                PRICE,
                4.9,
                215,
                false,
                "Shield",
                "from-emerald-500/20 to-teal-500/10"
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
                "Gentle suede brushing",
                "Stain & scuff removal",
                "Color restoration",
                "Waterproof nano-coating",
                "Suede protector spray"
        );
    }

    @Override
    public String getDuration() {
        return DURATION;
    }
}
