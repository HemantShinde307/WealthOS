package com.wealthos.auth.tenant;

import com.wealthos.auth.chat.ChatAttachmentRepository;
import com.wealthos.auth.model.AdminAccount;
import com.wealthos.auth.model.AdvisorAccount;
import com.wealthos.auth.model.BaseAccount;
import com.wealthos.auth.repository.AdminAccountRepository;
import com.wealthos.auth.repository.AdvisorAccountRepository;
import com.wealthos.auth.repository.FamilyOfficeAccountRepository;
import com.wealthos.auth.repository.InstitutionalAccountRepository;
import com.wealthos.auth.repository.InvestorAccountRepository;
import com.wealthos.auth.security.AuthPrincipal;
import com.wealthos.auth.tenant.TenantDtos.AddMemberRequest;
import com.wealthos.auth.tenant.TenantDtos.BrandingDto;
import com.wealthos.auth.tenant.TenantDtos.CreateTenantRequest;
import com.wealthos.auth.tenant.TenantDtos.PlanDto;
import com.wealthos.auth.tenant.TenantDtos.TeamMemberDto;
import com.wealthos.auth.tenant.TenantDtos.TenantMeDto;
import com.wealthos.auth.tenant.TenantDtos.TenantSummaryDto;
import com.wealthos.auth.tenant.TenantDtos.UpdateBrandingRequest;
import com.wealthos.auth.tenant.TenantDtos.UpdateMemberRequest;
import com.wealthos.auth.tenant.TenantDtos.UpdatePlanRequest;
import com.wealthos.auth.tenant.TenantDtos.UpdateTenantRequest;
import com.wealthos.auth.tenant.TenantDtos.UsageDto;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Everything about distributor firms: which portal a browser is on, branding, the team, plan limits,
 * and (for the platform administrator) creating and managing firms. The caller always comes from the
 * verified token; a tenant administrator can only ever touch their own firm.
 */
@Service
public class TenantService implements TenantLimits {

    public static final String DEFAULT_SLUG = "demo";
    static final String PORTAL_UNAVAILABLE = "This portal is currently unavailable.";
    private static final int DEFAULT_TRIAL_DAYS = 14;
    private static final long MB = 1024L * 1024L;

    private final TenantRepository tenants;
    private final PlanRepository plans;
    private final InvestorAccountRepository investors;
    private final AdvisorAccountRepository advisors;
    private final AdminAccountRepository admins;
    private final InstitutionalAccountRepository institutionals;
    private final FamilyOfficeAccountRepository familyOffices;
    private final ChatAttachmentRepository attachments;
    private final TenantGate gate;
    private final Clock clock;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();

    @Autowired
    public TenantService(
            TenantRepository tenants,
            PlanRepository plans,
            InvestorAccountRepository investors,
            AdvisorAccountRepository advisors,
            AdminAccountRepository admins,
            InstitutionalAccountRepository institutionals,
            FamilyOfficeAccountRepository familyOffices,
            ChatAttachmentRepository attachments,
            TenantGate gate) {
        this(tenants, plans, investors, advisors, admins, institutionals, familyOffices, attachments, gate, Clock.systemUTC());
    }

    TenantService(
            TenantRepository tenants,
            PlanRepository plans,
            InvestorAccountRepository investors,
            AdvisorAccountRepository advisors,
            AdminAccountRepository admins,
            InstitutionalAccountRepository institutionals,
            FamilyOfficeAccountRepository familyOffices,
            ChatAttachmentRepository attachments,
            TenantGate gate,
            Clock clock) {
        this.tenants = tenants;
        this.plans = plans;
        this.investors = investors;
        this.advisors = advisors;
        this.admins = admins;
        this.institutionals = institutionals;
        this.familyOffices = familyOffices;
        this.attachments = attachments;
        this.gate = gate;
        this.clock = clock;
    }

    // ---- which portal is this? ----------------------------------------------------------

