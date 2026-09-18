export interface Locale {
  code: string;
  name: string;
  isSource: boolean;
  rtl: boolean;
  totalStrings: number;
  completionPct: number;
  pendingStrings: number;
}

export type TranslationStatus = 'approved' | 'missing' | 'review';

export interface TranslationEntry {
  key: string;
  module: string;
  source: string;
  translations: Partial<Record<string, string>>;
  status: Partial<Record<string, TranslationStatus>>;
}

export const LOCALES: Locale[] = [
  { code: 'en-US', name: 'English (US)', isSource: true, rtl: false, totalStrings: 2405, completionPct: 100, pendingStrings: 0 },
  { code: 'ar-AE', name: 'Arabic (UAE)', isSource: false, rtl: true, totalStrings: 2405, completionPct: 85, pendingStrings: 361 },
  { code: 'hi-IN', name: 'Hindi', isSource: false, rtl: false, totalStrings: 2405, completionPct: 95, pendingStrings: 120 },
  { code: 'fr-FR', name: 'French (France)', isSource: false, rtl: false, totalStrings: 2405, completionPct: 72, pendingStrings: 673 },
];

export const TRANSLATION_MODULES = ['Navigation', 'Dashboard', 'Payouts', 'Onboarding'];

export const TRANSLATION_ENTRIES: TranslationEntry[] = [
  {
    key: 'nav.dashboard.title',
    module: 'Navigation',
    source: 'Dashboard',
    translations: { 'ar-AE': 'لوحة القيادة', 'hi-IN': 'डैशबोर्ड', 'fr-FR': 'Tableau de bord' },
    status: { 'ar-AE': 'approved', 'hi-IN': 'approved', 'fr-FR': 'approved' },
  },
  {
    key: 'nav.customers.title',
    module: 'Navigation',
    source: 'Customers',
    translations: { 'ar-AE': 'العملاء', 'hi-IN': 'ग्राहक', 'fr-FR': 'Clients' },
    status: { 'ar-AE': 'approved', 'hi-IN': 'approved', 'fr-FR': 'approved' },
  },
  {
    key: 'nav.mutual_funds.title',
    module: 'Navigation',
    source: 'Mutual Funds',
    translations: { 'hi-IN': 'म्यूचुअल फंड', 'fr-FR': 'Fonds communs de placement' },
    status: { 'ar-AE': 'missing', 'hi-IN': 'approved', 'fr-FR': 'review' },
  },
  {
    key: 'nav.orders.title',
    module: 'Navigation',
    source: 'Orders',
    translations: { 'ar-AE': 'الطلبات', 'hi-IN': 'ऑर्डर', 'fr-FR': 'Ordres' },
    status: { 'ar-AE': 'review', 'hi-IN': 'approved', 'fr-FR': 'approved' },
  },
  {
    key: 'dashboard.payout.empty_state',
    module: 'Dashboard',
    source: 'You currently have no pending commission payouts for this settlement cycle. Check back after market close.',
    translations: {
      'ar-AE': 'ليس لديك حاليًا أي دفعات عمولة معلقة لدورة التسوية هذه. يرجى التحقق مرة أخرى بعد إغلاق السوق.',
      'hi-IN': 'इस निपटान चक्र के लिए आपके पास वर्तमान में कोई लंबित कमीशन भुगतान नहीं है। बाजार बंद होने के बाद फिर से जांचें।',
    },
    status: { 'ar-AE': 'approved', 'hi-IN': 'approved', 'fr-FR': 'missing' },
  },
  {
    key: 'dashboard.metric.ytd_revenue',
    module: 'Dashboard',
    source: 'Year-to-Date Revenue',
    translations: { 'hi-IN': 'वर्ष-दर-वर्ष राजस्व' },
    status: { 'ar-AE': 'missing', 'hi-IN': 'approved', 'fr-FR': 'missing' },
  },
  {
    key: 'payouts.status.processed',
    module: 'Payouts',
    source: 'Processed',
    translations: { 'ar-AE': 'تمت المعالجة', 'fr-FR': 'Traité' },
    status: { 'ar-AE': 'approved', 'hi-IN': 'missing', 'fr-FR': 'approved' },
  },
  {
    key: 'payouts.action.download_statement',
    module: 'Payouts',
    source: 'Download Statement',
    translations: {},
    status: { 'ar-AE': 'missing', 'hi-IN': 'missing', 'fr-FR': 'missing' },
  },
  {
    key: 'onboarding.step.kyc_verification',
    module: 'Onboarding',
    source: 'KYC Verification',
    translations: { 'ar-AE': 'التحقق من هوية العميل', 'hi-IN': 'केवाईसी सत्यापन', 'fr-FR': 'Vérification KYC' },
    status: { 'ar-AE': 'review', 'hi-IN': 'approved', 'fr-FR': 'approved' },
  },
  {
    key: 'onboarding.cta.get_started',
    module: 'Onboarding',
    source: 'Get Started',
    translations: { 'hi-IN': 'शुरू करें', 'fr-FR': 'Commencer' },
    status: { 'ar-AE': 'missing', 'hi-IN': 'approved', 'fr-FR': 'review' },
  },
];
