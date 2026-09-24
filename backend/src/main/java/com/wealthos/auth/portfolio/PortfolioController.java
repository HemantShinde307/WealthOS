package com.wealthos.auth.portfolio;

import com.wealthos.auth.dto.ErrorResponse;
import com.wealthos.auth.portfolio.PortfolioHoldingService.PortfolioException;
import com.wealthos.auth.security.AuthPrincipal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Every route sits behind {@code BearerAuthInterceptor}; the customer always comes from the token. */
@RestController
@RequestMapping("/api/portfolio/holdings")
public class PortfolioController {

    private final PortfolioHoldingService holdings;

    public PortfolioController(PortfolioHoldingService holdings) {
        this.holdings = holdings;
    }

    @GetMapping
    public List<HoldingDto> list(@RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        return holdings.list(principal);
    }

    @PutMapping
    public List<HoldingDto> replace(
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal, @RequestBody HoldingDto.ReplaceRequest request) {
        return holdings.replace(principal, request == null ? null : request.holdings());
    }

    @DeleteMapping
    public ResponseEntity<Void> clear(@RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        holdings.clear(principal);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(PortfolioException.class)
    public ResponseEntity<ErrorResponse> handle(PortfolioException ex) {
        return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage()));
    }
}
