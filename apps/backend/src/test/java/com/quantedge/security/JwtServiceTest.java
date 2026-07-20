package com.quantedge.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for JwtService.
 * Phase 15 — Per TECH_SPEC.md §15 — Testing Strategy.
 *
 * Tests token generation, validation, claim extraction, and expiry.
 * No Spring context needed — plain JUnit 5 tests with ReflectionTestUtils.
 */
@DisplayName("JwtService Unit Tests")
class JwtServiceTest {

    private JwtService jwtService;

    // 512-bit base64-encoded test secret (required for HS512)
    private static final String TEST_SECRET =
            Base64.getEncoder().encodeToString(
                    "quantedge-test-jwt-secret-key-must-be-at-least-512-bits-long-for-hs512!"
                    .getBytes());

    @BeforeEach
    void setup() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret",            TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "accessTokenExpiryMs",  900_000L);      // 15 min
        ReflectionTestUtils.setField(jwtService, "refreshTokenExpiryMs", 604_800_000L);  // 7 days
        ReflectionTestUtils.setField(jwtService, "interimTokenExpiryMs", 300_000L);      // 5 min
    }

    // ─── Access Token ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("generateAccessToken()")
    class GenerateAccessToken {

        @Test
        @DisplayName("should generate a non-empty JWT string")
        void generatesNonEmptyToken() {
            String token = jwtService.generateAccessToken("user-123", "test@example.com", "USER");
            assertThat(token).isNotBlank();
            // JWT structure: header.payload.signature
            assertThat(token.split("\\.")).hasSize(3);
        }

        @Test
        @DisplayName("should extract correct userId (subject) from token")
        void extractsCorrectSubject() {
            String token = jwtService.generateAccessToken("user-123", "test@example.com", "USER");
            assertThat(jwtService.extractUserId(token)).isEqualTo("user-123");
        }

        @Test
        @DisplayName("should embed correct email in token claims")
        void containsEmailClaim() {
            String token = jwtService.generateAccessToken("user-123", "test@example.com", "USER");
            assertThat(jwtService.extractEmail(token)).isEqualTo("test@example.com");
        }

        @Test
        @DisplayName("should embed correct role in token claims")
        void containsRoleClaim() {
            String token = jwtService.generateAccessToken("user-123", "test@example.com", "ADMIN");
            assertThat(jwtService.extractRole(token)).isEqualTo("ADMIN");
        }

        @Test
        @DisplayName("should embed type=access in token claims")
        void hasAccessType() {
            String token = jwtService.generateAccessToken("user-123", "test@example.com", "USER");
            assertThat(jwtService.extractTokenType(token)).isEqualTo("access");
        }

        @Test
        @DisplayName("should pass validateToken() immediately after generation")
        void isValidAfterGeneration() {
            String token = jwtService.generateAccessToken("user-123", "test@example.com", "USER");
            assertThat(jwtService.validateToken(token)).isTrue();
        }

        @Test
        @DisplayName("should fail validateToken() when signature is tampered")
        void invalidWhenTampered() {
            String token = jwtService.generateAccessToken("user-123", "test@example.com", "USER");
            String tampered = token.substring(0, token.lastIndexOf('.') + 1) + "invalidsignature";
            assertThat(jwtService.validateToken(tampered)).isFalse();
        }

        @Test
        @DisplayName("validateTokenType should return true for 'access' type")
        void validateTokenTypeAccess() {
            String token = jwtService.generateAccessToken("user-123", "test@example.com", "USER");
            assertThat(jwtService.validateTokenType(token, "access")).isTrue();
            assertThat(jwtService.validateTokenType(token, "refresh")).isFalse();
        }
    }

    // ─── Refresh Token ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("generateRefreshToken()")
    class GenerateRefreshToken {

        @Test
        @DisplayName("should generate a valid token string")
        void generatesRefreshToken() {
            String token = jwtService.generateRefreshToken("user-123", false);
            assertThat(token).isNotBlank();
        }

        @Test
        @DisplayName("should embed type=refresh in token claims")
        void hasRefreshType() {
            String token = jwtService.generateRefreshToken("user-123", false);
            assertThat(jwtService.extractTokenType(token)).isEqualTo("refresh");
        }

        @Test
        @DisplayName("rememberMe=true should produce a later expiry than rememberMe=false")
        void longerExpiryWithRememberMe() {
            String regular  = jwtService.generateRefreshToken("user-123", false);
            String remember = jwtService.generateRefreshToken("user-123", true);

            long regularExpiry  = jwtService.extractExpiration(regular).getTime();
            long rememberExpiry = jwtService.extractExpiration(remember).getTime();
            assertThat(rememberExpiry).isGreaterThan(regularExpiry);
        }

        @Test
        @DisplayName("validateTokenType should return true for 'refresh' type")
        void validateTokenTypeRefresh() {
            String token = jwtService.generateRefreshToken("user-123", false);
            assertThat(jwtService.validateTokenType(token, "refresh")).isTrue();
            assertThat(jwtService.validateTokenType(token, "access")).isFalse();
        }
    }

    // ─── Interim Token ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("generateInterimToken()")
    class GenerateInterimToken {

        @Test
        @DisplayName("should embed type=interim in token claims")
        void hasInterimType() {
            String token = jwtService.generateInterimToken("user-123");
            assertThat(jwtService.extractTokenType(token)).isEqualTo("interim");
        }

        @Test
        @DisplayName("should extract correct userId from interim token")
        void extractsUserId() {
            String token = jwtService.generateInterimToken("user-abc");
            assertThat(jwtService.extractUserId(token)).isEqualTo("user-abc");
        }
    }

    // ─── isTokenExpired ───────────────────────────────────────────────────────

    @Nested
    @DisplayName("isTokenExpired()")
    class IsTokenExpired {

        @Test
        @DisplayName("should return false for freshly generated access token")
        void notExpiredForFreshToken() {
            String token = jwtService.generateAccessToken("user-123", "test@example.com", "USER");
            assertThat(jwtService.isTokenExpired(token)).isFalse();
        }

        @Test
        @DisplayName("expiry date should be ~15 minutes from now for access token")
        void accessTokenExpiryInFuture() {
            long before = System.currentTimeMillis();
            String token = jwtService.generateAccessToken("user-123", "test@example.com", "USER");
            long expiry = jwtService.extractExpiration(token).getTime();
            // expiry should be ~15 min (900,000 ms) in the future
            assertThat(expiry).isGreaterThan(before + 850_000L);
            assertThat(expiry).isLessThan(before + 950_000L);
        }
    }
}
