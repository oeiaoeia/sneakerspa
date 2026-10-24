package com.sneakerspa.dto;

import com.sneakerspa.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequest {
    @NotNull(message = "New status is required")
    private OrderStatus newStatus;

    private String notes;

    public StatusUpdateRequest() {}

    public StatusUpdateRequest(OrderStatus newStatus, String notes) {
        this.newStatus = newStatus;
        this.notes = notes;
    }

    public OrderStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(OrderStatus newStatus) {
        this.newStatus = newStatus;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
