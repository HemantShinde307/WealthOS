package com.wealthos.auth.tenant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/** One distributor firm: its web address (slug), branding, subscription plan and status. */
@Entity
@Table(name = "wealthos_tenants")
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String slug;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 140)
    private String tagline;

    // Validated PNG/JPEG/WebP data URL (<= 300 KB). MEDIUMTEXT is explicit so it never becomes a 255-char column.
    @Column(name = "logo_data_url", columnDefinition = "MEDIUMTEXT")
    private String logoDataUrl;

    @Column(name = "primary_color", nullable = false, length = 7)
    private String primaryColor = "#131b2e";

    @Column(name = "secondary_color", nullable = false, length = 7)
    private String secondaryColor = "#316bf3";

    @Column(name = "support_email", length = 254)
    private String supportEmail;

    @Column(name = "support_phone", length = 20)
    private String supportPhone;

    @Column(length = 20)
    private String arn;

    @Column(name = "plan_code", nullable = false, length = 20)
    private String planCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TenantStatus status = TenantStatus.ACTIVE;

    @Column(name = "trial_ends_at")
    private Instant trialEndsAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Tenant() {
    }

    public Tenant(String slug, String name, String planCode) {
        this.slug = slug;
        this.name = name;
        this.planCode = planCode;
    }

    /** Whether people of this firm may sign in and use the API right now. */
    public boolean isUsableAt(Instant now) {
        return switch (status) {
            case ACTIVE -> true;
            case TRIAL -> trialEndsAt == null || trialEndsAt.isAfter(now);
            case SUSPENDED -> false;
        };
    }

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public String getName() { return name; }
    public String getTagline() { return tagline; }
    public String getLogoDataUrl() { return logoDataUrl; }
    public String getPrimaryColor() { return primaryColor; }
    public String getSecondaryColor() { return secondaryColor; }
    public String getSupportEmail() { return supportEmail; }
    public String getSupportPhone() { return supportPhone; }
    public String getArn() { return arn; }
    public String getPlanCode() { return planCode; }
    public TenantStatus getStatus() { return status; }
    public Instant getTrialEndsAt() { return trialEndsAt; }
    public Instant getCreatedAt() { return createdAt; }

    public void setName(String name) { this.name = name; }
    public void setTagline(String tagline) { this.tagline = tagline; }
    public void setLogoDataUrl(String logoDataUrl) { this.logoDataUrl = logoDataUrl; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }
    public void setSecondaryColor(String secondaryColor) { this.secondaryColor = secondaryColor; }
    public void setSupportEmail(String supportEmail) { this.supportEmail = supportEmail; }
    public void setSupportPhone(String supportPhone) { this.supportPhone = supportPhone; }
    public void setArn(String arn) { this.arn = arn; }
    public void setPlanCode(String planCode) { this.planCode = planCode; }
    public void setStatus(TenantStatus status) { this.status = status; }
    public void setTrialEndsAt(Instant trialEndsAt) { this.trialEndsAt = trialEndsAt; }
}
