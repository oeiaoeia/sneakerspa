package com.sneakerspa.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class OrderCreateRequest {

    // Can accept multiple service IDs (deliberate requirement)
    @NotEmpty(message = "At least one service must be selected")
    private List<String> serviceIds = new ArrayList<>();

    // Optional add-ons: "express", "coating", "laces"
    private List<String> addOnIds = new ArrayList<>();

    private String scheduledDate;
    private String scheduledTimeSlot;

    @NotNull(message = "Address is required")
    private AddressDto address;

    private String specialInstructions;

    private String promoCode;

    private List<UploadedPhotoDto> photos = new ArrayList<>();

    public OrderCreateRequest() {}

    public List<String> getServiceIds() {
        return serviceIds;
    }

    public void setServiceIds(List<String> serviceIds) {
        this.serviceIds = serviceIds;
    }

    public List<String> getAddOnIds() {
        return addOnIds;
    }

    public void setAddOnIds(List<String> addOnIds) {
        this.addOnIds = addOnIds;
    }

    public String getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(String scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getScheduledTimeSlot() {
        return scheduledTimeSlot;
    }

    public void setScheduledTimeSlot(String scheduledTimeSlot) {
        this.scheduledTimeSlot = scheduledTimeSlot;
    }

    public AddressDto getAddress() {
        return address;
    }

    public void setAddress(AddressDto address) {
        this.address = address;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public String getPromoCode() {
        return promoCode;
    }

    public void setPromoCode(String promoCode) {
        this.promoCode = promoCode;
    }

    public List<UploadedPhotoDto> getPhotos() {
        return photos;
    }

    public void setPhotos(List<UploadedPhotoDto> photos) {
        this.photos = photos;
    }
}
