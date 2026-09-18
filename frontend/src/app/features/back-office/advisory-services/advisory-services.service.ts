import { Injectable, computed, signal } from '@angular/core';
import {
  AdvisoryHolding,
  ApplicationRegisterEntry,
  ApplicationStatus,
  BasketOrder,
  CURRENT_DIGIGOLD_RATE_PER_GRAM,
  DigiGoldTransaction,
  EcasRequest,
  EcasStatus,
  IpoApplication,
  IpoListing,
  LasFacility,
  MOCK_ADVISORY_HOLDINGS,
  MOCK_APPLICATION_REGISTER,
  MOCK_DIGIGOLD_TRANSACTIONS,
  MOCK_ECAS_REQUESTS,
  MOCK_EQUITY_BASKETS,
  MOCK_IPO_LISTINGS,
  MOCK_LAS_FACILITIES,
  MOCK_P2P_OPTIONS,
  MOCK_SERVICE_REQUESTS,
  MOCK_WHATSAPP_SEND_LOG,
  MOCK_WHATSAPP_TEMPLATES,
  P2pOrder,
  ServiceRequestEntry,
  ServiceRequestStatus,
  WhatsAppSendLogEntry,
} from './advisory-services-data.mock';

export type AdvisorySignal = 'Book Profit' | 'Stop Loss Advised' | null;

export interface AdvisoryHoldingView extends AdvisoryHolding {
  invested: number;
  currentValue: number;
  gainPct: number;
  holdingDays: number;
  holdingYears: number;
  signal: AdvisorySignal;
  elssLockInDone: boolean;
  ltcgEligible: boolean;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TODAY = new Date('2026-09-16T00:00:00');

const BOOK_PROFIT_THRESHOLD_PCT = 20;
const STOP_LOSS_THRESHOLD_PCT = -10;
const ELSS_LOCK_IN_YEARS = 3;
const EQUITY_LTCG_MIN_YEARS = 1;
const DEBT_LTCG_MIN_YEARS = 3;

let nextLasSeq = 1011;
let nextBasketOrderSeq = 1;
let nextP2pOrderSeq = 1;
let nextEcasSeq = 5502;
let nextIpoAppSeq = 1;
let nextDigiGoldSeq = 30012;
let nextWhatsAppLogSeq = 9013;

@Injectable({ providedIn: 'root' })
export class AdvisoryServicesService {
  // ---- Portfolio Advisory (Mutual Fund) ----------------------------------
  private readonly _holdings = signal<AdvisoryHolding[]>(MOCK_ADVISORY_HOLDINGS.map((h) => ({ ...h })));

  readonly holdingViews = computed<AdvisoryHoldingView[]>(() =>
    this._holdings().map((h) => {
      const invested = h.units * h.avgCost;
      const currentValue = h.units * h.currentNav;
      const gainPct = ((h.currentNav - h.avgCost) / h.avgCost) * 100;
      const holdingDays = Math.floor((TODAY.getTime() - new Date(h.purchaseDate).getTime()) / MS_PER_DAY);
      const holdingYears = holdingDays / 365;

      let signal: AdvisorySignal = null;
      if (gainPct >= BOOK_PROFIT_THRESHOLD_PCT) signal = 'Book Profit';
      else if (gainPct <= STOP_LOSS_THRESHOLD_PCT) signal = 'Stop Loss Advised';

      const elssLockInDone = h.category === 'ELSS' && holdingYears >= ELSS_LOCK_IN_YEARS;
      const ltcgEligible = h.category === 'Debt' ? holdingYears >= DEBT_LTCG_MIN_YEARS : holdingYears >= EQUITY_LTCG_MIN_YEARS;

      return { ...h, invested, currentValue, gainPct, holdingDays, holdingYears, signal, elssLockInDone, ltcgEligible };
    }),
  );

  readonly bookProfitStopLossList = computed(() => this.holdingViews().filter((h) => h.signal !== null));
  readonly elssRedemptionList = computed(() => this.holdingViews().filter((h) => h.category === 'ELSS' && h.elssLockInDone));
  readonly ltRedemptionList = computed(() => this.holdingViews().filter((h) => h.ltcgEligible));

  markHoldingActioned(id: string): void {
    this._holdings.update((list) => list.map((h) => (h.id === id ? { ...h, actioned: true } : h)));
  }

  // ---- Services: Application Register ------------------------------------
  private readonly _applications = signal<ApplicationRegisterEntry[]>(MOCK_APPLICATION_REGISTER.map((a) => ({ ...a })));
  readonly applications = this._applications.asReadonly();

