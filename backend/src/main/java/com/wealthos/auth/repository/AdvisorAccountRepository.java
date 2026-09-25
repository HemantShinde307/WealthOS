package com.wealthos.auth.repository;

import com.wealthos.auth.model.AdvisorAccount;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdvisorAccountRepository extends JpaRepository<AdvisorAccount, Long> {
    Optional<AdvisorAccount> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    Optional<AdvisorAccount> findByAccountCode(String accountCode);
    Optional<AdvisorAccount> findByAccountCodeIgnoreCase(String accountCode);

    List<AdvisorAccount> findByTenantId(Long tenantId);

    List<AdvisorAccount> findByTenantIdIsNull();

    boolean existsByAccountCode(String accountCode);
}
