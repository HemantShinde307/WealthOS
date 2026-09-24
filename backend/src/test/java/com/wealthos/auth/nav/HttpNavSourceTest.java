package com.wealthos.auth.nav;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class HttpNavSourceTest {

    @Test
    void acceptsTheOfficialAmfiAddresses() {
        assertThat(HttpNavSource.validate("https://portal.amfiindia.com/spages/NAVAll.txt").getHost()).isEqualTo("portal.amfiindia.com");
        assertThat(HttpNavSource.validate("https://www.amfiindia.com/spages/NAVAll.txt")).isNotNull();
        assertThat(HttpNavSource.validate("https://amfiindia.com/x")).isNotNull();
    }

    @Test
    void rejectsAnythingThatIsNotHttpsOnAmfi() {
        assertThatThrownBy(() -> HttpNavSource.validate("http://portal.amfiindia.com/spages/NAVAll.txt")).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> HttpNavSource.validate("https://evil.example.com/NAVAll.txt")).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> HttpNavSource.validate("https://amfiindia.com.evil.example.com/NAVAll.txt")).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> HttpNavSource.validate("https://notamfiindia.com/NAVAll.txt")).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> HttpNavSource.validate("file:///etc/passwd")).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> HttpNavSource.validate("https://localhost/NAVAll.txt")).isInstanceOf(IllegalStateException.class);
    }
}
