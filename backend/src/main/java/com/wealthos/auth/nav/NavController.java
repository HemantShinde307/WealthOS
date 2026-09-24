package com.wealthos.auth.nav;

import com.wealthos.auth.dto.ErrorResponse;
import com.wealthos.auth.chat.RateLimiter;
import com.wealthos.auth.nav.NavDtos.NavDto;
import com.wealthos.auth.nav.NavDtos.NavStatusDto;
import com.wealthos.auth.nav.NavService.NavException;
import com.wealthos.auth.security.AuthPrincipal;
import java.time.Duration;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Every route sits behind {@code BearerAuthInterceptor}, so callers are always signed-in users. */
@RestController
@RequestMapping("/api/nav")
public class NavController {

    private final NavService navs;
    private final NavRefreshService refresh;
    private final RateLimiter refreshLimiter = new RateLimiter(1, Duration.ofMinutes(1));

    public NavController(NavService navs, NavRefreshService refresh) {
        this.navs = navs;
        this.refresh = refresh;
    }

    @GetMapping("/latest")
    public List<NavDto> latest(@RequestParam(required = false) String isins, @RequestParam(required = false) String codes) {
        return navs.latest(isins, codes);
    }

    @GetMapping("/status")
    public NavStatusDto status() {
        return navs.status();
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshNow(@RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        if (!"admin".equals(principal.role())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("Only an admin can refresh NAVs."));
        }
        if (!refreshLimiter.tryAcquire("refresh")) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(new ErrorResponse("NAVs were refreshed a moment ago. Please wait a minute."));
        }
        try {
            refresh.refresh();
        } catch (NavRefreshService.RefreshException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new ErrorResponse(e.getMessage()));
        }
        return ResponseEntity.ok(navs.status());
    }

    @ExceptionHandler(NavException.class)
    public ResponseEntity<ErrorResponse> handle(NavException ex) {
        return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage()));
    }
}