    /** The firm behind a portal address, refusing unknown, suspended and expired-trial firms. */
    public Tenant requirePortal(String slugOrNull) {
        String slug = slugOrNull == null || slugOrNull.isBlank() ? DEFAULT_SLUG : slugOrNull.trim().toLowerCase(Locale.ROOT);
        Tenant tenant = tenants.findBySlug(slug).orElseThrow(() -> new TenantException(HttpStatus.NOT_FOUND, "This portal was not found."));
        if (!tenant.isUsableAt(clock.instant())) {
            throw new TenantException(HttpStatus.FORBIDDEN, PORTAL_UNAVAILABLE);
        }
        return tenant;
    }

    public BrandingDto publicBranding(String slug) {
        return BrandingDto.from(requirePortal(slug));
    }

    /** Whether an account row belongs to this firm. Rows not yet assigned count as the default firm's. */
    public boolean belongsTo(Long accountTenantId, Tenant tenant) {
        if (accountTenantId != null) {
            return accountTenantId.equals(tenant.getId());
        }
        return DEFAULT_SLUG.equals(tenant.getSlug());
    }

    // ---- tenant administrator: own firm ---------------------------------------------------

    public TenantMeDto me(AuthPrincipal principal) {
        Tenant tenant = ownTenant(principal);
        return new TenantMeDto(BrandingDto.from(tenant), tenant.getStatus(), tenant.getTrialEndsAt(), PlanDto.from(planOf(tenant)), usage(tenant));
    }

    @Transactional
    public BrandingDto updateBranding(AuthPrincipal principal, UpdateBrandingRequest req) {
        Tenant tenant = ownTenant(principal);
        if (req.name() != null) {
            tenant.setName(TenantValidation.name(req.name(), "business name"));
        }
        if (req.tagline() != null) {
            tenant.setTagline(TenantValidation.optionalText(req.tagline(), 140, "tagline"));
        }
        if (req.primaryColor() != null) {
            tenant.setPrimaryColor(TenantValidation.color(req.primaryColor(), "primary colour"));
        }
        if (req.secondaryColor() != null) {
            tenant.setSecondaryColor(TenantValidation.color(req.secondaryColor(), "secondary colour"));
        }
        if (req.supportEmail() != null) {
            tenant.setSupportEmail(TenantValidation.optionalEmail(req.supportEmail(), "support email"));
        }
        if (req.supportPhone() != null) {
            tenant.setSupportPhone(TenantValidation.optionalPhone(req.supportPhone()));
        }
        if (req.arn() != null) {
            tenant.setArn(TenantValidation.optionalArn(req.arn()));
        }
        if (Boolean.TRUE.equals(req.clearLogo())) {
            tenant.setLogoDataUrl(null);
        } else if (req.logoDataUrl() != null && !req.logoDataUrl().isBlank()) {
            tenant.setLogoDataUrl(TenantValidation.logoDataUrl(req.logoDataUrl()));
        }
        return BrandingDto.from(tenants.save(tenant));
    }

    // ---- team (staff of the firm) ---------------------------------------------------------

    public List<TeamMemberDto> team(AuthPrincipal principal) {
        Long tid = ownTenant(principal).getId();
        List<TeamMemberDto> members = new ArrayList<>();
        advisors.findByTenantId(tid).forEach(a -> members.add(member("advisor", a)));
        admins.findByTenantId(tid).forEach(a -> members.add(member("admin", a)));
        members.sort(Comparator.comparing(TeamMemberDto::createdAt));
        return members;
    }

