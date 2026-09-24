package com.wealthos.auth.nav;

import static org.assertj.core.api.Assertions.assertThat;

import com.wealthos.auth.nav.AmfiNavParser.ParsedNav;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class AmfiNavParserTest {

    private static final String SAMPLE = String.join("\r\n",
            "Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Plan;Option;Net Asset Value;Date",
            " ",
            "Open Ended Schemes(Equity Scheme - Mid Cap Fund)",
            " ",
            "HDFC Mutual Fund",
            " ",
            "118989;INF179K01XQ0;-;HDFC Mid Cap Fund;Direct Plan;Growth Option;231.07;23-Sep-2026",
            "101762;INF179K01608;INF179K01616;HDFC Flexi Cap Fund;Regular Plan;Growth Option;2042.755;23-Sep-2026",
            "151130;INF917K01QA1;-;HSBC Small Cap Fund;;;104.0971;23-Sep-2026",
            "");

    @Test
    void parsesRealLookingRowsAndIgnoresHeadersAndHeadings() {
        List<ParsedNav> rows = AmfiNavParser.parse(SAMPLE);

        assertThat(rows).extracting(ParsedNav::schemeCode).containsExactlyInAnyOrder(118989L, 101762L, 151130L);
        ParsedNav flexi = rows.stream().filter(r -> r.schemeCode() == 101762L).findFirst().orElseThrow();
        assertThat(flexi.isinGrowth()).isEqualTo("INF179K01608");
        assertThat(flexi.isinReinvestment()).isEqualTo("INF179K01616");
        assertThat(flexi.schemeName()).isEqualTo("HDFC Flexi Cap Fund");
        assertThat(flexi.nav()).isEqualByComparingTo(new BigDecimal("2042.755"));
        assertThat(flexi.navDate()).isEqualTo(LocalDate.of(2026, 9, 23));
    }

    @Test
    void dashAndBlankIsinsBecomeNull() {
        ParsedNav mid = AmfiNavParser.parse(SAMPLE).stream().filter(r -> r.schemeCode() == 118989L).findFirst().orElseThrow();

        assertThat(mid.isinReinvestment()).isNull();
    }

    @Test
    void rowsWithMissingPlanAndOptionStillParse() {
        assertThat(AmfiNavParser.parse(SAMPLE)).anyMatch(r -> r.schemeCode() == 151130L && r.nav().compareTo(new BigDecimal("104.0971")) == 0);
    }

    @Test
    void unusableRowsAreSkippedWithoutFailingTheFile() {
        String text = String.join("\n",
                "1;INF000000011;-;Not Available Fund;Direct;Growth;N.A.;23-Sep-2026",
                "2;INF000000029;-;Bad Date Fund;Direct;Growth;10.5;31-Foo-2026",
                "3;INF000000037;-;Zero Nav Fund;Direct;Growth;0;23-Sep-2026",
                "4;INF000000045;-;Negative Nav Fund;Direct;Growth;-3.2;23-Sep-2026",
                "5;INF000000052;-;Too Few Fields;10.5;23-Sep-2026",
                "abc;INF000000060;-;Bad Code Fund;Direct;Growth;10.5;23-Sep-2026",
                "6;INF000000078;-;;Direct;Growth;10.5;23-Sep-2026",
                "7;INF000000086;-;Good Fund;Direct;Growth;10.5;23-Sep-2026");

        assertThat(AmfiNavParser.parse(text)).extracting(ParsedNav::schemeCode).containsExactly(7L);
    }

    @Test
    void whenACodeAppearsTwiceTheNewestDateWins() {
        String text = String.join("\n",
                "9;INF000000011;-;Repeat Fund;Direct;Growth;10.0;22-Sep-2026",
                "9;INF000000011;-;Repeat Fund;Direct;Growth;11.0;23-Sep-2026",
                "9;INF000000011;-;Repeat Fund;Direct;Growth;9.0;21-Sep-2026");

        List<ParsedNav> rows = AmfiNavParser.parse(text);

        assertThat(rows).hasSize(1);
        assertThat(rows.get(0).nav()).isEqualByComparingTo("11.0");
    }

    @Test
    void invalidIsinsAreDroppedButTheRowIsKept() {
        ParsedNav row = AmfiNavParser.parse("10;not-an-isin;also bad;Odd Fund;Direct;Growth;10.5;23-Sep-2026").get(0);

        assertThat(row.isinGrowth()).isNull();
        assertThat(row.isinReinvestment()).isNull();
    }

    @Test
    void monthNamesAreCaseInsensitive() {
        assertThat(AmfiNavParser.parse("11;INF000000011;-;Case Fund;Direct;Growth;10.5;23-SEP-2026")).hasSize(1);
        assertThat(AmfiNavParser.parse("12;INF000000029;-;Case Fund;Direct;Growth;10.5;23-sep-2026")).hasSize(1);
    }

    @Test
    void veryLongNamesAreTruncatedAndNullInputIsEmpty() {
        String longName = "X".repeat(500);

        assertThat(AmfiNavParser.parse("13;INF000000011;-;" + longName + ";Direct;Growth;10.5;23-Sep-2026").get(0).schemeName()).hasSize(300);
        assertThat(AmfiNavParser.parse(null)).isEmpty();
        assertThat(AmfiNavParser.parse("")).isEmpty();
    }
}
