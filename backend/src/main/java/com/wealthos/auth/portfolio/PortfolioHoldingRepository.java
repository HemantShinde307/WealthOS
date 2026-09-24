package com.wealthos.auth.portfolio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PortfolioHoldingRepository extends JpaRepository<PortfolioHolding, Long> {

    List<PortfolioHolding> findByCustomerIdOrderByIdAsc(String customerId);

    @Modifying
    @Query("delete from PortfolioHolding h where h.customerId = :customerId")
    int deleteAllForCustomer(@Param("customerId") String customerId);
}
