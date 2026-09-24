package com.wealthos.auth.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.PlainJWT;
import com.nimbusds.jwt.SignedJWT;
import java.util.Date;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-that-is-long-enough-32b";

    private final JwtService service = new JwtService(SECRET, 60);

    @Test
    void issuedTokenVerifiesAndCarriesTheIdentity() {
        String token = service.issue("advisor", "ADV-1001", "Amit");

        AuthPrincipal principal = service.verify(token).orElseThrow();

        assertThat(principal.role()).isEqualTo("advisor");
        assertThat(principal.code()).isEqualTo("ADV-1001");
        assertThat(principal.name()).isEqualTo("Amit");
        assertThat(principal.isAdvisor()).isTrue();
    }

    @Test
    void tamperedPayloadIsRejected() {
        String[] parts = service.issue("investor", "CL-1", "Ann").split("\\.");
        String forgedClaims = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(
                "{\"iss\":\"wealthos-auth\",\"role\":\"advisor\",\"code\":\"ADV-1001\",\"exp\":9999999999}".getBytes());

        assertThat(service.verify(parts[0] + "." + forgedClaims + "." + parts[2])).isEmpty();
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() {
        JwtService other = new JwtService("another-secret-that-is-also-long-enough!!", 60);

        assertThat(service.verify(other.issue("advisor", "ADV-1001", "Amit"))).isEmpty();
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService shortLived = new JwtService(SECRET, -1);

        assertThat(service.verify(shortLived.issue("advisor", "ADV-1001", "Amit"))).isEmpty();
    }

    @Test
    void unsignedAlgNoneTokenIsRejected() {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer("wealthos-auth")
                .expirationTime(new Date(System.currentTimeMillis() + 60_000))
                .claim("role", "advisor")
                .claim("code", "ADV-1001")
                .build();

        assertThat(service.verify(new PlainJWT(claims).serialize())).isEmpty();
    }

    @Test
    void tokenUsingADifferentAlgorithmIsRejected() throws Exception {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer("wealthos-auth")
                .expirationTime(new Date(System.currentTimeMillis() + 60_000))
                .claim("role", "advisor")
                .claim("code", "ADV-1001")
                .build();
        SignedJWT hs512 = new SignedJWT(new JWSHeader(JWSAlgorithm.HS512), claims);
        // A 64-byte key is needed to sign HS512; the service must still refuse it because it only accepts HS256.
        hs512.sign(new MACSigner((SECRET + SECRET).getBytes()));

        assertThat(service.verify(hs512.serialize())).isEmpty();
    }

    @Test
    void garbageAndBlankInputAreRejected() {
        assertThat(service.verify(null)).isEmpty();
        assertThat(service.verify("")).isEmpty();
        assertThat(service.verify("not-a-token")).isEmpty();
        assertThat(service.verify("a.b.c")).isEmpty();
    }

    @Test
    void tooShortConfiguredSecretFailsFast() {
        assertThatThrownBy(() -> new JwtService("short", 60)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void missingSecretFallsBackToARandomOneThatStillWorks() {
        JwtService random = new JwtService("", 60);

        assertThat(random.verify(random.issue("investor", "CL-1", "Ann"))).isPresent();
        // and a token from a differently-started instance is not valid here
        assertThat(random.verify(new JwtService("", 60).issue("investor", "CL-1", "Ann"))).isEmpty();
    }
}
