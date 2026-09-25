package com.wealthos.auth.security;

import com.wealthos.auth.tenant.TenantGate;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Requires a valid bearer token on the routes it is registered for and exposes the caller as a
 * request attribute. Everyone except the platform administrator must belong to a firm that is
 * still allowed to use the portal, so suspending a firm blocks its people immediately.
 */
@Component
public class BearerAuthInterceptor implements HandlerInterceptor {

    private static final String PREFIX = "Bearer ";
    static final String UNAVAILABLE = "{\"error\":\"This portal is currently unavailable.\"}";
    static final String SIGN_IN_AGAIN = "{\"error\":\"Please sign in again.\"}";

    private final JwtService jwtService;
    private final TenantGate tenantGate;

    public BearerAuthInterceptor(JwtService jwtService, TenantGate tenantGate) {
        this.jwtService = jwtService;
        this.tenantGate = tenantGate;
    }

    /** The two routes under a protected prefix that must work before anyone has signed in. */
    static boolean isPublic(String method, String path) {
        String p = path.endsWith("/") && path.length() > 1 ? path.substring(0, path.length() - 1) : path;
        return (HttpMethod.GET.matches(method) && p.equals("/api/tenant/branding"))
                || (HttpMethod.POST.matches(method) && p.equals("/api/platform/login"));
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (HttpMethod.OPTIONS.matches(request.getMethod()) || isPublic(request.getMethod(), request.getRequestURI())) {
            return true; // CORS preflight carries no credentials; the others are public by design
        }
        String header = request.getHeader("Authorization");
        Optional<AuthPrincipal> principal = header != null && header.startsWith(PREFIX)
                ? jwtService.verify(header.substring(PREFIX.length()).trim())
                : Optional.empty();
        if (principal.isEmpty()) {
            return reject(response, HttpServletResponse.SC_UNAUTHORIZED, SIGN_IN_AGAIN);
        }
        AuthPrincipal p = principal.get();
        if (!p.isPlatformAdmin()) {
            if (p.tenantId() == null) {
                // A token from before multi-tenancy: it says nothing about which firm the user belongs to.
                return reject(response, HttpServletResponse.SC_UNAUTHORIZED, SIGN_IN_AGAIN);
            }
            if (!tenantGate.isUsable(p.tenantId())) {
                return reject(response, HttpServletResponse.SC_FORBIDDEN, UNAVAILABLE);
            }
        }
        request.setAttribute(AuthPrincipal.REQUEST_ATTRIBUTE, p);
        return true;
    }

    private static boolean reject(HttpServletResponse response, int status, String body) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(body);
        return false;
    }
}
