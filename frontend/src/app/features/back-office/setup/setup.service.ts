import { Injectable, computed, signal } from '@angular/core';
import {
  Agency,
  ArnRecord,
  Associate,
  AppConfig,
  AreaRecord,
  Branch,
  BroadcastMessage,
  CustomerLogin,
  Employee,
  GreetingTemplate,
  HolidayRecord,
  IntimationTemplate,
  MOCK_AGENCIES,
  MOCK_APP_CONFIG,
  MOCK_AREAS,
  MOCK_ARN_RECORDS,
  MOCK_ASSOCIATES,
  MOCK_BRANCHES,
  MOCK_BROADCAST_LOG,
  MOCK_CUSTOMER_LOGINS,
  MOCK_EMPLOYEES,
  MOCK_GREETING_TEMPLATES,
  MOCK_HOLIDAYS,
  MOCK_INTIMATION_TEMPLATES,
  MOCK_PERMISSIONS,
  MOCK_PRINCIPAL_BROKER_RELATIONSHIPS,
  MOCK_RECOMMENDED_FUNDS,
  MOCK_REPORT_MAIL_BACK_LOG,
  MOCK_RM_MAPPINGS,
  MOCK_ROLES,
  MOCK_ROLE_PRIVILEGES,
  MOCK_SCHEDULED_SERVICES,
  MOCK_SCHEDULE_SERVICE_LOG,
  MOCK_SETUP_IMPORT_LOG,
  MOCK_SETUP_SCHEDULED_REPORTS,
  MOCK_SMS_EMAIL_LOG,
  MOCK_USERS,
  MOCK_VERSION_HISTORY,
  Permission,
  PrincipalBrokerRelationship,
  RecommendedFund,
  ReportMailBackLogEntry,
  RmMapping,
  Role,
  ScheduledService,
  ScheduleServiceLogEntry,
  SetupImportLogEntry,
  SetupScheduledReport,
  SmsEmailUsageLogEntry,
  UserAccount,
  VersionHistoryEntry,
} from './setup-data.mock';

let seq = 5000;
const nextId = (prefix: string) => `${prefix}-${seq++}`;

@Injectable({ providedIn: 'root' })
export class SetupService {
  // --- Organization Setup ---------------------------------------------
  private readonly _branches = signal<Branch[]>(MOCK_BRANCHES.map((b) => ({ ...b })));
  private readonly _employees = signal<Employee[]>(MOCK_EMPLOYEES.map((e) => ({ ...e })));
  private readonly _associates = signal<Associate[]>(MOCK_ASSOCIATES.map((a) => ({ ...a })));
  private readonly _agencies = signal<Agency[]>(MOCK_AGENCIES.map((a) => ({ ...a })));
  private readonly _arnRecords = signal<ArnRecord[]>(MOCK_ARN_RECORDS.map((a) => ({ ...a })));
  private readonly _principalBrokerRelationships = signal<PrincipalBrokerRelationship[]>(MOCK_PRINCIPAL_BROKER_RELATIONSHIPS.map((p) => ({ ...p })));

  readonly branches = this._branches.asReadonly();
  readonly employees = this._employees.asReadonly();
  readonly associates = this._associates.asReadonly();
  readonly agencies = this._agencies.asReadonly();
  readonly arnRecords = this._arnRecords.asReadonly();
  readonly principalBrokerRelationships = this._principalBrokerRelationships.asReadonly();

  branchName(id: string | null): string {
    return (id && this._branches().find((b) => b.id === id)?.name) || '—';
  }

