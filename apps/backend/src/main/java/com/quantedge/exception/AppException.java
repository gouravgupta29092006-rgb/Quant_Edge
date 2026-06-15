package com.quantedge.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base application exception.
 * All domain-specific exceptions extend this.
 */
@Getter
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;
    private final String message;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
        this.message = errorCode.getDefaultMessage();
    }

    public AppException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.message = message;
    }

    public AppException(ErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.message = message;
    }

    public HttpStatus getHttpStatus() {
        return errorCode.getHttpStatus();
    }
}
