package com.wealthos.auth.controller;

import com.wealthos.auth.dto.AccountResponse;
import com.wealthos.auth.dto.AuthenticatedInvestorResponse;
import com.wealthos.auth.dto.ErrorResponse;
import com.wealthos.auth.dto.LoginRequest;
import com.wealthos.auth.dto.SignupRequest;
import com.wealthos.auth.model.InvestorAccount;
import com.wealthos.auth.repository.InvestorAccountRepository;
import com.wealthos.auth.security.AuthPrincipal;
import com.wealthos.auth.security.JwtService;
import com.wealthos.auth.service.InvestorAccountService;
import com.wealthos.auth.tenant.Tenant;
import com.wealthos.auth.tenant.TenantService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Customer (investor) sign-in and sign-up. Every request is for one distributor firm's portal: a
 * customer can only sign in on the portal of the firm they belong to.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final InvestorAccountService accountService;
    private final InvestorAccountRepository repository;
    private final JwtService jwtService;
    private final TenantService tenantService;

    public AuthController(
            InvestorAccountService accountService, InvestorAccountRepository repository, JwtService jwtService, TenantService tenantService) {
        this.accountService = accountService;
        this.repository = repository;
        this.jwtService = jwtService;
        this.tenantService = tenantService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Tenant tenant = tenantService.requirePortal(request.getTenant());
        return accountService.validateCredentials(request.getEmail(), request.getPassword())
                // An account of another firm gets the same answer as a wrong password.
                .filter(account -> tenantService.belongsTo(account.getTenantId(), tenant))
                .<ResponseEntity<?>>map(account -> ResponseEntity.ok(authenticated(account, tenant)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid email or password.")));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        Tenant tenant = tenantService.requirePortal(request.getTenant());
        tenantService.checkClientLimit(tenant);
        InvestorAccount created = accountService.createAccount(request, tenant.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(authenticated(created, tenant));
    }

    private AuthenticatedInvestorResponse authenticated(InvestorAccount account, Tenant tenant) {
        String token = jwtService.issue("investor", account.getCustomerId(), account.getName(), tenant.getId(), tenant.getSlug());
        return AuthenticatedInvestorResponse.from(account, token, tenant);
    }

    /** Staff only, and only the caller's own firm's customers (this used to list every account to anyone). */
    @GetMapping("/accounts")
    public ResponseEntity<?> listAccounts(@RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        if (principal.tenantId() == null || !(principal.isAdvisor() || principal.isTenantAdmin())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("You don't have access to the customer list."));
        }
        List<AccountResponse> accounts = repository.findByTenantId(principal.tenantId()).stream().map(AccountResponse::from).toList();
        return ResponseEntity.ok(accounts);
    }

    @ExceptionHandler(InvestorAccountService.DuplicateEmailException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateEmail(InvestorAccountService.DuplicateEmailException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(ex.getMessage()));
    }
}
