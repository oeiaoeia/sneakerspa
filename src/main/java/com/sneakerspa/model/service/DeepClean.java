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
 * DeepClean specializes CleaningService for heavy dirt, stained soles, and deep cleans.
 * Marked as our flagship popular service.
 * ============================================================================
 */
@Entity
@DiscriminatorValue("DEEP")
public class DeepClean extends CleaningService {
    private static final long serialVersionUID = 1L;

    public static final String ID = "deep-clean";
    public static final BigDecimal PRICE = BigDecimal.valueOf(45);
    public static final String DURATION = "2-3 days";

    public DeepClean() {
        super(
                ID,
                "Deep Clean",
                "Full disassembly cleaning, stain removal, and sole restoration.",
                PRICE,
                DURATION,
                4.9,
                528,
                true,
                "Brush",
                "from-purple-500/20 to-blue-500/10"
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
                "Full disassembly",
                "Deep stain removal",
                "Sole whitening & restoration",
                "Insole replacement",
                "Protective coating"
        );
    }

    @Override
    public String getDuration() {
        return DURATION;
    }
}
