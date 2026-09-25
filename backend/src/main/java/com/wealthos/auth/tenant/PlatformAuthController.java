package com.wealthos.auth.tenant;

import com.wealthos.auth.chat.RateLimiter;
import com.wealthos.auth.dto.ErrorResponse;
import com.wealthos.auth.dto.LoginRequest;
import com.wealthos.auth.security.JwtService;
import com.wealthos.auth.security.AuthPrincipal;
import com.wealthos.auth.tenant.TenantDtos.PlatformLoginResponse;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Sign-in for the platform administrator only. Public route, so it is rate limited per email. */
@RestController
@RequestMapping("/api/platform")
public class PlatformAuthController {

    private static final ResponseEntity<ErrorResponse> INVALID = ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid email or password."));

    private final PlatformAdminAccountRepository accounts;
    private final JwtService jwt;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final RateLimiter attempts = new RateLimiter(10, Duration.ofMinutes(1));

    public PlatformAuthController(PlatformAdminAccountRepository accounts, JwtService jwt) {
        this.accounts = accounts;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (!attempts.tryAcquire("platform-login:" + email)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(new ErrorResponse("Too many attempts. Please wait a minute."));
        }
        return accounts.findByEmailIgnoreCase(email)
                .filter(a -> a.isActive() && encoder.matches(request.getPassword(), a.getPasswordHash()))
                .<ResponseEntity<?>>map(a -> ResponseEntity.ok(new PlatformLoginResponse(
                        a.getAccountCode(), a.getName(), a.getEmail(), jwt.issue(AuthPrincipal.PLATFORM_ADMIN, a.getAccountCode(), a.getName()))))
                .orElse(INVALID);
    }
}
