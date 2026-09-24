package com.wealthos.auth.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/** Requires a valid bearer token on the routes it is registered for and exposes the caller as a request attribute. */
@Component
public class BearerAuthInterceptor implements HandlerInterceptor {

    private static final String PREFIX = "Bearer ";
    private final JwtService jwtService;

    public BearerAuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true; // CORS preflight carries no credentials
        }
        String header = request.getHeader("Authorization");
        Optional<AuthPrincipal> principal = header != null && header.startsWith(PREFIX)
                ? jwtService.verify(header.substring(PREFIX.length()).trim())
                : Optional.empty();
        if (principal.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.getWriter().write("{\"error\":\"Please sign in again.\"}");
            return false;
        }
        request.setAttribute(AuthPrincipal.REQUEST_ATTRIBUTE, principal.get());
        return true;
    }
}
