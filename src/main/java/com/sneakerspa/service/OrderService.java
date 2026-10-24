package com.sneakerspa.service;

import com.sneakerspa.dto.*;
import com.sneakerspa.entity.*;
import com.sneakerspa.exception.OrderNotFoundException;
import com.sneakerspa.exception.ResourceNotFoundException;
import com.sneakerspa.model.builder.OrderBuilder;
import com.sneakerspa.model.observer.StatusChangeSubject;
import com.sneakerspa.model.service.AddOn;
import com.sneakerspa.model.service.CleaningService;
import com.sneakerspa.model.service.ServiceFactory;
import com.sneakerspa.model.strategy.PricingStrategy;
import com.sneakerspa.model.vo.Money;
import com.sneakerspa.repository.OrderRepository;
import com.sneakerspa.repository.PromoCodeRepository;
import com.sneakerspa.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final PricingService pricingService;
    private final StatusChangeSubject statusSubject;

    private static final List<OrderStatus> TERMINAL_STATUSES = List.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED);

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            PromoCodeRepository promoCodeRepository,
            PricingService pricingService,
            StatusChangeSubject statusSubject
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.promoCodeRepository = promoCodeRepository;
        this.pricingService = pricingService;
        this.statusSubject = statusSubject;
    }

    @Transactional
    public OrderDto createOrder(String customerEmail, OrderCreateRequest request) {
        UserEntity customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerEmail));

        // 1. Resolve domain objects
        List<String> serviceIds = request.getServiceIds();
        if (serviceIds == null || serviceIds.isEmpty()) {
            throw new IllegalArgumentException("At least one service is required");
        }

        List<String> addOnIds = request.getAddOnIds() != null ? request.getAddOnIds() : Collections.emptyList();
        Set<AddOn> domainAddOns = pricingService.resolveAddOns(addOnIds);

        // 2. Authoritative Server-side pricing via Strategy Pattern
        PricingService.PricingCalculationResult pricingResult =
                pricingService.calculateOrderPricing(serviceIds, addOnIds, request.getPromoCode(), customer);

        // 3. Assemble complete order using Builder Pattern
        OrderBuilder builder = OrderBuilder.newOrder()
                .forCustomer(customer)
                .withAddress(request.getAddress().getStreet(), request.getAddress().getCity(), request.getAddress().getZip())
                .scheduledFor(request.getScheduledDate(), request.getScheduledTimeSlot())
                .withInstructions(request.getSpecialInstructions())
                .withPromoCode(request.getPromoCode())
                .usingPricingStrategy(pricingResult.strategyUsed());

        // Add first service with add-ons polymorphically
        boolean first = true;
        for (String sId : serviceIds) {
            CleaningService service = ServiceFactory.createService(sId);
            if (first) {
                builder.addServiceItem(service, domainAddOns);
                first = false;
            } else {
                builder.addServiceItem(service, Collections.emptySet());
            }
        }

        // Add uploaded photos
        if (request.getPhotos() != null) {
            for (UploadedPhotoDto photoDto : request.getPhotos()) {
                builder.addPhoto(
                        photoDto.getSlotNumber(),
                        photoDto.getSlotLabel(),
                        photoDto.getPhotoUrl(),
                        photoDto.getOriginalFilename(),
                        photoDto.getFileSize()
                );
            }
        }

        OrderEntity order = builder.build();
        OrderEntity savedOrder = orderRepository.save(order);

        // Earn 50 loyalty points per order
        customer.addLoyaltyPoints(50);
        userRepository.save(customer);

        // Record promo usage
        if (pricingResult.promoApplied() && request.getPromoCode() != null) {
            promoCodeRepository.findByCodeIgnoreCase(request.getPromoCode()).ifPresent(promo -> {
                promo.incrementUsage();
                promoCodeRepository.save(promo);
            });
        }

        // Notify observers (Observer Pattern)
        statusSubject.notifyObservers(
                savedOrder.getTrackingNumber(),
                customer.getEmail(),
                null,
                savedOrder.getCurrentStatus(),
                "Order successfully created"
        );

        return toDto(savedOrder);
    }

    public List<OrderDto> getActiveOrders(String customerEmail) {
        UserEntity customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerEmail));

        return orderRepository.findActiveOrders(customer.getId(), TERMINAL_STATUSES).stream()
                .map(this::toDto)
                .toList();
    }

    public List<OrderDto> getPastOrders(String customerEmail) {
        UserEntity customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerEmail));

        return orderRepository.findPastOrders(customer.getId(), TERMINAL_STATUSES).stream()
                .map(this::toDto)
                .toList();
    }

    public OrderDto getOrderByTrackingNumber(String trackingNumber) {
        OrderEntity order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new OrderNotFoundException(trackingNumber));
        return toDto(order);
    }

    @Transactional
    public OrderDto rateOrder(String trackingNumber, String customerEmail, int rating) {
        OrderEntity order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new OrderNotFoundException(trackingNumber));

        if (!order.getCustomer().getEmail().equalsIgnoreCase(customerEmail)) {
            throw new IllegalArgumentException("Unauthorized to rate this order");
        }

        order.setRating(rating);
        OrderEntity saved = orderRepository.save(order);
        return toDto(saved);
    }

    @Transactional
    public OrderDto updateOrderStatus(String trackingNumber, OrderStatus newStatus, String notes) {
        OrderEntity order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new OrderNotFoundException(trackingNumber));

        OrderStatus previousStatus = order.getCurrentStatus();
        order.setCurrentStatus(newStatus);

        // Update tracking history according to current status
        updateStatusTimeline(order, newStatus, notes);

        OrderEntity saved = orderRepository.save(order);

        // Broadcast status update through Observer pattern
        statusSubject.notifyObservers(
                saved.getTrackingNumber(),
                saved.getCustomer().getEmail(),
                previousStatus,
                newStatus,
                notes
        );

        return toDto(saved);
    }

    private void updateStatusTimeline(OrderEntity order, OrderStatus currentStatus, String notes) {
        List<OrderStatusHistoryEntity> history = order.getStatusHistory();

        // Standard timeline sequence
        OrderStatus[] sequence = new OrderStatus[]{
                OrderStatus.PICKUP_SCHEDULED,
                OrderStatus.PICKED_UP,
                OrderStatus.CLEANING,
                OrderStatus.QUALITY_CHECK,
                OrderStatus.OUT_FOR_DELIVERY,
                OrderStatus.DELIVERED
        };

        int currentIndex = -1;
        for (int i = 0; i < sequence.length; i++) {
            if (sequence[i] == currentStatus) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex >= 0) {
            for (OrderStatusHistoryEntity step : history) {
                int stepIndex = -1;
                for (int i = 0; i < sequence.length; i++) {
                    if (sequence[i] == step.getStatus()) {
                        stepIndex = i;
                        break;
                    }
                }

                if (stepIndex >= 0) {
                    if (stepIndex < currentIndex) {
                        step.setDone(true);
                        step.setActive(false);
                    } else if (stepIndex == currentIndex) {
                        step.setDone(false);
                        step.setActive(true);
                        if (notes != null && !notes.isBlank()) {
                            step.setDetail(notes);
                        }
                    } else {
                        step.setDone(false);
                        step.setActive(false);
                    }
                }
            }
        }
    }

    public List<OrderDto> getAllOrdersForAdmin() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .toList();
    }

    public long getActiveOrdersCount(String customerEmail) {
        UserEntity customer = userRepository.findByEmail(customerEmail).orElse(null);
        if (customer == null) return 0;
        return orderRepository.countByCustomerIdAndCurrentStatusNotIn(customer.getId(), TERMINAL_STATUSES);
    }

    public OrderDto toDto(OrderEntity order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getTrackingNumber());
        dto.setDatabaseId(order.getId());

        List<String> serviceNames = order.getOrderItems().stream().map(OrderItemEntity::getServiceName).toList();
        dto.setServices(serviceNames);
        if (serviceNames.size() > 1) {
            dto.setService(serviceNames.get(0) + " +" + (serviceNames.size() - 1) + " more");
        } else if (!serviceNames.isEmpty()) {
            dto.setService(serviceNames.get(0));
        } else {
            dto.setService("Sneaker Spa Care");
        }

        List<String> addOnList = new ArrayList<>();
        for (OrderItemEntity item : order.getOrderItems()) {
            if (item.getAddOnsSummary() != null && !item.getAddOnsSummary().isBlank()) {
                addOnList.add(item.getAddOnsSummary());
            }
        }
        dto.setAddOns(addOnList);

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        dto.setDate(order.getCreatedAt().format(dtf));
        dto.setScheduledTime(order.getScheduledTimeSlot());
        dto.setRawStatus(order.getCurrentStatus().name());
        dto.setStatus(order.getCurrentStatus().getDisplayName());

        dto.setRated(order.getRating() != null);
        dto.setRating(order.getRating() != null ? order.getRating() : 0);

        dto.setPrice("$" + order.getTotalAmount().intValue());
        dto.setSubtotal("$" + order.getSubtotal().intValue());
        dto.setDiscount(order.getDiscountAmount().compareTo(java.math.BigDecimal.ZERO) > 0 ? "-$" + order.getDiscountAmount().intValue() : "$0");
        dto.setPromoCode(order.getPromoCode());

        dto.setEta(order.getEtaText());
        dto.setPickupAddress(order.getStreet());
        dto.setPhotosCount(order.getPhotos().size());
        dto.setProgressPercentage(order.getProgressPercentage());

        dto.setCustomerEmail(order.getCustomer().getEmail());
        dto.setCustomerName(order.getCustomer().getName());

        List<TrackingStepDto> steps = new ArrayList<>();
        for (OrderStatusHistoryEntity h : order.getStatusHistory()) {
            // Only include user-facing steps (skip internal PLACED if pickup scheduled exists)
            if (h.getStatus() == OrderStatus.PLACED) continue;
            steps.add(new TrackingStepDto(h.getLabel(), h.getTimeDisplay(), h.isDone(), h.isActive(), h.getDetail()));
        }
        dto.setTrackingSteps(steps);

        return dto;
    }
}
