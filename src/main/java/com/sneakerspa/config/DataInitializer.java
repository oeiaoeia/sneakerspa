package com.sneakerspa.config;

import com.sneakerspa.entity.*;
import com.sneakerspa.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CleaningServiceRepository serviceRepository;
    private final AddOnRepository addOnRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            CleaningServiceRepository serviceRepository,
            AddOnRepository addOnRepository,
            PromoCodeRepository promoCodeRepository,
            UserRepository userRepository,
            AddressRepository addressRepository,
            OrderRepository orderRepository,
            ReviewRepository reviewRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.serviceRepository = serviceRepository;
        this.addOnRepository = addOnRepository;
        this.promoCodeRepository = promoCodeRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedServices();
        seedAddOns();
        seedPromoCodes();
        seedReviews();
        seedUsersAndOrders();
    }

    private void seedServices() {
        if (serviceRepository.count() > 0) return;

        serviceRepository.save(new CleaningServiceEntity(
                "basic-clean",
                "Basic Clean",
                "Surface cleaning, lace wash, and deodorization for everyday freshness.",
                BigDecimal.valueOf(25),
                "1-2 days",
                4.8,
                342,
                false,
                "Droplets",
                "from-blue-500/20 to-cyan-500/10",
                List.of("Surface dirt removal", "Lace wash & whitening", "Deodorization", "Quick dry")
        ));

        serviceRepository.save(new CleaningServiceEntity(
                "deep-clean",
                "Deep Clean",
                "Full disassembly cleaning, stain removal, and sole restoration.",
                BigDecimal.valueOf(45),
                "2-3 days",
                4.9,
                528,
                true,
                "Brush",
                "from-purple-500/20 to-blue-500/10",
                List.of("Full disassembly", "Deep stain removal", "Sole whitening & restoration", "Insole replacement", "Protective coating")
        ));

        serviceRepository.save(new CleaningServiceEntity(
                "premium-restoration",
                "Premium Restoration",
                "Complete restoration including color touch-up, re-gluing, and protective coating.",
                BigDecimal.valueOf(75),
                "3-5 days",
                5.0,
                189,
                false,
                "SprayCan",
                "from-amber-500/20 to-orange-500/10",
                List.of("Everything in Deep Clean", "Color touch-up & repainting", "Re-gluing & structural repair", "Premium protective coating", "Before/after photo report")
        ));

        serviceRepository.save(new CleaningServiceEntity(
                "suede-care",
                "Suede Care",
                "Specialized suede and nubuck treatment with waterproof protection.",
                BigDecimal.valueOf(55),
                "2-4 days",
                4.9,
                215,
                false,
                "Shield",
                "from-emerald-500/20 to-teal-500/10",
                List.of("Gentle suede brushing", "Stain & scuff removal", "Color restoration", "Waterproof nano-coating", "Suede protector spray")
        ));
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

    private void seedUsersAndOrders() {
        // Seed Admin user
        if (!userRepository.existsByEmail("admin@sneakerspa.com")) {
            UserEntity admin = new UserEntity(
                    "Spa Admin",
                    "admin@sneakerspa.com",
                    passwordEncoder.encode("admin123"),
                    Role.ADMIN
            );
            userRepository.save(admin);
        }

        // Seed Customer user
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

            UserEntity savedAlex = userRepository.save(alex);

            // Saved addresses
            AddressEntity homeAddr = new AddressEntity("Home", "123 Main Street, Apt 4B", "New York", "10001", true);
            homeAddr.setUser(savedAlex);
            addressRepository.save(homeAddr);

            AddressEntity officeAddr = new AddressEntity("Office", "456 Business Ave, Floor 12", "New York", "10016", false);
            officeAddr.setUser(savedAlex);
            addressRepository.save(officeAddr);

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

            OrderItemEntity item = new OrderItemEntity("deep-clean", "Deep Clean", BigDecimal.valueOf(45), "Protective Coating");
            activeOrder.addOrderItem(item);

            // 3 sample uploaded photos
            activeOrder.addPhoto(new OrderPhotoEntity(1, "Front", "/images/hero-sneaker.jpg", "front.jpg", 102400L));
            activeOrder.addPhoto(new OrderPhotoEntity(2, "Back", "/images/before-after.jpg", "back.jpg", 102400L));
            activeOrder.addPhoto(new OrderPhotoEntity(3, "Sole", "/images/cleaning-process.jpg", "sole.jpg", 102400L));

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

            // Seed Past Orders matching Orders.tsx
            // 1. SNK-2831: Basic Clean, $25, Delivered, Mar 15, 2026, rating: 5
            OrderEntity past1 = new OrderEntity();
            past1.setTrackingNumber("SNK-2831");
            past1.setCustomer(savedAlex);
            past1.setStreet("123 Main Street, Apt 4B");
            past1.setCity("New York");
            past1.setZip("10001");
            past1.setSubtotal(BigDecimal.valueOf(25));
            past1.setDiscountAmount(BigDecimal.ZERO);
            past1.setTotalAmount(BigDecimal.valueOf(25));
            past1.setCurrentStatus(OrderStatus.DELIVERED);
            past1.setRating(5);
            past1.setRatingSubmittedAt(LocalDateTime.now().minusDays(10));
            past1.setCreatedAt(LocalDateTime.now().minusDays(15));
            past1.addOrderItem(new OrderItemEntity("basic-clean", "Basic Clean", BigDecimal.valueOf(25), ""));
            orderRepository.save(past1);

            // 2. SNK-2790: Suede Care, $55, Delivered, Feb 28, 2026, unrated
            OrderEntity past2 = new OrderEntity();
            past2.setTrackingNumber("SNK-2790");
            past2.setCustomer(savedAlex);
            past2.setStreet("123 Main Street, Apt 4B");
            past2.setCity("New York");
            past2.setZip("10001");
            past2.setSubtotal(BigDecimal.valueOf(55));
            past2.setDiscountAmount(BigDecimal.ZERO);
            past2.setTotalAmount(BigDecimal.valueOf(55));
            past2.setCurrentStatus(OrderStatus.DELIVERED);
            past2.setCreatedAt(LocalDateTime.now().minusDays(30));
            past2.addOrderItem(new OrderItemEntity("suede-care", "Suede Care", BigDecimal.valueOf(55), ""));
            orderRepository.save(past2);

            // 3. SNK-2745: Deep Clean, $45, Delivered, Feb 10, 2026, rating: 4
            OrderEntity past3 = new OrderEntity();
            past3.setTrackingNumber("SNK-2745");
            past3.setCustomer(savedAlex);
            past3.setStreet("123 Main Street, Apt 4B");
            past3.setCity("New York");
            past3.setZip("10001");
            past3.setSubtotal(BigDecimal.valueOf(45));
            past3.setDiscountAmount(BigDecimal.ZERO);
            past3.setTotalAmount(BigDecimal.valueOf(45));
            past3.setCurrentStatus(OrderStatus.DELIVERED);
            past3.setRating(4);
            past3.setRatingSubmittedAt(LocalDateTime.now().minusDays(45));
            past3.setCreatedAt(LocalDateTime.now().minusDays(48));
            past3.addOrderItem(new OrderItemEntity("deep-clean", "Deep Clean", BigDecimal.valueOf(45), ""));
            orderRepository.save(past3);
        }
    }
}
