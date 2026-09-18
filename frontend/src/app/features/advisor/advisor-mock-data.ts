// Advisor-module-only mock data: covers domains not represented by shared core models
// (brokerage slabs/payouts, campaign leads/templates, chat threads). Reuses MOCK_CLIENTS /
// MOCK_SCHEMES ids for cross-linking wherever the data overlaps with shared domain data.

// Aggregate book-of-business AUM trend (Cr), used on the advisor Portfolio Overview chart.
export interface AumTrendPoint {
  month: string;
  aum: number;
  benchmark: number;
}
export const PORTFOLIO_AUM_TREND: AumTrendPoint[] = [
  { month: 'Oct', aum: 28.4, benchmark: 27.1 },
  { month: 'Nov', aum: 29.1, benchmark: 27.6 },
  { month: 'Dec', aum: 30.6, benchmark: 28.3 },
  { month: 'Jan', aum: 31.2, benchmark: 28.9 },
  { month: 'Feb', aum: 32.5, benchmark: 29.5 },
  { month: 'Mar', aum: 33.8, benchmark: 30.4 },
  { month: 'Apr', aum: 33.1, benchmark: 30.8 },
  { month: 'May', aum: 34.6, benchmark: 31.5 },
  { month: 'Jun', aum: 35.9, benchmark: 32.1 },
  { month: 'Jul', aum: 36.8, benchmark: 32.9 },
  { month: 'Aug', aum: 37.9, benchmark: 33.6 },
  { month: 'Sep', aum: 38.9, benchmark: 34.2 },
];

export interface CommissionTrendPoint {
  month: string;
  base: number; // INR, in lakhs
  incentive: number; // INR, in lakhs
}
export const COMMISSION_TREND: CommissionTrendPoint[] = [
  { month: 'Oct', base: 8.2, incentive: 1.1 },
  { month: 'Nov', base: 8.6, incentive: 1.3 },
  { month: 'Dec', base: 9.4, incentive: 1.2 },
  { month: 'Jan', base: 9.1, incentive: 1.6 },
  { month: 'Feb', base: 9.8, incentive: 1.8 },
  { month: 'Mar', base: 10.9, incentive: 2.1 },
  { month: 'Apr', base: 10.4, incentive: 1.9 },
  { month: 'May', base: 11.2, incentive: 2.2 },
  { month: 'Jun', base: 11.8, incentive: 2.4 },
  { month: 'Jul', base: 12.3, incentive: 2.5 },
  { month: 'Aug', base: 12.9, incentive: 2.7 },
  { month: 'Sep', base: 13.6, incentive: 3.0 },
];

export interface CommissionSlabTier {
  range: string;
  upfront: number;
  trail: number;
  b30: boolean;
  current?: boolean;
}
export const EQUITY_SLABS: CommissionSlabTier[] = [
  { range: '0 - 50L', upfront: 0.75, trail: 0.5, b30: true },
  { range: '50L - 2Cr', upfront: 0.85, trail: 0.6, b30: true },
  { range: '2Cr - 5Cr', upfront: 1.0, trail: 0.75, b30: false, current: true },
  { range: '> 5Cr', upfront: 1.25, trail: 1.0, b30: false },
];
export const DEBT_SLABS: { range: string; rate: number; current?: boolean }[] = [
  { range: '0 - 1Cr', rate: 0.1 },
  { range: '1Cr - 10Cr', rate: 0.15, current: true },
  { range: '> 10Cr', rate: 0.25 },
];
export const GOLD_FLAT_RATE = 1.5;

export interface PayoutBatch {
  id: string;
  period: string;
  gross: number;
  tds: number;
  net: number;
  status: 'Settled' | 'Reconciling';
  bankRef: string;
}
export const PAYOUT_BATCHES: PayoutBatch[] = [
  { id: 'PO-2026-09-042', period: 'Aug 2026', gross: 1350000, tds: 135000, net: 1215000, status: 'Settled', bankRef: 'HDFC-883921' },
  { id: 'PO-2026-08-019', period: 'Jul 2026', gross: 1120500, tds: 112050, net: 1008450, status: 'Settled', bankRef: 'ICICI-772810' },
  { id: 'PO-2026-08-002', period: 'Jul 2026 (Ad-hoc)', gross: 45000, tds: 4500, net: 40500, status: 'Reconciling', bankRef: 'PENDING' },
  { id: 'PO-2026-07-088', period: 'Jun 2026', gross: 985000, tds: 98500, net: 886500, status: 'Settled', bankRef: 'AXIS-992123' },
];

