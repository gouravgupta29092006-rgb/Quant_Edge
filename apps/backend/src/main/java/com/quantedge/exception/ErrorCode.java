package com.quantedge.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * All application-specific error codes.
 * Maps to TECH_SPEC.md Â§15 error response standards.
 */
@Getter
public enum ErrorCode {

    // â”€â”€â”€ Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    VALIDATION_ERROR("Validation failed", HttpStatus.BAD_REQUEST),

    // â”€â”€â”€ Authentication â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    UNAUTHORIZED("Authentication required", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN("Invalid or expired token", HttpStatus.UNAUTHORIZED),
    MISSING_TOKEN("Bearer token required", HttpStatus.UNAUTHORIZED),
    INVALID_CREDENTIALS("Invalid email or password", HttpStatus.UNAUTHORIZED),
    ACCOUNT_LOCKED("Account temporarily locked after too many failed attempts", HttpStatus.UNAUTHORIZED),
    TWO_FACTOR_REQUIRED("Two-factor authentication required", HttpStatus.UNAUTHORIZED),
    INVALID_2FA_CODE("Invalid 2FA code", HttpStatus.UNAUTHORIZED),

    // â”€â”€â”€ Authorization â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    FORBIDDEN("Insufficient permissions", HttpStatus.FORBIDDEN),
    EMAIL_NOT_VERIFIED("Email address not verified. Please check your inbox.", HttpStatus.FORBIDDEN),
    ACCOUNT_SUSPENDED("Account has been suspended. Contact support.", HttpStatus.FORBIDDEN),

    // â”€â”€â”€ Not Found â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    NOT_FOUND("Resource not found", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND("User not found", HttpStatus.NOT_FOUND),
    PORTFOLIO_NOT_FOUND("Portfolio not found", HttpStatus.NOT_FOUND),
    STOCK_NOT_FOUND("Stock not found", HttpStatus.NOT_FOUND),
    STRATEGY_NOT_FOUND("Strategy not found", HttpStatus.NOT_FOUND),
    BACKTEST_NOT_FOUND("Backtest not found", HttpStatus.NOT_FOUND),

    // â”€â”€â”€ Conflict â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    ALREADY_EXISTS("Resource already exists", HttpStatus.CONFLICT),
    EMAIL_TAKEN("Email address is already registered", HttpStatus.CONFLICT),
    PORTFOLIO_NAME_TAKEN("A portfolio with this name already exists", HttpStatus.CONFLICT),

    // â”€â”€â”€ Business Logic (Unprocessable) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    INSUFFICIENT_CASH("Insufficient cash balance", HttpStatus.UNPROCESSABLE_ENTITY),
    INSUFFICIENT_SHARES("Insufficient shares to sell", HttpStatus.UNPROCESSABLE_ENTITY),
    PORTFOLIO_LIMIT("Maximum of 5 portfolios allowed per user", HttpStatus.UNPROCESSABLE_ENTITY),
    INVALID_TRADE("Invalid trade parameters", HttpStatus.UNPROCESSABLE_ENTITY),
    WATCHLIST_LIMIT("Maximum of 50 items in watchlist", HttpStatus.UNPROCESSABLE_ENTITY),

    // â”€â”€â”€ Rate Limiting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    RATE_LIMIT_EXCEEDED("Too many requests. Please slow down.", HttpStatus.TOO_MANY_REQUESTS),
    AI_QUOTA_EXCEEDED("AI usage limit reached. Please wait before making another request.", HttpStatus.TOO_MANY_REQUESTS),

    // â”€â”€â”€ External API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    EXTERNAL_API_ERROR("External API error", HttpStatus.BAD_GATEWAY),
    MARKET_DATA_UNAVAILABLE("Market data temporarily unavailable", HttpStatus.BAD_GATEWAY),
    AI_SERVICE_UNAVAILABLE("AI service is temporarily unavailable", HttpStatus.SERVICE_UNAVAILABLE),

    // â”€â”€â”€ Internal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    INTERNAL_ERROR("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String defaultMessage;
    private final HttpStatus httpStatus;

    ErrorCode(String defaultMessage, HttpStatus httpStatus) {
        this.defaultMessage = defaultMessage;
        this.httpStatus = httpStatus;
    }
}
