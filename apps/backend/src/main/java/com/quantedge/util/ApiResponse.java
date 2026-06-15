package com.quantedge.util;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

/**
 * Standard API response envelope.
 * ALL API responses follow this shape — per TECH_SPEC.md §1.2
 *
 * Success:  { success: true,  data: {...}, meta: {...}, timestamp: "..." }
 * Error:    { success: false, error: { code, message, details }, timestamp: "..." }
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final ErrorBody error;
    private final Meta meta;
    private final String timestamp;

    private ApiResponse(boolean success, T data, ErrorBody error, Meta meta) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.meta = meta;
        this.timestamp = Instant.now().toString();
    }

    // ─── Success Factories ─────────────────────────────────────

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, null);
    }

    public static <T> ApiResponse<T> success(T data, Meta meta) {
        return new ApiResponse<>(true, data, null, meta);
    }

    // ─── Error Factories ───────────────────────────────────────

    public static <T> ApiResponse<T> error(String code, String message) {
        ErrorBody errorBody = new ErrorBody(code, message, null);
        return new ApiResponse<>(false, null, errorBody, null);
    }

    public static <T> ApiResponse<T> validationError(List<FieldError> details) {
        ErrorBody errorBody = new ErrorBody("VALIDATION_ERROR", "Request validation failed", details);
        return new ApiResponse<>(false, null, errorBody, null);
    }

    // ─── Nested Records ───────────────────────────────────────

    @Getter
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorBody {
        private final String code;
        private final String message;
        private final List<FieldError> details;

        public ErrorBody(String code, String message, List<FieldError> details) {
            this.code = code;
            this.message = message;
            this.details = details;
        }
    }

    @Getter
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FieldError {
        private final String field;
        private final String message;
        private final Object value;

        public FieldError(String field, String message, Object value) {
            this.field = field;
            this.message = message;
            this.value = value;
        }
    }

    /**
     * Pagination metadata — per TECH_SPEC.md §1.4
     */
    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Meta {
        private final Integer page;
        private final Integer limit;
        private final Long total;
        private final Integer totalPages;
        private final Boolean hasNextPage;
        private final Boolean hasPrevPage;

        public static Meta of(int page, int limit, long total) {
            int totalPages = (int) Math.ceil((double) total / limit);
            return Meta.builder()
                    .page(page)
                    .limit(limit)
                    .total(total)
                    .totalPages(totalPages)
                    .hasNextPage(page < totalPages)
                    .hasPrevPage(page > 1)
                    .build();
        }
    }
}