export interface ForecastQuarter {
  label: string;
  amount: number;
  changeLabel: string;
  confirmed: boolean;
}
export const FORECAST_QUARTERS: ForecastQuarter[] = [
  { label: 'Q3 FY26 Expected', amount: 1452000, changeLabel: '+5.2%', confirmed: true },
  { label: 'Q4 FY26 Projected', amount: 1510500, changeLabel: '+4.0%', confirmed: true },
  { label: 'Q1 FY27 Projected', amount: 1585000, changeLabel: 'Est. based on AUM', confirmed: false },
  { label: 'Q2 FY27 Projected', amount: 1640000, changeLabel: 'Pending slab review', confirmed: false },
];

export interface AmcSlabProgress {
  amc: string;
  aum: number; // Cr
  target: number; // Cr
  bps: number;
  label: string;
  hit: boolean;
}
export const AMC_SLAB_PROGRESS: AmcSlabProgress[] = [
  { amc: 'Alpha Mutual Fund', aum: 50, target: 50, bps: 85, label: 'Slab 3 Hit', hit: true },
  { amc: 'WealthNexus AMC', aum: 41, target: 50, bps: 75, label: 'Slab 2', hit: false },
  { amc: 'Global Capital AMC', aum: 11, target: 25, bps: 60, label: 'Slab 1', hit: false },
];

export interface ForecastRow {
  amc: string;
  category: string;
  grossTrail: number;
  gst: number;
  netPayout: number;
  confirmed: boolean;
  expectedDate: string;
}
export const FORECAST_BREAKDOWN: ForecastRow[] = [
  { amc: 'Alpha Mutual Fund', category: 'Equity - Large Cap', grossTrail: 450000, gst: 81000, netPayout: 369000, confirmed: true, expectedDate: '05 Oct 2026' },
  { amc: 'WealthNexus AMC', category: 'Hybrid - Aggressive', grossTrail: 280000, gst: 50400, netPayout: 229600, confirmed: true, expectedDate: '08 Oct 2026' },
  { amc: 'Global Capital AMC', category: 'Debt - Liquid', grossTrail: 115000, gst: 20700, netPayout: 94300, confirmed: false, expectedDate: '15 Nov 2026' },
  { amc: 'Alpha Mutual Fund', category: 'Equity - Mid Cap', grossTrail: 310000, gst: 55800, netPayout: 254200, confirmed: false, expectedDate: '10 Dec 2026' },
];

export interface CampaignChannel {
  name: string;
  icon: string;
  leads: number;
  pctOfTotal: number;
  highIntent: boolean;
}
export const CAMPAIGN_CHANNELS: CampaignChannel[] = [
  { name: 'WhatsApp', icon: 'chat', leads: 560, pctOfTotal: 45, highIntent: true },
  { name: 'Email', icon: 'mail', leads: 398, pctOfTotal: 32, highIntent: false },
  { name: 'Web Forms', icon: 'public', leads: 224, pctOfTotal: 18, highIntent: true },
];

export interface LeadActivity {
  name: string;
  time: string;
  message: string;
  tag?: string;
}
export const LEAD_ACTIVITY: LeadActivity[] = [
  { name: 'Rohit Sinha', time: '10 min ago', message: "Opted in via 'ELSS Tax Saver' WhatsApp blast.", tag: 'High Score: 85' },
  { name: 'Anita Kulkarni', time: '1 hr ago', message: "Downloaded 'Retirement Planning Guide' PDF." },
  { name: 'Vikram Malhotra', time: '2 hrs ago', message: 'Converted — meeting booked for tomorrow.', tag: 'Converted' },
];

