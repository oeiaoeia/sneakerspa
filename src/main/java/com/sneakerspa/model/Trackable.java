package com.sneakerspa.model;

import com.sneakerspa.entity.OrderStatus;

/**
 * ============================================================================
 * OOP PRINCIPLE: INTERFACE SEGREGATION
 * Contract for any domain entity that supports live lifecycle tracking,
 * progress calculation, and tracking identifier lookup.
 * ============================================================================
 */
public interface Trackable {
    String getTrackingNumber();
    OrderStatus getCurrentStatus();
    int getProgressPercentage();
}
