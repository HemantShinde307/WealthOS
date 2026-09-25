package com.wealthos.auth.tenant;

import com.wealthos.auth.security.AuthPrincipal;
import com.wealthos.auth.tenant.TenantDtos.AddMemberRequest;
import com.wealthos.auth.tenant.TenantDtos.BrandingDto;
import com.wealthos.auth.tenant.TenantDtos.TeamMemberDto;
import com.wealthos.auth.tenant.TenantDtos.TenantMeDto;
import com.wealthos.auth.tenant.TenantDtos.UpdateBrandingRequest;
import com.wealthos.auth.tenant.TenantDtos.UpdateMemberRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * The public branding lookup, plus a firm's own settings and team. Everything except the branding
 * GET sits behind {@code BearerAuthInterceptor} and is limited to the firm's administrator.
 */
@RestController
@RequestMapping("/api/tenant")
public class TenantController {

    private final TenantService tenants;

    public TenantController(TenantService tenants) {
        this.tenants = tenants;
    }

    /** Public: the login page needs it before anyone has signed in. Exposes only look-and-feel and support contact. */
    @GetMapping("/branding")
    public BrandingDto branding(@RequestParam(required = false) String slug) {
        return tenants.publicBranding(slug);
    }

    @GetMapping("/me")
    public TenantMeDto me(@RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        return tenants.me(principal);
    }

    @PutMapping("/branding")
    public BrandingDto updateBranding(
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal, @RequestBody UpdateBrandingRequest request) {
        return tenants.updateBranding(principal, request);
    }

    @GetMapping("/users")
    public List<TeamMemberDto> team(@RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        return tenants.team(principal);
    }

    @PostMapping("/users")
    public ResponseEntity<TeamMemberDto> addMember(
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal, @RequestBody AddMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tenants.addMember(principal, request));
    }

    @PatchMapping("/users/{role}/{id}")
    public TeamMemberDto updateMember(
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal,
            @PathVariable String role,
            @PathVariable Long id,
            @RequestBody UpdateMemberRequest request) {
        return tenants.updateMember(principal, role, id, request);
    }
}
