package com.quantedge.service;

import com.quantedge.dto.request.*;
import com.quantedge.dto.response.AuthResponse;
import com.quantedge.entity.*;
import com.quantedge.exception.AppException;
import com.quantedge.exception.ErrorCode;
import com.quantedge.repository.*;
import com.quantedge.security.JwtService;
import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Authentication service Ã¢â‚¬â€ handles all auth flows.
 * Per TECH_SPEC.md Ã‚Â§12 Ã¢â‚¬â€ Security Implementation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final WatchlistRepository watchlistRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuditLogRepository auditLogRepository;

    @Value("${quantedge.security.max-failed-logins:5}")
    private int maxFailedLogins;

    @Value("${quantedge.security.lock-duration-minutes:15}")
    private int lockDurationMinutes;

    @Value("${quantedge.jwt.refresh-token-expiry-ms:2592000000}")
    private long refreshTokenExpiryMs;

    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Register Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    public AuthResponse register(RegisterRequest request, String ipAddress) {
        // Check email uniqueness
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new AppException(ErrorCode.EMAIL_TAKEN);
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .role(User.UserRole.USER)
                .status(User.UserStatus.PENDING_VERIFICATION)
                .build();

        userRepository.save(user);

        // Create default preferences
        UserPreferences prefs = UserPreferences.builder().user(user).build();
        userPreferencesRepository.save(prefs);

        // Create default watchlist
        Watchlist watchlist = Watchlist.builder().user(user).build();
        watchlistRepository.save(watchlist);

        // Send verification email
        String verificationToken = generateAndSaveVerificationToken(user.getId(), "email_verification");
        emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), verificationToken);

        // Audit
        auditLog(user.getId(), AuditLog.AuditAction.AUTH_REGISTER, ipAddress, true);

        log.info("New user registered: {}", user.getEmail());

        // Return tokens (user can browse but email must be verified for trades)
        return buildAuthResponse(user, true);
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Login Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String email = request.getEmail().toLowerCase().trim();
        String ipAddress = httpRequest.getRemoteAddr();

        User user = userRepository.findActiveByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        // Check account status
        if (user.getStatus() == User.UserStatus.SUSPENDED) {
            throw new AppException(ErrorCode.ACCOUNT_SUSPENDED);
        }
        if (user.getStatus() == User.UserStatus.DELETED) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // Check if locked
        if (user.isCurrentlyLocked()) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED,
                    "Account locked until " + user.getLockedUntil());
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            handleFailedLogin(user);
            auditLog(user.getId(), AuditLog.AuditAction.AUTH_LOGIN, ipAddress, false);
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // Reset failed login count
        user.setFailedLoginCount(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(Instant.now());
        user.setLastLoginIp(ipAddress);
        userRepository.save(user);

        // 2FA check
        if (user.isTwoFactorEnabled()) {
            String interimToken = jwtService.generateInterimToken(user.getId());
            auditLog(user.getId(), AuditLog.AuditAction.AUTH_LOGIN, ipAddress, true);
            return AuthResponse.builder()
                    .requires2fa(interimToken)
                    .tokenType("Bearer")
                    .build();
        }

        auditLog(user.getId(), AuditLog.AuditAction.AUTH_LOGIN, ipAddress, true);
        return buildAuthResponse(user, request.isRememberMe());
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 2FA Verification Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    public AuthResponse verify2fa(Verify2faRequest request, HttpServletResponse httpResponse) {
        if (!jwtService.validateTokenType(request.getInterimToken(), "interim")) {
            throw new AppException(ErrorCode.INVALID_TOKEN, "Invalid or expired interim token");
        }

        String userId = jwtService.extractUserId(request.getInterimToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Verify TOTP code
        CodeVerifier verifier = new DefaultCodeVerifier(
                new DefaultCodeGenerator(), new SystemTimeProvider());

        if (!verifier.isValidCode(user.getTwoFactorSecret(), request.getCode())) {
            throw new AppException(ErrorCode.INVALID_2FA_CODE);
        }

        auditLog(userId, AuditLog.AuditAction.AUTH_2FA_VERIFY, null, true);
        return buildAuthResponse(user, false);
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Refresh Token Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    public AuthResponse refresh(RefreshTokenRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String tokenHash = hashToken(request.getRefreshToken());

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN, "Invalid refresh token"));

        if (storedToken.isExpired()) {
            refreshTokenRepository.delete(storedToken);
            throw new AppException(ErrorCode.INVALID_TOKEN, "Refresh token expired");
        }

        // Validate the JWT itself
        if (!jwtService.validateToken(request.getRefreshToken()) ||
            !jwtService.validateTokenType(request.getRefreshToken(), "refresh")) {
            refreshTokenRepository.delete(storedToken);
            throw new AppException(ErrorCode.INVALID_TOKEN, "Invalid refresh token");
        }

        User user = storedToken.getUser();

        // Rotate: delete old token, issue new one
        refreshTokenRepository.delete(storedToken);

        return buildAuthResponse(user, false);
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Logout Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    public void logout(String refreshToken, String userId) {
        String tokenHash = hashToken(refreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash)
                .ifPresent(refreshTokenRepository::delete);
        auditLog(userId, AuditLog.AuditAction.AUTH_LOGOUT, null, true);
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Password Reset Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    public void forgotPassword(String email) {
        userRepository.findActiveByEmail(email.toLowerCase()).ifPresent(user -> {
            String token = generateAndSaveVerificationToken(user.getId(), "password_reset");
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), token);
            log.info("Password reset email sent to: {}", email);
        });
        // Don't reveal whether email exists
    }

    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.getToken());

        VerificationToken vt = verificationTokenRepository
                .findByTokenHashAndType(tokenHash, "password_reset")
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN, "Invalid or expired reset token"));

        if (vt.isExpired() || vt.isUsed()) {
            throw new AppException(ErrorCode.INVALID_TOKEN, "Invalid or expired reset token");
        }

        User user = userRepository.findById(vt.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setFailedLoginCount(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        vt.setUsedAt(Instant.now());
        verificationTokenRepository.save(vt);

        // Invalidate all refresh tokens (security: new password = new sessions)
        refreshTokenRepository.deleteByUserId(user.getId());

        emailService.sendPasswordChangedEmail(user.getEmail(), user.getFirstName());
        auditLog(user.getId(), AuditLog.AuditAction.AUTH_PASSWORD_RESET, null, true);
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Email Verification Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    public void verifyEmail(String token) {
        String tokenHash = hashToken(token);

        VerificationToken vt = verificationTokenRepository
                .findByTokenHashAndType(tokenHash, "email_verification")
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN, "Invalid or expired verification token"));

        if (vt.isExpired() || vt.isUsed()) {
            throw new AppException(ErrorCode.INVALID_TOKEN, "Invalid or expired verification token");
        }

        User user = userRepository.findById(vt.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setEmailVerifiedAt(Instant.now());
        if (user.getStatus() == User.UserStatus.PENDING_VERIFICATION) {
            user.setStatus(User.UserStatus.ACTIVE);
        }
        userRepository.save(user);

        vt.setUsedAt(Instant.now());
        verificationTokenRepository.save(vt);
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Profile Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    @Transactional(readOnly = true)
    public AuthResponse.UserProfile getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return toUserProfile(user);
    }
    /**
     * Update user display name (Settings page — POST /users/me).
     */
    public AuthResponse.UserProfile updateProfile(String userId, String displayName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (displayName != null && !displayName.isBlank()) {
            user.setDisplayName(displayName.trim());
            userRepository.save(user);
        }
        return toUserProfile(user);
    }

    /**
     * Change password — verifies current password, encodes new one,
     * invalidates all existing refresh tokens (POST /auth/change-password).
     */
    public void changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Current password is incorrect");
        }
        if (newPassword.length() < 8) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "New password must be at least 8 characters");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        refreshTokenRepository.deleteByUserId(userId);
        userRepository.save(user);
        log.info("Password changed for user: {}", userId);
    }


    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 2FA Setup Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    public AuthResponse.TwoFactorSetup setup2fa(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String secret = new DefaultSecretGenerator().generate();
        user.setTwoFactorSecret(secret);
        userRepository.save(user);

        String qrUri = String.format(
                "otpauth://totp/QuantEdge:%s?secret=%s&issuer=QuantEdge",
                user.getEmail(), secret);

        return AuthResponse.TwoFactorSetup.builder()
                .secret(secret)
                .qrCodeUri(qrUri)
                .backupCodes(generateBackupCodes())
                .build();
    }

    public void enable2fa(String userId, String code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getTwoFactorSecret() == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Call /2fa/setup first");
        }

        CodeVerifier verifier = new DefaultCodeVerifier(
                new DefaultCodeGenerator(), new SystemTimeProvider());

        if (!verifier.isValidCode(user.getTwoFactorSecret(), code)) {
            throw new AppException(ErrorCode.INVALID_2FA_CODE);
        }

        user.setTwoFactorEnabled(true);
        userRepository.save(user);
        auditLog(userId, AuditLog.AuditAction.AUTH_2FA_ENABLE, null, true);
    }

    public void disable2fa(String userId, String password) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepository.save(user);
        auditLog(userId, AuditLog.AuditAction.AUTH_2FA_DISABLE, null, true);
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Private Helpers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

    private AuthResponse buildAuthResponse(User user, boolean rememberMe) {
        String accessToken = jwtService.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), rememberMe);

        // Persist hashed refresh token
        long expiryMs = rememberMe ? 30L * 24 * 60 * 60 * 1000 : refreshTokenExpiryMs;
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(refreshToken))
                .expiresAt(Instant.now().plusMillis(expiryMs))
                .build();
        refreshTokenRepository.save(rt);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(900L)  // 15 minutes
                .user(toUserProfile(user))
                .build();
    }

    private AuthResponse.UserProfile toUserProfile(User user) {
        return AuthResponse.UserProfile.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private void handleFailedLogin(User user) {
        int count = user.getFailedLoginCount() + 1;
        user.setFailedLoginCount(count);
        if (count >= maxFailedLogins) {
            user.setLockedUntil(Instant.now().plus(lockDurationMinutes, ChronoUnit.MINUTES));
            log.warn("Account locked: {} after {} failed attempts", user.getEmail(), count);
        }
        userRepository.save(user);
    }

    private String generateAndSaveVerificationToken(String userId, String type) {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        VerificationToken vt = VerificationToken.builder()
                .userId(userId)
                .tokenHash(hashToken(rawToken))
                .type(type)
                .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();
        verificationTokenRepository.save(vt);

        return rawToken;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private String[] generateBackupCodes() {
        SecureRandom random = new SecureRandom();
        String[] codes = new String[8];
        for (int i = 0; i < 8; i++) {
            codes[i] = String.format("%08d", random.nextInt(100_000_000));
        }
        return codes;
    }

    private void auditLog(String userId, AuditLog.AuditAction action, String ipAddress, boolean success) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action)
                .ipAddress(ipAddress)
                .success(success)
                .build();
        auditLogRepository.save(log);
    }
}
