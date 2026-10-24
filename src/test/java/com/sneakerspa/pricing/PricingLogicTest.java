package com.sneakerspa.pricing;

import com.sneakerspa.model.service.*;
import com.sneakerspa.model.strategy.PricingStrategy;
import com.sneakerspa.model.strategy.PromoPricing;
import com.sneakerspa.model.strategy.StandardPricing;
import com.sneakerspa.model.strategy.SubscriberPricing;
import com.sneakerspa.model.vo.Money;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ============================================================================
 * UNIT TESTS: OOP PRICING LOGIC
 * Tests polymorphic calculation, add-ons accumulation, strategy discounts,
 * and multi-service order totals.
 * ============================================================================
 */
public class PricingLogicTest {

    private final AddOn express = new AddOn("express", "Express (24h)", Money.of(15), "24h");
    private final AddOn coating = new AddOn("coating", "Protective Coating", Money.of(10), "Hydrophobic");
    private final AddOn laces = new AddOn("laces", "Lace Swap (White)", Money.of(5), "White laces");

    @Test
    @DisplayName("Polymorphism: Base prices for each concrete CleaningService subclass")
    void testPolymorphicBasePrices() {
        CleaningService basic = ServiceFactory.createService("basic-clean");
        CleaningService deep = ServiceFactory.createService("deep-clean");
        CleaningService premium = ServiceFactory.createService("premium-restoration");
        CleaningService suede = ServiceFactory.createService("suede-care");

        assertEquals(Money.of(25), basic.calculatePrice(Collections.emptySet()));
        assertEquals(Money.of(45), deep.calculatePrice(Collections.emptySet()));
        assertEquals(Money.of(75), premium.calculatePrice(Collections.emptySet()));
        assertEquals(Money.of(55), suede.calculatePrice(Collections.emptySet()));
    }

    @Test
    @DisplayName("Polymorphism: Add-ons correctly accumulate on a CleaningService")
    void testServiceWithAddOns() {
        CleaningService deep = new DeepClean();
        Set<AddOn> addOns = Set.of(express, coating); // 15 + 10 = 25

        Money total = deep.calculatePrice(addOns); // 45 + 25 = 70
        assertEquals(Money.of(70), total);
        assertEquals(70, total.toIntDollars());
    }

    @Test
    @DisplayName("Strategy Pattern: Standard pricing applies zero discount")
    void testStandardPricingStrategy() {
        PricingStrategy standard = new StandardPricing();
        Money subtotal = Money.of(100);

        Money discount = standard.calculateDiscount(subtotal);
        Money total = standard.applyPricing(subtotal);

        assertEquals(Money.ZERO, discount);
        assertEquals(Money.of(100), total);
    }

    @Test
    @DisplayName("Strategy Pattern: Promo CLEAN20 applies 20% discount")
    void testPromoPricingStrategy() {
        PricingStrategy promo = PromoPricing.ofClean20();
        Money subtotal = Money.of(100);

        Money discount = promo.calculateDiscount(subtotal);
        Money total = promo.applyPricing(subtotal);

        assertEquals(Money.of(20), discount);
        assertEquals(Money.of(80), total);
    }

    @Test
    @DisplayName("Strategy Pattern: Subscriber pricing applies 20% discount")
    void testSubscriberPricingStrategy() {
        PricingStrategy subscriber = new SubscriberPricing(20.0);
        Money subtotal = Money.of(45); // Deep Clean base

        Money discount = subscriber.calculateDiscount(subtotal); // 45 * 0.20 = 9.00
        Money total = subscriber.applyPricing(subtotal); // 36.00

        assertEquals(Money.of(9), discount);
        assertEquals(Money.of(36), total);
    }

    @Test
    @DisplayName("Multi-Service Order: Sum of multiple services plus add-ons minus promo")
    void testMultiServiceOrderCalculation() {
        // Multi-service: Deep Clean ($45) + Basic Clean ($25) = $70 base
        CleaningService service1 = new DeepClean();
        CleaningService service2 = new BasicClean();

        Set<AddOn> addOns = Set.of(coating, laces); // 10 + 5 = $15

        // Polymorphic evaluation across List<CleaningService>
        List<CleaningService> items = List.of(service1, service2);
        Money subtotal = Money.ZERO;
        boolean first = true;
        for (CleaningService s : items) {
            if (first) {
                subtotal = subtotal.add(s.calculatePrice(addOns)); // 45 + 15 = 60
                first = false;
            } else {
                subtotal = subtotal.add(s.calculatePrice(Collections.emptySet())); // 25
            }
        }

        // Subtotal should be 60 + 25 = 85
        assertEquals(Money.of(85), subtotal);

        // Apply CLEAN20 promo strategy (20% of 85 = 17)
        PricingStrategy promo = PromoPricing.ofClean20();
        Money discount = promo.calculateDiscount(subtotal);
        Money finalTotal = promo.applyPricing(subtotal);

        assertEquals(Money.of(17), discount);
        assertEquals(Money.of(68), finalTotal);
    }

    @Test
    @DisplayName("Encapsulation & Immutability: Money value object enforces invariants")
    void testMoneyInvariants() {
        Money m1 = Money.of(25);
        Money m2 = Money.of(15);

        Money sum = m1.add(m2);
        assertEquals(Money.of(40), sum);
        assertEquals(Money.of(25), m1); // Immutable, m1 unchanged

        Money diff = m1.subtract(m2);
        assertEquals(Money.of(10), diff);

        // Cannot create negative money
        assertThrows(IllegalArgumentException.class, () -> new Money(java.math.BigDecimal.valueOf(-5)));
    }
}
