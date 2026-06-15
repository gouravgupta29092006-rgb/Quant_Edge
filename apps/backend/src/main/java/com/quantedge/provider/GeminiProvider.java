package com.quantedge.provider;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Gemini AI provider (Google AI Studio — Free Tier).
 * Free: 15 requests/minute, 1M tokens/day, no credit card required.
 * Sign up: https://aistudio.google.com/app/apikey
 *
 * Used for:
 *   - Portfolio analysis and recommendations
 *   - Backtest result interpretation
 *   - Market sentiment analysis
 *   - Strategy improvement suggestions
 */
@Component
@Slf4j
public class GeminiProvider {

    private final WebClient webClient;

    @Value("${quantedge.ai.gemini-api-key:}")
    private String apiKey;

    @Value("${quantedge.ai.gemini-model:gemini-1.5-flash}")
    private String model;

    public GeminiProvider(WebClient.Builder builder) {
        this.webClient = builder
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
    }

    /**
     * Generate AI content using Gemini.
     *
     * @param systemPrompt Contextual instructions for the AI
     * @param userPrompt   The actual user question or data
     * @return Generated text response
     */
    public Mono<String> generate(String systemPrompt, String userPrompt) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key not configured — returning placeholder");
            return Mono.just("AI analysis is not configured. Please set GEMINI_API_KEY.");
        }

        Map<String, Object> requestBody = Map.of(
                "system_instruction", Map.of(
                        "parts", new Object[]{Map.of("text", systemPrompt)}
                ),
                "contents", new Object[]{
                        Map.of("parts", new Object[]{Map.of("text", userPrompt)})
                },
                "generationConfig", Map.of(
                        "maxOutputTokens", 1024,
                        "temperature", 0.3    // Lower = more factual, consistent
                )
        );

        return webClient.post()
                .uri("/models/{model}:generateContent?key={key}", model, apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(this::extractText)
                .doOnNext(r -> log.debug("Gemini response received"))
                .onErrorResume(e -> {
                    log.error("Gemini API error: {}", e.getMessage());
                    return Mono.just("AI analysis temporarily unavailable. Please try again later.");
                });
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<?, ?> response) {
        try {
            var candidates = (java.util.List<?>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) return "No response generated";
            var content = (Map<?, ?>) ((Map<?, ?>) candidates.get(0)).get("content");
            var parts = (java.util.List<?>) content.get("parts");
            return (String) ((Map<?, ?>) parts.get(0)).get("text");
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            return "Failed to parse AI response";
        }
    }
}
