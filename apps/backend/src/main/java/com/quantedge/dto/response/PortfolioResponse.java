package com.quantedge.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.quantedge.entity.Holding;
import com.quantedge.entity.Portfolio;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PortfolioResponse {
    private Portfolio portfolio;
    private List<Holding> holdings;
    private BigDecimal totalValue;
    private BigDecimal holdingsValue;
    private BigDecimal cashBalance;
    private BigDecimal totalReturn;
    private BigDecimal totalReturnPct;
}
