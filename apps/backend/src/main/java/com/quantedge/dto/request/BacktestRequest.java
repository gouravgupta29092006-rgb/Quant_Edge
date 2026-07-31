package com.quantedge.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BacktestRequest {
    @NotBlank(message = "Symbol required")
    @Size(max = 10)
    private String symbol;

    @NotNull
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fromDate;

    @NotNull
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate toDate;

    @NotNull
    @DecimalMin("1000.00")
    @DecimalMax("10000000.00")
    private BigDecimal initialCapital;
}
