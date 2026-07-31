package com.quantedge.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * SpringDoc OpenAPI (Swagger UI) configuration.
 * Access at: http://localhost:8080/api/v1/swagger-ui/index.html
 * Disabled in production via application-prod.yml.
 * Cost: â‚¹0 â€” springdoc-openapi is free.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI quantEdgeOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("QuantEdge API")
                        .version("1.0.0")
                        .description("""
                            AI-powered financial intelligence platform.
                            Educational and analytical only â€” no real-money trading.
                            
                            **Authentication:** Bearer JWT token in Authorization header.
                            Use `POST /auth/login` to obtain an access token.
                            """)
                        .contact(new Contact()
                                .name("QuantEdge")
                                .url("https://github.com/YOUR_USERNAME/quantedge")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT access token from POST /auth/login")));
    }
}
