import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal, viewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TenantService } from '../../core/services/tenant.service';
import { AuthService, ROLE_HOME_ROUTE } from '../../core/services/auth.service';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface RoleCard {
  icon: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent implements AfterViewInit, OnDestroy {
  private readonly auth = inject(AuthService);
  readonly tenant = inject(TenantService);

  readonly isAuthenticated = this.auth.isAuthenticated;

  get dashboardRoute(): string {
    return ROLE_HOME_ROUTE[this.auth.currentUser().role];
  }

  readonly features: Feature[] = [
    { icon: 'account_balance_wallet', title: 'Unified Portfolio Tracking', description: 'Mutual funds, digital gold, fixed income and insurance — one consolidated view of everything a client owns.' },
    { icon: 'auto_awesome', title: 'AI-Powered Insights', description: 'Plain-language answers about returns, allocation drift, idle cash and FD maturities, generated from real portfolio data.' },
    { icon: 'flag', title: 'Goal-Based Planning', description: 'Turn a retirement, education or home-purchase goal into a concrete SIP and fund mix in minutes.' },
    { icon: 'groups', title: 'Advisor & Distributor Tools', description: 'A full book-of-business view, brokerage tracking, and client onboarding built for how distributors actually work.' },
    { icon: 'apartment', title: 'Family Office & Institutional', description: 'Consolidated wealth across family members, multi-entity reporting, and institutional-grade controls.' },
    { icon: 'admin_panel_settings', title: 'Back Office Suite', description: 'Customer management, risk profiling, compliance workflows and reporting — the operational backbone underneath.' },
  ];

  readonly roles: RoleCard[] = [
    { icon: 'person', label: 'Investors', description: 'Track your portfolio, invest, and plan your goals — all in one place.' },
    { icon: 'support_agent', label: 'Advisors', description: 'Manage clients, transactions and commissions from a single dashboard.' },
    { icon: 'shield', label: 'Admins', description: 'Compliance, audit trails and regulatory reporting, always up to date.' },
    { icon: 'public', label: 'Institutions', description: 'Multi-market portfolios with the controls institutional mandates need.' },
    { icon: 'diversity_3', label: 'Family Offices', description: 'A consolidated view of wealth across every member of the family.' },
  ];

  // Animated hero stat card — purely decorative, illustrates the product rather than reporting a real figure.
  readonly heroChartPoints = 'M0,68 L14,60 L28,64 L42,44 L56,50 L70,28 L84,34 L100,10';

  readonly statTargets = [6, 110, 24, 1];
  readonly statSuffixes = ['', '+', '/7', ''];
  readonly statLabels = ['Purpose-built portals', 'Back-office workflows', 'AI portfolio assistant', 'Login for your whole team'];
  readonly statValues = this.statTargets.map(() => signal(0));

  private readonly revealTargets = viewChildren<ElementRef<HTMLElement>>('reveal');
  private observer?: IntersectionObserver;
  private statsAnimated = false;

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          if (entry.target.hasAttribute('data-stats')) this.animateStats();
          this.observer?.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );
    for (const el of this.revealTargets()) this.observer.observe(el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private animateStats(): void {
    if (this.statsAnimated) return;
    this.statsAnimated = true;
    const durationMs = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.statTargets.forEach((target, i) => this.statValues[i].set(Math.round(target * eased)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