export interface CampaignTemplate {
  name: string;
  channel: 'Email' | 'WhatsApp' | 'SMS' | 'Push';
  icon: string;
  description: string;
  openRate: string;
  goal: string;
}
export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  { name: 'Q3 Wealth Insights Newsletter', channel: 'Email', icon: 'mail', description: 'Quarterly market performance and advisory insights digest.', openRate: '+14% Open Rate', goal: 'Lead Gen' },
  { name: 'ELSS Tax Saver FY26 Blast', channel: 'WhatsApp', icon: 'chat', description: 'Reminder push for 80C tax-saving investments before the March deadline.', openRate: '+22% Response Rate', goal: 'Lead Gen' },
  { name: 'SIP Top-Up Reminder', channel: 'SMS', icon: 'sms', description: 'Nudge existing SIP clients to top up ahead of bonus season.', openRate: '+9% CTR', goal: 'Retention' },
  { name: 'HNI Portfolio Review Invite', channel: 'Email', icon: 'diamond', description: 'Personalized review invite for high-net-worth clients.', openRate: '+31% Open Rate', goal: 'Upsell' },
  { name: 'New Fund Offer Alert', channel: 'Push', icon: 'campaign', description: 'In-app alert announcing a newly launched scheme.', openRate: '+18% CTR', goal: 'Lead Gen' },
  { name: 'Digital Gold SIP Drive', channel: 'Email', icon: 'monetization_on', description: 'Promote monthly digital gold accumulation plans.', openRate: '+11% Open Rate', goal: 'Lead Gen' },
];

// Lead inflow, last 12 data points (weekly), used for the sparkline chart
export const LEAD_INFLOW_SERIES: number[] = [62, 70, 58, 82, 91, 78, 105, 96, 118, 108, 132, 129];

export interface FunnelStep {
  label: string;
  value: number;
  icon: string;
}
export const CONVERSION_FUNNEL: FunnelStep[] = [
  { label: 'Impressions', value: 124500, icon: 'visibility' },
  { label: 'Clicks', value: 9960, icon: 'ads_click' },
  { label: 'Leads', value: 1429, icon: 'person_add' },
  { label: 'Customers', value: 71, icon: 'handshake' },
];

export interface RevenueMixSlice {
  label: string;
  pct: number;
  colorVar: string;
}
export const REVENUE_MIX: RevenueMixSlice[] = [
  { label: 'Equity', pct: 65, colorVar: '--color-primary' },
  { label: 'Debt', pct: 20, colorVar: '--color-secondary' },
  { label: 'Hybrid', pct: 10, colorVar: '--color-tertiary-container' },
  { label: 'Liquid', pct: 5, colorVar: '--color-outline-variant' },
];

export interface AumMovementBar {
  label: string;
  value: number; // Cr, signed for in/out
  kind: 'total' | 'in' | 'out';
}
export const AUM_MOVEMENT: AumMovementBar[] = [
  { label: 'Opening AUM', value: 350, kind: 'total' },
  { label: 'New Sales', value: 45, kind: 'in' },
  { label: 'Market Apprec.', value: 25, kind: 'in' },
  { label: 'Redemptions', value: -40, kind: 'out' },
  { label: 'Closing AUM', value: 380, kind: 'total' },
];

export interface WatchlistItem {
  clientName: string;
  note: string;
  amount: number;
  when: string;
}
export const HIGH_IMPACT_INFLOWS: WatchlistItem[] = [
  { clientName: 'Kabir Enterprises Pvt Ltd', note: 'Equity Fund lumpsum', amount: 5200000, when: 'Today' },
  { clientName: 'The Malhotra Family Trust', note: 'Debt Liquid switch-in', amount: 2800000, when: 'Yesterday' },
];
export const AT_RISK_ASSETS: WatchlistItem[] = [
  { clientName: 'Vikram Singh', note: 'Large redemption request pending', amount: -1500000, when: '2 days ago' },
  { clientName: 'Ananya Ghosh', note: 'KYC rejected — AUM frozen', amount: 0, when: '3 days ago' },
];

