package com.wealthos.auth.service;

import com.wealthos.auth.dto.SignupRequest;
import com.wealthos.auth.model.InvestorAccount;
import com.wealthos.auth.repository.InvestorAccountRepository;
import java.util.Optional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class InvestorAccountService {

    private final InvestorAccountRepository repository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public InvestorAccountService(InvestorAccountRepository repository) {
        this.repository = repository;
    }

    /** Returns the matching account only if the password is correct — same result (empty) for an unknown email or a wrong password. */
    public Optional<InvestorAccount> validateCredentials(String email, String rawPassword) {
        return repository.findByEmailIgnoreCase(email)
                .filter(account -> passwordEncoder.matches(rawPassword, account.getPasswordHash()));
    }

    public static class DuplicateEmailException extends RuntimeException {
        public DuplicateEmailException(String message) {
            super(message);
        }
    }

    public InvestorAccount createAccount(SignupRequest request, Long tenantId) {
        if (repository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new DuplicateEmailException("An account with this email already exists. Try logging in instead.");
        }
        InvestorAccount account = new InvestorAccount(
                generateCustomerId(),
                request.getFullName().trim(),
                request.getEmail().trim(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhone() == null ? null : request.getPhone().trim());
        account.setTenantId(tenantId);
        return repository.save(account);
    }

    private String generateCustomerId() {
        long nextSeq = 2000 + repository.count();
        return "CL-U" + nextSeq;
    }
}
