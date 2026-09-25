package com.wealthos.auth.repository;

import com.wealthos.auth.model.AdminAccount;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminAccountRepository extends JpaRepository<AdminAccount, Long> {
    Optional<AdminAccount> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);

    List<AdminAccount> findByTenantId(Long tenantId);

    List<AdminAccount> findByTenantIdIsNull();

    boolean existsByAccountCode(String accountCode);
}
