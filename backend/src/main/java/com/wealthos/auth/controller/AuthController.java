package com.wealthos.auth.controller;

import com.wealthos.auth.dto.AccountResponse;
import com.wealthos.auth.dto.ErrorResponse;
import com.wealthos.auth.dto.LoginRequest;
import com.wealthos.auth.dto.SignupRequest;
import com.wealthos.auth.model.InvestorAccount;
import com.wealthos.auth.repository.InvestorAccountRepository;
import com.wealthos.auth.service.InvestorAccountService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final InvestorAccountService accountService;
    private final InvestorAccountRepository repository;

    public AuthController(InvestorAccountService accountService, InvestorAccountRepository repository) {
        this.accountService = accountService;
        this.repository = repository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        return accountService.validateCredentials(request.getEmail(), request.getPassword())
                .<ResponseEntity<?>>map(account -> ResponseEntity.ok(AccountResponse.from(account)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid email or password.")));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        InvestorAccount created = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(AccountResponse.from(created));
    }

    // Lets the Back Office "who's registered" screen list real accounts instead of reading source code.
    @GetMapping("/accounts")
    public List<AccountResponse> listAccounts() {
        return repository.findAll().stream().map(AccountResponse::from).toList();
    }

    @ExceptionHandler(InvestorAccountService.DuplicateEmailException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateEmail(InvestorAccountService.DuplicateEmailException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(ex.getMessage()));
    }
}