// Client profitability: synthetic holdings-to-revenue attribution keyed by client id (from MOCK_CLIENTS)
export interface ClientHoldingRevenue {
  schemeName: string;
  currentValue: number;
  trailBps: number;
}
export const CLIENT_HOLDINGS_REVENUE: Record<string, ClientHoldingRevenue[]> = {
  'CL-1001': [
    { schemeName: 'Alpha Bluechip Fund - Direct Growth', currentValue: 6500000, trailBps: 75 },
    { schemeName: 'Nexus Midcap Opportunities Fund', currentValue: 3200000, trailBps: 85 },
    { schemeName: 'WealthNexus Liquid Fund', currentValue: 2750000, trailBps: 18 },
  ],
  'CL-1005': [
    { schemeName: 'WealthNexus Liquid Fund', currentValue: 28000000, trailBps: 18 },
    { schemeName: 'Alpha Corporate Bond Fund', currentValue: 17000000, trailBps: 30 },
  ],
  'CL-1008': [
    { schemeName: 'Nexus Balanced Advantage Fund', currentValue: 95000000, trailBps: 62 },
    { schemeName: 'Alpha Corporate Bond Fund', currentValue: 62000000, trailBps: 30 },
    { schemeName: 'WealthNexus Short Term Debt Fund', currentValue: 25000000, trailBps: 35 },
  ],
  'CL-1010': [
    { schemeName: 'Nexus Midcap Opportunities Fund', currentValue: 8800000, trailBps: 85 },
    { schemeName: 'Global Innovation Tech Fund', currentValue: 4200000, trailBps: 95 },
    { schemeName: 'Alpha ELSS Tax Saver Fund', currentValue: 2600000, trailBps: 71 },
  ],
};

// Chat threads keyed to real MOCK_CLIENTS ids for cross-linking
export interface ChatMessage {
  from: 'advisor' | 'client';
  text: string;
  time: string;
}
export interface ChatThread {
  clientId: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
}
export const CHAT_THREADS: ChatThread[] = [
  {
    clientId: 'CL-1010',
    lastMessage: 'Regarding Q3 rebalance...',
    time: '10:42 AM',
    unread: 2,
    online: true,
    messages: [
      { from: 'client', text: 'Good morning. I was reviewing the Q3 performance summary you sent over. Can we discuss adjusting the equity allocation slightly?', time: '10:35 AM' },
      { from: 'advisor', text: 'Morning Vikram. Absolutely — given the recent volatility, trimming growth equities in favour of defensives makes sense. Fixed income or cash equivalents?', time: '10:38 AM' },
      { from: 'client', text: "I'd like to see scenarios for both. Let's aim for a 5% shift from growth equities.", time: '10:42 AM' },
    ],
  },
  {
    clientId: 'CL-1001',
    lastMessage: 'Thanks for the update.',
    time: 'Yesterday',
    unread: 0,
    online: false,
    messages: [
      { from: 'advisor', text: 'Hi Rajesh, your Alpha Bluechip SIP has been processed successfully for this month.', time: 'Yesterday, 4:10 PM' },
      { from: 'client', text: 'Thanks for the update.', time: 'Yesterday, 4:22 PM' },
    ],
  },
  {
    clientId: 'CL-1005',
    lastMessage: 'Can we schedule a call this week?',
    time: '2 days ago',
    unread: 1,
    online: false,
    messages: [
      { from: 'client', text: 'We would like to review the corporate treasury allocation. Can we schedule a call this week?', time: '2 days ago' },
    ],
  },
  {
    clientId: 'CL-1004',
    lastMessage: 'Redemption request confirmed.',
    time: '3 days ago',
    unread: 0,
    online: true,
    messages: [
      { from: 'advisor', text: 'Your redemption request for WealthNexus Short Term Debt Fund has been confirmed and is processing.', time: '3 days ago' },
      { from: 'client', text: 'Redemption request confirmed. Thank you!', time: '3 days ago' },
    ],
  },
];
