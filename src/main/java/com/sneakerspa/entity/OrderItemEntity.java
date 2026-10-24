package com.sneakerspa.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sneakerspa.model.Payable;
import com.sneakerspa.model.service.CleaningService;
import com.sneakerspa.model.vo.Money;
import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * ============================================================================
 * OOP PRINCIPLE: COMPOSITION & ASSOCIATION
 * OrderItem represents one booked service within an Order. It references the
 * polymorphic CleaningService entity directly by JPA relationship (@ManyToOne)
 * instead of a plain string.
 * ============================================================================
 */
@Entity
@Table(name = "order_items")
public class OrderItemEntity implements Payable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private OrderEntity order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id", nullable = false)
    private CleaningService service;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(length = 500)
    private String addOnsSummary;

    public OrderItemEntity() {}

    public OrderItemEntity(CleaningService service, BigDecimal price, String addOnsSummary) {
        this.service = service;
        this.price = price;
        this.addOnsSummary = addOnsSummary;
    }

    @Override
    public Money calculateTotal() {
        return Money.of(price);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OrderEntity getOrder() {
        return order;
    }

    public void setOrder(OrderEntity order) {
        this.order = order;
    }

    public CleaningService getService() {
        return service;
    }

    public void setService(CleaningService service) {
        this.service = service;
    }

    public String getServiceId() {
        return service != null ? service.getId() : null;
    }

    public String getServiceName() {
        return service != null ? service.getName() : null;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getAddOnsSummary() {
        return addOnsSummary;
    }

    public void setAddOnsSummary(String addOnsSummary) {
        this.addOnsSummary = addOnsSummary;
    }
}
