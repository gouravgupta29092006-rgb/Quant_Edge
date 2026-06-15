package com.quantedge.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;     // "Bearer"
    private Long expiresIn;       // seconds
    private String requires2fa;   // interim token if 2FA needed
    private UserProfile user;

    @Data @Builder
    public static class UserProfile {
        private String id;
        private String email;
        private String firstName;
        private String lastName;
        private String displayName;
        private String avatarUrl;
        private String role;
        private String status;
        private boolean twoFactorEnabled;
        private boolean emailVerified;
        private Instant createdAt;
    }

    @Data @Builder
    public static class TwoFactorSetup {
        private String secret;
        private String qrCodeUri;
        private String[] backupCodes;
    }
}
