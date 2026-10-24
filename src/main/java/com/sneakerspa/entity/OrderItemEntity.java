package com.sneakerspa.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sneakerspa.model.Payable;
import com.sneakerspa.model.vo.Money;
import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * ============================================================================
 * OOP PRINCIPLE: COMPOSITION
 * OrderItem represents one booked service within an Order, including its
 * item price and associated add-ons.
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

    @Column(nullable = false)
    private String serviceId;

    @Column(nullable = false)
    private String serviceName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(length = 500)
    private String addOnsSummary;

    public OrderItemEntity() {}

    public OrderItemEntity(String serviceId, String serviceName, BigDecimal price, String addOnsSummary) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
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

    public String getServiceId() {
        return serviceId;
    }

    public void setServiceId(String serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
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
