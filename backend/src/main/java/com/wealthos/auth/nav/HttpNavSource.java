package com.wealthos.auth.nav;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Downloads AMFI's published NAV file over HTTPS, with timeouts and a hard size cap. */
@Component
public class HttpNavSource implements NavSource {

    static final int MAX_BYTES = 20 * 1024 * 1024; // the real file is ~1.5 MB
    private static final String ALLOWED_HOST_SUFFIX = "amfiindia.com";

    private final URI uri;
    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            // NORMAL never follows a redirect from https down to http.
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    public HttpNavSource(@Value("${app.nav.source-url}") String url) {
        this.uri = validate(url);
    }

    static URI validate(String url) {
        URI parsed = URI.create(url.trim());
        String host = parsed.getHost();
        if (!"https".equalsIgnoreCase(parsed.getScheme()) || host == null || !(host.equals(ALLOWED_HOST_SUFFIX) || host.endsWith("." + ALLOWED_HOST_SUFFIX))) {
            throw new IllegalStateException("app.nav.source-url must be an https URL on amfiindia.com");
        }
        return parsed;
    }

    @Override
    public String download() throws IOException {
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(Duration.ofSeconds(90))
                .header("User-Agent", "WealthOS-NAV-Refresh/1.0")
                .GET()
                .build();
        try {
            HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
            try (InputStream body = response.body()) {
                if (response.statusCode() != 200) {
                    throw new IOException("AMFI responded with HTTP " + response.statusCode());
                }
                byte[] bytes = body.readNBytes(MAX_BYTES + 1);
                if (bytes.length > MAX_BYTES) {
                    throw new IOException("AMFI file is unexpectedly large");
                }
                return new String(bytes, StandardCharsets.UTF_8);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Download was interrupted", e);
        }
    }
}
