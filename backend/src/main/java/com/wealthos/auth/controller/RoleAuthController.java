package com.wealthos.auth.controller;

import com.wealthos.auth.dto.AuthenticatedStaffResponse;
import com.wealthos.auth.dto.ErrorResponse;
import com.wealthos.auth.dto.LoginRequest;
import com.wealthos.auth.dto.StaffAccountResponse;
import com.wealthos.auth.model.BaseAccount;
import com.wealthos.auth.repository.AdminAccountRepository;
import com.wealthos.auth.repository.AdvisorAccountRepository;
import com.wealthos.auth.repository.FamilyOfficeAccountRepository;
import com.wealthos.auth.repository.InstitutionalAccountRepository;
import com.wealthos.auth.security.AuthPrincipal;
import com.wealthos.auth.security.JwtService;
import com.wealthos.auth.service.AdminAccountService;
import com.wealthos.auth.service.AdvisorAccountService;
import com.wealthos.auth.service.FamilyOfficeAccountService;
import com.wealthos.auth.service.InstitutionalAccountService;
import com.wealthos.auth.tenant.Tenant;
import com.wealthos.auth.tenant.TenantService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Sign-in for the four staff-facing roles. There is no self-service sign-up for them: the platform
 * creates a firm's first administrator, who then adds the rest of the team. Each role has its own table.
 * Every request is for one firm's portal; a staff member can only sign in on their own firm's portal,
 * and a deactivated member cannot sign in at all.
 */
@RestController
@RequestMapping("/api/auth")
public class RoleAuthController {

    private final AdvisorAccountService advisorService;
    private final AdvisorAccountRepository advisorRepository;
    private final AdminAccountService adminService;
    private final AdminAccountRepository adminRepository;
    private final InstitutionalAccountService institutionalService;
    private final InstitutionalAccountRepository institutionalRepository;
    private final FamilyOfficeAccountService familyOfficeService;
    private final FamilyOfficeAccountRepository familyOfficeRepository;
    private final JwtService jwtService;
    private final TenantService tenantService;

    public RoleAuthController(
            AdvisorAccountService advisorService,
            AdvisorAccountRepository advisorRepository,
            AdminAccountService adminService,
            AdminAccountRepository adminRepository,
            InstitutionalAccountService institutionalService,
            InstitutionalAccountRepository institutionalRepository,
            FamilyOfficeAccountService familyOfficeService,
            FamilyOfficeAccountRepository familyOfficeRepository,
            JwtService jwtService,
            TenantService tenantService) {
        this.advisorService = advisorService;
        this.advisorRepository = advisorRepository;
        this.adminService = adminService;
        this.adminRepository = adminRepository;
        this.institutionalService = institutionalService;
        this.institutionalRepository = institutionalRepository;
        this.familyOfficeService = familyOfficeService;
        this.familyOfficeRepository = familyOfficeRepository;
        this.jwtService = jwtService;
        this.tenantService = tenantService;
    }

    private static final ResponseEntity<ErrorResponse> INVALID_CREDENTIALS =
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid email or password."));

    private ResponseEntity<?> respond(String role, LoginRequest request, Optional<? extends BaseAccount> validated) {
        Tenant tenant = tenantService.requirePortal(request.getTenant());
        return validated
                // Wrong firm and deactivated members get the same answer as a wrong password.
                .filter(account -> account.isActive() && tenantService.belongsTo(account.getTenantId(), tenant))
                .<ResponseEntity<?>>map(account -> ResponseEntity.ok(AuthenticatedStaffResponse.from(
                        account, jwtService.issue(role, account.getAccountCode(), account.getName(), tenant.getId(), tenant.getSlug()), tenant)))
                .orElse(INVALID_CREDENTIALS);
    }

    /** Staff lists: tenant administrators only, and only their own firm (they used to be readable by anyone). */
    private ResponseEntity<?> ownFirm(AuthPrincipal principal, List<? extends BaseAccount> ofFirm) {
        return ResponseEntity.ok(ofFirm.stream().map(StaffAccountResponse::from).toList());
    }

    private static boolean mayList(AuthPrincipal principal) {
        return principal.tenantId() != null && principal.isTenantAdmin();
    }

    private static ResponseEntity<?> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("You don't have access to that list."));
    }

    @PostMapping("/advisor/login")
    public ResponseEntity<?> advisorLogin(@Valid @RequestBody LoginRequest request) {
        return respond("advisor", request, advisorService.validateCredentials(request.getEmail(), request.getPassword()));
    }

    @GetMapping("/advisor/accounts")
    public ResponseEntity<?> advisorAccounts(@RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        return mayList(principal) ? ownFirm(principal, advisorRepository.findByTenantId(principal.tenantId())) : forbidden();
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody LoginRequest request) {
        return respond("admin", request, adminService.validateCredentials(request.getEmail(), request.getPassword()));
    }

    @GetMapping("/admin/accounts")
    public ResponseEntity<?> adminAccounts(@RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        return mayList(principal) ? ownFirm(principal, adminRepository.findByTenantId(principal.tenantId())) : forbidden();
    }

    @PostMapping("/institutional/login")
    public ResponseEntity<?> institutionalLogin(@Valid @RequestBody LoginRequest request) {
        return respond("institutional", request, institutionalService.validateCredentials(request.getEmail(), request.getPassword()));
    }

    @GetMapping("/institutional/accounts")
    public ResponseEntity<?> institutionalAccounts(@RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        return mayList(principal) ? ownFirm(principal, institutionalRepository.findByTenantId(principal.tenantId())) : forbidden();
    }

    @PostMapping("/family-office/login")
    public ResponseEntity<?> familyOfficeLogin(@Valid @RequestBody LoginRequest request) {
        return respond("family_office", request, familyOfficeService.validateCredentials(request.getEmail(), request.getPassword()));
    }

    @GetMapping("/family-office/accounts")
    public ResponseEntity<?> familyOfficeAccounts(@RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        return mayList(principal) ? ownFirm(principal, familyOfficeRepository.findByTenantId(principal.tenantId())) : forbidden();
    }
}
