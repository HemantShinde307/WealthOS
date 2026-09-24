import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export type ChatRole = 'ADVISOR' | 'INVESTOR';

export interface ChatMessageDto {
  id: number;
  customerId: string;
  advisorCode: string;
  senderRole: ChatRole;
  text: string;
  sentAt: string;
  readAt: string | null;
}

export interface ConversationDto {
  customerId: string;
  customerName: string;
  advisorCode: string;
  advisorName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastSender: ChatRole | null;
  unread: number;
  online: boolean;
}

export interface LinkResponse {
  distributorCode: string;
  distributorName: string;
}

/** A message as shown in the UI: server message, or an optimistic one still awaiting its echo. */
export interface ChatMessageView extends ChatMessageDto {
  clientId?: string;
  pending?: boolean;
  failed?: boolean;
}

type ServerEvent =
  | { type: 'ready'; role: ChatRole; code: string }
  | { type: 'pong' }
  | { type: 'message'; message: ChatMessageDto; clientId?: string }
  | { type: 'read'; customerId: string; by: ChatRole; upToId: number }
  | { type: 'presence'; role: ChatRole; code: string; online: boolean }
  | { type: 'error'; error: string };

const API = `${environment.apiBase}/api/chat`;
const WS_URL = `${environment.apiBase.replace(/^http/i, 'ws')}/ws/chat`;
const PAGE_SIZE = 50;
const PING_MS = 25_000;
const SEND_TIMEOUT_MS = 10_000;

