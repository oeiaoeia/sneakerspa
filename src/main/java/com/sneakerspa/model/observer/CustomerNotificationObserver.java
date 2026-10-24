package com.sneakerspa.model.observer;

import com.sneakerspa.entity.OrderStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * ============================================================================
 * OOP DESIGN PATTERN: OBSERVER PATTERN (Concrete Observer)
 * Listens for order status updates and dispatches push / notification alerts
 * to the customer, retaining an in-memory audit log of dispatches.
 * ============================================================================
 */
@Component
public class CustomerNotificationObserver implements StatusObserver {

    public record NotificationRecord(
            String trackingNumber,
            String customerEmail,
            OrderStatus status,
            String message,
            LocalDateTime timestamp
    ) {}

    private final List<NotificationRecord> notificationLog = Collections.synchronizedList(new ArrayList<>());

    public CustomerNotificationObserver(StatusChangeSubject subject) {
        subject.registerObserver(this);
    }

    @Override
    public void onStatusChanged(
            String orderTrackingNumber,
            String customerEmail,
            OrderStatus previousStatus,
            OrderStatus newStatus,
            String notes
    ) {
        String msg = String.format("Order #%s updated from %s to %s. %s",
                orderTrackingNumber,
                previousStatus != null ? previousStatus.getDisplayName() : "NONE",
                newStatus.getDisplayName(),
                notes != null ? notes : newStatus.getDefaultDetail());

        NotificationRecord record = new NotificationRecord(
                orderTrackingNumber,
                customerEmail,
                newStatus,
                msg,
                LocalDateTime.now()
        );
        notificationLog.add(record);
        System.out.println("[NOTIFY CUSTOMER] -> " + customerEmail + ": " + msg);
    }

    public List<NotificationRecord> getNotificationLog() {
        return Collections.unmodifiableList(notificationLog);
    }
}
