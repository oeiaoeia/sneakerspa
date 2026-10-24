package com.sneakerspa.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sneakerspa.model.Payable;
import com.sneakerspa.model.Trackable;
import com.sneakerspa.model.vo.Money;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ============================================================================
 * OOP PRINCIPLE: COMPOSITION & INTERFACE IMPLEMENTATION
 * OrderEntity is the central aggregate in the domain model.
 * It is composed of:
 *   - Customer (UserEntity)
 *   - Delivery Address fields
 *   - A collection of OrderItemEntity instances (Payable)
 *   - A collection of OrderPhotoEntity instances
 *   - A chronological list of OrderStatusHistoryEntity updates
 * Implements Payable and Trackable interfaces.
 * ============================================================================
 */
@Entity
@Table(name = "orders")
public class OrderEntity implements Payable, Trackable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String trackingNumber; // e.g. "SNK-2847"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private UserEntity customer;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String zip;

    private String scheduledDate;

    private String scheduledTimeSlot; // e.g. "2:00 PM"

    @Column(length = 1000)
    private String specialInstructions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus currentStatus = OrderStatus.PLACED;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    private String promoCode;

    @Column(nullable = false)
    private boolean isPickupFree = true;

    private String driverName = "Mike R.";

    private String etaText = "Tomorrow";

    private Integer rating; // 1-5

    private LocalDateTime ratingSubmittedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItemEntity> orderItems = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderPhotoEntity> photos = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("recordedAt ASC")
    private List<OrderStatusHistoryEntity> statusHistory = new ArrayList<>();

    public OrderEntity() {}

    // Implement Payable interface
    @Override
    public Money calculateTotal() {
        return Money.of(totalAmount);
    }

    // Implement Trackable interface
    @Override
    public String getTrackingNumber() {
        return trackingNumber;
    }

    @Override
    public OrderStatus getCurrentStatus() {
        return currentStatus;
    }

    @Override
    public int getProgressPercentage() {
        return currentStatus != null ? currentStatus.getProgressPercentage() : 0;
    }

    // Helper composition methods
    public void addOrderItem(OrderItemEntity item) {
        orderItems.add(item);
        item.setOrder(this);
    }

    public void addPhoto(OrderPhotoEntity photo) {
        photos.add(photo);
        photo.setOrder(this);
    }

    public void addStatusHistory(OrderStatusHistoryEntity history) {
        statusHistory.add(history);
        history.setOrder(this);
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public UserEntity getCustomer() {
        return customer;
    }

    public void setCustomer(UserEntity customer) {
        this.customer = customer;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getZip() {
        return zip;
    }

    public void setZip(String zip) {
        this.zip = zip;
    }

    public String getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(String scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getScheduledTimeSlot() {
        return scheduledTimeSlot;
    }

    public void setScheduledTimeSlot(String scheduledTimeSlot) {
        this.scheduledTimeSlot = scheduledTimeSlot;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public void setCurrentStatus(OrderStatus currentStatus) {
        this.currentStatus = currentStatus;
        this.updatedAt = LocalDateTime.now();
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPromoCode() {
        return promoCode;
    }

    public void setPromoCode(String promoCode) {
        this.promoCode = promoCode;
    }

    public boolean isPickupFree() {
        return isPickupFree;
    }

    public void setPickupFree(boolean pickupFree) {
        isPickupFree = pickupFree;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getEtaText() {
        return etaText;
    }

    public void setEtaText(String etaText) {
        this.etaText = etaText;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
        this.ratingSubmittedAt = LocalDateTime.now();
    }

    public LocalDateTime getRatingSubmittedAt() {
        return ratingSubmittedAt;
    }

    public void setRatingSubmittedAt(LocalDateTime ratingSubmittedAt) {
        this.ratingSubmittedAt = ratingSubmittedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<OrderItemEntity> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItemEntity> orderItems) {
        this.orderItems = orderItems;
    }

    public List<OrderPhotoEntity> getPhotos() {
        return photos;
    }

    public void setPhotos(List<OrderPhotoEntity> photos) {
        this.photos = photos;
    }

    public List<OrderStatusHistoryEntity> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<OrderStatusHistoryEntity> statusHistory) {
        this.statusHistory = statusHistory;
    }
}
