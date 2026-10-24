package com.sneakerspa.entity;

/**
 * ============================================================================
 * Order lifecycle status with sequential progress tracking.
 * ============================================================================
 */
public enum OrderStatus {
    PLACED("Order Placed", 10, "Order has been placed and confirmed."),
    PICKUP_SCHEDULED("Pickup Scheduled", 25, "Driver assigned: Mike R."),
    PICKED_UP("Picked Up", 45, "Shoes collected from your address"),
    CLEANING("Cleaning in Progress", 65, "Currently being deep cleaned by our experts"),
    QUALITY_CHECK("Quality Check", 85, "Final inspection before delivery"),
    OUT_FOR_DELIVERY("Out for Delivery", 95, "Will be delivered to your address"),
    DELIVERED("Delivered", 100, "Successfully delivered back to you"),
    CANCELLED("Cancelled", 0, "Order was cancelled");

    private final String displayName;
    private final int progressPercentage;
    private final String defaultDetail;

    OrderStatus(String displayName, int progressPercentage, String defaultDetail) {
        this.displayName = displayName;
        this.progressPercentage = progressPercentage;
        this.defaultDetail = defaultDetail;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getProgressPercentage() {
        return progressPercentage;
    }

    public String getDefaultDetail() {
        return defaultDetail;
    }

    public boolean isTerminal() {
        return this == DELIVERED || this == CANCELLED;
    }

    public OrderStatus next() {
        return switch (this) {
            case PLACED -> PICKUP_SCHEDULED;
            case PICKUP_SCHEDULED -> PICKED_UP;
            case PICKED_UP -> CLEANING;
            case CLEANING -> QUALITY_CHECK;
            case QUALITY_CHECK -> OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY -> DELIVERED;
            case DELIVERED, CANCELLED -> this;
        };
    }
}
