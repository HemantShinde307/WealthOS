package com.wealthos.auth.repository;

import com.wealthos.auth.model.InvestorAccount;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvestorAccountRepository extends JpaRepository<InvestorAccount, Long> {

    Optional<InvestorAccount> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<InvestorAccount> findByCustomerId(String customerId);

    List<InvestorAccount> findByDistributorCode(String distributorCode);

    long countByTenantId(Long tenantId);

    List<InvestorAccount> findByTenantId(Long tenantId);

    List<InvestorAccount> findByTenantIdIsNull();
}
