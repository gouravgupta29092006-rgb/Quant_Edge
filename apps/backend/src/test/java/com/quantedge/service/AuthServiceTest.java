package com.quantedge.service;

import com.quantedge.dto.request.RegisterRequest;
import com.quantedge.dto.response.AuthResponse;
import com.quantedge.entity.AuditLog;
import com.quantedge.entity.User;
import com.quantedge.entity.UserPreferences;
import com.quantedge.entity.Watchlist;
import com.quantedge.exception.AppException;
import com.quantedge.repository.*;
import com.quantedge.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService.
 * Phase 15 — TECH_SPEC.md §15 — Testing Strategy
 *
 * Uses Mockito to isolate service logic from DB and external dependencies.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private VerificationTokenRepository verificationTokenRepository;
    @Mock private UserPreferencesRepository userPreferencesRepository;
    @Mock private WatchlistRepository watchlistRepository;
    @Mock private AuditLogRepository auditLogRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setup() {
        // Inject @Value fields via reflection — must match AuthService field names exactly
        ReflectionTestUtils.setField(authService, "maxFailedLogins",    5);
        ReflectionTestUtils.setField(authService, "lockDurationMinutes", 15);
        ReflectionTestUtils.setField(authService, "refreshTokenExpiryMs", 604_800_000L);
    }

    // ─── Register ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("register()")
    class Register {

        @Test
        @DisplayName("should create user, preferences, watchlist and return tokens")
        void successfulRegistration() {
            RegisterRequest req = new RegisterRequest();
            req.setEmail("test@example.com");
            req.setPassword("SecurePass@1");
            req.setFirstName("John");
            req.setLastName("Doe");

            when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
            when(passwordEncoder.encode("SecurePass@1")).thenReturn("$hashed$");
            // JPA sets the ID on the managed entity after save(); simulate that here
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                u.setId("user-id-123");   // set the generated ID on the original object
                return u;
            });
            when(userPreferencesRepository.save(any(UserPreferences.class)))
                    .thenReturn(new UserPreferences());
            when(watchlistRepository.save(any(Watchlist.class))).thenReturn(new Watchlist());
            when(verificationTokenRepository.save(any())).thenReturn(null);
            when(auditLogRepository.save(any(AuditLog.class))).thenReturn(null);
            when(jwtService.generateAccessToken(anyString(), anyString(), anyString())).thenReturn("access-token");
            when(jwtService.generateRefreshToken(anyString(), anyBoolean())).thenReturn("refresh-token");
            when(refreshTokenRepository.save(any())).thenReturn(null);
            doNothing().when(emailService).sendVerificationEmail(anyString(), anyString(), anyString());


            AuthResponse result = authService.register(req, "127.0.0.1");

            assertThat(result).isNotNull();
            assertThat(result.getAccessToken()).isEqualTo("access-token");
            assertThat(result.getRefreshToken()).isEqualTo("refresh-token");
            assertThat(result.getUser().getEmail()).isEqualTo("test@example.com");
            assertThat(result.getUser().getRole()).isEqualTo("USER");

            verify(userRepository).save(any(User.class));
            verify(userPreferencesRepository).save(any(UserPreferences.class));
            verify(watchlistRepository).save(any(Watchlist.class));
            verify(emailService).sendVerificationEmail(eq("test@example.com"), anyString(), anyString());
        }

        @Test
        @DisplayName("should throw CONFLICT if email already exists")
        void duplicateEmailThrowsConflict() {
            RegisterRequest req = new RegisterRequest();
            req.setEmail("taken@example.com");
            req.setPassword("SecurePass@1");
            req.setFirstName("Jane");
            req.setLastName("Doe");

            when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(req, "127.0.0.1"))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("already registered");

            verify(userRepository, never()).save(any());
        }
    }

    // ─── Update Profile ───────────────────────────────────────────────────────

    @Nested
    @DisplayName("updateProfile()")
    class UpdateProfile {

        @Test
        @DisplayName("should update display name when provided")
        void updatesDisplayName() {
            User user = User.builder()
                    .id("user-id")
                    .email("user@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .role(User.UserRole.USER)
                    .status(User.UserStatus.ACTIVE)
                    .twoFactorEnabled(false)
                    .build();
            when(userRepository.findById("user-id")).thenReturn(Optional.of(user));
            when(userRepository.save(user)).thenReturn(user);

            AuthResponse.UserProfile result = authService.updateProfile("user-id", "John Display");

            assertThat(user.getDisplayName()).isEqualTo("John Display");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("should skip update if displayName is blank")
        void skipsUpdateForBlankName() {
            User user = User.builder()
                    .id("user-id")
                    .email("user@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .role(User.UserRole.USER)
                    .status(User.UserStatus.ACTIVE)
                    .twoFactorEnabled(false)
                    .build();
            when(userRepository.findById("user-id")).thenReturn(Optional.of(user));

            authService.updateProfile("user-id", "  ");

            verify(userRepository, never()).save(any());
        }
    }

    // ─── Change Password ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("changePassword()")
    class ChangePassword {

        @Test
        @DisplayName("should hash new password and invalidate all refresh tokens")
        void successfulPasswordChange() {
            User user = User.builder()
                    .id("user-id")
                    .email("user@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .passwordHash("$old$hash$")
                    .role(User.UserRole.USER)
                    .status(User.UserStatus.ACTIVE)
                    .twoFactorEnabled(false)
                    .build();
            when(userRepository.findById("user-id")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("OldPass@1", "$old$hash$")).thenReturn(true);
            when(passwordEncoder.encode("NewPass@1")).thenReturn("$new$hash$");
            when(userRepository.save(user)).thenReturn(user);

            authService.changePassword("user-id", "OldPass@1", "NewPass@1");

            assertThat(user.getPasswordHash()).isEqualTo("$new$hash$");
            verify(refreshTokenRepository).deleteByUserId("user-id");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("should throw INVALID_CREDENTIALS if current password wrong")
        void wrongCurrentPasswordThrows() {
            User user = User.builder()
                    .id("user-id")
                    .email("user@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .passwordHash("$old$hash$")
                    .role(User.UserRole.USER)
                    .status(User.UserStatus.ACTIVE)
                    .twoFactorEnabled(false)
                    .build();
            when(userRepository.findById("user-id")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("WrongPass", "$old$hash$")).thenReturn(false);

            assertThatThrownBy(() -> authService.changePassword("user-id", "WrongPass", "NewPass@1"))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Current password is incorrect");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw VALIDATION_ERROR if new password is too short")
        void shortNewPasswordThrows() {
            User user = User.builder()
                    .id("user-id")
                    .email("user@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .passwordHash("$old$hash$")
                    .role(User.UserRole.USER)
                    .status(User.UserStatus.ACTIVE)
                    .twoFactorEnabled(false)
                    .build();
            when(userRepository.findById("user-id")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("OldPass@1", "$old$hash$")).thenReturn(true);

            assertThatThrownBy(() -> authService.changePassword("user-id", "OldPass@1", "short"))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("at least 8 characters");
        }
    }

    // ─── Get Profile ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getProfile()")
    class GetProfile {

        @Test
        @DisplayName("should return UserProfile for valid user ID")
        void returnsProfile() {
            User user = User.builder()
                    .id("user-id")
                    .email("user@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .role(User.UserRole.USER)
                    .status(User.UserStatus.ACTIVE)
                    .twoFactorEnabled(false)
                    .createdAt(Instant.now())
                    .build();
            when(userRepository.findById("user-id")).thenReturn(Optional.of(user));

            AuthResponse.UserProfile profile = authService.getProfile("user-id");

            assertThat(profile.getEmail()).isEqualTo("user@example.com");
            assertThat(profile.getFirstName()).isEqualTo("John");
            assertThat(profile.getRole()).isEqualTo("USER");
        }

        @Test
        @DisplayName("should throw USER_NOT_FOUND for unknown user ID")
        void throwsForUnknownUser() {
            when(userRepository.findById("bad-id")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.getProfile("bad-id"))
                    .isInstanceOf(AppException.class);
        }
    }
}
