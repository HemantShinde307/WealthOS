package com.wealthos.auth.tenant;

import com.wealthos.auth.chat.ChatException;
import com.wealthos.auth.chat.FileTypePolicy;
import java.util.Base64;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;

/** Input rules for everything a tenant or the platform admin can type. Pure, so each rule is testable. */
public final class TenantValidation {

    static final int MAX_LOGO_BYTES = 300 * 1024;
    private static final int MAX_LOGO_CHARS = 420_000; // base64 of 300 KB is ~400,000 characters

    private static final Pattern SLUG = Pattern.compile("^[a-z][a-z0-9-]{1,28}[a-z0-9]$");
    private static final Pattern COLOR = Pattern.compile("^#[0-9a-fA-F]{6}$");
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern PHONE = Pattern.compile("^[0-9+()\\-\\s]{6,20}$");
    private static final Pattern ARN = Pattern.compile("^ARN-[0-9]{3,8}$");
    private static final Pattern LOGO = Pattern.compile("^data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$");

    /** Words that would collide with the platform's own addresses or be confusing/abusable as a firm's address. */
    static final Set<String> RESERVED_SLUGS = Set.of(
            "www", "app", "api", "admin", "platform", "static", "assets", "mail", "smtp", "support", "help",
            "login", "signup", "billing", "status", "docs", "blog", "cdn", "ftp", "root", "wealthos", "localhost", "test");

    private TenantValidation() {
    }

    private static TenantException bad(String message) {
        return new TenantException(HttpStatus.BAD_REQUEST, message);
    }

    public static String slug(String raw) {
        String s = raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT);
        if (!SLUG.matcher(s).matches() || s.contains("--")) {
            throw bad("The web address must be 3-30 characters: lowercase letters, digits and single hyphens, starting with a letter.");
        }
        if (RESERVED_SLUGS.contains(s)) {
            throw bad("That web address is reserved. Please choose another.");
        }
        return s;
    }

    public static String name(String raw, String label) {
        String s = clean(raw, label);
        if (s == null || s.length() < 2 || s.length() > 80) {
            throw bad("The " + label + " must be 2 to 80 characters.");
        }
        return s;
    }

    /** Empty or null means "not set". */
    public static String optionalText(String raw, int max, String label) {
        String s = clean(raw, label);
        if (s == null || s.isEmpty()) {
            return null;
        }
        if (s.length() > max) {
            throw bad("The " + label + " must be at most " + max + " characters.");
        }
        return s;
    }

    public static String color(String raw, String label) {
        if (raw == null || !COLOR.matcher(raw.trim()).matches()) {
            throw bad("The " + label + " must be a colour like #1A2B3C.");
        }
        return raw.trim().toLowerCase(Locale.ROOT);
    }

    public static String email(String raw, String label) {
        String s = raw == null ? "" : raw.trim();
        if (s.length() > 254 || !EMAIL.matcher(s).matches()) {
            throw bad("Enter a valid " + label + ".");
        }
        return s;
    }

    public static String optionalEmail(String raw, String label) {
        return raw == null || raw.isBlank() ? null : email(raw, label);
    }

    public static String optionalPhone(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String s = raw.trim();
        if (!PHONE.matcher(s).matches()) {
            throw bad("Enter a valid phone number.");
        }
        return s;
    }

    public static String optionalArn(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String s = raw.trim().toUpperCase(Locale.ROOT);
        if (!ARN.matcher(s).matches()) {
            throw bad("An ARN looks like ARN-123456.");
        }
        return s;
    }

    /** BCrypt only uses the first 72 bytes, so longer passwords are refused rather than silently truncated. */
    public static String password(String raw) {
        if (raw == null || raw.length() < 8) {
            throw bad("The password must be at least 8 characters.");
        }
        if (raw.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw bad("The password is too long (at most 72 bytes).");
        }
        return raw;
    }

    /**
     * A logo must be a real PNG, JPEG or WebP image of at most 300 KB, sent as a data URL. SVG is
     * refused because it can carry scripts. The bytes are checked against the declared type.
     */
    public static String logoDataUrl(String raw) {
        if (raw == null || raw.length() > MAX_LOGO_CHARS) {
            throw bad("The logo is too large. Use a PNG, JPEG or WebP image up to 300 KB.");
        }
        Matcher m = LOGO.matcher(raw);
        if (!m.matches()) {
            throw bad("The logo must be a PNG, JPEG or WebP image.");
        }
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(m.group(2));
        } catch (IllegalArgumentException e) {
            throw bad("The logo could not be read.");
        }
        if (bytes.length > MAX_LOGO_BYTES) {
            throw bad("The logo is too large. Use a PNG, JPEG or WebP image up to 300 KB.");
        }
        String ext = m.group(1).equals("jpeg") ? "jpg" : m.group(1);
        try {
            FileTypePolicy.check("logo." + ext, bytes);
        } catch (ChatException e) {
            throw bad("The logo isn't a valid PNG, JPEG or WebP image.");
        }
        return raw;
    }

    private static String clean(String raw, String label) {
        if (raw == null) {
            return null;
        }
        String s = raw.trim();
        for (int i = 0; i < s.length(); i++) {
            if (Character.isISOControl(s.charAt(i))) {
                throw bad("The " + label + " contains characters that are not allowed.");
            }
        }
        return s;
    }
}
