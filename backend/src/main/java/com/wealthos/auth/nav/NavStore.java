package com.wealthos.auth.nav;

import com.wealthos.auth.nav.AmfiNavParser.ParsedNav;
import java.time.Instant;
import java.util.List;

/** Writes a downloaded NAV file into the store. An interface so the refresh logic can be tested without a database. */
public interface NavStore {

    void upsertAll(List<ParsedNav> navs, Instant now);
}
