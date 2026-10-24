package com.sneakerspa.config;

import com.sneakerspa.entity.*;
import com.sneakerspa.model.service.*;
import com.sneakerspa.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CleaningServiceRepository serviceRepository;
    private final AddOnRepository addOnRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    public DataInitializer(
            CleaningServiceRepository serviceRepository,
            AddOnRepository addOnRepository,
            PromoCodeRepository promoCodeRepository,
            UserRepository userRepository,
            AddressRepository addressRepository,
            OrderRepository orderRepository,
            ReviewRepository reviewRepository,
            PasswordEncoder passwordEncoder,
            Environment environment
    ) {
        this.serviceRepository = serviceRepository;
        this.addOnRepository = addOnRepository;
        this.promoCodeRepository = promoCodeRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
        seedServices();
        seedAddOns();
        seedPromoCodes();
        seedReviews();

        List<String> activeProfiles = Arrays.asList(environment.getActiveProfiles());
        boolean isProd = activeProfiles.contains("prod");
        boolean isDev = activeProfiles.contains("dev") || activeProfiles.isEmpty();

        if (isDev) {
            log.info("Running in DEV profile: seeding demo users and orders.");
            seedDevUsersAndOrders();
        } else if (isProd) {
            log.info("Running in PROD profile: demo users skipped. Checking ADMIN_EMAIL & ADMIN_PASSWORD env vars.");
            seedProdAdmin();
        }
    }

    private void seedServices() {
        if (serviceRepository.count() > 0) return;

        // Subclasses mapped via SINGLE_TABLE JPA inheritance
        serviceRepository.save(new BasicClean());
        serviceRepository.save(new DeepClean());
        serviceRepository.save(new PremiumRestoration());
        serviceRepository.save(new SuedeCare());
        log.info("Seeded 4 polymorphic CleaningService entities.");
    }

    private void seedAddOns() {
        if (addOnRepository.count() > 0) return;

        addOnRepository.save(new AddOnEntity("express", "Express (24h)", BigDecimal.valueOf(15), "Guaranteed turnaround within 24 hours"));
        addOnRepository.save(new AddOnEntity("coating", "Protective Coating", BigDecimal.valueOf(10), "Hydrophobic nano-coating to repel dirt and liquids"));
        addOnRepository.save(new AddOnEntity("laces", "Lace Swap (White)", BigDecimal.valueOf(5), "Premium replacement athletic laces"));
    }

    private void seedPromoCodes() {
        if (promoCodeRepository.count() > 0) return;

        promoCodeRepository.save(new PromoCodeEntity("CLEAN20", 20.0, true));
    }

    private void seedReviews() {
        if (reviewRepository.count() > 0) return;

        reviewRepository.save(new ReviewEntity("Sarah M.", 5, "My Air Jordans look brand new! Incredible service.", "2 days ago", "S", 12));
        reviewRepository.save(new ReviewEntity("James K.", 5, "Fast pickup, perfect cleaning. Will use again!", "5 days ago", "J", 8));
        reviewRepository.save(new ReviewEntity("Maria L.", 5, "The suede care saved my favorite boots. Thank you!", "1 week ago", "M", 15));
    }

    private void seedProdAdmin() {
        String adminEmail = environment.getProperty("ADMIN_EMAIL");
        String adminPassword = environment.getProperty("ADMIN_PASSWORD");

        if (adminEmail != null && !adminEmail.isBlank() && adminPassword != null && !adminPassword.isBlank()) {
            String cleanEmail = adminEmail.trim().toLowerCase();
            if (!userRepository.existsByEmail(cleanEmail)) {
                UserEntity admin = new UserEntity(
                        "Administrator",
                        cleanEmail,
                        passwordEncoder.encode(adminPassword.trim()),
                        Role.ADMIN
                );
                userRepository.save(admin);
                log.info("Production admin created successfully from ADMIN_EMAIL env var: {}", cleanEmail);
            }
        } else {
            log.warn("Production profile active, but ADMIN_EMAIL or ADMIN_PASSWORD environment variable not set. No admin seeded.");
        }
    }

    private void seedDevUsersAndOrders() {
        // Seed Dev Admin
        if (!userRepository.existsByEmail("admin@sneakerspa.com")) {
            UserEntity admin = new UserEntity(
                    "Spa Admin",
                    "admin@sneakerspa.com",
                    passwordEncoder.encode("admin123"),
                    Role.ADMIN
            );
            userRepository.save(admin);
        }

        // Seed Customer user Alex Johnson (matching prototype)
        if (!userRepository.existsByEmail("alex@email.com")) {
            UserEntity alex = new UserEntity(
                    "Alex Johnson",
                    "alex@email.com",
                    passwordEncoder.encode("password123"),
                    Role.CUSTOMER
            );
            alex.setLoyaltyPoints(1250);
            alex.setHasActiveSubscription(true);
            alex.setSubscriptionNextBilling("Apr 15, 2026");
            alex.setCleaningsLeft(1);
            alex.setNotificationsEnabled(true);
            alex.setDarkModeEnabled(true);
            alex.setCreatedAt(LocalDateTime.of(2025, 1, 15, 9, 30)); // Member Since Jan '25

            UserEntity savedAlex = userRepository.save(alex);

            // Saved addresses
            AddressEntity homeAddr = new AddressEntity("Home", "123 Main Street, Apt 4B", "New York", "10001", true);
            homeAddr.setUser(savedAlex);
            addressRepository.save(homeAddr);

            AddressEntity officeAddr = new AddressEntity("Office", "456 Business Ave, Floor 12", "New York", "10016", false);
            officeAddr.setUser(savedAlex);
            addressRepository.save(officeAddr);

            CleaningService basicClean = serviceRepository.findById("basic-clean").orElse(null);
            CleaningService deepClean = serviceRepository.findById("deep-clean").orElse(null);
            CleaningService premiumRestoration = serviceRepository.findById("premium-restoration").orElse(null);
            CleaningService suedeCare = serviceRepository.findById("suede-care").orElse(null);

            // Seed Active Order #SNK-2847
            OrderEntity activeOrder = new OrderEntity();
            activeOrder.setTrackingNumber("SNK-2847");
            activeOrder.setCustomer(savedAlex);
            activeOrder.setStreet("123 Main Street, Apt 4B");
            activeOrder.setCity("New York");
            activeOrder.setZip("10001");
            activeOrder.setScheduledDate("Today");
            activeOrder.setScheduledTimeSlot("2:00 PM");
            activeOrder.setSubtotal(BigDecimal.valueOf(45));
            activeOrder.setDiscountAmount(BigDecimal.ZERO);
            activeOrder.setTotalAmount(BigDecimal.valueOf(45));
            activeOrder.setCurrentStatus(OrderStatus.CLEANING);
            activeOrder.setDriverName("Mike R.");
            activeOrder.setEtaText("Tomorrow");
            activeOrder.setPickupFree(true);
            activeOrder.setCreatedAt(LocalDateTime.now().minusHours(4));
            activeOrder.setUpdatedAt(LocalDateTime.now().minusHours(1));

            OrderItemEntity item = new OrderItemEntity(deepClean, BigDecimal.valueOf(45), "Protective Coating");
            activeOrder.addOrderItem(item);

            // Seed real BLOB photos for demo order
            try {
                byte[] heroBytes = new ClassPathResource("static/images/hero-sneaker.jpg").getContentAsByteArray();
                byte[] beforeAfterBytes = new ClassPathResource("static/images/before-after.jpg").getContentAsByteArray();
                byte[] processBytes = new ClassPathResource("static/images/cleaning-process.jpg").getContentAsByteArray();

                activeOrder.addPhoto(new OrderPhotoEntity(1, "Front", heroBytes, "image/jpeg", "front.jpg", (long) heroBytes.length));
                activeOrder.addPhoto(new OrderPhotoEntity(2, "Back", beforeAfterBytes, "image/jpeg", "back.jpg", (long) beforeAfterBytes.length));
                activeOrder.addPhoto(new OrderPhotoEntity(3, "Sole", processBytes, "image/jpeg", "sole.jpg", (long) processBytes.length));
            } catch (Exception e) {
                log.warn("Could not read classpath images for BLOB seed: {}", e.getMessage());
            }

            // Status tracking steps matching Orders.tsx
            activeOrder.addStatusHistory(new OrderStatusHistoryEntity(
                    OrderStatus.PICKUP_SCHEDULED,
                    "Pickup Scheduled",
                    "Today, 2:00 PM",
                    "Driver assigned: Mike R.",
                    true,
                    false
            ));
            activeOrder.addStatusHistory(new OrderStatusHistoryEntity(
                    OrderStatus.PICKED_UP,
                    "Picked Up",
                    "Today, 2:15 PM",
                    "Shoes collected from your address",
                    true,
                    false
            ));
            activeOrder.addStatusHistory(new OrderStatusHistoryEntity(
                    OrderStatus.CLEANING,
                    "Cleaning in Progress",
                    "In progress",
                    "Currently being deep cleaned by our experts",
                    false,
                    true
            ));
            activeOrder.addStatusHistory(new OrderStatusHistoryEntity(
                    OrderStatus.QUALITY_CHECK,
                    "Quality Check",
                    "Estimated: Tomorrow",
                    "Final inspection before delivery",
                    false,
                    false
            ));
            activeOrder.addStatusHistory(new OrderStatusHistoryEntity(
                    OrderStatus.OUT_FOR_DELIVERY,
                    "Out for Delivery",
                    "Estimated: Tomorrow 4PM",
                    "Will be delivered to your address",
                    false,
                    false
            ));

            orderRepository.save(activeOrder);

            // Seed Past Orders (11 past orders + 1 active = 12 total orders)
            // 1. SNK-2831: Basic Clean, $25, Delivered, Mar 15, 2026, rating: 5
            createPastOrder(savedAlex, "SNK-2831", basicClean, 25, OrderStatus.DELIVERED, 5, 15);

            // 2. SNK-2790: Suede Care, $55, Delivered, Feb 28, 2026, unrated
            createPastOrder(savedAlex, "SNK-2790", suedeCare, 55, OrderStatus.DELIVERED, null, 30);

            // 3. SNK-2745: Deep Clean, $45, Delivered, Feb 10, 2026, rating: 4
            createPastOrder(savedAlex, "SNK-2745", deepClean, 45, OrderStatus.DELIVERED, 4, 48);

            // 4. SNK-2712: Basic Clean, $25, Delivered, Jan 29, 2026, rating: 5
            createPastOrder(savedAlex, "SNK-2712", basicClean, 25, OrderStatus.DELIVERED, 5, 60);

            // 5. SNK-2688: Premium Restoration, $75, Delivered, Jan 14, 2026, rating: 5
            createPastOrder(savedAlex, "SNK-2688", premiumRestoration, 75, OrderStatus.DELIVERED, 5, 75);

            // 6. SNK-2640: Deep Clean, $45, Delivered, Dec 20, 2025, rating: 4
            createPastOrder(savedAlex, "SNK-2640", deepClean, 45, OrderStatus.DELIVERED, 4, 100);

            // 7. SNK-2601: Basic Clean, $25, Delivered, Nov 18, 2025, rating: 5
            createPastOrder(savedAlex, "SNK-2601", basicClean, 25, OrderStatus.DELIVERED, 5, 132);

            // 8. SNK-2550: Suede Care, $55, Delivered, Oct 25, 2025, rating: 5
            createPastOrder(savedAlex, "SNK-2550", suedeCare, 55, OrderStatus.DELIVERED, 5, 156);

            // 9. SNK-2510: Deep Clean, $45, Delivered, Sep 12, 2025, rating: 4
            createPastOrder(savedAlex, "SNK-2510", deepClean, 45, OrderStatus.DELIVERED, 4, 199);

            // 10. SNK-2470: Basic Clean, $25, Delivered, Aug 05, 2025, rating: 5
            createPastOrder(savedAlex, "SNK-2470", basicClean, 25, OrderStatus.DELIVERED, 5, 237);

            // 11. SNK-2420: Premium Restoration, $75, Delivered, Jul 19, 2025, rating: 5
            createPastOrder(savedAlex, "SNK-2420", premiumRestoration, 75, OrderStatus.DELIVERED, 5, 254);

            log.info("Seeded Alex Johnson with 1 active and 11 past orders (12 total orders).");
        }
    }

    private void createPastOrder(UserEntity user, String trackingNumber, CleaningService service, int price, OrderStatus status, Integer rating, int daysAgo) {
        OrderEntity past = new OrderEntity();
        past.setTrackingNumber(trackingNumber);
        past.setCustomer(user);
        past.setStreet("123 Main Street, Apt 4B");
        past.setCity("New York");
        past.setZip("10001");
        past.setSubtotal(BigDecimal.valueOf(price));
        past.setDiscountAmount(BigDecimal.ZERO);
        past.setTotalAmount(BigDecimal.valueOf(price));
        past.setCurrentStatus(status);
        past.setRating(rating);
        if (rating != null) {
            past.setRatingSubmittedAt(LocalDateTime.now().minusDays(daysAgo - 2));
        }
        past.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
        past.addOrderItem(new OrderItemEntity(service, BigDecimal.valueOf(price), ""));
        orderRepository.save(past);
    }
}
