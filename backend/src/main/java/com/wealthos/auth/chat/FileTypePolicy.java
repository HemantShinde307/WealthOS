package com.wealthos.auth.chat;

import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.function.Predicate;
import org.springframework.http.HttpStatus;

/**
 * Decides whether an uploaded file may be shared. Allow-list only: the extension must be a known
 * document/image type AND the file's real content must match it (the browser's Content-Type and
 * anything the user typed are never trusted). Anything that a browser could execute or render as a
 * page (html, svg, js, ...) or that is an executable/archive is refused.
 */
public final class FileTypePolicy {

    public static final long MAX_BYTES = 10L * 1024 * 1024;
    private static final int MAX_NAME = 150;

    public record Accepted(String safeName, String extension, String contentType, boolean previewable) {
    }

    private record Rule(String contentType, boolean previewable, Predicate<byte[]> looksRight) {
    }

    private static final String OOXML = "application/vnd.openxmlformats-officedocument.";

    private static final Map<String, Rule> RULES = Map.ofEntries(
            Map.entry("pdf", new Rule("application/pdf", true, d -> startsWith(d, '%', 'P', 'D', 'F', '-'))),
            Map.entry("png", new Rule("image/png", true, d -> startsWith(d, 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A))),
            Map.entry("jpg", new Rule("image/jpeg", true, d -> startsWith(d, 0xFF, 0xD8, 0xFF))),
            Map.entry("jpeg", new Rule("image/jpeg", true, d -> startsWith(d, 0xFF, 0xD8, 0xFF))),
            Map.entry("gif", new Rule("image/gif", true, d -> startsWith(d, 'G', 'I', 'F', '8', '7', 'a') || startsWith(d, 'G', 'I', 'F', '8', '9', 'a'))),
            Map.entry("webp", new Rule("image/webp", true, FileTypePolicy::isWebp)),
            Map.entry("docx", new Rule(OOXML + "wordprocessingml.document", false, FileTypePolicy::isMacroFreeZip)),
            Map.entry("xlsx", new Rule(OOXML + "spreadsheetml.sheet", false, FileTypePolicy::isMacroFreeZip)),
            Map.entry("pptx", new Rule(OOXML + "presentationml.presentation", false, FileTypePolicy::isMacroFreeZip)),
            Map.entry("doc", new Rule("application/msword", false, FileTypePolicy::isOle)),
            Map.entry("xls", new Rule("application/vnd.ms-excel", false, FileTypePolicy::isOle)),
            Map.entry("ppt", new Rule("application/vnd.ms-powerpoint", false, FileTypePolicy::isOle)),
            Map.entry("txt", new Rule("text/plain; charset=utf-8", false, FileTypePolicy::isPlainText)),
            Map.entry("csv", new Rule("text/csv; charset=utf-8", false, FileTypePolicy::isPlainText)));

    private FileTypePolicy() {
    }

    public static String allowedExtensionsForMessages() {
        return "PDF, images (PNG, JPG, GIF, WebP), Word, Excel, PowerPoint, TXT and CSV";
    }

    /** @throws ChatException 400 with a user-safe message when the file is not acceptable */
    public static Accepted check(String originalName, byte[] data) {
        if (data == null || data.length == 0) {
            throw new ChatException(HttpStatus.BAD_REQUEST, "That file is empty.");
        }
        String safeName = sanitizeName(originalName);
        String ext = extensionOf(safeName);
        Rule rule = RULES.get(ext);
        if (rule == null) {
            throw new ChatException(HttpStatus.BAD_REQUEST, "This file type isn't allowed. You can share " + allowedExtensionsForMessages() + ".");
        }
        if (!rule.looksRight().test(data)) {
            throw new ChatException(HttpStatus.BAD_REQUEST, "The file's content doesn't match its ." + ext + " type, so it was not accepted.");
        }
        return new Accepted(safeName, ext, rule.contentType(), rule.previewable());
    }

    /**
     * Keeps only the final path segment and safe characters. Path separators, control and
     * invisible/bidi-override characters (used to disguise "evil.exe" as "evilfdp.exe") are replaced.
     */
    public static String sanitizeName(String original) {
        String n = original == null ? "" : original;
        int slash = Math.max(n.lastIndexOf('/'), n.lastIndexOf('\\'));
        if (slash >= 0) {
            n = n.substring(slash + 1);
        }
        StringBuilder sb = new StringBuilder();
        n.codePoints().forEach(cp -> {
            if (Character.isLetterOrDigit(cp) || isCombiningMark(cp) || " ._-()[]&,+'#@".indexOf(cp) >= 0) {
                sb.appendCodePoint(cp);
            } else {
                sb.append('_');
            }
        });
        String cleaned = sb.toString().replaceAll(" {2,}", " ").trim();
        while (cleaned.startsWith(".")) {
            cleaned = cleaned.substring(1);
        }
        if (cleaned.length() > MAX_NAME) {
            String ext = extensionOf(cleaned);
            int keep = ext.isEmpty() ? MAX_NAME : MAX_NAME - ext.length() - 1;
            String base = ext.isEmpty() ? cleaned : cleaned.substring(0, cleaned.length() - ext.length() - 1);
            cleaned = base.substring(0, Math.max(1, Math.min(base.length(), keep))) + (ext.isEmpty() ? "" : "." + ext);
        }
        return cleaned.isEmpty() ? "file" : cleaned;
    }

    /** Vowel signs and virama in Hindi, Marathi, Tamil etc. are combining marks, not letters; names must keep them. */
    private static boolean isCombiningMark(int cp) {
        int type = Character.getType(cp);
        return type == Character.NON_SPACING_MARK || type == Character.COMBINING_SPACING_MARK;
    }

    static String extensionOf(String name) {
        int dot = name.lastIndexOf('.');
        return dot > 0 && dot < name.length() - 1 ? name.substring(dot + 1).toLowerCase(Locale.ROOT) : "";
    }

    // ---- content checks ------------------------------------------------------------------

    private static boolean startsWith(byte[] d, int... signature) {
        if (d.length < signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if ((d[i] & 0xFF) != signature[i]) {
                return false;
            }
        }
        return true;
    }

    private static boolean isWebp(byte[] d) {
        return d.length > 12 && startsWith(d, 'R', 'I', 'F', 'F') && d[8] == 'W' && d[9] == 'E' && d[10] == 'B' && d[11] == 'P';
    }

    private static boolean isOle(byte[] d) {
        return startsWith(d, 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1);
    }

    /** OOXML files are zip archives; a macro-enabled file renamed to .docx still carries vbaProject.bin. */
    private static boolean isMacroFreeZip(byte[] d) {
        return startsWith(d, 'P', 'K', 0x03, 0x04) && !containsAscii(d, "vbaProject.bin");
    }

    private static boolean isPlainText(byte[] d) {
        String text;
        try {
            text = StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(d))
                    .toString();
        } catch (CharacterCodingException e) {
            return false;
        }
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            boolean allowedControl = c == '\t' || c == '\n' || c == '\r' || (i == 0 && c == '﻿');
            if ((c < 0x20 || c == 0x7F) && !allowedControl) {
                return false;
            }
        }
        return true;
    }

    private static boolean containsAscii(byte[] data, String needle) {
        byte[] n = needle.getBytes(StandardCharsets.US_ASCII);
        outer:
        for (int i = 0; i <= data.length - n.length; i++) {
            for (int j = 0; j < n.length; j++) {
                if (data[i + j] != n[j]) {
                    continue outer;
                }
            }
            return true;
        }
        return false;
    }
}
