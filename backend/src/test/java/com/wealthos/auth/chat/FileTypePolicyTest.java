package com.wealthos.auth.chat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.wealthos.auth.chat.FileTypePolicy.Accepted;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class FileTypePolicyTest {

    private static final byte[] PDF = "%PDF-1.7\n1 0 obj\n<<>>\nendobj\n".getBytes(StandardCharsets.US_ASCII);
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};
    private static final byte[] JPG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0x10, 'J', 'F', 'I', 'F'};
    private static final byte[] GIF = "GIF89a....".getBytes(StandardCharsets.US_ASCII);
    private static final byte[] WEBP = "RIFF\0\0\0\0WEBPVP8 ".getBytes(StandardCharsets.ISO_8859_1);
    private static final byte[] ZIP = {'P', 'K', 0x03, 0x04, 0x14, 0, 0, 0, 8, 0, '[', 'C', 'o', 'n', 't'};
    private static final byte[] OLE = {(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0, (byte) 0xA1, (byte) 0xB1, 0x1A, (byte) 0xE1, 0, 0};
    private static final byte[] EXE = {'M', 'Z', (byte) 0x90, 0, 3, 0, 0, 0};

    private static void assertRejected(String name, byte[] data) {
        assertThatThrownBy(() -> FileTypePolicy.check(name, data))
                .isInstanceOfSatisfying(ChatException.class, e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    // ---- accepted files -----------------------------------------------------------------

    @Test
    void acceptsGenuineFilesOfEveryAllowedType() {
        assertThat(FileTypePolicy.check("Statement.pdf", PDF).contentType()).isEqualTo("application/pdf");
        assertThat(FileTypePolicy.check("photo.png", PNG).contentType()).isEqualTo("image/png");
        assertThat(FileTypePolicy.check("photo.jpg", JPG).contentType()).isEqualTo("image/jpeg");
        assertThat(FileTypePolicy.check("photo.jpeg", JPG).contentType()).isEqualTo("image/jpeg");
        assertThat(FileTypePolicy.check("anim.gif", GIF).contentType()).isEqualTo("image/gif");
        assertThat(FileTypePolicy.check("pic.webp", WEBP).contentType()).isEqualTo("image/webp");
        assertThat(FileTypePolicy.check("letter.docx", ZIP).contentType()).contains("wordprocessingml");
        assertThat(FileTypePolicy.check("sheet.xlsx", ZIP).contentType()).contains("spreadsheetml");
        assertThat(FileTypePolicy.check("deck.pptx", ZIP).contentType()).contains("presentationml");
        assertThat(FileTypePolicy.check("old.doc", OLE).contentType()).isEqualTo("application/msword");
        assertThat(FileTypePolicy.check("old.xls", OLE).contentType()).isEqualTo("application/vnd.ms-excel");
        assertThat(FileTypePolicy.check("notes.txt", "hello\nworld\t!".getBytes(StandardCharsets.UTF_8)).contentType()).startsWith("text/plain");
        assertThat(FileTypePolicy.check("data.csv", "a,b\n1,2\r\n".getBytes(StandardCharsets.UTF_8)).contentType()).startsWith("text/csv");
    }

    @Test
    void onlyImagesAndPdfsArePreviewable() {
        assertThat(FileTypePolicy.check("a.pdf", PDF).previewable()).isTrue();
        assertThat(FileTypePolicy.check("a.png", PNG).previewable()).isTrue();
        assertThat(FileTypePolicy.check("a.docx", ZIP).previewable()).isFalse();
        assertThat(FileTypePolicy.check("a.txt", "x".getBytes(StandardCharsets.UTF_8)).previewable()).isFalse();
        assertThat(FileTypePolicy.check("a.csv", "x".getBytes(StandardCharsets.UTF_8)).previewable()).isFalse();
    }

    @Test
    void extensionsAreCaseInsensitiveAndTextMayStartWithABom() {
        assertThat(FileTypePolicy.check("REPORT.PDF", PDF).extension()).isEqualTo("pdf");
        assertThat(FileTypePolicy.check("bom.txt", "\uFEFFhello".getBytes(StandardCharsets.UTF_8)).extension()).isEqualTo("txt");
        assertThat(FileTypePolicy.check("hindi.txt", "नमस्ते".getBytes(StandardCharsets.UTF_8)).extension()).isEqualTo("txt");
    }

    // ---- refused files ------------------------------------------------------------------

    @Test
    void refusesEverythingThatIsNotOnTheAllowList() {
        assertRejected("virus.exe", EXE);
        assertRejected("page.html", "<html><script>alert(1)</script></html>".getBytes(StandardCharsets.UTF_8));
        assertRejected("image.svg", "<svg onload=alert(1)/>".getBytes(StandardCharsets.UTF_8));
        assertRejected("run.js", "alert(1)".getBytes(StandardCharsets.UTF_8));
        assertRejected("run.bat", "del *.*".getBytes(StandardCharsets.UTF_8));
        assertRejected("run.ps1", "x".getBytes(StandardCharsets.UTF_8));
        assertRejected("archive.zip", ZIP);
        assertRejected("app.jar", ZIP);
        assertRejected("macro.docm", ZIP);
        assertRejected("macro.xlsm", ZIP);
        assertRejected("noextension", PDF);
        assertRejected(".pdf", PDF);
        assertRejected("", PDF);
        assertRejected(null, PDF);
    }

    @Test
    void theRealContentMustMatchTheExtension() {
        assertRejected("photo.png", PDF);
        assertRejected("report.pdf", EXE);
        assertRejected("evil.exe.pdf", EXE);
        assertRejected("photo.jpg", PNG);
        assertRejected("letter.docx", PDF);
        assertRejected("old.doc", ZIP);
    }

    @Test
    void theLastExtensionIsTheOneThatCounts() {
        assertRejected("invoice.pdf.exe", PDF);
        assertRejected("photo.png.html", PNG);
    }

    @Test
    void macroEnabledContentDisguisedAsAPlainOfficeFileIsRefused() {
        byte[] withMacro = new byte[ZIP.length + 20];
        System.arraycopy(ZIP, 0, withMacro, 0, ZIP.length);
        byte[] marker = "word/vbaProject.bin".getBytes(StandardCharsets.US_ASCII);
        System.arraycopy(marker, 0, withMacro, ZIP.length, marker.length);

        assertRejected("innocent.docx", withMacro);
    }

    @Test
    void textFilesMustBeRealText() {
        assertRejected("bin.txt", new byte[] {'a', 0, 'b'});
        assertRejected("bad.csv", new byte[] {(byte) 0xC3, (byte) 0x28});
        assertRejected("ctrl.txt", "abc\u0001def".getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void emptyFilesAreRefused() {
        assertRejected("a.pdf", new byte[0]);
        assertRejected("a.pdf", null);
    }

    // ---- file names ---------------------------------------------------------------------

    @Test
    void pathsAreStrippedFromNames() {
        assertThat(FileTypePolicy.sanitizeName("../../etc/passwd.txt")).isEqualTo("passwd.txt");
        assertThat(FileTypePolicy.sanitizeName("..\\..\\windows\\system.ini")).isEqualTo("system.ini");
        assertThat(FileTypePolicy.sanitizeName("C:\\Users\\me\\Statement.pdf")).isEqualTo("Statement.pdf");
    }

    @Test
    void invisibleAndBidiOverrideCharactersCannotDisguiseAName() {
        String sneaky = FileTypePolicy.sanitizeName("invoice\u202Efdp.exe");

        assertThat(sneaky).doesNotContain("\u202E").endsWith(".exe");
        assertThat(FileTypePolicy.sanitizeName("a\u0000b\nc.pdf")).doesNotContain("\u0000").doesNotContain("\n");
    }

    @Test
    void unsafeCharactersBecomeUnderscoresAndLettersOfAnyLanguageSurvive() {
        assertThat(FileTypePolicy.sanitizeName("a<b>\"c\".pdf")).isEqualTo("a_b__c_.pdf");
        assertThat(FileTypePolicy.sanitizeName("रिपोर्ट 2026.pdf")).isEqualTo("रिपोर्ट 2026.pdf");
        assertThat(FileTypePolicy.sanitizeName("my   file.pdf")).isEqualTo("my file.pdf");
    }

    @Test
    void namesInIndianScriptsKeepTheirVowelSignsAndStillBlockDirectionOverrides() {
        assertThat(FileTypePolicy.sanitizeName("रिपोर्ट.pdf")).isEqualTo("रिपोर्ट.pdf");
        assertThat(FileTypePolicy.sanitizeName("மாதிரி அறிக்கை.pdf")).isEqualTo("மாதிரி அறிக்கை.pdf");
        assertThat(FileTypePolicy.sanitizeName("खाता‮विवरण.pdf")).doesNotContain("‮");
        assertThat(FileTypePolicy.check("रिपोर्ट.pdf", PDF).safeName()).isEqualTo("रिपोर्ट.pdf");
    }

    @Test
    void longNamesAreShortenedButKeepTheirExtension() {
        String name = FileTypePolicy.sanitizeName("x".repeat(400) + ".pdf");

        assertThat(name).hasSizeLessThanOrEqualTo(150).endsWith(".pdf");
    }

    @Test
    void namesThatSanitiseToNothingBecomeAPlainPlaceholder() {
        assertThat(FileTypePolicy.sanitizeName("...")).isEqualTo("file");
        assertThat(FileTypePolicy.sanitizeName(null)).isEqualTo("file");
    }

    @Test
    void theAcceptedResultCarriesTheSanitisedName() {
        Accepted a = FileTypePolicy.check("../../Statement 1.pdf", PDF);

        assertThat(a.safeName()).isEqualTo("Statement 1.pdf");
    }
}
