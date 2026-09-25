package com.wealthos.auth.chat;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatAttachmentRepository extends JpaRepository<ChatAttachment, String> {

    List<ChatAttachment> findByAdvisorCodeAndCustomerIdAndRemovedAtIsNullOrderByUploadedAtDesc(
            String advisorCode, String customerId, Pageable pageable);

    @Query("select coalesce(sum(a.sizeBytes), 0) from ChatAttachment a "
            + "where a.advisorCode = :advisorCode and a.customerId = :customerId and a.removedAt is null")
    long totalStoredBytes(@Param("advisorCode") String advisorCode, @Param("customerId") String customerId);

    /** Everything a distributor firm has stored, found through its advisors (files carry their advisor's code). */
    @Query("select coalesce(sum(a.sizeBytes), 0) from ChatAttachment a where a.removedAt is null "
            + "and a.advisorCode in (select ad.accountCode from AdvisorAccount ad where ad.tenantId = :tenantId)")
    long totalStoredBytesForTenant(@Param("tenantId") Long tenantId);
}
