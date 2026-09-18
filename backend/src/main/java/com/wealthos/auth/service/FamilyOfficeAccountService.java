package com.wealthos.auth.service;

import com.wealthos.auth.model.FamilyOfficeAccount;
import com.wealthos.auth.repository.FamilyOfficeAccountRepository;
import java.util.Optional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class FamilyOfficeAccountService {

    private final FamilyOfficeAccountRepository repository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public FamilyOfficeAccountService(FamilyOfficeAccountRepository repository) {
        this.repository = repository;
    }

    public Optional<FamilyOfficeAccount> validateCredentials(String email, String rawPassword) {
        return repository.findByEmailIgnoreCase(email)
                .filter(account -> passwordEncoder.matches(rawPassword, account.getPasswordHash()));
    }
}
