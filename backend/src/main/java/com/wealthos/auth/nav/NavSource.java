package com.wealthos.auth.nav;

import java.io.IOException;

/** Where the raw AMFI NAV file comes from. An interface so tests never touch the network. */
public interface NavSource {

    String download() throws IOException;
}
