package com.sneakerspa.model;

import com.sneakerspa.model.vo.Money;

/**
 * ============================================================================
 * OOP PRINCIPLE: INTERFACE SEGREGATION
 * Contract for any domain entity or order item that incurs a financial cost
 * and can calculate its own payable total.
 * ============================================================================
 */
public interface Payable {
    /**
     * Calculates the total payable amount.
     * @return Money representation of payable charge.
     */
    Money calculateTotal();
}
