package com.sneakerspa.model.observer;

import com.sneakerspa.entity.OrderStatus;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * ============================================================================
 * OOP DESIGN PATTERN: OBSERVER PATTERN (Subject)
 * Maintains active observers and broadcasts order status updates to all listeners.
 * ============================================================================
 */
@Component
public class StatusChangeSubject {

    private final List<StatusObserver> observers = new ArrayList<>();

    public synchronized void registerObserver(StatusObserver observer) {
        if (observer != null && !observers.contains(observer)) {
            observers.add(observer);
        }
    }

    public synchronized void removeObserver(StatusObserver observer) {
        observers.remove(observer);
    }

    public synchronized void notifyObservers(
            String orderTrackingNumber,
            String customerEmail,
            OrderStatus previousStatus,
            OrderStatus newStatus,
            String notes
    ) {
        for (StatusObserver observer : observers) {
            try {
                observer.onStatusChanged(orderTrackingNumber, customerEmail, previousStatus, newStatus, notes);
            } catch (Exception e) {
                // Log and continue notifying others
                System.err.println("Error notifying observer: " + e.getMessage());
            }
        }
    }
}