function newClientId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `c-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly connected = signal(false);
  readonly conversations = signal<ConversationDto[]>([]);
  readonly activeCustomerId = signal<string | null>(null);
  readonly messages = signal<ChatMessageView[]>([]);
  /** Online state of counterparties, keyed by customerId (advisor's view) or advisorCode (investor's view). */
  readonly presence = signal<Record<string, boolean>>({});
  readonly hasMore = signal(false);
  readonly loadingOlder = signal(false);
  readonly loadingMessages = signal(false);
  /** Last non-fatal error (send failure, rate limit, load failure). */
  readonly error = signal<string | null>(null);

  readonly unreadTotal = computed(() => this.conversations().reduce((sum, c) => sum + (c.unread || 0), 0));
  readonly activeConversation = computed(() => this.conversations().find((c) => c.customerId === this.activeCustomerId()) ?? null);

  private ws: WebSocket | null = null;
  private wantConnected = false;
  private attempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private readonly sendTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor() {
    // Close the socket and drop all state as soon as the user logs out (from anywhere).
    effect(
      () => {
        if (!this.auth.isAuthenticated()) untracked(() => this.disconnect());
      },
      { allowSignalWrites: true },
    );
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') this.markRead();
      });
    }
  }

  private get myRole(): ChatRole | null {
    const role = this.auth.currentUser().role;
    return role === 'advisor' ? 'ADVISOR' : role === 'investor' ? 'INVESTOR' : null;
  }

  private canChat(): boolean {
    return this.auth.isAuthenticated() && this.myRole !== null && !!this.auth.currentUser().token;
  }

  private get otherRole(): ChatRole {
    return this.myRole === 'ADVISOR' ? 'INVESTOR' : 'ADVISOR';
  }

  // ---------------------------------------------------------------- connection

  connect(): void {
    if (!this.canChat()) return;
    this.wantConnected = true;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    this.openSocket();
  }

  disconnect(): void {
    this.wantConnected = false;
    this.attempt = 0;
    this.clearTimers();
    const ws = this.ws;
    this.ws = null;
    if (ws) {
      ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
      try {
        ws.close();
      } catch {
        /* already closed */
      }
    }
    this.sendTimers.forEach((t) => clearTimeout(t));
    this.sendTimers.clear();
    this.connected.set(false);
    this.conversations.set([]);
    this.messages.set([]);
    this.activeCustomerId.set(null);
    this.presence.set({});
    this.hasMore.set(false);
    this.error.set(null);
  }

  private openSocket(): void {
    let ws: WebSocket;
    try {
      ws = new WebSocket(WS_URL);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;
    ws.onopen = () => {
      // The token travels in the first frame, never in the URL.
      const token = this.auth.currentUser().token;
      if (!token) {
        ws.close();
        return;
      }
      ws.send(JSON.stringify({ type: 'auth', token }));
    };
    ws.onmessage = (ev) => {
      if (ws !== this.ws || typeof ev.data !== 'string') return;
      let evt: ServerEvent;
      try {
        evt = JSON.parse(ev.data) as ServerEvent;
      } catch {
        return;
      }
      this.handleEvent(evt);
    };
    ws.onclose = (ev) => {
      if (ws !== this.ws) return;
      this.ws = null;
      this.onSocketDown();
      if (ev.code === 4401) {
        this.wantConnected = false;
        this.auth.logout();
        void this.router.navigate(['/login']);
        return;
      }
      this.scheduleReconnect();
    };
    ws.onerror = () => {
      /* onclose follows and handles reconnect */
    };
  }

  private onSocketDown(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = null;
    this.connected.set(false);
    this.presence.set({});
    this.failPending();
  }

  private scheduleReconnect(): void {
    if (!this.wantConnected || this.reconnectTimer) return;
    const delay = Math.min(1000 * 2 ** this.attempt, 30_000);
    this.attempt++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.wantConnected && this.canChat()) this.openSocket();
    }, delay);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.reconnectTimer = null;
    this.pingTimer = null;
  }

  private sendFrame(frame: object): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.connected()) return false;
    this.ws.send(JSON.stringify(frame));
    return true;
  }

  // ---------------------------------------------------------------- incoming events

  private handleEvent(evt: ServerEvent): void {
    switch (evt.type) {
      case 'ready':
        this.attempt = 0;
        this.connected.set(true);
        if (this.pingTimer) clearInterval(this.pingTimer);
        this.pingTimer = setInterval(() => this.sendFrame({ type: 'ping' }), PING_MS);
        // Refetch anything that may have been missed while offline.
        void this.loadConversations().then(() => {
          if (this.activeCustomerId()) void this.reloadActiveThread();
        });
        break;
      case 'message':
        this.onMessage(evt.message, evt.clientId);
        break;
      case 'read':
        this.onReadEvent(evt.customerId, evt.by, evt.upToId);
        break;
      case 'presence':
        if (evt.role === this.otherRole) {
          this.presence.update((p) => ({ ...p, [evt.code]: evt.online }));
        }
        break;
      case 'error':
        this.error.set(evt.error);
        this.failPending();
        break;
    }
  }

  private onMessage(m: ChatMessageDto, clientId?: string): void {
    const mine = m.senderRole === this.myRole;
    const isActive = this.activeCustomerId() === m.customerId;

    if (isActive) {
      this.messages.update((list) => {
        if (list.some((x) => x.id === m.id)) return list;
        const idx = clientId ? list.findIndex((x) => x.clientId === clientId) : -1;
        if (idx >= 0) {
          const copy = [...list];
          copy[idx] = { ...m };
          return copy;
        }
        return [...list, { ...m }];
      });
      if (clientId) this.clearSendTimer(clientId);
    }

    const known = this.conversations().some((c) => c.customerId === m.customerId);
    if (!known) {
      void this.loadConversations();
      return;
    }
    const visible = isActive && this.isTabVisible();
    this.conversations.update((list) => {
      const next = list.map((c) =>
        c.customerId === m.customerId
          ? { ...c, lastMessage: m.text, lastMessageAt: m.sentAt, lastSender: m.senderRole, unread: mine || visible ? c.unread : c.unread + 1 }
          : c,
      );
      return this.sortConversations(next);
    });
    if (!mine && visible) {
      // Unread count is bumped server-side; make sure it is cleared for the open thread.
      this.conversations.update((list) => list.map((c) => (c.customerId === m.customerId ? { ...c, unread: Math.max(c.unread, 1) } : c)));
      this.markRead();
    }
  }

  private onReadEvent(customerId: string, by: ChatRole, upToId: number): void {
    if (by === this.otherRole) {
      // The counterparty read my messages.
      if (this.activeCustomerId() === customerId) {
        const now = new Date().toISOString();
        this.messages.update((list) =>
          list.map((m) => (m.senderRole === this.myRole && !m.readAt && !m.pending && m.id <= upToId ? { ...m, readAt: now } : m)),
        );
      }
    } else {
      // I read it on another tab/device.
      this.conversations.update((list) => list.map((c) => (c.customerId === customerId ? { ...c, unread: 0 } : c)));
    }
  }

  // ---------------------------------------------------------------- REST

  isOnline(c: ConversationDto): boolean {
    const key = this.myRole === 'ADVISOR' ? c.customerId : c.advisorCode;
    return this.presence()[key] ?? c.online;
  }

  async loadConversations(): Promise<void> {
    if (!this.canChat()) return;
    try {
      const list = await firstValueFrom(this.http.get<ConversationDto[]>(`${API}/conversations`));
      this.conversations.set(this.sortConversations(list));
      // An investor has exactly one thread; open it automatically.
      if (this.myRole === 'INVESTOR') {
        if (list.length > 0 && this.activeCustomerId() !== list[0].customerId) void this.openConversation(list[0].customerId);
        if (list.length === 0) {
          this.activeCustomerId.set(null);
          this.messages.set([]);
        }
      }
    } catch (e) {
      this.error.set(this.errText(e, 'Could not load conversations.'));
    }
  }

  async openConversation(customerId: string): Promise<void> {
    this.activeCustomerId.set(customerId);
    this.messages.set([]);
    this.hasMore.set(false);
    await this.reloadActiveThread();
    this.markRead();
  }

  private async reloadActiveThread(): Promise<void> {
    const customerId = this.activeCustomerId();
    if (!customerId) return;
    this.loadingMessages.set(true);
    try {
      const list = await firstValueFrom(this.http.get<ChatMessageDto[]>(`${API}/messages`, { params: { customerId, limit: PAGE_SIZE } }));
      if (this.activeCustomerId() !== customerId) return;
      // Keep optimistic messages that have not been echoed yet.
      const pending = this.messages().filter((m) => m.pending || m.failed);
      this.messages.set([...list, ...pending]);
      this.hasMore.set(list.length >= PAGE_SIZE);
    } catch (e) {
      this.error.set(this.errText(e, 'Could not load messages.'));
    } finally {
      this.loadingMessages.set(false);
    }
  }

  async loadOlder(): Promise<void> {
    const customerId = this.activeCustomerId();
    if (!customerId || this.loadingOlder() || !this.hasMore()) return;
    const oldest = this.messages().find((m) => m.id > 0 && !m.pending);
    if (!oldest) return;
    this.loadingOlder.set(true);
    try {
      const list = await firstValueFrom(
        this.http.get<ChatMessageDto[]>(`${API}/messages`, { params: { customerId, beforeId: oldest.id, limit: PAGE_SIZE } }),
      );
      if (this.activeCustomerId() !== customerId) return;
      this.messages.update((cur) => {
        const ids = new Set(cur.map((m) => m.id));
        return [...list.filter((m) => !ids.has(m.id)), ...cur];
      });
      this.hasMore.set(list.length >= PAGE_SIZE);
    } catch (e) {
      this.error.set(this.errText(e, 'Could not load earlier messages.'));
    } finally {
      this.loadingOlder.set(false);
    }
  }

  /** Marks the open conversation read - only when the tab is actually visible. */
  markRead(): void {
    const customerId = this.activeCustomerId();
    if (!customerId || !this.isTabVisible() || !this.canChat()) return;
    const conv = this.conversations().find((c) => c.customerId === customerId);
    if (!conv || conv.unread === 0) return;
    this.conversations.update((list) => list.map((c) => (c.customerId === customerId ? { ...c, unread: 0 } : c)));
    this.http.post<void>(`${API}/read`, this.myRole === 'ADVISOR' ? { customerId } : {}).subscribe({ error: () => undefined });
  }

  /** Returns an error message, or null on success. */
  async linkDistributor(code: string): Promise<string | null> {
    const distributorCode = code.trim();
    if (!distributorCode) return 'Enter your distributor code.';
    try {
      const res = await firstValueFrom(this.http.post<LinkResponse>(`${API}/link`, { distributorCode }));
      this.auth.setDistributorCode(res.distributorCode);
      this.activeCustomerId.set(null);
      this.messages.set([]);
      await this.loadConversations();
      return null;
    } catch (e) {
      return this.errText(e, 'Could not connect to that distributor.');
    }
  }

  // ---------------------------------------------------------------- sending

  send(text: string): boolean {
    const body = text.trim();
    const customerId = this.activeCustomerId();
    if (!body || !customerId || !this.connected()) return false;
    const clientId = newClientId();
    const conv = this.activeConversation();
    this.error.set(null);
    this.messages.update((list) => [
      ...list,
      {
        id: -Date.now() - Math.floor(Math.random() * 1000),
        customerId,
        advisorCode: conv?.advisorCode ?? '',
        senderRole: this.myRole as ChatRole,
        text: body,
        sentAt: new Date().toISOString(),
        readAt: null,
        clientId,
        pending: true,
      },
    ]);
    this.transmit(clientId, body);
    return true;
  }

  retry(clientId: string): void {
    const m = this.messages().find((x) => x.clientId === clientId);
    if (!m) return;
    if (!this.connected()) {
      this.error.set('Not connected. Reconnecting...');
      return;
    }
    this.error.set(null);
    this.messages.update((list) => list.map((x) => (x.clientId === clientId ? { ...x, pending: true, failed: false } : x)));
    this.transmit(clientId, m.text);
  }

  /** Drops a failed optimistic message. */
  discard(clientId: string): void {
    this.clearSendTimer(clientId);
    this.messages.update((list) => list.filter((x) => x.clientId !== clientId));
  }

  private transmit(clientId: string, text: string): void {
    const frame: Record<string, string> = { type: 'send', text, clientId };
    if (this.myRole === 'ADVISOR') frame['customerId'] = this.activeCustomerId() as string;
    if (!this.sendFrame(frame)) {
      this.markFailed(clientId);
      return;
    }
    this.clearSendTimer(clientId);
    this.sendTimers.set(clientId, setTimeout(() => this.markFailed(clientId), SEND_TIMEOUT_MS));
  }

  private markFailed(clientId: string): void {
    this.clearSendTimer(clientId);
    let changed = false;
    this.messages.update((list) =>
      list.map((x) => {
        if (x.clientId === clientId && x.pending) {
          changed = true;
          return { ...x, pending: false, failed: true };
        }
        return x;
      }),
    );
    if (changed && !this.error()) this.error.set('Message not sent. Tap retry.');
  }

  private failPending(): void {
    this.messages()
      .filter((m) => m.pending && m.clientId)
      .forEach((m) => this.markFailed(m.clientId as string));
  }

  private clearSendTimer(clientId: string): void {
    const t = this.sendTimers.get(clientId);
    if (t) clearTimeout(t);
    this.sendTimers.delete(clientId);
  }

  // ---------------------------------------------------------------- helpers

  private isTabVisible(): boolean {
    return typeof document === 'undefined' || document.visibilityState === 'visible';
  }

  private sortConversations(list: ConversationDto[]): ConversationDto[] {
    return [...list].sort((a, b) => {
      if (a.lastMessageAt && b.lastMessageAt) return b.lastMessageAt.localeCompare(a.lastMessageAt);
      if (a.lastMessageAt) return -1;
      if (b.lastMessageAt) return 1;
      return a.customerName.localeCompare(b.customerName);
    });
  }

  private errText(e: unknown, fallback: string): string {
    if (e instanceof HttpErrorResponse) {
      const msg = (e.error as { error?: string } | null)?.error;
      if (msg) return msg;
      if (e.status === 0) return 'Cannot reach the server.';
    }
    return fallback;
  }
}
