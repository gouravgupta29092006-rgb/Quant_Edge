package com.quantedge.controller;

import com.quantedge.util.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Health check endpoint — publicly accessible.
 * Used by Railway/Render health checks.
 */
@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.success(Map.of(
                "status", "UP",
                "service", "quantedge-api",
                "version", "1.0.0",
                "timestamp", Instant.now().toString()
        ));
    }
}
