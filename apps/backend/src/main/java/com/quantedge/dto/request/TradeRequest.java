package com.quantedge.dto.request;

import com.quantedge.entity.Transaction;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class TradeRequest {
    @NotBlank(message = "Symbol is required")
    @Size(max = 10)
    private String symbol;

    @NotNull
    private Transaction.TransactionType type;  // BUY | SELL

    @NotNull
    @DecimalMin(value = "0.0001", message = "Must buy/sell at least 0.0001 shares")
    @DecimalMax(value = "1000000", message = "Shares exceed maximum allowed")
    private BigDecimal shares;

    // Optional limit price (defaults to market price)
    private BigDecimal limitPrice;

    @Size(max = 500)
    private String notes;
}
