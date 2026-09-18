export interface FixedIncomeInstrument {
  id: string;
  name: string;
  issuer: string;
  type: 'NCD' | 'G-Sec' | 'Corporate Bond' | 'T-Bill';
  yieldPct: number;
  rating: string;
  tenureMonths: number;
  minInvestment: number;
  faceValue: number;
  couponFrequency: string;
  maturityDate: string;
  description: string;
}

export const FIXED_INCOME_INSTRUMENTS: FixedIncomeInstrument[] = [
  {
    id: 'FI-01',
    name: 'Alpha Infra NCD Series IV',
    issuer: 'Alpha Infrastructure Ltd',
    type: 'NCD',
    yieldPct: 9.25,
    rating: 'AA+',
    tenureMonths: 36,
    minInvestment: 10000,
    faceValue: 1000,
    couponFrequency: 'Annual',
    maturityDate: '2029-09-01',
    description: 'Secured, redeemable non-convertible debentures issued to fund infrastructure road projects across Western India.',
  },
  {
    id: 'FI-02',
    name: '10Y Government Security',
    issuer: 'Government of India',
    type: 'G-Sec',
    yieldPct: 7.12,
    rating: 'Sovereign',
    tenureMonths: 120,
    minInvestment: 10000,
    faceValue: 100,
    couponFrequency: 'Semi-Annual',
    maturityDate: '2036-09-01',
    description: 'Sovereign-backed government security with semi-annual coupon payments, zero credit risk.',
  },
  {
    id: 'FI-03',
    name: 'Nexus Power Corporate Bond',
    issuer: 'Nexus Power Corp',
    type: 'Corporate Bond',
    yieldPct: 8.4,
    rating: 'AAA',
    tenureMonths: 60,
    minInvestment: 25000,
    faceValue: 1000,
    couponFrequency: 'Quarterly',
    maturityDate: '2031-09-01',
    description: 'AAA-rated corporate bond issued by a leading power generation company to refinance existing debt.',
  },
  {
    id: 'FI-04',
    name: '91-Day Treasury Bill',
    issuer: 'RBI',
    type: 'T-Bill',
    yieldPct: 6.8,
    rating: 'Sovereign',
    tenureMonths: 3,
    minInvestment: 25000,
    faceValue: 100,
    couponFrequency: 'Discount (No Coupon)',
    maturityDate: '2026-12-06',
    description: 'Short-term zero-coupon money market instrument issued at a discount to face value.',
  },
];
