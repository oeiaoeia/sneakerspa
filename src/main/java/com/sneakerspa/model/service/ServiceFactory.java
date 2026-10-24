package com.sneakerspa.model.service;

import java.util.List;
import java.util.Locale;

/**
 * ============================================================================
 * OOP DESIGN PATTERN: FACTORY PATTERN
 * ServiceFactory encapsulates instantiation logic for all CleaningService
 * subclasses, decoupling client code from concrete implementations.
 * ============================================================================
 */
public final class ServiceFactory {

    private ServiceFactory() {
        // Prevent direct instantiation
    }

    public static CleaningService createService(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("Service identifier cannot be empty");
        }

        String normalized = identifier.trim().toLowerCase(Locale.ROOT).replace(" ", "-").replace("_", "-");

        return switch (normalized) {
            case "basic-clean", "basic", "basicclean" -> new BasicClean();
            case "deep-clean", "deep", "deepclean" -> new DeepClean();
            case "premium-restoration", "premium", "premiumrestoration" -> new PremiumRestoration();
            case "suede-care", "suede", "suedecare" -> new SuedeCare();
            default -> throw new IllegalArgumentException("Unknown cleaning service: " + identifier);
        };
    }

    public static List<CleaningService> getAllStandardServices() {
        return List.of(
                new BasicClean(),
                new DeepClean(),
                new PremiumRestoration(),
                new SuedeCare()
        );
    }
}
