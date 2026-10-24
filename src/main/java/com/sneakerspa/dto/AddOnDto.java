package com.sneakerspa.dto;

import java.math.BigDecimal;

public class AddOnDto {
    private String id;
    private String name;
    private String price;
    private BigDecimal rawPrice;

    public AddOnDto() {}

    public AddOnDto(String id, String name, String price, BigDecimal rawPrice) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.rawPrice = rawPrice;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public BigDecimal getRawPrice() {
        return rawPrice;
    }

    public void setRawPrice(BigDecimal rawPrice) {
        this.rawPrice = rawPrice;
    }
}
