package com.wealthos.auth.tenant;

import com.wealthos.auth.security.AuthPrincipal;
import com.wealthos.auth.tenant.TenantDtos.CreateTenantRequest;
import com.wealthos.auth.tenant.TenantDtos.PlanDto;
import com.wealthos.auth.tenant.TenantDtos.TenantSummaryDto;
import com.wealthos.auth.tenant.TenantDtos.UpdatePlanRequest;
import com.wealthos.auth.tenant.TenantDtos.UpdateTenantRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** The WealthOS owner's console: create, suspend and manage distributor firms and plans. Platform administrator only. */
@RestController
@RequestMapping("/api/platform")
public class PlatformController {

    private final TenantService tenants;

    public PlatformController(TenantService tenants) {
        this.tenants = tenants;
    }

    private static void requirePlatformAdmin(AuthPrincipal principal) {
        if (!principal.isPlatformAdmin()) {
            throw new TenantException(HttpStatus.FORBIDDEN, "Only the platform administrator can do that.");
        }
    }

    @GetMapping("/plans")
    public List<PlanDto> plans(@RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        requirePlatformAdmin(principal);
        return tenants.plans();
    }

    @PutMapping("/plans/{code}")
    public PlanDto updatePlan(
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal, @PathVariable String code, @RequestBody UpdatePlanRequest request) {
        requirePlatformAdmin(principal);
        return tenants.updatePlan(code, request);
    }

    @GetMapping("/tenants")
    public List<TenantSummaryDto> list(@RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        requirePlatformAdmin(principal);
        return tenants.listTenants();
    }

    @PostMapping("/tenants")
    public ResponseEntity<TenantSummaryDto> create(
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal, @RequestBody CreateTenantRequest request) {
        requirePlatformAdmin(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(tenants.createTenant(request));
    }

    @PutMapping("/tenants/{id}")
    public TenantSummaryDto update(
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal, @PathVariable Long id, @RequestBody UpdateTenantRequest request) {
        requirePlatformAdmin(principal);
        return tenants.updateTenant(id, request);
    }
}
