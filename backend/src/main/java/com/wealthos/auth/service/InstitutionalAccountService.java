package com.wealthos.auth.service;

import com.wealthos.auth.model.InstitutionalAccount;
import com.wealthos.auth.repository.InstitutionalAccountRepository;
import java.util.Optional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class InstitutionalAccountService {

    private final InstitutionalAccountRepository repository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public InstitutionalAccountService(InstitutionalAccountRepository repository) {
        this.repository = repository;
    }

    public Optional<InstitutionalAccount> validateCredentials(String email, String rawPassword) {
        return repository.findByEmailIgnoreCase(email)
                .filter(account -> passwordEncoder.matches(rawPassword, account.getPasswordHash()));
    }
}
