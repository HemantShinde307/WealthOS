package com.wealthos.auth.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origin}")
    private String allowedOrigin;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        // Comma-separated list, e.g. "http://localhost:4300,https://<user>.github.io" — lets both
        // local dev and the deployed frontend call this API at once.
        String[] origins = Arrays.stream(allowedOrigin.split(",")).map(String::trim).toArray(String[]::new);
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(origins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
            }
        };
    }
}
