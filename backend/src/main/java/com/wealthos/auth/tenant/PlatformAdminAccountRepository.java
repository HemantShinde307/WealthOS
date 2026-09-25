package com.wealthos.auth.tenant;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformAdminAccountRepository extends JpaRepository<PlatformAdminAccount, Long> {

    Optional<PlatformAdminAccount> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
