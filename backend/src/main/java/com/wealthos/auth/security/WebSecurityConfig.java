package com.wealthos.auth.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebSecurityConfig implements WebMvcConfigurer {

    private final BearerAuthInterceptor bearerAuthInterceptor;

    public WebSecurityConfig(BearerAuthInterceptor bearerAuthInterceptor) {
        this.bearerAuthInterceptor = bearerAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(bearerAuthInterceptor).addPathPatterns(
                "/api/chat/**",
                "/api/nav/**",
                "/api/portfolio/**",
                "/api/tenant/**",
                "/api/platform/**",
                // the account lists used to be public; they now need a token and only show the caller's own firm
                "/api/auth/accounts",
                "/api/auth/advisor/accounts",
                "/api/auth/admin/accounts",
                "/api/auth/institutional/accounts",
                "/api/auth/family-office/accounts");
    }
}
