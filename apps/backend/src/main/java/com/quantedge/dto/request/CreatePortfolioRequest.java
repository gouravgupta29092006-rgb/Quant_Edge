package com.quantedge.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreatePortfolioRequest {
    @NotBlank @Size(min = 1, max = 100, message = "Name must be 1-100 characters")
    private String name;

    @Size(max = 500)
    private String description;

    @DecimalMin(value = "1000.00", message = "Initial capital must be at least $1,000")
    @DecimalMax(value = "10000000.00", message = "Initial capital must not exceed $10,000,000")
    private BigDecimal initialCapital;
}
