package com.quantedge.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class Verify2faRequest {
    @NotBlank private String interimToken;
    @NotBlank @Size(min = 6, max = 6, message = "Code must be 6 digits") private String code;
}
