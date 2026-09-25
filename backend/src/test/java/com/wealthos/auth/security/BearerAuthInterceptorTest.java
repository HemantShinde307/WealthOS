package com.wealthos.auth.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.wealthos.auth.tenant.TenantGate;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class BearerAuthInterceptorTest {

    private static final String SECRET = "unit-test-secret-that-is-long-enough-32b";

    private final JwtService jwt = new JwtService(SECRET, 60);
    private final TenantGate gate = mock(TenantGate.class);
    private final BearerAuthInterceptor interceptor = new BearerAuthInterceptor(jwt, gate);

    private MockHttpServletResponse call(String method, String path, String token) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.setRequestURI(path);
        if (token != null) {
            request.addHeader("Authorization", "Bearer " + token);
        }
        MockHttpServletResponse response = new MockHttpServletResponse();
        boolean allowed = interceptor.preHandle(request, response, new Object());
        if (allowed) {
            response.setStatus(200);
        }
        return response;
    }

    @Test
    void onlyBrandingAndPlatformLoginArePublic() {
        assertThat(BearerAuthInterceptor.isPublic("GET", "/api/tenant/branding")).isTrue();
        assertThat(BearerAuthInterceptor.isPublic("GET", "/api/tenant/branding/")).isTrue();
        assertThat(BearerAuthInterceptor.isPublic("POST", "/api/platform/login")).isTrue();
        assertThat(BearerAuthInterceptor.isPublic("PUT", "/api/tenant/branding")).isFalse();
        assertThat(BearerAuthInterceptor.isPublic("GET", "/api/tenant/me")).isFalse();
        assertThat(BearerAuthInterceptor.isPublic("GET", "/api/platform/tenants")).isFalse();
        assertThat(BearerAuthInterceptor.isPublic("GET", "/api/auth/accounts")).isFalse();
    }

    @Test
    void noTokenIsRejected() throws Exception {
        assertThat(call("GET", "/api/chat/conversations", null).getStatus()).isEqualTo(401);
    }

    @Test
    void tokenWithoutAFirmIsRejectedEvenIfSigned() throws Exception {
        String legacy = jwt.issue("advisor", "ADV-1", "Amit");
        assertThat(call("GET", "/api/chat/conversations", legacy).getStatus()).isEqualTo(401);
    }

    @Test
    void memberOfAnActiveFirmPasses() throws Exception {
        when(gate.isUsable(7L)).thenReturn(true);
        String token = jwt.issue("advisor", "ADV-1", "Amit", 7L, "acme");
        assertThat(call("GET", "/api/chat/conversations", token).getStatus()).isEqualTo(200);
    }

    @Test
    void memberOfASuspendedFirmIsBlocked() throws Exception {
        when(gate.isUsable(7L)).thenReturn(false);
        String token = jwt.issue("advisor", "ADV-1", "Amit", 7L, "acme");
        assertThat(call("GET", "/api/chat/conversations", token).getStatus()).isEqualTo(403);
    }

    @Test
    void platformAdminSkipsTheFirmCheck() throws Exception {
        String token = jwt.issue(AuthPrincipal.PLATFORM_ADMIN, "PLT-1", "Root", null, null);
        assertThat(call("GET", "/api/platform/tenants", token).getStatus()).isEqualTo(200);
    }

    @Test
    void preflightAndPublicRoutesNeedNoToken() throws Exception {
        assertThat(call("OPTIONS", "/api/chat/conversations", null).getStatus()).isEqualTo(200);
        assertThat(call("GET", "/api/tenant/branding", null).getStatus()).isEqualTo(200);
    }
}
