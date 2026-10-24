package com.sneakerspa.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * ============================================================================
 * OOP PRINCIPLE: COMPOSITION
 * Audit log of each status transition in the order's life cycle.
 * Used to render the tracking timeline in the UI.
 * ============================================================================
 */
@Entity
@Table(name = "order_status_history")
public class OrderStatusHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private OrderEntity order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String timeDisplay;

    @Column(length = 500)
    private String detail;

    @Column(nullable = false)
    private boolean done;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private LocalDateTime recordedAt = LocalDateTime.now();

    public OrderStatusHistoryEntity() {}

    public OrderStatusHistoryEntity(
            OrderStatus status,
            String label,
            String timeDisplay,
            String detail,
            boolean done,
            boolean active
    ) {
        this.status = status;
        this.label = label;
        this.timeDisplay = timeDisplay;
        this.detail = detail;
        this.done = done;
        this.active = active;
        this.recordedAt = LocalDateTime.now();
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

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getTimeDisplay() {
        return timeDisplay;
    }

    public void setTimeDisplay(String timeDisplay) {
        this.timeDisplay = timeDisplay;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}
