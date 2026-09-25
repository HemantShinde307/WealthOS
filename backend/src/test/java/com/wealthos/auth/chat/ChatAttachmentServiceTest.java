package com.wealthos.auth.chat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.wealthos.auth.chat.ChatAttachmentService.Content;
import com.wealthos.auth.chat.ChatService.Conversation;
import com.wealthos.auth.security.AuthPrincipal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;

class ChatAttachmentServiceTest {

    private static final String FILE_ID = "11111111-2222-3333-4444-555555555555";
    private static final byte[] PDF = "%PDF-1.7\nhello".getBytes(StandardCharsets.US_ASCII);

    private ChatService chat;
    private ChatAttachmentRepository attachments;
    private ChatAttachmentBlobRepository blobs;
    private ChatMessageRepository messages;
    private ChatAttachmentService service;

    private final AuthPrincipal advisor = new AuthPrincipal("advisor", "ADV-1001", "Amit");
    private final AuthPrincipal otherAdvisor = new AuthPrincipal("advisor", "ADV-2002", "Other");
    private final AuthPrincipal ann = new AuthPrincipal("investor", "CL-1", "Ann");
    private final Conversation advisorConv = new Conversation("ADV-1001", "CL-1", ChatSenderRole.ADVISOR);
    private final Conversation annConv = new Conversation("ADV-1001", "CL-1", ChatSenderRole.INVESTOR);

    /** A transaction manager that does nothing: these tests are about rules, not persistence. */
    private static TransactionTemplate noTx() {
        return new TransactionTemplate(new PlatformTransactionManager() {
            @Override
            public TransactionStatus getTransaction(TransactionDefinition definition) {
                return new SimpleTransactionStatus();
            }

            @Override
            public void commit(TransactionStatus status) {
            }

            @Override
            public void rollback(TransactionStatus status) {
            }
        });
    }

    @BeforeEach
    void setUp() {
        chat = mock(ChatService.class);
        attachments = mock(ChatAttachmentRepository.class);
        blobs = mock(ChatAttachmentBlobRepository.class);
        messages = mock(ChatMessageRepository.class);
        service = new ChatAttachmentService(chat, attachments, blobs, messages, noTx(), mock(com.wealthos.auth.tenant.TenantLimits.class));

        when(chat.resolve(advisor, "CL-1")).thenReturn(advisorConv);
        when(chat.resolve(ann, null)).thenReturn(annConv);
        when(chat.resolve(ann, "CL-1")).thenReturn(annConv);
        when(chat.resolve(otherAdvisor, "CL-1")).thenThrow(new ChatException(HttpStatus.FORBIDDEN, "not yours"));
        when(messages.save(any(ChatMessage.class))).thenAnswer(inv -> inv.getArgument(0));
        when(attachments.totalStoredBytes(anyString(), anyString())).thenReturn(0L);
    }

    private void assertRejected(Runnable call, HttpStatus status) {
        assertThatThrownBy(call::run).isInstanceOfSatisfying(ChatException.class, e -> assertThat(e.getStatus()).isEqualTo(status));
    }

    private ChatAttachment stored(ChatSenderRole uploader, boolean removed) {
        ChatAttachment a = new ChatAttachment(FILE_ID, "ADV-1001", "CL-1", uploader, "Statement.pdf", "application/pdf", PDF.length);
        if (removed) {
            a.markRemoved();
        }
        when(attachments.findById(FILE_ID)).thenReturn(Optional.of(a));
        return a;
    }

    // ---- uploading ----------------------------------------------------------------------

