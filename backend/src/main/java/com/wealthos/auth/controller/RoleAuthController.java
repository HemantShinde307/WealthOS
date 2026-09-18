package com.wealthos.auth.controller;

import com.wealthos.auth.dto.ErrorResponse;
import com.wealthos.auth.dto.LoginRequest;
import com.wealthos.auth.dto.StaffAccountResponse;
import com.wealthos.auth.repository.AdminAccountRepository;
import com.wealthos.auth.repository.AdvisorAccountRepository;
import com.wealthos.auth.repository.FamilyOfficeAccountRepository;
import com.wealthos.auth.repository.InstitutionalAccountRepository;
import com.wealthos.auth.service.AdminAccountService;
import com.wealthos.auth.service.AdvisorAccountService;
import com.wealthos.auth.service.FamilyOfficeAccountService;
import com.wealthos.auth.service.InstitutionalAccountService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Login-only for these four staff-facing roles — unlike investors, there's no self-service
// signup UI for them in the app, so no /signup endpoints here. Each role has its own table
// (advisor_accounts / admin_accounts / institutional_accounts / family_office_accounts), so a
// leaked or brute-forced advisor credential set has no bearing on any other role's accounts.
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

    public RoleAuthController(
            AdvisorAccountService advisorService,
            AdvisorAccountRepository advisorRepository,
            AdminAccountService adminService,
            AdminAccountRepository adminRepository,
            InstitutionalAccountService institutionalService,
            InstitutionalAccountRepository institutionalRepository,
            FamilyOfficeAccountService familyOfficeService,
            FamilyOfficeAccountRepository familyOfficeRepository) {
        this.advisorService = advisorService;
        this.advisorRepository = advisorRepository;
        this.adminService = adminService;
        this.adminRepository = adminRepository;
        this.institutionalService = institutionalService;
        this.institutionalRepository = institutionalRepository;
        this.familyOfficeService = familyOfficeService;
        this.familyOfficeRepository = familyOfficeRepository;
    }

    private static final ResponseEntity<ErrorResponse> INVALID_CREDENTIALS =
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid email or password."));

    @PostMapping("/advisor/login")
    public ResponseEntity<?> advisorLogin(@Valid @RequestBody LoginRequest request) {
        return advisorService.validateCredentials(request.getEmail(), request.getPassword())
                .<ResponseEntity<?>>map(account -> ResponseEntity.ok(StaffAccountResponse.from(account)))
                .orElse(INVALID_CREDENTIALS);
    }

    @GetMapping("/advisor/accounts")
    public List<StaffAccountResponse> advisorAccounts() {
        return advisorRepository.findAll().stream().map(StaffAccountResponse::from).toList();
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody LoginRequest request) {
        return adminService.validateCredentials(request.getEmail(), request.getPassword())
                .<ResponseEntity<?>>map(account -> ResponseEntity.ok(StaffAccountResponse.from(account)))
                .orElse(INVALID_CREDENTIALS);
    }

    @GetMapping("/admin/accounts")
    public List<StaffAccountResponse> adminAccounts() {
        return adminRepository.findAll().stream().map(StaffAccountResponse::from).toList();
    }

    @PostMapping("/institutional/login")
    public ResponseEntity<?> institutionalLogin(@Valid @RequestBody LoginRequest request) {
        return institutionalService.validateCredentials(request.getEmail(), request.getPassword())
                .<ResponseEntity<?>>map(account -> ResponseEntity.ok(StaffAccountResponse.from(account)))
                .orElse(INVALID_CREDENTIALS);
    }

    @GetMapping("/institutional/accounts")
    public List<StaffAccountResponse> institutionalAccounts() {
        return institutionalRepository.findAll().stream().map(StaffAccountResponse::from).toList();
    }

    @PostMapping("/family-office/login")
    public ResponseEntity<?> familyOfficeLogin(@Valid @RequestBody LoginRequest request) {
        return familyOfficeService.validateCredentials(request.getEmail(), request.getPassword())
                .<ResponseEntity<?>>map(account -> ResponseEntity.ok(StaffAccountResponse.from(account)))
                .orElse(INVALID_CREDENTIALS);
    }

    @GetMapping("/family-office/accounts")
    public List<StaffAccountResponse> familyOfficeAccounts() {
        return familyOfficeRepository.findAll().stream().map(StaffAccountResponse::from).toList();
    }
}
