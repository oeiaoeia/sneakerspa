package com.sneakerspa.dto;

import jakarta.validation.constraints.NotBlank;

public class AddressDto {
    private Long id;
    private String label = "Home";

    @NotBlank(message = "Street address is required")
    private String street;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "ZIP code is required")
    private String zip;

    private boolean isDefault;

    public AddressDto() {}

    public AddressDto(Long id, String label, String street, String city, String zip, boolean isDefault) {
        this.id = id;
        this.label = label;
        this.street = street;
        this.city = city;
        this.zip = zip;
        this.isDefault = isDefault;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getZip() {
        return zip;
    }

    public void setZip(String zip) {
        this.zip = zip;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }
}
