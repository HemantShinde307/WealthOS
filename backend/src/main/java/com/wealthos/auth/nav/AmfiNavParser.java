package com.wealthos.auth.nav;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Parses AMFI's daily "NAVAll.txt": semicolon separated rows
 * {@code Scheme Code;ISIN Growth/Payout;ISIN Reinvestment;Scheme Name;Plan;Option;NAV;Date}
 * interleaved with blank lines, fund-house names and category headings. Anything that is not a
 * well-formed scheme row (including "N.A." NAVs) is skipped rather than failing the whole file.
 */
public final class AmfiNavParser {

    public record ParsedNav(long schemeCode, String isinGrowth, String isinReinvestment, String schemeName, BigDecimal nav, LocalDate navDate) {
    }

    private static final Pattern ISIN = Pattern.compile("^[A-Z]{2}[A-Z0-9]{9}[0-9]$");
    private static final Pattern CODE = Pattern.compile("^[0-9]{1,9}$");
    private static final BigDecimal MAX_NAV = new BigDecimal("1000000000");
    private static final int MAX_NAME = 300;
    private static final DateTimeFormatter DATE = new DateTimeFormatterBuilder()
            .parseCaseInsensitive()
            .appendPattern("dd-MMM-yyyy")
            .toFormatter(Locale.ENGLISH);

    private AmfiNavParser() {
    }

    public static List<ParsedNav> parse(String text) {
        Map<Long, ParsedNav> byCode = new LinkedHashMap<>();
        if (text == null) {
            return List.of();
        }
        for (String rawLine : text.split("\n")) {
            ParsedNav row = parseLine(rawLine.trim());
            if (row == null) {
                continue;
            }
            ParsedNav existing = byCode.get(row.schemeCode());
            if (existing == null || row.navDate().isAfter(existing.navDate())) {
                byCode.put(row.schemeCode(), row);
            }
        }
        return new ArrayList<>(byCode.values());
    }

    static ParsedNav parseLine(String line) {
        if (line.isEmpty() || line.indexOf(';') < 0) {
            return null;
        }
        String[] f = line.split(";", -1);
        if (f.length < 8) {
            return null;
        }
        String code = f[0].trim();
        if (!CODE.matcher(code).matches()) {
            return null; // the header row
        }
        // NAV and date are taken from the end so a stray ';' inside a scheme name cannot shift them.
        BigDecimal nav = parseNav(f[f.length - 2]);
        LocalDate date = parseDate(f[f.length - 1]);
        if (nav == null || date == null) {
            return null;
        }
        String name = f[3].trim();
        if (name.isEmpty()) {
            return null;
        }
        if (name.length() > MAX_NAME) {
            name = name.substring(0, MAX_NAME);
        }
        return new ParsedNav(Long.parseLong(code), isin(f[1]), isin(f[2]), name, nav, date);
    }

    private static String isin(String value) {
        String v = value.trim().toUpperCase(Locale.ROOT);
        return ISIN.matcher(v).matches() ? v : null;
    }

    private static BigDecimal parseNav(String value) {
        try {
            BigDecimal nav = new BigDecimal(value.trim());
            return nav.signum() > 0 && nav.compareTo(MAX_NAV) < 0 ? nav : null;
        } catch (NumberFormatException e) {
            return null; // "N.A." and similar
        }
    }

    private static LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value.trim(), DATE);
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
