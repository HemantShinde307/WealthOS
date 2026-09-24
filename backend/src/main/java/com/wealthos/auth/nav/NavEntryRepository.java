package com.wealthos.auth.nav;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface NavEntryRepository extends JpaRepository<NavEntry, Long> {

    List<NavEntry> findBySchemeCodeIn(Collection<Long> schemeCodes);

    List<NavEntry> findByIsinGrowthIn(Collection<String> isins);

    List<NavEntry> findByIsinReinvestmentIn(Collection<String> isins);

    @Query("select max(n.navDate) from NavEntry n")
    LocalDate findLatestNavDate();

    @Query("select max(n.updatedAt) from NavEntry n")
    Instant findLastUpdatedAt();
}
