package com.wealthos.auth.chat;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByAdvisorCodeAndCustomerIdOrderByIdDesc(String advisorCode, String customerId, Pageable pageable);

    List<ChatMessage> findByAdvisorCodeAndCustomerIdAndIdLessThanOrderByIdDesc(
            String advisorCode, String customerId, Long beforeId, Pageable pageable);

    Optional<ChatMessage> findFirstByAdvisorCodeAndCustomerIdOrderByIdDesc(String advisorCode, String customerId);

    long countByAdvisorCodeAndCustomerIdAndSenderRoleAndReadAtIsNull(
            String advisorCode, String customerId, ChatSenderRole senderRole);

    @Query("select max(m.id) from ChatMessage m where m.advisorCode = :advisorCode and m.customerId = :customerId and m.senderRole = :role")
    Long findMaxIdBySender(
            @Param("advisorCode") String advisorCode, @Param("customerId") String customerId, @Param("role") ChatSenderRole role);

    @Modifying
    @Query("update ChatMessage m set m.readAt = :now where m.advisorCode = :advisorCode and m.customerId = :customerId "
            + "and m.senderRole = :role and m.readAt is null")
    int markRead(
            @Param("advisorCode") String advisorCode,
            @Param("customerId") String customerId,
            @Param("role") ChatSenderRole role,
            @Param("now") Instant now);
}