  addBranch(b: Omit<Branch, 'id'>): void {
    this._branches.update((list) => [...list, { ...b, id: nextId('BR') }]);
  }
  updateBranch(id: string, patch: Partial<Branch>): void {
    this._branches.update((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }
  deleteBranch(id: string): void {
    this._branches.update((list) => list.filter((b) => b.id !== id));
  }

  addEmployee(e: Omit<Employee, 'id'>): void {
    this._employees.update((list) => [...list, { ...e, id: nextId('EMP') }]);
  }
  updateEmployee(id: string, patch: Partial<Employee>): void {
    this._employees.update((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
  deleteEmployee(id: string): void {
    this._employees.update((list) => list.filter((e) => e.id !== id));
  }

  addAssociate(a: Omit<Associate, 'id'>): void {
    this._associates.update((list) => [...list, { ...a, id: nextId('ASC') }]);
  }
  updateAssociate(id: string, patch: Partial<Associate>): void {
    this._associates.update((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }
  deleteAssociate(id: string): void {
    this._associates.update((list) => list.filter((a) => a.id !== id));
  }

  addAgency(a: Omit<Agency, 'id'>): void {
    this._agencies.update((list) => [...list, { ...a, id: nextId('AGY') }]);
  }
  updateAgency(id: string, patch: Partial<Agency>): void {
    this._agencies.update((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }
  deleteAgency(id: string): void {
    this._agencies.update((list) => list.filter((a) => a.id !== id));
  }

  addArnRecord(a: Omit<ArnRecord, 'id'>): void {
    this._arnRecords.update((list) => [...list, { ...a, id: nextId('ARNREC') }]);
  }
  updateArnRecord(id: string, patch: Partial<ArnRecord>): void {
    this._arnRecords.update((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }
  deleteArnRecord(id: string): void {
    this._arnRecords.update((list) => list.filter((a) => a.id !== id));
  }

  addPrincipalBrokerRelationship(p: Omit<PrincipalBrokerRelationship, 'id'>): void {
    this._principalBrokerRelationships.update((list) => [...list, { ...p, id: nextId('PBR') }]);
  }
  updatePrincipalBrokerRelationship(id: string, patch: Partial<PrincipalBrokerRelationship>): void {
    this._principalBrokerRelationships.update((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  deletePrincipalBrokerRelationship(id: string): void {
    this._principalBrokerRelationships.update((list) => list.filter((p) => p.id !== id));
  }

  // --- User Management --------------------------------------------------
  private readonly _roles = signal<Role[]>(MOCK_ROLES.map((r) => ({ ...r })));
  private readonly _permissions = signal<Permission[]>(MOCK_PERMISSIONS.map((p) => ({ ...p })));
  private readonly _rolePrivileges = signal<Record<string, string[]>>(
    Object.fromEntries(Object.entries(MOCK_ROLE_PRIVILEGES).map(([k, v]) => [k, [...v]])),
  );
  private readonly _users = signal<UserAccount[]>(MOCK_USERS.map((u) => ({ ...u })));
  private readonly _rmMappings = signal<RmMapping[]>(MOCK_RM_MAPPINGS.map((m) => ({ ...m })));

  readonly roles = this._roles.asReadonly();
  readonly permissions = this._permissions.asReadonly();
  readonly rolePrivileges = this._rolePrivileges.asReadonly();
  readonly users = this._users.asReadonly();
  readonly rmMappings = this._rmMappings.asReadonly();

  readonly permissionsByCategory = computed(() => {
    const map = new Map<string, Permission[]>();
    for (const p of this._permissions()) {
      map.set(p.category, [...(map.get(p.category) ?? []), p]);
    }
    return [...map.entries()].map(([category, perms]) => ({ category, perms }));
  });

  roleName(id: string): string {
    return this._roles().find((r) => r.id === id)?.name ?? id;
  }

  userCountForRole(roleId: string): number {
    return this._users().filter((u) => u.roleId === roleId).length;
  }

  employeeName(id: string): string {
    return this._employees().find((e) => e.id === id)?.name ?? id;
  }

  addRole(r: Omit<Role, 'id'>): void {
    const role = { ...r, id: nextId('ROLE') };
    this._roles.update((list) => [...list, role]);
    this._rolePrivileges.update((rp) => ({ ...rp, [role.id]: [] }));
  }
  updateRole(id: string, patch: Partial<Role>): void {
    this._roles.update((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  deleteRole(id: string): void {
    this._roles.update((list) => list.filter((r) => r.id !== id));
    this._rolePrivileges.update((rp) => {
      const { [id]: _, ...rest } = rp;
      return rest;
    });
  }

  hasPrivilege(roleId: string, permissionId: string): boolean {
    return (this._rolePrivileges()[roleId] ?? []).includes(permissionId);
  }

  togglePrivilege(roleId: string, permissionId: string): void {
    this._rolePrivileges.update((rp) => {
      const current = rp[roleId] ?? [];
      const next = current.includes(permissionId) ? current.filter((p) => p !== permissionId) : [...current, permissionId];
      return { ...rp, [roleId]: next };
    });
  }

  addUser(u: Omit<UserAccount, 'id'>): void {
    this._users.update((list) => [...list, { ...u, id: nextId('USR') }]);
  }
  updateUser(id: string, patch: Partial<UserAccount>): void {
    this._users.update((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }
  deleteUser(id: string): void {
    this._users.update((list) => list.filter((u) => u.id !== id));
  }

  addRmMapping(m: Omit<RmMapping, 'id'>): void {
    this._rmMappings.update((list) => [...list, { ...m, id: nextId('RMM') }]);
  }
  updateRmMapping(id: string, patch: Partial<RmMapping>): void {
    this._rmMappings.update((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  deleteRmMapping(id: string): void {
    this._rmMappings.update((list) => list.filter((m) => m.id !== id));
  }

  // --- Customer Access ----------------------------------------------------
  private readonly _customerLogins = signal<CustomerLogin[]>(MOCK_CUSTOMER_LOGINS.map((c) => ({ ...c })));
  readonly customerLogins = this._customerLogins.asReadonly();
  readonly smsEmailLog = signal<SmsEmailUsageLogEntry[]>(MOCK_SMS_EMAIL_LOG).asReadonly();
  readonly reportMailBackLog = signal<ReportMailBackLogEntry[]>(MOCK_REPORT_MAIL_BACK_LOG).asReadonly();

  setLoginStatus(id: string, status: CustomerLogin['status']): void {
    this._customerLogins.update((list) => list.map((c) => (c.id === id ? { ...c, status, failedAttempts: status === 'Active' ? 0 : c.failedAttempts } : c)));
  }

  resetPassword(id: string): string {
    const tempPassword = `Wos@${Math.floor(1000 + Math.random() * 9000)}`;
    this._customerLogins.update((list) => list.map((c) => (c.id === id ? { ...c, failedAttempts: 0 } : c)));
    return tempPassword;
  }

  // --- Settings -------------------------------------------------------
  private readonly _appConfig = signal<AppConfig>({ ...MOCK_APP_CONFIG });
  readonly appConfig = this._appConfig.asReadonly();

  saveAppConfig(patch: Partial<AppConfig>): void {
    this._appConfig.update((c) => ({ ...c, ...patch }));
  }

  private readonly _greetingTemplates = signal<GreetingTemplate[]>(MOCK_GREETING_TEMPLATES.map((g) => ({ ...g })));
  readonly greetingTemplates = this._greetingTemplates.asReadonly();

  addGreetingTemplate(g: Omit<GreetingTemplate, 'id'>): void {
    this._greetingTemplates.update((list) => [...list, { ...g, id: nextId('GRT') }]);
  }
  updateGreetingTemplate(id: string, patch: Partial<GreetingTemplate>): void {
    this._greetingTemplates.update((list) => list.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }
  deleteGreetingTemplate(id: string): void {
    this._greetingTemplates.update((list) => list.filter((g) => g.id !== id));
  }

  private readonly _recommendedFunds = signal<RecommendedFund[]>(MOCK_RECOMMENDED_FUNDS.map((f) => ({ ...f })));
  readonly recommendedFunds = this._recommendedFunds.asReadonly();

  addRecommendedFund(f: Omit<RecommendedFund, 'id' | 'rank'>): void {
    this._recommendedFunds.update((list) => [...list, { ...f, id: nextId('RF'), rank: list.length + 1 }]);
  }
  removeRecommendedFund(id: string): void {
    this._recommendedFunds.update((list) => list.filter((f) => f.id !== id).map((f, i) => ({ ...f, rank: i + 1 })));
  }
  moveRecommendedFund(id: string, direction: -1 | 1): void {
    this._recommendedFunds.update((list) => {
      const idx = list.findIndex((f) => f.id === id);
      const swapIdx = idx + direction;
      if (idx < 0 || swapIdx < 0 || swapIdx >= list.length) return list;
      const next = [...list];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((f, i) => ({ ...f, rank: i + 1 }));
    });
  }

  // --- Alerts & Notifications ------------------------------------------
  private readonly _intimationTemplates = signal<IntimationTemplate[]>(MOCK_INTIMATION_TEMPLATES.map((t) => ({ ...t })));
  readonly intimationTemplates = this._intimationTemplates.asReadonly();

  addIntimationTemplate(t: Omit<IntimationTemplate, 'id'>): void {
    this._intimationTemplates.update((list) => [...list, { ...t, id: nextId('IT') }]);
  }
  updateIntimationTemplate(id: string, patch: Partial<IntimationTemplate>): void {
    this._intimationTemplates.update((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }
  deleteIntimationTemplate(id: string): void {
    this._intimationTemplates.update((list) => list.filter((t) => t.id !== id));
  }

  private readonly _scheduledServices = signal<ScheduledService[]>(MOCK_SCHEDULED_SERVICES.map((s) => ({ ...s })));
  readonly scheduledServices = this._scheduledServices.asReadonly();

  toggleServicePause(id: string): void {
    this._scheduledServices.update((list) =>
      list.map((s) => (s.id === id ? { ...s, status: s.status === 'Paused' ? 'Active' : 'Paused' } : s)),
    );
  }

  readonly scheduleServiceLog = signal<ScheduleServiceLogEntry[]>(MOCK_SCHEDULE_SERVICE_LOG).asReadonly();

  private readonly _broadcastLog = signal<BroadcastMessage[]>(MOCK_BROADCAST_LOG.map((b) => ({ ...b })));
  readonly broadcastLog = this._broadcastLog.asReadonly();

  sendBroadcast(msg: Omit<BroadcastMessage, 'id' | 'sentOn' | 'status'>): void {
    const entry: BroadcastMessage = { ...msg, id: nextId('BC'), sentOn: new Date().toISOString().slice(0, 16).replace('T', ' '), status: 'Sent' };
    this._broadcastLog.update((list) => [entry, ...list]);
  }

  private readonly _setupScheduledReports = signal<SetupScheduledReport[]>(MOCK_SETUP_SCHEDULED_REPORTS.map((r) => ({ ...r })));
  readonly setupScheduledReports = this._setupScheduledReports.asReadonly();

  addSetupScheduledReport(r: Omit<SetupScheduledReport, 'id'>): void {
    this._setupScheduledReports.update((list) => [...list, { ...r, id: nextId('SSR') }]);
  }
  updateSetupScheduledReport(id: string, patch: Partial<SetupScheduledReport>): void {
    this._setupScheduledReports.update((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  deleteSetupScheduledReport(id: string): void {
    this._setupScheduledReports.update((list) => list.filter((r) => r.id !== id));
  }
  toggleSetupScheduledReport(id: string): void {
    this._setupScheduledReports.update((list) =>
      list.map((r) => (r.id === id ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' } : r)),
    );
  }

  // --- Miscellaneous ----------------------------------------------------
  private readonly _areas = signal<AreaRecord[]>(MOCK_AREAS.map((a) => ({ ...a })));
  readonly areas = this._areas.asReadonly();

  addArea(a: Omit<AreaRecord, 'id'>): void {
    this._areas.update((list) => [...list, { ...a, id: nextId('AR') }]);
  }
  updateArea(id: string, patch: Partial<AreaRecord>): void {
    this._areas.update((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }
  deleteArea(id: string): void {
    this._areas.update((list) => list.filter((a) => a.id !== id));
  }

  private readonly _holidays = signal<HolidayRecord[]>(MOCK_HOLIDAYS.map((h) => ({ ...h })));
  readonly holidays = this._holidays.asReadonly();

  addHoliday(h: Omit<HolidayRecord, 'id'>): void {
    this._holidays.update((list) => [...list, { ...h, id: nextId('HOL') }].sort((a, b) => a.date.localeCompare(b.date)));
  }
  updateHoliday(id: string, patch: Partial<HolidayRecord>): void {
    this._holidays.update((list) => list.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }
  deleteHoliday(id: string): void {
    this._holidays.update((list) => list.filter((h) => h.id !== id));
  }

  readonly setupImportLog = signal<SetupImportLogEntry[]>(MOCK_SETUP_IMPORT_LOG).asReadonly();
  readonly versionHistory = signal<VersionHistoryEntry[]>(MOCK_VERSION_HISTORY).asReadonly();
}
