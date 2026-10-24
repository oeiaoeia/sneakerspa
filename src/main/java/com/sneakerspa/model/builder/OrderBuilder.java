package com.sneakerspa.model.builder;

import com.sneakerspa.entity.*;
import com.sneakerspa.model.service.AddOn;
import com.sneakerspa.model.service.CleaningService;
import com.sneakerspa.model.strategy.PricingStrategy;
import com.sneakerspa.model.strategy.StandardPricing;
import com.sneakerspa.model.vo.Money;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * ============================================================================
 * OOP DESIGN PATTERN: BUILDER PATTERN
 * OrderBuilder constructs complex OrderEntity objects step-by-step.
 * It coordinates polymorphic subtotal calculations, strategy-based discount
 * evaluation, initial tracking timeline creation, and validation.
 * ============================================================================
 */
public class OrderBuilder {

    private UserEntity customer;
    private String street;
    private String city;
    private String zip;
    private String scheduledDate;
    private String scheduledTimeSlot;
    private String specialInstructions;
    private String promoCode;
    private PricingStrategy pricingStrategy = new StandardPricing();

    private final List<OrderItemEntity> orderItems = new ArrayList<>();
    private final List<OrderPhotoEntity> photos = new ArrayList<>();
    private Money calculatedSubtotal = Money.ZERO;

    public static OrderBuilder newOrder() {
        return new OrderBuilder();
    }

    public OrderBuilder forCustomer(UserEntity customer) {
        this.customer = customer;
        return this;
    }

    public OrderBuilder withAddress(String street, String city, String zip) {
        this.street = street;
        this.city = city;
        this.zip = zip;
        return this;
    }

    public OrderBuilder scheduledFor(String date, String timeSlot) {
        this.scheduledDate = date;
        this.scheduledTimeSlot = timeSlot;
        return this;
    }

    public OrderBuilder withInstructions(String instructions) {
        this.specialInstructions = instructions;
        return this;
    }

    public OrderBuilder withPromoCode(String promoCode) {
        this.promoCode = promoCode;
        return this;
    }

    public OrderBuilder usingPricingStrategy(PricingStrategy strategy) {
        if (strategy != null) {
            this.pricingStrategy = strategy;
        }
        return this;
    }

    /**
     * POLYMORPHISM IN ACTION:
     * Adds an order item by evaluating CleaningService.calculatePrice(addOns) polymorphically!
     */
    public OrderBuilder addServiceItem(CleaningService service, Set<AddOn> addOns) {
        Objects.requireNonNull(service, "Service cannot be null");
        Set<AddOn> safeAddOns = addOns != null ? addOns : Collections.emptySet();

        // Calculate item price polymorphically
        Money itemPrice = service.calculatePrice(safeAddOns);
        calculatedSubtotal = calculatedSubtotal.add(itemPrice);

        List<String> addOnNames = safeAddOns.stream().map(AddOn::getName).toList();
        String summary = addOnNames.isEmpty() ? "" : String.join(", ", addOnNames);

        OrderItemEntity itemEntity = new OrderItemEntity(
                service.getId(),
                service.getName(),
                itemPrice.getAmount(),
                summary
        );
        orderItems.add(itemEntity);
        return this;
    }

    public OrderBuilder addPhoto(int slotNumber, String slotLabel, String photoUrl, String originalFilename, Long fileSize) {
        OrderPhotoEntity photo = new OrderPhotoEntity(slotNumber, slotLabel, photoUrl, originalFilename, fileSize);
        photos.add(photo);
        return this;
    }

    public OrderEntity build() {
        if (customer == null) {
            throw new IllegalStateException("Order must belong to a Customer");
        }
        if (orderItems.isEmpty()) {
            throw new IllegalStateException("Order must contain at least one service item");
        }
        if (street == null || street.trim().isEmpty()) {
            throw new IllegalStateException("Order address street is required");
        }

        OrderEntity order = new OrderEntity();
        order.setCustomer(customer);
        order.setStreet(street.trim());
        order.setCity(city != null && !city.trim().isEmpty() ? city.trim() : "New York");
        order.setZip(zip != null && !zip.trim().isEmpty() ? zip.trim() : "10001");
        order.setScheduledDate(scheduledDate != null ? scheduledDate : "Today");
        order.setScheduledTimeSlot(scheduledTimeSlot != null ? scheduledTimeSlot : "2:00 PM");
        order.setSpecialInstructions(specialInstructions);
        order.setPromoCode(promoCode);

        // Generate tracking number SNK-XXXX
        int randomId = 1000 + new Random().nextInt(9000);
        order.setTrackingNumber("SNK-" + randomId);

        // Pricing calculations via Strategy Pattern
        Money discount = pricingStrategy.calculateDiscount(calculatedSubtotal);
        Money total = pricingStrategy.applyPricing(calculatedSubtotal);

        order.setSubtotal(calculatedSubtotal.getAmount());
        order.setDiscountAmount(discount.getAmount());
        order.setTotalAmount(total.getAmount());
        order.setPickupFree(true);
        order.setCurrentStatus(OrderStatus.PLACED);
        order.setDriverName("Mike R.");
        order.setEtaText("Tomorrow");
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        // Attach items and photos
        for (OrderItemEntity item : orderItems) {
            order.addOrderItem(item);
        }
        for (OrderPhotoEntity photo : photos) {
            order.addPhoto(photo);
        }

        // Initialize status history timeline
        // 1. Placed
        OrderStatusHistoryEntity placedStep = new OrderStatusHistoryEntity(
                OrderStatus.PLACED,
                "Order Placed",
                "Today, just now",
                "Order confirmed and sent to dispatch team",
                true,
                false
        );
        order.addStatusHistory(placedStep);

        // 2. Pickup Scheduled
        OrderStatusHistoryEntity pickupStep = new OrderStatusHistoryEntity(
                OrderStatus.PICKUP_SCHEDULED,
                "Pickup Scheduled",
                order.getScheduledDate() + ", " + order.getScheduledTimeSlot(),
                "Driver assigned: " + order.getDriverName(),
                true,
                true
        );
        order.addStatusHistory(pickupStep);

        // 3. Picked Up (future)
        OrderStatusHistoryEntity pickedUpStep = new OrderStatusHistoryEntity(
                OrderStatus.PICKED_UP,
                "Picked Up",
                "Pending pickup",
                "Shoes collected from your address",
                false,
                false
        );
        order.addStatusHistory(pickedUpStep);

        // 4. Cleaning
        OrderStatusHistoryEntity cleaningStep = new OrderStatusHistoryEntity(
                OrderStatus.CLEANING,
                "Cleaning in Progress",
                "In progress",
                "Currently being deep cleaned by our experts",
                false,
                false
        );
        order.addStatusHistory(cleaningStep);

        // 5. Quality Check
        OrderStatusHistoryEntity qcStep = new OrderStatusHistoryEntity(
                OrderStatus.QUALITY_CHECK,
                "Quality Check",
                "Estimated: Tomorrow",
                "Final inspection before delivery",
                false,
                false
        );
        order.addStatusHistory(qcStep);

        // 6. Out for Delivery
        OrderStatusHistoryEntity deliveryStep = new OrderStatusHistoryEntity(
                OrderStatus.OUT_FOR_DELIVERY,
                "Out for Delivery",
                "Estimated: Tomorrow 4PM",
                "Will be delivered to your address",
                false,
                false
        );
        order.addStatusHistory(deliveryStep);

        return order;
    }
}
