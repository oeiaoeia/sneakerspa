package com.sneakerspa.model.service;

import com.sneakerspa.model.vo.Money;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

/**
 * ============================================================================
 * OOP PRINCIPLE: INHERITANCE & POLYMORPHISM (JPA ENTITY SUBCLASS)
 * BasicClean specializes CleaningService for everyday surface maintenance.
 * Overrides calculatePrice(), getIncludes(), and getDuration().
 * ============================================================================
 */
@Entity
@DiscriminatorValue("BASIC")
public class BasicClean extends CleaningService {
    private static final long serialVersionUID = 1L;

    public static final String ID = "basic-clean";
    public static final BigDecimal PRICE = BigDecimal.valueOf(25);
    public static final String DURATION = "1-2 days";

    public BasicClean() {
        super(
                ID,
                "Basic Clean",
                "Surface cleaning, lace wash, and deodorization for everyday freshness.",
                PRICE,
                DURATION,
                4.8,
                342,
                false,
                "Droplets",
                "from-blue-500/20 to-cyan-500/10"
        );
    }

    @Override
    public Money calculatePrice(Set<AddOn> addOns) {
        Money total = Money.of(getBasePrice());
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
                "Surface dirt removal",
                "Lace wash & whitening",
                "Deodorization",
                "Quick dry"
        );
    }

    @Override
    public String getDuration() {
        return DURATION;
    }
}
