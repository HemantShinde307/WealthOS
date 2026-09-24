package com.wealthos.auth.security;

/** The authenticated caller, derived only from a verified token — never from request data. */
public record AuthPrincipal(String role, String code, String name) {

    public static final String REQUEST_ATTRIBUTE = "wealthos.principal";

    public boolean isAdvisor() {
        return "advisor".equals(role);
    }

    public boolean isInvestor() {
        return "investor".equals(role);
    }
}
