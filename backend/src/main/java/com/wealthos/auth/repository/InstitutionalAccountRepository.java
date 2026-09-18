package com.wealthos.auth.repository;

import com.wealthos.auth.model.InstitutionalAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionalAccountRepository extends JpaRepository<InstitutionalAccount, Long> {
    Optional<InstitutionalAccount> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
