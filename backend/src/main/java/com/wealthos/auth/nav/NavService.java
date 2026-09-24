package com.wealthos.auth.nav;

import com.wealthos.auth.nav.NavDtos.NavDto;
import com.wealthos.auth.nav.NavDtos.NavStatusDto;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class NavService {

    static final int MAX_IDS = 200;
    private static final Pattern ISIN = Pattern.compile("^[A-Z0-9]{12}$");
    private static final Pattern CODE = Pattern.compile("^[0-9]{1,9}$");

    public static class NavException extends RuntimeException {
        private final HttpStatus status;

        public NavException(HttpStatus status, String message) {
            super(message);
            this.status = status;
        }

        public HttpStatus getStatus() {
            return status;
        }
    }

    private final NavEntryRepository repository;
    private final NavRefreshService refresh;

    public NavService(NavEntryRepository repository, NavRefreshService refresh) {
        this.repository = repository;
        this.refresh = refresh;
    }

    /** Latest NAV for the given ISINs (either ISIN column) and/or AMFI scheme codes. Unknown ids are simply absent. */
    public List<NavDto> latest(String isinsCsv, String codesCsv) {
        Set<String> isins = new LinkedHashSet<>();
        for (String raw : split(isinsCsv)) {
            String isin = raw.toUpperCase(Locale.ROOT);
            if (!ISIN.matcher(isin).matches()) {
                throw new NavException(HttpStatus.BAD_REQUEST, "Invalid ISIN: " + safe(raw));
            }
            isins.add(isin);
        }
        Set<Long> codes = new LinkedHashSet<>();
        for (String raw : split(codesCsv)) {
            if (!CODE.matcher(raw).matches()) {
                throw new NavException(HttpStatus.BAD_REQUEST, "Invalid scheme code: " + safe(raw));
            }
            codes.add(Long.parseLong(raw));
        }
        if (isins.isEmpty() && codes.isEmpty()) {
            throw new NavException(HttpStatus.BAD_REQUEST, "Provide isins and/or codes.");
        }
        if (isins.size() + codes.size() > MAX_IDS) {
            throw new NavException(HttpStatus.BAD_REQUEST, "Ask for at most " + MAX_IDS + " schemes at a time.");
        }

        Map<Long, NavEntry> found = new LinkedHashMap<>();
        if (!codes.isEmpty()) {
            repository.findBySchemeCodeIn(codes).forEach(e -> found.put(e.getSchemeCode(), e));
        }
        if (!isins.isEmpty()) {
            repository.findByIsinGrowthIn(isins).forEach(e -> found.put(e.getSchemeCode(), e));
            repository.findByIsinReinvestmentIn(isins).forEach(e -> found.put(e.getSchemeCode(), e));
        }
        List<NavDto> result = new ArrayList<>(found.values().stream().map(NavDto::from).toList());
        result.sort(Comparator.comparingLong(NavDto::schemeCode));
        return result;
    }

    public NavStatusDto status() {
        NavRefreshService.LastRefresh last = refresh.last();
        return new NavStatusDto(
                repository.count(),
                repository.findLatestNavDate(),
                last != null ? last.at() : repository.findLastUpdatedAt(),
                last != null ? last.ok() : null,
                last != null ? last.message() : null);
    }

    private static List<String> split(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        List<String> parts = new ArrayList<>();
        for (String p : csv.split(",")) {
            String t = p.trim();
            if (!t.isEmpty()) {
                parts.add(t);
            }
        }
        return parts;
    }

    /** Echo back only a short, printable snippet of bad input. */
    private static String safe(String raw) {
        String s = raw.length() > 20 ? raw.substring(0, 20) : raw;
        return s.replaceAll("[^A-Za-z0-9 _-]", "?");
    }
}
