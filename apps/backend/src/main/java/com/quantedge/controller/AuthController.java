package com.quantedge.controller;

import com.quantedge.dto.request.*;
import com.quantedge.dto.response.AuthResponse;
import com.quantedge.dto.response.MessageResponse;
import com.quantedge.service.AuthService;
import com.quantedge.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication controller — all public auth endpoints.
 * Per TECH_SPEC.md §2 — Authentication API
 *
 * Base path: /api/v1/auth (configured in SecurityConfig)
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /auth/register
     * Register a new user account.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {

        AuthResponse response = authService.register(request, httpRequest.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /**
     * POST /auth/login
     * Login with email + password.
     * Returns access token. If 2FA enabled, returns interim token instead.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        AuthResponse response = authService.login(request, httpRequest, httpResponse);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /auth/verify-2fa
     * Complete 2FA verification using interim token + TOTP code.
     */
    @PostMapping("/verify-2fa")
    public ResponseEntity<ApiResponse<AuthResponse>> verify2fa(
            @Valid @RequestBody Verify2faRequest request,
            HttpServletResponse httpResponse) {

        AuthResponse response = authService.verify2fa(request, httpResponse);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /auth/refresh
     * Rotate refresh token and issue a new access token.
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        AuthResponse response = authService.refresh(request, httpRequest, httpResponse);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /auth/logout
     * Invalidate the refresh token.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<MessageResponse>> logout(
            @Valid @RequestBody LogoutRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        authService.logout(request.getRefreshToken(), userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(new MessageResponse("Logged out successfully")));
    }

    /**
     * POST /auth/forgot-password
     * Send password reset email.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<MessageResponse>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        authService.forgotPassword(request.getEmail());
        // Always return success — never reveal if email exists (security)
        return ResponseEntity.ok(ApiResponse.success(
                new MessageResponse("If that email is registered, a reset link has been sent.")));
    }

    /**
     * POST /auth/reset-password
     * Reset password using token from email.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<MessageResponse>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(new MessageResponse("Password reset successfully.")));
    }

    /**
     * POST /auth/verify-email
     * Verify email using token from verification email.
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<MessageResponse>> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request) {

        authService.verifyEmail(request.getToken());
        return ResponseEntity.ok(ApiResponse.success(new MessageResponse("Email verified successfully.")));
    }

    /**
     * GET /auth/me
     * Get the currently authenticated user's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserProfile>> me(
            @AuthenticationPrincipal UserDetails userDetails) {

        AuthResponse.UserProfile profile = authService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * POST /auth/change-password
     * Change current user's password (also available at /users/change-password).
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<MessageResponse>> changePassword(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String current = body.get("currentPassword");
        String newPwd  = body.get("newPassword");
        authService.changePassword(userDetails.getUsername(), current, newPwd);
        return ResponseEntity.ok(ApiResponse.success(
                new MessageResponse("Password changed successfully.")));
    }

    /**
     * POST /auth/2fa/setup
     * Generate a TOTP secret and QR code for 2FA setup.
     */
    @PostMapping("/2fa/setup")
    public ResponseEntity<ApiResponse<AuthResponse.TwoFactorSetup>> setup2fa(
            @AuthenticationPrincipal UserDetails userDetails) {

        AuthResponse.TwoFactorSetup setup = authService.setup2fa(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(setup));
    }

    /**
     * POST /auth/2fa/enable
     * Enable 2FA after verifying TOTP code.
     */
    @PostMapping("/2fa/enable")
    public ResponseEntity<ApiResponse<MessageResponse>> enable2fa(
            @Valid @RequestBody Enable2faRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        authService.enable2fa(userDetails.getUsername(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success(
                new MessageResponse("Two-factor authentication enabled.")));
    }

    /**
     * POST /auth/2fa/disable
     * Disable 2FA (requires current password).
     */
    @PostMapping("/2fa/disable")
    public ResponseEntity<ApiResponse<MessageResponse>> disable2fa(
            @Valid @RequestBody Disable2faRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        authService.disable2fa(userDetails.getUsername(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.success(
                new MessageResponse("Two-factor authentication disabled.")));
    }
}
