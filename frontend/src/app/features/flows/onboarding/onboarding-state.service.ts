import { Injectable, computed, signal } from '@angular/core';
import { Client } from '../../../core/models/domain.models';

export interface RiskQuestion {
  id: string;
  question: string;
  helper: string;
  options: Array<{ label: string; score: number }>;
}

export const RISK_QUESTIONS: RiskQuestion[] = [
  {
    id: 'q1',
    question: 'What is your primary investment goal?',
    helper: 'This helps calibrate the balance between returns and volatility.',
    options: [
      { label: 'Capital preservation — protect what I have', score: 1 },
      { label: 'Steady income with limited fluctuation', score: 2 },
      { label: 'Balanced growth over the long term', score: 3 },
      { label: 'Maximum long-term capital appreciation', score: 4 },
    ],
  },
  {
    id: 'q2',
    question: 'What is your investment time horizon?',
    helper: 'Longer horizons can typically absorb more short-term volatility.',
    options: [
      { label: 'Less than 1 year', score: 1 },
      { label: '1 to 3 years', score: 2 },
      { label: '3 to 7 years', score: 3 },
      { label: 'More than 7 years', score: 4 },
    ],
  },
  {
    id: 'q3',
    question: 'If your portfolio fell 20% in a month, what would you do?',
    helper: 'Your reaction to drawdowns is a strong signal of risk tolerance.',
    options: [
      { label: 'Sell everything immediately', score: 1 },
      { label: 'Sell a part to limit further loss', score: 2 },
      { label: 'Hold and wait it out', score: 3 },
      { label: 'Invest more at the lower price', score: 4 },
    ],
  },
  {
    id: 'q4',
    question: 'How would you describe your investing experience?',
    helper: 'Experience with market cycles affects suitable product complexity.',
    options: [
      { label: 'No prior investing experience', score: 1 },
      { label: 'Some experience with mutual funds', score: 2 },
      { label: 'Comfortable with equities and derivatives', score: 3 },
      { label: 'Extensive, active trading experience', score: 4 },
    ],
  },
  {
    id: 'q5',
    question: 'What share of your income can you invest without needing it back soon?',
    helper: 'Liquidity needs shape how much risk you can safely take.',
    options: [
      { label: 'Less than 10%', score: 1 },
      { label: '10% to 25%', score: 2 },
      { label: '25% to 50%', score: 3 },
      { label: 'More than 50%', score: 4 },
    ],
  },
];

export type RiskProfile = Client['riskProfile'];

export interface DocumentItem {
  key: 'pan' | 'aadhaar' | 'address' | 'photo';
  label: string;
  description: string;
  icon: string;
}

export const KYC_DOCUMENTS: DocumentItem[] = [
  { key: 'pan', label: 'PAN Card', description: 'Permanent Account Number card', icon: 'badge' },
  { key: 'aadhaar', label: 'Aadhaar Card', description: 'UIDAI issued identity proof', icon: 'fingerprint' },
  { key: 'address', label: 'Address Proof', description: 'Utility bill or bank statement (last 3 months)', icon: 'home_pin' },
  { key: 'photo', label: 'Photograph', description: 'Recent passport-size photograph', icon: 'account_circle' },
];

@Injectable({ providedIn: 'root' })
export class OnboardingStateService {
  // Risk assessment
  readonly answers = signal<Record<string, number>>({});

  readonly totalScore = computed(() => Object.values(this.answers()).reduce((sum, s) => sum + s, 0));
  readonly maxScore = RISK_QUESTIONS.length * 4;
  readonly allAnswered = computed(() => Object.keys(this.answers()).length === RISK_QUESTIONS.length);

  readonly riskProfile = computed<RiskProfile>(() => {
    const pct = this.totalScore() / this.maxScore;
    if (pct <= 0.45) return 'Conservative';
    if (pct <= 0.75) return 'Moderate';
    return 'Aggressive';
  });

  readonly suggestedAllocation = computed(() => {
    switch (this.riskProfile()) {
      case 'Conservative':
        return { equity: 25, debt: 60, gold: 15 };
      case 'Moderate':
        return { equity: 55, debt: 35, gold: 10 };
      default:
        return { equity: 80, debt: 12, gold: 8 };
    }
  });

  setAnswer(questionId: string, score: number): void {
    this.answers.update((a) => ({ ...a, [questionId]: score }));
  }

  // KYC — client details
  readonly fullName = signal('');
  readonly pan = signal('');
  readonly dob = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly addressLine = signal('');
  readonly city = signal('');
  readonly state = signal('');
  readonly pincode = signal('');

  readonly clientDetailsValid = computed(
    () =>
      this.fullName().trim().length > 1 &&
      /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(this.pan().trim().toUpperCase()) &&
      this.dob().trim().length > 0 &&
      this.addressLine().trim().length > 0 &&
      this.city().trim().length > 0 &&
      this.pincode().trim().length === 6,
  );

  // KYC — documents
  readonly documents = signal<Record<DocumentItem['key'], boolean>>({ pan: false, aadhaar: false, address: false, photo: false });
  readonly allDocumentsUploaded = computed(() => Object.values(this.documents()).every(Boolean));

  toggleDocument(key: DocumentItem['key']): void {
    this.documents.update((d) => ({ ...d, [key]: !d[key] }));
  }

  // Final submit
  readonly submitted = signal(false);
  readonly clientId = signal<string | null>(null);

  reset(): void {
    this.answers.set({});
    this.fullName.set('');
    this.pan.set('');
    this.dob.set('');
    this.email.set('');
    this.phone.set('');
    this.addressLine.set('');
    this.city.set('');
    this.state.set('');
    this.pincode.set('');
    this.documents.set({ pan: false, aadhaar: false, address: false, photo: false });
    this.submitted.set(false);
    this.clientId.set(null);
  }
}
