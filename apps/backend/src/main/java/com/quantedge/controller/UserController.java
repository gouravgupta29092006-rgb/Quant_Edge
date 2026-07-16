package com.quantedge.controller;

import com.quantedge.dto.response.AuthResponse;
import com.quantedge.dto.response.MessageResponse;
import com.quantedge.service.AuthService;
import com.quantedge.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * User profile controller.
 * Base path: /api/v1/users
 * Handles profile updates and user settings management.
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    /**
     * GET /users/me
     * Get the current authenticated user's full profile.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserProfile>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        AuthResponse.UserProfile profile = authService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * POST /users/me
     * Update profile fields — currently supports displayName.
     * Called by the Settings page: apiPost('/users/me', { displayName }).
     */
    @PostMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserProfile>> updateProfile(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String displayName = body.get("displayName");
        AuthResponse.UserProfile profile = authService.updateProfile(
                userDetails.getUsername(), displayName);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * POST /users/change-password (alias route for /auth/change-password).
     * Change the current user's password.
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
}
