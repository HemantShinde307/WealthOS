package com.wealthos.auth.repository;

import com.wealthos.auth.model.FamilyOfficeAccount;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FamilyOfficeAccountRepository extends JpaRepository<FamilyOfficeAccount, Long> {
    Optional<FamilyOfficeAccount> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);

    List<FamilyOfficeAccount> findByTenantId(Long tenantId);

    List<FamilyOfficeAccount> findByTenantIdIsNull();

    boolean existsByAccountCode(String accountCode);
}
