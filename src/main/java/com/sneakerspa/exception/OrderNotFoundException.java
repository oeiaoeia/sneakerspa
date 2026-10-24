package com.sneakerspa.exception;

public class OrderNotFoundException extends ResourceNotFoundException {
    public OrderNotFoundException(String trackingNumber) {
        super("Order not found with tracking number or id: " + trackingNumber);
    }
}
