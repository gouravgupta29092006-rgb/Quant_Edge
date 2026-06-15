package com.quantedge.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class Disable2faRequest {
    @NotBlank private String password;
}