    @Transactional
    public TeamMemberDto addMember(AuthPrincipal principal, AddMemberRequest req) {
        Tenant tenant = ownTenant(principal);
        String role = req.role() == null ? "" : req.role().trim().toLowerCase(Locale.ROOT);
        if (!role.equals("admin") && !role.equals("advisor")) {
            throw new TenantException(HttpStatus.BAD_REQUEST, "The role must be admin or advisor.");
        }
        String name = TenantValidation.name(req.name(), "name");
        String email = TenantValidation.email(req.email(), "email address");
        String phone = TenantValidation.optionalPhone(req.phone());
        String password = TenantValidation.password(req.password());

        PlanDto plan = PlanDto.from(planOf(tenant));
        if (activeStaffCount(tenant.getId()) >= plan.maxUsers()) {
            throw new TenantException(HttpStatus.FORBIDDEN, "Your plan allows " + plan.maxUsers() + " team members. Upgrade to add more.");
        }
        boolean exists = role.equals("admin") ? admins.existsByEmailIgnoreCase(email) : advisors.existsByEmailIgnoreCase(email);
        if (exists) {
            throw new TenantException(HttpStatus.CONFLICT, "A team member with this email already exists.");
        }
        String hash = passwordEncoder.encode(password);
        BaseAccount saved;
        if (role.equals("admin")) {
            AdminAccount account = new AdminAccount(newCode("ADM-", admins::existsByAccountCode), name, email, hash, phone);
            account.setTenantId(tenant.getId());
            account.setActive(true);
            saved = admins.save(account);
        } else {
            AdvisorAccount account = new AdvisorAccount(newCode("ADV-", advisors::existsByAccountCode), name, email, hash, phone);
            account.setTenantId(tenant.getId());
            account.setActive(true);
            saved = advisors.save(account);
        }
        return member(role, saved);
    }

    @Transactional
    public TeamMemberDto updateMember(AuthPrincipal principal, String role, Long id, UpdateMemberRequest req) {
        Tenant tenant = ownTenant(principal);
        BaseAccount account = findStaff(role, id);
        if (account == null || !Objects.equals(account.getTenantId(), tenant.getId())) {
            throw new TenantException(HttpStatus.NOT_FOUND, "That team member was not found.");
        }
        if (req.active() != null && req.active() != account.isActive()) {
            if (!req.active()) {
                if (account.getAccountCode().equals(principal.code())) {
                    throw new TenantException(HttpStatus.BAD_REQUEST, "You can't deactivate your own account.");
                }
                if (role.equals("admin") && otherActiveAdmins(tenant.getId(), account) == 0) {
                    throw new TenantException(HttpStatus.BAD_REQUEST, "At least one active admin is required.");
                }
            } else {
                PlanDto plan = PlanDto.from(planOf(tenant));
                if (activeStaffCount(tenant.getId()) >= plan.maxUsers()) {
                    throw new TenantException(HttpStatus.FORBIDDEN, "Your plan allows " + plan.maxUsers() + " team members. Upgrade to add more.");
                }
            }
            account.setActive(req.active());
        }
        if (req.name() != null) {
            account.setName(TenantValidation.name(req.name(), "name"));
        }
        if (req.phone() != null) {
            account.setPhone(TenantValidation.optionalPhone(req.phone()));
        }
        return member(role, saveStaff(role, account));
    }

    // ---- plan limits used by other modules -------------------------------------------------

    /** Refuses a new client signup when the firm's plan client limit is reached. */
    public void checkClientLimit(Tenant tenant) {
        PlanDto plan = PlanDto.from(planOf(tenant));
        if (investors.countByTenantId(tenant.getId()) >= plan.maxClients()) {
            throw new TenantException(HttpStatus.FORBIDDEN, "This distributor's portal has reached its client limit.");
        }
    }

    @Override
    public Optional<Long> storageLimitBytes(Long tenantId) {
        if (tenantId == null) {
            return Optional.empty();
        }
        return tenants.findById(tenantId).flatMap(t -> plans.findById(t.getPlanCode())).map(p -> p.getMaxStorageMb() * MB);
    }

    @Override
    public long storageUsedBytes(Long tenantId) {
        return tenantId == null ? 0 : attachments.totalStoredBytesForTenant(tenantId);
    }

    // ---- platform administrator ------------------------------------------------------------

    public List<PlanDto> plans() {
        return plans.findAll().stream().sorted(Comparator.comparingInt(Plan::getMonthlyPriceInr)).map(PlanDto::from).toList();
    }

