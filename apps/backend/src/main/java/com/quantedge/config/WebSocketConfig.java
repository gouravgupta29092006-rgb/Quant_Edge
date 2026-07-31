package com.quantedge.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.beans.factory.annotation.Value;

/**
 * STOMP WebSocket configuration.
 * Replaces Socket.io + Redis adapter with Spring's built-in WebSocket support.
 * Cost: â‚¹0 â€” built into Spring Boot, no external dependencies.
 *
 * Client connects to: ws://localhost:8080/api/v1/ws
 * Subscribe to topics:  /topic/price/{symbol}
 *                       /user/queue/notifications
 *                       /topic/portfolio/{portfolioId}
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${quantedge.security.cors-allowed-origins}")
    private String allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // In-memory message broker â€” no Redis needed for single-node deployment
        config.enableSimpleBroker(
            "/topic",   // broadcast (stock prices, market movers)
            "/queue"    // user-specific (notifications, portfolio updates)
        );
        // Client sends messages to /app/... prefix
        config.setApplicationDestinationPrefixes("/app");
        // User-specific destinations prefix
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins(allowedOrigins.split(","))
                .withSockJS();   // SockJS fallback for browsers without WS support
    }
}
