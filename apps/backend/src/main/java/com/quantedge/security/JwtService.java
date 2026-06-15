package com.quantedge.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

/**
 * JWT token generation and validation service.
 * Uses JJWT (free library) with HS256 symmetric signing.
 *
 * Token types:
 *   - access  : 15 min TTL, used for all API calls
 *   - refresh : 30 day TTL, httpOnly cookie, rotated on use
 *   - interim : 5 min TTL, only valid for /auth/verify-2fa
 */
@Service
@Slf4j
public class JwtService {

    @Value("${quantedge.jwt.secret}")
    private String jwtSecret;

    @Value("${quantedge.jwt.access-token-expiry-ms}")
    private long accessTokenExpiryMs;

    @Value("${quantedge.jwt.refresh-token-expiry-ms}")
    private long refreshTokenExpiryMs;

    @Value("${quantedge.jwt.interim-token-expiry-ms}")
    private long interimTokenExpiryMs;

    // ─── Token Generation ─────────────────────────────────────

    public String generateAccessToken(String userId, String email, String role) {
        return buildToken(
                Map.of("email", email, "role", role, "type", "access"),
                userId,
                accessTokenExpiryMs
        );
    }

    public String generateRefreshToken(String userId, boolean rememberMe) {
        long expiry = rememberMe ? 30L * 24 * 60 * 60 * 1000 : refreshTokenExpiryMs;
        return buildToken(
                Map.of("type", "refresh"),
                userId,
                expiry
        );
    }

    public String generateInterimToken(String userId) {
        return buildToken(
                Map.of("type", "interim"),
                userId,
                interimTokenExpiryMs
        );
    }

    // ─── Token Validation ─────────────────────────────────────

    public boolean validateToken(String token) {
        try {
            parseAllClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public boolean validateTokenType(String token, String expectedType) {
        try {
            Claims claims = parseAllClaims(token);
            String type = claims.get("type", String.class);
            return expectedType.equals(type);
        } catch (JwtException e) {
            return false;
        }
    }

    // ─── Claims Extraction ────────────────────────────────────

    public String extractUserId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractEmail(String token) {
        return extractClaim(token, claims -> claims.get("email", String.class));
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    // ─── Private Helpers ──────────────────────────────────────

    private String buildToken(Map<String, Object> extraClaims, String subject, long expiryMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiryMs);

        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiry)
                .id(UUID.randomUUID().toString())   // jti — prevents replay
                .signWith(getSigningKey())
                .compact();
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = parseAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims parseAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(
                java.util.Base64.getEncoder().encodeToString(jwtSecret.getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