    @Transactional
    public PlanDto updatePlan(String code, UpdatePlanRequest req) {
        Plan plan = plans.findById(code == null ? "" : code.toUpperCase(Locale.ROOT))
                .orElseThrow(() -> new TenantException(HttpStatus.NOT_FOUND, "That plan was not found."));
        if (req.name() != null) {
            plan.setName(TenantValidation.name(req.name(), "plan name"));
        }
        if (req.maxUsers() != null) {
            plan.setMaxUsers(limit(req.maxUsers(), 1, 100_000, "user limit"));
        }
        if (req.maxClients() != null) {
            plan.setMaxClients(limit(req.maxClients(), 1, 10_000_000, "client limit"));
        }
        if (req.maxStorageMb() != null) {
            plan.setMaxStorageMb(limit(req.maxStorageMb(), 1, 10_000_000, "storage limit"));
        }
        if (req.monthlyPriceInr() != null) {
            plan.setMonthlyPriceInr(limit(req.monthlyPriceInr(), 0, 100_000_000, "price"));
        }
        return PlanDto.from(plans.save(plan));
    }

    public List<TenantSummaryDto> listTenants() {
        return tenants.findAll().stream().sorted(Comparator.comparing(Tenant::getCreatedAt)).map(this::summary).toList();
    }

    @Transactional
    public TenantSummaryDto createTenant(CreateTenantRequest req) {
        String slug = TenantValidation.slug(req.slug());
        String name = TenantValidation.name(req.name(), "business name");
        String adminName = TenantValidation.name(req.adminName(), "administrator name");
        String adminEmail = TenantValidation.email(req.adminEmail(), "administrator email");
        String adminPassword = TenantValidation.password(req.adminPassword());
        String primary = req.primaryColor() == null ? null : TenantValidation.color(req.primaryColor(), "primary colour");
        String secondary = req.secondaryColor() == null ? null : TenantValidation.color(req.secondaryColor(), "secondary colour");
        String planCode = req.planCode() == null ? "" : req.planCode().trim().toUpperCase(Locale.ROOT);
        if (plans.findById(planCode).isEmpty()) {
            throw new TenantException(HttpStatus.BAD_REQUEST, "Choose a valid plan.");
        }
        int trialDays = req.trialDays() == null ? DEFAULT_TRIAL_DAYS : limit(req.trialDays(), 0, 365, "trial length");
        if (tenants.existsBySlug(slug)) {
            throw new TenantException(HttpStatus.CONFLICT, "That web address is already taken.");
        }
        if (admins.existsByEmailIgnoreCase(adminEmail)) {
            throw new TenantException(HttpStatus.CONFLICT, "That administrator email is already in use.");
        }

        Tenant tenant = new Tenant(slug, name, planCode);
        if (primary != null) {
            tenant.setPrimaryColor(primary);
        }
        if (secondary != null) {
            tenant.setSecondaryColor(secondary);
        }
        if (trialDays == 0) {
            tenant.setStatus(TenantStatus.ACTIVE);
        } else {
            tenant.setStatus(TenantStatus.TRIAL);
            tenant.setTrialEndsAt(clock.instant().plus(Duration.ofDays(trialDays)));
        }
        tenant = tenants.save(tenant);

        AdminAccount owner = new AdminAccount(newCode("ADM-", admins::existsByAccountCode), adminName, adminEmail, passwordEncoder.encode(adminPassword), null);
        owner.setTenantId(tenant.getId());
        owner.setActive(true);
        admins.save(owner);
        return summary(tenant);
    }

