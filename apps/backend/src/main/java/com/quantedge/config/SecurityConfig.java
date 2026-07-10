package com.quantedge.config;

import com.quantedge.exception.ErrorCode;
import com.quantedge.security.JwtAuthFilter;
import com.quantedge.security.UserDetailsServiceImpl;
import com.quantedge.util.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security configuration.
 * Per TECH_SPEC.md Â§12 â€” Security Implementation
 *
 * Architecture:
 *   - Stateless JWT (no sessions)
 *   - RBAC via @PreAuthorize (enabled via @EnableMethodSecurity)
 *   - CORS configured for Next.js frontend
 *   - httpOnly cookies for refresh tokens
 *   - BCrypt rounds = 12
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)   // Enables @PreAuthorize
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;
    private final ObjectMapper objectMapper;

    @Value("${quantedge.security.cors-allowed-origins}")
    private String corsAllowedOrigins;

    @Value("${quantedge.security.bcrypt-rounds:12}")
    private int bcryptRounds;

    /**
     * Main security filter chain.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // â”€â”€â”€ Disable CSRF (stateless JWT, no cookies for auth) â”€â”€â”€â”€
            .csrf(AbstractHttpConfigurer::disable)

            // â”€â”€â”€ CORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // â”€â”€â”€ Stateless Session (JWT, no HttpSession) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // â”€â”€â”€ Authorization Rules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            .authorizeHttpRequests(auth -> auth
                // Health + actuator
                .requestMatchers("/health", "/actuator/**").permitAll()
                // Swagger UI (dev only â€” disabled in prod via application-prod.yml)
                .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()
                // Public auth endpoints
                .requestMatchers(HttpMethod.POST,
                    "/auth/register",
                    "/auth/login",
                    "/auth/verify-2fa",
                    "/auth/refresh",
                    "/auth/forgot-password",
                    "/auth/reset-password",
                    "/auth/verify-email"
                ).permitAll()
                // Market overview is public (no auth needed for landing page)
                .requestMatchers(HttpMethod.GET, "/markets/overview").permitAll()
                // All other routes require authentication
                .anyRequest().authenticated()
            )

            // â”€â”€â”€ Custom 401/403 handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setStatus(401);
                    objectMapper.writeValue(
                        response.getOutputStream(),
                        ApiResponse.error(ErrorCode.UNAUTHORIZED.name(), "Authentication required")
                    );
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setStatus(403);
                    objectMapper.writeValue(
                        response.getOutputStream(),
                        ApiResponse.error(ErrorCode.FORBIDDEN.name(), "Insufficient permissions")
                    );
                })
            )

            // â”€â”€â”€ Authentication Provider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            .authenticationProvider(authenticationProvider())

            // â”€â”€â”€ JWT Filter (before Spring's username/password filter) â”€
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS configuration â€” allows Next.js frontend to call the API.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(corsAllowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of(
            "Content-Type", "Authorization", "X-API-Version", "X-Request-ID"
        ));
        config.setExposedHeaders(List.of("X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining"));
        config.setAllowCredentials(true);  // Required for httpOnly refresh token cookie
        config.setMaxAge(86400L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * BCrypt password encoder â€” rounds=12 per TECH_SPEC.md Â§12.1
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(bcryptRounds);
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
