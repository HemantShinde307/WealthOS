package com.wealthos.auth.repository;

import com.wealthos.auth.model.InvestorAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvestorAccountRepository extends JpaRepository<InvestorAccount, Long> {

    Optional<InvestorAccount> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
