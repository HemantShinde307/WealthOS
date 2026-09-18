import { NavItem, ShellConfig } from './layout.models';

const investorNav: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/investor/portfolio' },
  { label: 'AI Insights', icon: 'auto_awesome', route: '/investor/ai-insights' },
  { label: 'Mutual Funds', icon: 'account_balance_wallet', route: '/investor/mutual-funds' },
  { label: 'Goals', icon: 'flag', route: '/investor/goals' },
  { label: 'Digital Gold', icon: 'monetization_on', route: '/investor/gold' },
  { label: 'Gold SIP', icon: 'savings', route: '/investor/gold-sip' },
  { label: 'Fixed Income', icon: 'account_balance', route: '/investor/fixed-income' },
  { label: 'Insurance', icon: 'shield', route: '/investor/insurance' },
  { label: 'Tax Saving', icon: 'receipt_long', route: '/investor/tax-saving' },
  { label: 'Reports', icon: 'description', route: '/investor/reports' },
];

const advisorNav: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/advisor/dashboard' },
  { label: 'Portfolio', icon: 'account_balance_wallet', route: '/advisor/portfolio' },
  { label: 'Clients', icon: 'group', route: '/advisor/clients' },
  { label: 'Transactions', icon: 'swap_horiz', route: '/advisor/transactions' },
  { label: 'Brokerage', icon: 'payments', route: '/advisor/brokerage' },
  { label: 'Campaigns', icon: 'campaign', route: '/advisor/campaigns' },
  { label: 'Chat', icon: 'chat', route: '/advisor/chat' },
  { label: 'Back Office', icon: 'admin_panel_settings', route: '/back-office/customer-investments' },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
  { label: 'Compliance', icon: 'gavel', route: '/admin/compliance' },
  { label: 'Document Vault', icon: 'folder', route: '/admin/documents' },
  { label: 'Audit Trail', icon: 'history', route: '/admin/audit-trail' },
  { label: 'Regulatory Reports', icon: 'summarize', route: '/admin/regulatory-reporting' },
  { label: 'Back Office', icon: 'admin_panel_settings', route: '/back-office/customer-investments' },
];

const institutionalNav: NavItem[] = [
  { label: 'Global Dashboard', icon: 'public', route: '/institutional/global-dashboard' },
  { label: 'India Hub', icon: 'location_on', route: '/institutional/india-hub' },
  { label: 'Corporate Onboarding', icon: 'domain_add', route: '/institutional/onboarding' },
  { label: 'Regulatory Framework', icon: 'balance', route: '/institutional/regulatory-framework' },
  { label: 'Market Settings', icon: 'tune', route: '/institutional/market-settings' },
  { label: 'Currency & FX', icon: 'currency_exchange', route: '/institutional/currency-fx' },
];

const familyOfficeNav: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/family-office/dashboard' },
  { label: 'Consolidated Wealth', icon: 'account_balance', route: '/family-office/consolidated-wealth' },
  { label: 'Portfolio Aggregator', icon: 'stacked_line_chart', route: '/family-office/portfolio-aggregator' },
  { label: 'Transactions', icon: 'swap_horiz', route: '/family-office/transactions' },
  { label: 'Members', icon: 'diversity_3', route: '/family-office/members' },
  { label: 'Tax & Succession', icon: 'gavel', route: '/family-office/tax-succession' },
];

const nriNav: NavItem[] = [
  { label: 'Wealth Hub', icon: 'public', route: '/nri/hub' },
  { label: 'Onboarding & Compliance', icon: 'fact_check', route: '/nri/onboarding-compliance' },
  { label: 'Taxation & Repatriation', icon: 'currency_exchange', route: '/nri/taxation-repatriation' },
  { label: 'Portfolio Tracker', icon: 'trending_up', route: '/nri/portfolio-tracker' },
];