    @Transactional
    public TenantSummaryDto updateTenant(Long id, UpdateTenantRequest req) {
        Tenant tenant = tenants.findById(id).orElseThrow(() -> new TenantException(HttpStatus.NOT_FOUND, "That firm was not found."));
        if (req.name() != null) {
            tenant.setName(TenantValidation.name(req.name(), "business name"));
        }
        if (req.planCode() != null) {
            String code = req.planCode().trim().toUpperCase(Locale.ROOT);
            if (plans.findById(code).isEmpty()) {
                throw new TenantException(HttpStatus.BAD_REQUEST, "Choose a valid plan.");
            }
            tenant.setPlanCode(code);
        }
        if (req.status() != null) {
            tenant.setStatus(req.status());
        }
        if (req.trialEndsAt() != null) {
            tenant.setTrialEndsAt(req.trialEndsAt());
        }
        Tenant saved = tenants.save(tenant);
        gate.evict(saved.getId());
        return summary(saved);
    }

    // ---- helpers ---------------------------------------------------------------------------

    private Tenant ownTenant(AuthPrincipal principal) {
        if (!principal.isTenantAdmin() || principal.tenantId() == null) {
            throw new TenantException(HttpStatus.FORBIDDEN, "Only your firm's administrator can do that.");
        }
        return tenants.findById(principal.tenantId()).orElseThrow(() -> new TenantException(HttpStatus.NOT_FOUND, "Your firm was not found."));
    }

    private Plan planOf(Tenant tenant) {
        return plans.findById(tenant.getPlanCode()).orElseThrow(() -> new TenantException(HttpStatus.INTERNAL_SERVER_ERROR, "Your plan could not be found."));
    }

    private UsageDto usage(Tenant tenant) {
        long bytes = attachments.totalStoredBytesForTenant(tenant.getId());
        return new UsageDto(activeStaffCount(tenant.getId()), investors.countByTenantId(tenant.getId()), (bytes + MB - 1) / MB);
    }

    private TenantSummaryDto summary(Tenant t) {
        return new TenantSummaryDto(
                t.getId(), t.getSlug(), t.getName(), t.getStatus(), t.getPlanCode(), t.getTrialEndsAt(),
                activeStaffCount(t.getId()), investors.countByTenantId(t.getId()), t.getCreatedAt());
    }

    /** Active staff of every role (they all count toward the plan's user limit). */
    long activeStaffCount(Long tenantId) {
        Predicate<BaseAccount> active = BaseAccount::isActive;
        return advisors.findByTenantId(tenantId).stream().filter(active).count()
                + admins.findByTenantId(tenantId).stream().filter(active).count()
                + institutionals.findByTenantId(tenantId).stream().filter(active).count()
                + familyOffices.findByTenantId(tenantId).stream().filter(active).count();
    }

    private long otherActiveAdmins(Long tenantId, BaseAccount except) {
        return admins.findByTenantId(tenantId).stream().filter(a -> a.isActive() && !Objects.equals(a.getId(), except.getId())).count();
    }

    private BaseAccount findStaff(String role, Long id) {
        if (id == null) {
            return null;
        }
        return switch (role == null ? "" : role) {
            case "advisor" -> advisors.findById(id).orElse(null);
            case "admin" -> admins.findById(id).orElse(null);
            default -> throw new TenantException(HttpStatus.BAD_REQUEST, "The role must be admin or advisor.");
        };
    }

    private BaseAccount saveStaff(String role, BaseAccount account) {
        return role.equals("admin") ? admins.save((AdminAccount) account) : advisors.save((AdvisorAccount) account);
    }

    private static TeamMemberDto member(String role, BaseAccount a) {
        return new TeamMemberDto(a.getId(), role, a.getAccountCode(), a.getName(), a.getEmail(), a.getPhone(), a.isActive(), a.getCreatedAt());
    }

    private String newCode(String prefix, Predicate<String> exists) {
        for (int attempt = 0; attempt < 30; attempt++) {
            String code = prefix + (10_000 + random.nextInt(90_000));
            if (!exists.test(code)) {
                return code;
            }
        }
        throw new TenantException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create an account code. Please try again.");
    }

    private static int limit(int value, int min, int max, String label) {
        if (value < min || value > max) {
            throw new TenantException(HttpStatus.BAD_REQUEST, "The " + label + " must be between " + min + " and " + max + ".");
        }
        return value;
    }
}
