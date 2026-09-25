package com.wealthos.auth.tenant;

import com.wealthos.auth.model.AdminAccount;
import com.wealthos.auth.model.AdvisorAccount;
import com.wealthos.auth.model.BaseAccount;
import com.wealthos.auth.model.FamilyOfficeAccount;
import com.wealthos.auth.model.InstitutionalAccount;
import com.wealthos.auth.model.InvestorAccount;
import com.wealthos.auth.repository.AdminAccountRepository;
import com.wealthos.auth.repository.AdvisorAccountRepository;
import com.wealthos.auth.repository.FamilyOfficeAccountRepository;
import com.wealthos.auth.repository.InstitutionalAccountRepository;
import com.wealthos.auth.repository.InvestorAccountRepository;
import java.util.List;
import java.util.function.Consumer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Runs at startup, after the demo seeder. Idempotent: creates the standard plans and the default
 * firm, moves every account that has no firm yet under it, and makes sure a platform administrator exists.
 */
@Component
@Order(2)
public class TenantBootstrapper implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(TenantBootstrapper.class);

    private final PlanRepository plans;
    private final TenantRepository tenants;
    private final PlatformAdminAccountRepository platformAdmins;
    private final InvestorAccountRepository investors;
    private final AdvisorAccountRepository advisors;
    private final AdminAccountRepository admins;
    private final InstitutionalAccountRepository institutionals;
    private final FamilyOfficeAccountRepository familyOffices;
    private final TransactionTemplate tx;
    private final String platformEmail;
    private final String platformPassword;
    private final boolean demoData;

    public TenantBootstrapper(
            PlanRepository plans,
            TenantRepository tenants,
            PlatformAdminAccountRepository platformAdmins,
            InvestorAccountRepository investors,
            AdvisorAccountRepository advisors,
            AdminAccountRepository admins,
            InstitutionalAccountRepository institutionals,
            FamilyOfficeAccountRepository familyOffices,
            TransactionTemplate tx,
            @Value("${app.platform.admin-email:}") String platformEmail,
            @Value("${app.platform.admin-password:}") String platformPassword,
            @Value("${app.demo-data:true}") boolean demoData) {
        this.plans = plans;
        this.tenants = tenants;
        this.platformAdmins = platformAdmins;
        this.investors = investors;
        this.advisors = advisors;
        this.admins = admins;
        this.institutionals = institutionals;
        this.familyOffices = familyOffices;
        this.tx = tx;
        this.platformEmail = platformEmail == null ? "" : platformEmail.trim();
        this.platformPassword = platformPassword == null ? "" : platformPassword;
        this.demoData = demoData;
    }

    @Override
    public void run(String... args) {
        tx.executeWithoutResult(status -> {
            seedPlans();
            adopt(defaultTenant());
            seedPlatformAdmin();
        });
    }

    private void seedPlans() {
        if (plans.count() > 0) {
            return;
        }
        plans.save(new Plan("STARTER", "Starter", 3, 100, 500, 999));
        plans.save(new Plan("GROWTH", "Growth", 10, 500, 5_000, 2_999));
        plans.save(new Plan("PRO", "Pro", 50, 5_000, 50_000, 7_999));
        log.info("Seeded the standard subscription plans");
    }

    private Tenant defaultTenant() {
        return tenants.findBySlug(TenantService.DEFAULT_SLUG).orElseGet(() -> {
            Tenant t = new Tenant(TenantService.DEFAULT_SLUG, "WealthOS Demo", "PRO");
            t.setStatus(TenantStatus.ACTIVE);
            log.info("Created the default firm {}", TenantService.DEFAULT_SLUG);
            return tenants.save(t);
        });
    }

    /** Existing accounts pre-date multi-tenancy; they all belong to the default firm. */
    private void adopt(Tenant home) {
        int moved = 0;
        List<InvestorAccount> customers = investors.findByTenantIdIsNull();
        for (InvestorAccount customer : customers) {
            customer.setTenantId(home.getId());
            investors.save(customer);
        }
        moved += customers.size();
        moved += assign(advisors.findByTenantIdIsNull(), home, a -> advisors.save((AdvisorAccount) a));
        moved += assign(admins.findByTenantIdIsNull(), home, a -> admins.save((AdminAccount) a));
        moved += assign(institutionals.findByTenantIdIsNull(), home, a -> institutionals.save((InstitutionalAccount) a));
        moved += assign(familyOffices.findByTenantIdIsNull(), home, a -> familyOffices.save((FamilyOfficeAccount) a));
        if (moved > 0) {
            log.info("Moved {} existing account(s) under the default firm", moved);
        }
    }

    private static int assign(List<? extends BaseAccount> accounts, Tenant home, Consumer<BaseAccount> save) {
        for (BaseAccount account : accounts) {
            account.setTenantId(home.getId());
            save.accept(account);
        }
        return accounts.size();
    }

    private void seedPlatformAdmin() {
        if (platformAdmins.count() > 0) {
            return;
        }
        String email = platformEmail;
        String password = platformPassword;
        if (email.isEmpty() || password.length() < 8) {
            if (!demoData) {
                log.warn("No platform administrator exists. Set PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD (8+ characters) to create one.");
                return;
            }
            email = "platform@wealthos.com";
            password = "demo1234";
            log.warn("Created the DEMO platform administrator {} (password demo1234). Do not use this in production.", email);
        }
        platformAdmins.save(new PlatformAdminAccount("PLT-1001", "Platform Admin", email, new BCryptPasswordEncoder().encode(password), null));
    }
}
