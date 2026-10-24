package com.sneakerspa.model.service;

import com.sneakerspa.model.Payable;
import com.sneakerspa.model.vo.Money;
import java.io.Serializable;
import java.util.Objects;

/**
 * ============================================================================
 * OOP PRINCIPLE: ENCAPSULATION
 * AddOn represents optional value-added services attached to a sneaker cleaning.
 * Implements Payable interface.
 * ============================================================================
 */
public class AddOn implements Payable, Serializable {
    private static final long serialVersionUID = 1L;

    private final String id;
    private final String name;
    private final Money price;
    private final String description;

    public AddOn(String id, String name, Money price, String description) {
        this.id = Objects.requireNonNull(id, "AddOn id required");
        this.name = Objects.requireNonNull(name, "AddOn name required");
        this.price = Objects.requireNonNull(price, "AddOn price required");
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Money getPrice() {
        return price;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public Money calculateTotal() {
        return price;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AddOn addOn)) return false;
        return Objects.equals(id, addOn.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