    @Test
    void uploadStoresTheFileAndMessageAndDeliversItLive() {
        ChatMessageDto dto = service.upload(ann, null, "../../Statement.pdf", PDF, "  here you go  ");

        assertThat(dto.text()).isEqualTo("here you go");
        assertThat(dto.senderRole()).isEqualTo(ChatSenderRole.INVESTOR);
        assertThat(dto.advisorCode()).isEqualTo("ADV-1001");
        assertThat(dto.attachment().name()).isEqualTo("Statement.pdf");
        assertThat(dto.attachment().previewable()).isTrue();
        assertThat(dto.attachment().removed()).isFalse();

        ArgumentCaptor<ChatAttachmentBlob> blob = ArgumentCaptor.forClass(ChatAttachmentBlob.class);
        verify(blobs).save(blob.capture());
        assertThat(blob.getValue().getData()).isEqualTo(PDF);
        assertThat(blob.getValue().getAttachmentId()).isEqualTo(dto.attachment().id()).matches("^[0-9a-f-]{36}$");
        verify(chat).publish(eq(annConv), any(), eq(null), eq(null));
    }

    @Test
    void theFileIsNeverStoredUnderTheUsersOwnName() {
        ChatMessageDto dto = service.upload(ann, null, "../../etc/passwd.pdf", PDF, null);

        assertThat(dto.attachment().id()).doesNotContain("passwd").doesNotContain("/");
        assertThat(dto.text()).isEmpty();
    }

    @Test
    void uploadIntoSomeoneElsesConversationStoresNothing() {
        assertRejected(() -> service.upload(otherAdvisor, "CL-1", "a.pdf", PDF, null), HttpStatus.FORBIDDEN);

        verify(blobs, never()).save(any());
        verify(chat, never()).publish(any(), any(), any(), any());
    }

    @Test
    void badFilesAreRefusedBeforeAnythingIsStored() {
        assertRejected(() -> service.upload(ann, null, "virus.exe", new byte[] {'M', 'Z', 0, 0}, null), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.upload(ann, null, "fake.pdf", "not a pdf".getBytes(StandardCharsets.UTF_8), null), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.upload(ann, null, "a.pdf", new byte[0], null), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.upload(ann, null, "a.pdf", null, null), HttpStatus.BAD_REQUEST);
        assertRejected(() -> service.upload(ann, null, "a.pdf", PDF, "x".repeat(2001)), HttpStatus.BAD_REQUEST);

        verify(blobs, never()).save(any());
    }

    @Test
    void filesOverTenMegabytesAreRefused() {
        byte[] big = new byte[(int) FileTypePolicy.MAX_BYTES + 1];
        System.arraycopy(PDF, 0, big, 0, PDF.length);

        assertRejected(() -> service.upload(ann, null, "big.pdf", big, null), HttpStatus.PAYLOAD_TOO_LARGE);
        verify(blobs, never()).save(any());
    }

    @Test
    void aFullConversationRefusesMoreFiles() {
        when(attachments.totalStoredBytes("ADV-1001", "CL-1")).thenReturn(ChatAttachmentService.MAX_CONVERSATION_BYTES - 5);

        assertRejected(() -> service.upload(ann, null, "a.pdf", PDF, null), HttpStatus.PAYLOAD_TOO_LARGE);
    }

    @Test
    void tooManyUploadsInAMinuteAreThrottled() {
        for (int i = 0; i < 10; i++) {
            service.upload(ann, null, "a" + i + ".pdf", PDF, null);
        }

        assertRejected(() -> service.upload(ann, null, "one-more.pdf", PDF, null), HttpStatus.TOO_MANY_REQUESTS);
    }

    // ---- listing ------------------------------------------------------------------------

    @Test
    void listingIsScopedToTheCallersConversation() {
        ChatAttachment shared = stored(ChatSenderRole.INVESTOR, false);
        when(attachments.findByAdvisorCodeAndCustomerIdAndRemovedAtIsNullOrderByUploadedAtDesc(anyString(), anyString(), any(Pageable.class)))
                .thenReturn(List.of(shared));

        var files = service.list(advisor, "CL-1");

        assertThat(files).hasSize(1);
        assertThat(files.get(0).uploadedBy()).isEqualTo(ChatSenderRole.INVESTOR);
        verify(attachments).findByAdvisorCodeAndCustomerIdAndRemovedAtIsNullOrderByUploadedAtDesc(eq("ADV-1001"), eq("CL-1"), any(Pageable.class));
    }

