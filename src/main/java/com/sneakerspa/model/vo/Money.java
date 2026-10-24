package com.sneakerspa.model.vo;

import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * ============================================================================
 * OOP PRINCIPLE: ENCAPSULATION & IMMUTABILITY
 * Value Object pattern: Money is completely immutable. All fields are private
 * and final. State transitions return new Money instances with strict validation.
 * ============================================================================
 */
public final class Money implements Serializable, Comparable<Money> {
    private static final long serialVersionUID = 1L;

    public static final Money ZERO = new Money(BigDecimal.ZERO);

    private final BigDecimal amount;

    public Money(BigDecimal amount) {
        if (amount == null) {
            throw new IllegalArgumentException("Money amount cannot be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Money amount cannot be negative: " + amount);
        }
        this.amount = amount.setScale(2, RoundingMode.HALF_UP);
    }

    public static Money of(double value) {
        return new Money(BigDecimal.valueOf(value));
    }

    public static Money of(BigDecimal value) {
        return new Money(value);
    }

    public static Money of(int value) {
        return new Money(BigDecimal.valueOf(value));
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public Money add(Money other) {
        Objects.requireNonNull(other, "Cannot add null Money");
        return new Money(this.amount.add(other.amount));
    }

    public Money subtract(Money other) {
        Objects.requireNonNull(other, "Cannot subtract null Money");
        BigDecimal result = this.amount.subtract(other.amount);
        if (result.compareTo(BigDecimal.ZERO) < 0) {
            return ZERO;
        }
        return new Money(result);
    }

    public Money multiply(double factor) {
        if (factor < 0) {
            throw new IllegalArgumentException("Factor cannot be negative: " + factor);
        }
        return new Money(this.amount.multiply(BigDecimal.valueOf(factor)));
    }

    public Money discountByPercent(double percentage) {
        if (percentage < 0 || percentage > 100) {
            throw new IllegalArgumentException("Discount percentage must be between 0 and 100");
        }
        BigDecimal discountFraction = BigDecimal.valueOf(percentage).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal discountAmount = this.amount.multiply(discountFraction);
        return new Money(discountAmount);
    }

    public int toIntDollars() {
        return amount.setScale(0, RoundingMode.HALF_UP).intValue();
    }

    public String format() {
        if (amount.stripTrailingZeros().scale() <= 0) {
            return "$" + amount.setScale(0, RoundingMode.HALF_UP);
        }
        return "$" + amount;
    }

    @Override
    public int compareTo(Money o) {
        return this.amount.compareTo(o.amount);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Money money)) return false;
        return amount.compareTo(money.amount) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(amount.stripTrailingZeros());
    }

    @Override
    public String toString() {
        return format();
    }
}
