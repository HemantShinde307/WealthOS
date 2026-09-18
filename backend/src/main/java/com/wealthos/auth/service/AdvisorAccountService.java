package com.wealthos.auth.service;

import com.wealthos.auth.model.AdvisorAccount;
import com.wealthos.auth.repository.AdvisorAccountRepository;
import java.util.Optional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdvisorAccountService {

    private final AdvisorAccountRepository repository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdvisorAccountService(AdvisorAccountRepository repository) {
        this.repository = repository;
    }

    public Optional<AdvisorAccount> validateCredentials(String email, String rawPassword) {
        return repository.findByEmailIgnoreCase(email)
                .filter(account -> passwordEncoder.matches(rawPassword, account.getPasswordHash()));
    }
}
