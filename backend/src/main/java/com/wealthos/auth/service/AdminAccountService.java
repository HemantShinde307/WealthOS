package com.wealthos.auth.service;

import com.wealthos.auth.model.AdminAccount;
import com.wealthos.auth.repository.AdminAccountRepository;
import java.util.Optional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminAccountService {

    private final AdminAccountRepository repository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminAccountService(AdminAccountRepository repository) {
        this.repository = repository;
    }

    public Optional<AdminAccount> validateCredentials(String email, String rawPassword) {
        return repository.findByEmailIgnoreCase(email)
                .filter(account -> passwordEncoder.matches(rawPassword, account.getPasswordHash()));
    }
}
