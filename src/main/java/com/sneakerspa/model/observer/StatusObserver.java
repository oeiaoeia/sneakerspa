package com.sneakerspa.model.observer;

import com.sneakerspa.entity.OrderStatus;

/**
 * ============================================================================
 * OOP DESIGN PATTERN: OBSERVER PATTERN (Observer Interface)
 * Notified whenever an order transitions through its lifecycle states.
 * ============================================================================
 */
public interface StatusObserver {
    void onStatusChanged(String orderTrackingNumber, String customerEmail, OrderStatus previousStatus, OrderStatus newStatus, String notes);
}