    @Test
    void anAdvisorCannotListSomeoneElsesCustomersFiles() {
        assertRejected(() -> service.list(otherAdvisor, "CL-1"), HttpStatus.FORBIDDEN);
    }

    // ---- opening / downloading ----------------------------------------------------------

    @Test
    void bothParticipantsCanOpenTheFile() {
        stored(ChatSenderRole.INVESTOR, false);
        when(blobs.findById(FILE_ID)).thenReturn(Optional.of(new ChatAttachmentBlob(FILE_ID, PDF)));

        Content byAdvisor = service.content(advisor, FILE_ID);
        Content byCustomer = service.content(ann, FILE_ID);

        assertThat(byAdvisor.data()).isEqualTo(PDF);
        assertThat(byAdvisor.contentType()).isEqualTo("application/pdf");
        assertThat(byCustomer.name()).isEqualTo("Statement.pdf");
    }

    @Test
    void outsidersAndUnknownIdsAllLookTheSame() {
        stored(ChatSenderRole.INVESTOR, false);

        assertRejected(() -> service.content(otherAdvisor, FILE_ID), HttpStatus.NOT_FOUND);
        assertRejected(() -> service.content(ann, "99999999-2222-3333-4444-555555555555"), HttpStatus.NOT_FOUND);
        assertRejected(() -> service.content(ann, "../../etc/passwd"), HttpStatus.NOT_FOUND);
        assertRejected(() -> service.content(ann, null), HttpStatus.NOT_FOUND);
        assertRejected(() -> service.content(ann, "x".repeat(500)), HttpStatus.NOT_FOUND);
    }

    @Test
    void aCustomerWhoLinkedADifferentDistributorLosesAccessToTheOldFiles() {
        ChatAttachment a = new ChatAttachment(FILE_ID, "ADV-OLD", "CL-1", ChatSenderRole.INVESTOR, "Statement.pdf", "application/pdf", 10);
        when(attachments.findById(FILE_ID)).thenReturn(Optional.of(a));

        assertRejected(() -> service.content(ann, FILE_ID), HttpStatus.NOT_FOUND);
        assertRejected(() -> service.content(advisor, FILE_ID), HttpStatus.NOT_FOUND);
    }

    @Test
    void aRemovedFileCannotBeOpened() {
        stored(ChatSenderRole.INVESTOR, true);

        assertRejected(() -> service.content(advisor, FILE_ID), HttpStatus.NOT_FOUND);
    }

    // ---- removing -----------------------------------------------------------------------

    @Test
    void theDistributorCanRemoveAnyFileAndItsBytesAreErased() {
        stored(ChatSenderRole.INVESTOR, false);

        service.remove(advisor, FILE_ID);

        verify(blobs).deleteById(FILE_ID);
        verify(chat).publishAttachmentRemoved(advisorConv, FILE_ID);
    }

    @Test
    void aCustomerCanRemoveTheirOwnUploadButNotTheDistributorsFile() {
        stored(ChatSenderRole.INVESTOR, false);
        service.remove(ann, FILE_ID);
        verify(blobs).deleteById(FILE_ID);

        stored(ChatSenderRole.ADVISOR, false);
        assertRejected(() -> service.remove(ann, FILE_ID), HttpStatus.FORBIDDEN);
    }

    @Test
    void nobodyElseCanRemoveAFileAndAlreadyRemovedFilesAreGone() {
        stored(ChatSenderRole.INVESTOR, false);
        assertRejected(() -> service.remove(otherAdvisor, FILE_ID), HttpStatus.NOT_FOUND);
        verify(blobs, never()).deleteById(anyString());

        stored(ChatSenderRole.INVESTOR, true);
        assertRejected(() -> service.remove(advisor, FILE_ID), HttpStatus.NOT_FOUND);
    }

    @Test
    void removalNeverTouchesOtherFiles() {
        stored(ChatSenderRole.INVESTOR, false);

        service.remove(advisor, FILE_ID);

        verify(blobs).deleteById(FILE_ID);
        verify(attachments, never()).deleteById(anyString());
        verify(messages, never()).deleteById(anyLong());
    }
}
