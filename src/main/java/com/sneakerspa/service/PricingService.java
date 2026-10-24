package com.sneakerspa.service;

import com.sneakerspa.entity.AddOnEntity;
import com.sneakerspa.entity.PromoCodeEntity;
import com.sneakerspa.entity.UserEntity;
import com.sneakerspa.exception.InvalidPromoCodeException;
import com.sneakerspa.model.service.AddOn;
import com.sneakerspa.model.service.CleaningService;
import com.sneakerspa.model.service.ServiceFactory;
import com.sneakerspa.model.strategy.PricingStrategy;
import com.sneakerspa.model.strategy.PromoPricing;
import com.sneakerspa.model.strategy.StandardPricing;
import com.sneakerspa.model.strategy.SubscriberPricing;
import com.sneakerspa.model.vo.Money;
import com.sneakerspa.repository.AddOnRepository;
import com.sneakerspa.repository.PromoCodeRepository;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * ============================================================================
 * OOP DOMAIN SERVICE: PRICING SERVICE
 * Server-side authoritative calculation of sneaker care orders.
 * Applies:
 *   - Polymorphism (looping over CleaningService and calling calculatePrice())
 *   - Strategy Pattern (selecting PromoPricing, SubscriberPricing, or StandardPricing)
 *   - Encapsulation & Immutability (Money value object)
 * ============================================================================
 */
@Service
public class PricingService {

    private final PromoCodeRepository promoCodeRepository;
    private final AddOnRepository addOnRepository;

    public PricingService(PromoCodeRepository promoCodeRepository, AddOnRepository addOnRepository) {
        this.promoCodeRepository = promoCodeRepository;
        this.addOnRepository = addOnRepository;
    }

    public record PricingCalculationResult(
            Money subtotal,
            Money discount,
            Money total,
            PricingStrategy strategyUsed,
            boolean promoApplied
    ) {}

    /**
     * Calculates the order total polymorphically across all selected services
     * and their associated add-ons.
     */
    public PricingCalculationResult calculateOrderPricing(
            List<String> serviceIds,
            List<String> addOnIds,
            String promoCode,
            UserEntity user
    ) {
        if (serviceIds == null || serviceIds.isEmpty()) {
            throw new IllegalArgumentException("At least one service must be specified for pricing calculation");
        }

        // Convert string addOn IDs to domain AddOn objects
        Set<AddOn> addOns = resolveAddOns(addOnIds);

        // Convert service IDs to domain CleaningService polymorphic instances
        List<CleaningService> services = new ArrayList<>();
        for (String id : serviceIds) {
            services.add(ServiceFactory.createService(id));
        }

        // 1. Calculate subtotal polymorphically:
        // First service receives the selected add-ons (or distributed according to requirement)
        Money subtotal = Money.ZERO;
        boolean first = true;
        for (CleaningService service : services) {
            if (first) {
                // Polymorphic invocation: calculatePrice(addOns)
                subtotal = subtotal.add(service.calculatePrice(addOns));
                first = false;
            } else {
                // Subsequent services in multi-service order calculate their own price polymorphically
                subtotal = subtotal.add(service.calculatePrice(Collections.emptySet()));
            }
        }

        // 2. Determine pricing strategy (Strategy Pattern)
        PricingStrategy strategy = determineStrategy(promoCode, user);

        // 3. Apply pricing strategy
        Money discount = strategy.calculateDiscount(subtotal);
        Money finalTotal = strategy.applyPricing(subtotal);

        boolean promoApplied = strategy instanceof PromoPricing;

        return new PricingCalculationResult(subtotal, discount, finalTotal, strategy, promoApplied);
    }

    public PricingStrategy determineStrategy(String promoCode, UserEntity user) {
        // First priority: user provided valid promo code (e.g. CLEAN20 = 20% off)
        if (promoCode != null && !promoCode.trim().isEmpty()) {
            String trimmedCode = promoCode.trim();
            PromoCodeEntity promoEntity = promoCodeRepository.findByCodeIgnoreCase(trimmedCode)
                    .orElseThrow(() -> new InvalidPromoCodeException("Invalid promo code: " + trimmedCode));

            if (!promoEntity.isValid()) {
                throw new InvalidPromoCodeException("Promo code " + trimmedCode + " is expired or exhausted");
            }

            return new PromoPricing(promoEntity.getCode(), promoEntity.getDiscountPercentage());
        }

        // Second priority: active monthly subscriber benefit (20% off)
        if (user != null && user.isHasActiveSubscription()) {
            return new SubscriberPricing(20.0);
        }

        // Default: standard pricing
        return new StandardPricing();
    }

    public Set<AddOn> resolveAddOns(List<String> addOnIds) {
        if (addOnIds == null || addOnIds.isEmpty()) {
            return Collections.emptySet();
        }

        Set<AddOn> result = new HashSet<>();
        for (String id : addOnIds) {
            if (id == null || id.isBlank()) continue;
            String normalizedId = id.trim().toLowerCase();
            Optional<AddOnEntity> entityOpt = addOnRepository.findById(normalizedId);

            if (entityOpt.isPresent()) {
                AddOnEntity e = entityOpt.get();
                result.add(new AddOn(e.getId(), e.getName(), Money.of(e.getPrice()), e.getDescription()));
            } else {
                // Fallback known add-ons
                switch (normalizedId) {
                    case "express" -> result.add(new AddOn("express", "Express (24h)", Money.of(15), "24 hour turnaround"));
                    case "coating" -> result.add(new AddOn("coating", "Protective Coating", Money.of(10), "Repels water and dirt"));
                    case "laces" -> result.add(new AddOn("laces", "Lace Swap (White)", Money.of(5), "Premium white replacement laces"));
                }
            }
        }
        return result;
    }
}