  setApplicationStatus(id: string, status: ApplicationStatus): void {
    this._applications.update((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  // ---- Services: Service Requests -----------------------------------------
  private readonly _serviceRequests = signal<ServiceRequestEntry[]>(MOCK_SERVICE_REQUESTS.map((s) => ({ ...s })));
  readonly serviceRequests = this._serviceRequests.asReadonly();

  setServiceRequestStatus(id: string, status: ServiceRequestStatus): void {
    this._serviceRequests.update((list) => list.map((s) => (s.id === id ? { ...s, status } : s)));
  }

  // ---- New Products: Loan Against Securities -------------------------------
  private readonly _lasFacilities = signal<LasFacility[]>(MOCK_LAS_FACILITIES.map((l) => ({ ...l })));
  readonly lasFacilities = this._lasFacilities.asReadonly();

  submitLasApplication(input: { customerName: string; lender: string; pledgedSecuritiesValue: number; requestedLimit: number }): LasFacility {
    const facility: LasFacility = {
      id: `LAS-${nextLasSeq++}`,
      customerName: input.customerName,
      lender: input.lender,
      pledgedSecuritiesValue: input.pledgedSecuritiesValue,
      sanctionedLimit: input.requestedLimit,
      utilizedAmount: 0,
      interestRatePct: 10.5,
      sanctionDate: '2026-09-16',
      status: 'Under Review',
    };
    this._lasFacilities.update((list) => [facility, ...list]);
    return facility;
  }

  // ---- New Products: Equity Baskets ----------------------------------------
  readonly equityBaskets = MOCK_EQUITY_BASKETS;
  private readonly _basketOrders = signal<BasketOrder[]>([]);
  readonly basketOrders = this._basketOrders.asReadonly();

  investInBasket(basketName: string, customerName: string, amount: number): BasketOrder {
    const order: BasketOrder = { id: `BO-${String(nextBasketOrderSeq++).padStart(4, '0')}`, basketName, customerName, amount, investedOn: '2026-09-16', status: 'Order Placed' };
    this._basketOrders.update((list) => [order, ...list]);
    return order;
  }

  // ---- New Products: P2P Investment -----------------------------------------
  readonly p2pOptions = MOCK_P2P_OPTIONS;
  private readonly _p2pOrders = signal<P2pOrder[]>([]);
  readonly p2pOrders = this._p2pOrders.asReadonly();

  investInP2p(planName: string, customerName: string, amount: number): P2pOrder {
    const order: P2pOrder = { id: `PO-${String(nextP2pOrderSeq++).padStart(4, '0')}`, planName, customerName, amount, investedOn: '2026-09-16', status: 'Order Placed' };
    this._p2pOrders.update((list) => [order, ...list]);
    return order;
  }

  // ---- New Products: DigiGold ------------------------------------------------
  readonly currentGoldRate = CURRENT_DIGIGOLD_RATE_PER_GRAM;
  private readonly _digiGoldTxns = signal<DigiGoldTransaction[]>(MOCK_DIGIGOLD_TRANSACTIONS.map((t) => ({ ...t })));
  readonly digiGoldTransactions = this._digiGoldTxns.asReadonly();

  recordDigiGoldTransaction(customerName: string, type: 'Buy' | 'Sell', amount: number): DigiGoldTransaction {
    const grams = Number((amount / this.currentGoldRate).toFixed(3));
    const txn: DigiGoldTransaction = {
      id: `DG-${nextDigiGoldSeq++}`,
      customerName,
      type,
      grams,
      ratePerGram: this.currentGoldRate,
      amount,
      vendor: 'SafeGold',
      timestamp: '2026-09-16 ' + new Date().toTimeString().slice(0, 5),
      status: 'Completed',
    };
    this._digiGoldTxns.update((list) => [txn, ...list]);
    return txn;
  }

  // ---- New Products: eCAS -----------------------------------------------------
  private readonly _ecasRequests = signal<EcasRequest[]>(MOCK_ECAS_REQUESTS.map((e) => ({ ...e })));
  readonly ecasRequests = this._ecasRequests.asReadonly();

  createEcasRequest(input: { customerName: string; pan: string; emailId: string; fromDate: string; toDate: string }): EcasRequest {
    const request: EcasRequest = {
      id: `ECAS-${nextEcasSeq++}`,
      customerName: input.customerName,
      pan: input.pan,
      emailId: input.emailId,
      fromDate: input.fromDate,
      toDate: input.toDate,
      requestedOn: '2026-09-16',
      requestedBy: 'RM',
      status: 'Queued' as EcasStatus,
    };
    this._ecasRequests.update((list) => [request, ...list]);
    return request;
  }

  // ---- New Products: WhatsApp (FintsoClick) -----------------------------------
  readonly whatsAppTemplates = MOCK_WHATSAPP_TEMPLATES;
  private readonly _whatsAppSendLog = signal<WhatsAppSendLogEntry[]>(MOCK_WHATSAPP_SEND_LOG.map((w) => ({ ...w })));
  readonly whatsAppSendLog = this._whatsAppSendLog.asReadonly();

  sendTestWhatsAppMessage(templateUsed: string, phone: string): WhatsAppSendLogEntry {
    const entry: WhatsAppSendLogEntry = {
      id: `WSL-${nextWhatsAppLogSeq++}`,
      customerName: 'Test Contact',
      phone,
      templateUsed,
      sentStatus: 'Sent',
      timestamp: '2026-09-16 ' + new Date().toTimeString().slice(0, 5),
    };
    this._whatsAppSendLog.update((list) => [entry, ...list]);
    return entry;
  }

  // ---- New Products: IPO -------------------------------------------------------
  readonly ipoListings: IpoListing[] = MOCK_IPO_LISTINGS;
  private readonly _ipoApplications = signal<IpoApplication[]>([]);
  readonly ipoApplications = this._ipoApplications.asReadonly();

  applyForIpo(listing: IpoListing, customerName: string, lots: number): IpoApplication {
    const application: IpoApplication = {
      id: `IPOA-${String(nextIpoAppSeq++).padStart(4, '0')}`,
      companyName: listing.companyName,
      customerName,
      lots,
      amount: lots * listing.lotSize * listing.priceBandHigh,
      appliedOn: '2026-09-16',
      status: 'Applied',
    };
    this._ipoApplications.update((list) => [application, ...list]);
    return application;
  }
}
