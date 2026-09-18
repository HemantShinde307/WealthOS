package com.wealthos.auth.repository;

import com.wealthos.auth.model.AdvisorAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdvisorAccountRepository extends JpaRepository<AdvisorAccount, Long> {
    Optional<AdvisorAccount> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
