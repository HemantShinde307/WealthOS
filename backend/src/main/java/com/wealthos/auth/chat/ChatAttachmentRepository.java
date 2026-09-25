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
}
