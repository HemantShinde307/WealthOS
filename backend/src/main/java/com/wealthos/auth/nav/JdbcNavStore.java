package com.wealthos.auth.nav;

import com.wealthos.auth.nav.AmfiNavParser.ParsedNav;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class JdbcNavStore implements NavStore {

    private static final int BATCH = 1000;

    // A row is only overwritten by an equal-or-newer NAV date, so a stale or replayed file can never
    // roll a scheme back. nav_date is assigned last: MySQL evaluates the assignments left to right.
    private static final String UPSERT = """
            INSERT INTO amfi_nav_latest (scheme_code, isin_growth, isin_reinvestment, scheme_name, nav, nav_date, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              isin_growth = IF(VALUES(nav_date) >= nav_date, VALUES(isin_growth), isin_growth),
              isin_reinvestment = IF(VALUES(nav_date) >= nav_date, VALUES(isin_reinvestment), isin_reinvestment),
              scheme_name = IF(VALUES(nav_date) >= nav_date, VALUES(scheme_name), scheme_name),
              nav = IF(VALUES(nav_date) >= nav_date, VALUES(nav), nav),
              updated_at = IF(VALUES(nav_date) >= nav_date, VALUES(updated_at), updated_at),
              nav_date = IF(VALUES(nav_date) >= nav_date, VALUES(nav_date), nav_date)
            """;

    private final JdbcTemplate jdbc;

    public JdbcNavStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    @Transactional
    public void upsertAll(List<ParsedNav> navs, Instant now) {
        Timestamp stamp = Timestamp.from(now);
        jdbc.batchUpdate(UPSERT, navs, BATCH, (ps, n) -> {
            ps.setLong(1, n.schemeCode());
            ps.setString(2, n.isinGrowth());
            ps.setString(3, n.isinReinvestment());
            ps.setString(4, n.schemeName());
            ps.setBigDecimal(5, n.nav());
            ps.setObject(6, n.navDate());
            ps.setTimestamp(7, stamp);
        });
    }
}
