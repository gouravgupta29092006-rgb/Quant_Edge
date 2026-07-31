package com.quantedge.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Email(message = "Must be a valid email")
    private String email;

    @NotBlank @Size(min = 8, max = 128, message = "Password must be 8-128 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,}$",
             message = "Password must contain uppercase, lowercase, digit, and special character")
    private String password;

    @NotBlank @Size(min = 1, max = 50) private String firstName;
    @NotBlank @Size(min = 1, max = 50) private String lastName;
}
