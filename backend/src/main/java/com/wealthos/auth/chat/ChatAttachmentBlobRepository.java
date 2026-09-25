package com.wealthos.auth.chat;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatAttachmentBlobRepository extends JpaRepository<ChatAttachmentBlob, String> {
}
