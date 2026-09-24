package com.wealthos.auth.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.text.ParseException;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Issues and verifies the signed session tokens (HS256 JWT) the frontend sends as
 * {@code Authorization: Bearer <token>} and as the first WebSocket frame.
 *
 * If {@code JWT_SECRET} is not configured a random secret is generated for this run, so an
 * unconfigured deployment can never be forged with a secret that is visible in the source
 * (the trade-off: sessions end whenever the service restarts). Set JWT_SECRET (32+ chars)
 * in any real deployment.
 */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final String ISSUER = "wealthos-auth";
    private static final int MIN_SECRET_BYTES = 32;

    private final byte[] secret;
    private final Duration ttl;

    public JwtService(
            @Value("${app.jwt.secret:}") String configuredSecret,
            @Value("${app.jwt.ttl-minutes:480}") long ttlMinutes) {
        if (configuredSecret == null || configuredSecret.isBlank()) {
            byte[] random = new byte[48];
            new SecureRandom().nextBytes(random);
            this.secret = random;
            log.warn("JWT_SECRET is not set: using a random per-run signing secret. "
                    + "Logins will be invalidated on every restart. Set JWT_SECRET (32+ characters) for real deployments.");
        } else {
            byte[] bytes = configuredSecret.getBytes(StandardCharsets.UTF_8);
            if (bytes.length < MIN_SECRET_BYTES) {
                throw new IllegalStateException("JWT_SECRET must be at least " + MIN_SECRET_BYTES + " bytes long.");
            }
            this.secret = bytes;
        }
        this.ttl = Duration.ofMinutes(ttlMinutes);
    }

    public String issue(String role, String code, String name) {
        Instant now = Instant.now();
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(ISSUER)
                .subject(role + ":" + code)
                .issueTime(Date.from(now))
                .expirationTime(Date.from(now.plus(ttl)))
                .claim("role", role)
                .claim("code", code)
                .claim("name", name)
                .build();
        try {
            SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
            jwt.sign(new MACSigner(secret));
            return jwt.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException("Could not sign session token", e);
        }
    }

    /** Empty for anything that is not a currently valid token signed by this service. */
    public Optional<AuthPrincipal> verify(String token) {
        if (token == null || token.isBlank() || token.length() > 4096) {
            return Optional.empty();
        }
        try {
            SignedJWT jwt = SignedJWT.parse(token);
            // Pin the algorithm: never accept "none" or a token re-signed with a different alg.
            if (!JWSAlgorithm.HS256.equals(jwt.getHeader().getAlgorithm())) {
                return Optional.empty();
            }
            if (!jwt.verify(new MACVerifier(secret))) {
                return Optional.empty();
            }
            JWTClaimsSet claims = jwt.getJWTClaimsSet();
            Date expiry = claims.getExpirationTime();
            if (!ISSUER.equals(claims.getIssuer()) || expiry == null || expiry.before(new Date())) {
                return Optional.empty();
            }
            String role = claims.getStringClaim("role");
            String code = claims.getStringClaim("code");
            String name = claims.getStringClaim("name");
            if (role == null || code == null || code.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(new AuthPrincipal(role, code, name == null ? "" : name));
        } catch (ParseException | JOSEException | RuntimeException e) {
            return Optional.empty();
        }
    }
}
