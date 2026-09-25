package com.wealthos.auth.chat;

import static org.assertj.core.api.Assertions.assertThat;

import com.wealthos.auth.chat.ChatAttachmentService.Content;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;

class ChatAttachmentHeadersTest {

    private static Content pdf() {
        return new Content("Statement.pdf", "application/pdf", 4, true, new byte[] {1, 2, 3, 4});
    }

    private static Content docx() {
        return new Content("letter.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 4, false, new byte[] {1, 2, 3, 4});
    }

    @Test
    void aPreviewableFileIsShownInlineOnlyWhenNotAskedToDownload() {
        HttpHeaders view = ChatAttachmentController.contentHeaders(pdf(), false);
        HttpHeaders save = ChatAttachmentController.contentHeaders(pdf(), true);

        assertThat(view.getContentDisposition().isInline()).isTrue();
        assertThat(save.getContentDisposition().isAttachment()).isTrue();
    }

    @Test
    void aFileThatIsNotPreviewableIsAlwaysADownload() {
        HttpHeaders headers = ChatAttachmentController.contentHeaders(docx(), false);

        assertThat(headers.getContentDisposition().isAttachment()).isTrue();
        assertThat(headers.getContentDisposition().getFilename()).isEqualTo("letter.docx");
    }

    @Test
    void everyResponseIsLockedDownAgainstSniffingAndCaching() {
        HttpHeaders headers = ChatAttachmentController.contentHeaders(pdf(), false);

        assertThat(headers.getFirst("X-Content-Type-Options")).isEqualTo("nosniff");
        assertThat(headers.getFirst("Content-Security-Policy")).isEqualTo("default-src 'none'; sandbox");
        assertThat(headers.getCacheControl()).contains("no-store").contains("private");
        assertThat(headers.getContentType().toString()).isEqualTo("application/pdf");
        assertThat(headers.getContentLength()).isEqualTo(4);
    }

    @Test
    void theContentTypeComesFromTheServerNotFromTheUpload() {
        Content c = new Content("x.txt", "text/plain; charset=utf-8", 1, false, new byte[] {'x'});

        assertThat(ChatAttachmentController.contentHeaders(c, false).getContentType().toString()).startsWith("text/plain");
    }

    @Test
    void oddFileNamesCannotInjectHeaders() {
        Content c = new Content("a\"b.pdf", "application/pdf", 1, true, new byte[] {'x'});

        HttpHeaders headers = ChatAttachmentController.contentHeaders(c, true);

        assertThat(headers.getFirst(HttpHeaders.CONTENT_DISPOSITION)).doesNotContain("\n").doesNotContain("\r");
    }
}
