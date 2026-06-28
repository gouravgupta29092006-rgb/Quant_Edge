package com.quantedge.controller;

import com.quantedge.service.HistoricalDataService;
import com.quantedge.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Historical Data Controller.
 * Provides OHLCV data for TradingView lightweight-charts.
 *
 * Base path: /api/v1/market/chart
 */
@RestController
@RequestMapping("/market/chart")
@RequiredArgsConstructor
@Tag(name = "Chart Data", description = "Historical OHLCV price data for charting")
public class ChartController {

    private final HistoricalDataService historicalDataService;

    /**
     * GET /market/chart/{symbol}?range=1Y&interval=1day
     * OHLCV data for TradingView-compatible charting.
     *
     * range:    1D | 5D | 1M | 3M | 6M | 1Y | 2Y | 5Y | MAX
     * interval: 1min | 5min | 15min | 1day (auto-selected based on range if omitted)
     */
    @GetMapping("/{symbol}")
    @Operation(summary = "Get historical OHLCV chart data")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getChartData(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1Y") String range,
            @RequestParam(defaultValue = "1day") String interval) {

        List<Map<String, Object>> candles =
                historicalDataService.getChartData(symbol.toUpperCase(), range, interval);

        return ResponseEntity.ok(ApiResponse.success(candles));
    }
}