const analyticsNav: NavItem[] = [
  { label: 'Portfolio Overview', icon: 'monitoring', route: '/analytics/portfolio-overview' },
  { label: 'Performance Attribution', icon: 'insights', route: '/analytics/performance-attribution' },
  { label: 'Risk & Stress Testing', icon: 'warning', route: '/analytics/risk-stress-testing' },
  { label: 'Monte Carlo', icon: 'casino', route: '/analytics/monte-carlo' },
  { label: 'Report Center', icon: 'description', route: '/analytics/report-center' },
];

const localizationNav: NavItem[] = [
  { label: 'Currency & FX', icon: 'currency_exchange', route: '/localization/currency-fx' },
  { label: 'Market Settings', icon: 'tune', route: '/localization/market-settings' },
  { label: 'Regulatory Framework', icon: 'balance', route: '/localization/regulatory-framework' },
  { label: 'Translation Manager', icon: 'translate', route: '/localization/translation-manager' },
];

const executiveNav: NavItem[] = [
  { label: 'Command Center', icon: 'dashboard', route: '/executive/command-center' },
  { label: 'Advanced Analytics', icon: 'insights', route: '/executive/advanced-analytics' },
  { label: 'Aurum (Gold)', icon: 'monetization_on', route: '/executive/aurum' },
  { label: 'Brokerage', icon: 'payments', route: '/executive/brokerage' },
  { label: 'Institutional Portfolio', icon: 'account_balance', route: '/executive/institutional-portfolio' },
  { label: 'Marketing Growth', icon: 'campaign', route: '/executive/marketing' },
  { label: 'Onboarding', icon: 'fact_check', route: '/executive/onboarding' },
];

const backOfficeNav: NavItem[] = [
  { label: 'Setup', icon: 'settings', route: '/back-office/setup' },
  { label: 'Customer & Investments', icon: 'group', route: '/back-office/customer-investments' },
  { label: 'Reports & Advisory', icon: 'summarize', route: '/back-office/reports-advisory' },
];

export const SHELL_CONFIGS: Record<string, ShellConfig> = {
  investor: { brand: 'WealthOS', portalLabel: 'Investor Portal', navItems: investorNav, ctaLabel: 'New Investment', ctaRoute: '/mf-purchase/select-scheme' },
  advisor: { brand: 'WealthOS', portalLabel: 'Distributor Portal', navItems: advisorNav, ctaLabel: 'New Transaction', ctaRoute: '/mf-purchase/select-scheme' },
  admin: { brand: 'WealthOS', portalLabel: 'Admin Console', navItems: adminNav },
  institutional: { brand: 'WealthOS', portalLabel: 'Institutional', navItems: institutionalNav },
  familyOffice: { brand: 'WealthOS', portalLabel: 'Family Office', navItems: familyOfficeNav },
  nri: { brand: 'WealthOS', portalLabel: 'NRI Services', navItems: nriNav },
  analytics: { brand: 'WealthOS', portalLabel: 'Analytics & Reporting', navItems: analyticsNav },
  localization: { brand: 'WealthOS', portalLabel: 'Platform Settings', navItems: localizationNav },
  executive: { brand: 'WealthOS', portalLabel: 'Executive Alpha', navItems: executiveNav, theme: 'dark' },
  backOffice: {
    brand: 'WealthOS',
    portalLabel: 'Back Office',
    navItems: backOfficeNav,
    ctaLabel: 'New Customer Group',
    ctaRoute: '/back-office/customer-management/groups',
    backLabel: 'Back to Main Portal',
  },
};

const mobileNav: NavItem[] = [
  { label: 'Home', icon: 'home', route: '/mobile/dashboard' },
  { label: 'Portfolio', icon: 'account_balance_wallet', route: '/mobile/portfolio' },
  { label: 'Goals', icon: 'flag', route: '/mobile/goals' },
  { label: 'Tax Saving', icon: 'receipt_long', route: '/mobile/tax-saving' },
];

export const MOBILE_SHELL_CONFIG: ShellConfig = { brand: 'WealthOS', portalLabel: 'Mobile', navItems: mobileNav };
