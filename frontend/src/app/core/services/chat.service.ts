import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
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
  attachment: AttachmentDto | null;
}

export interface AttachmentDto {
  id: string;
  name: string;
  contentType: string;
  size: number;
  previewable: boolean;
  removed: boolean;
}

export interface FileItemDto {
  id: string;
  messageId: number;
  name: string;
  contentType: string;
  size: number;
  previewable: boolean;
  uploadedBy: ChatRole;
  uploadedAt: string;
}

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'txt', 'csv', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

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
  /** 0-100 while an attachment is uploading. */
  uploadProgress?: number;
  /** Server error text for a failed upload. */
  failReason?: string;
}

type ServerEvent =
  | { type: 'ready'; role: ChatRole; code: string }
  | { type: 'pong' }
  | { type: 'message'; message: ChatMessageDto; clientId?: string }
  | { type: 'attachment-removed'; customerId: string; attachmentId: string }
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
  /** Files (not removed) of the active conversation, newest first. */
  readonly files = signal<FileItemDto[]>([]);
  readonly filesLoading = signal(false);

  readonly unreadTotal = computed(() => this.conversations().reduce((sum, c) => sum + (c.unread || 0), 0));
  readonly activeConversation = computed(() => this.conversations().find((c) => c.customerId === this.activeCustomerId()) ?? null);

  private ws: WebSocket | null = null;
  private wantConnected = false;
  private attempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private readonly sendTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly uploads = new Map<string, { file: File; caption: string; sub: Subscription | null }>();

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
    this.uploads.forEach((u) => u.sub?.unsubscribe());
    this.uploads.clear();
    this.files.set([]);
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
      case 'attachment-removed':
        this.markAttachmentRemoved(evt.attachmentId);
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
      if (m.attachment) void this.loadFiles();
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
          ? { ...c, lastMessage: m.text || (m.attachment ? `Attachment: ${m.attachment.name}` : m.text), lastMessageAt: m.sentAt, lastSender: m.senderRole, unread: mine || visible ? c.unread : c.unread + 1 }
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
    this.files.set([]);
    this.hasMore.set(false);
    void this.loadFiles();
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
        attachment: null,
      },
    ]);
    this.transmit(clientId, body);
    return true;
  }

  retry(clientId: string): void {
    const m = this.messages().find((x) => x.clientId === clientId);
    if (!m) return;
    const up = this.uploads.get(clientId);
    if (up) {
      this.error.set(null);
      this.messages.update((list) =>
        list.map((x) => (x.clientId === clientId ? { ...x, pending: true, failed: false, failReason: undefined, uploadProgress: 0 } : x)),
      );
      this.startUpload(clientId, up.file, up.caption, m.customerId);
      return;
    }
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
    this.uploads.get(clientId)?.sub?.unsubscribe();
    this.uploads.delete(clientId);
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
      .filter((m) => m.pending && m.clientId && !this.uploads.has(m.clientId))
      .forEach((m) => this.markFailed(m.clientId as string));
  }

  private clearSendTimer(clientId: string): void {
    const t = this.sendTimers.get(clientId);
    if (t) clearTimeout(t);
    this.sendTimers.delete(clientId);
  }

  // ---------------------------------------------------------------- attachments

  /** Uploads one file as a chat message (multipart REST). Returns a client-side validation error, or null when started. */
  uploadAttachment(file: File, caption = ''): string | null {
    const customerId = this.activeCustomerId();
    if (!customerId) return 'Open a conversation first.';
    const invalid = validateAttachment(file);
    if (invalid) return invalid;
    const clientId = newClientId();
    const conv = this.activeConversation();
    const text = caption.trim();
    this.error.set(null);
    this.uploads.set(clientId, { file, caption: text, sub: null });
    this.messages.update((list) => [
      ...list,
      {
        id: -Date.now() - Math.floor(Math.random() * 1000),
        customerId,
        advisorCode: conv?.advisorCode ?? '',
        senderRole: this.myRole as ChatRole,
        text,
        sentAt: new Date().toISOString(),
        readAt: null,
        clientId,
        pending: true,
        uploadProgress: 0,
        attachment: { id: '', name: file.name, contentType: file.type, size: file.size, previewable: false, removed: false },
      },
    ]);
    this.startUpload(clientId, file, text, customerId);
    return null;
  }

  private startUpload(clientId: string, file: File, caption: string, customerId: string): void {
    const form = new FormData();
    form.append('file', file, file.name);
    if (this.myRole === 'ADVISOR') form.append('customerId', customerId);
    if (caption) form.append('caption', caption);
    const entry = this.uploads.get(clientId);
    if (!entry) return;
    entry.sub?.unsubscribe();
    entry.sub = this.http.post<ChatMessageDto>(`${API}/attachments`, form, { observe: 'events', reportProgress: true }).subscribe({
      next: (ev) => {
        if (ev.type === HttpEventType.UploadProgress) {
          const pct = ev.total ? Math.min(99, Math.round((ev.loaded / ev.total) * 100)) : 0;
          this.messages.update((list) => list.map((x) => (x.clientId === clientId ? { ...x, uploadProgress: pct } : x)));
        } else if (ev.type === HttpEventType.Response && ev.body) {
          this.uploads.delete(clientId);
          const m = ev.body;
          if (this.activeCustomerId() === m.customerId) {
            this.messages.update((list) => {
              // The socket push may already have delivered the server message.
              if (list.some((x) => x.id === m.id)) return list.filter((x) => x.clientId !== clientId);
              return list.map((x) => (x.clientId === clientId ? { ...m } : x));
            });
            void this.loadFiles();
          } else {
            this.messages.update((list) => list.filter((x) => x.clientId !== clientId));
          }
        }
      },
      error: (e) => {
        void this.errorText(e, 'Upload failed.').then((reason) => {
          this.messages.update((list) =>
            list.map((x) => (x.clientId === clientId ? { ...x, pending: false, failed: true, failReason: reason, uploadProgress: undefined } : x)),
          );
        });
      },
    });
  }

  async loadFiles(): Promise<FileItemDto[]> {
    const customerId = this.activeCustomerId();
    if (!customerId || !this.canChat()) return [];
    this.filesLoading.set(true);
    try {
      const params: Record<string, string> = this.myRole === 'ADVISOR' ? { customerId } : {};
      const list = await firstValueFrom(this.http.get<FileItemDto[]>(`${API}/attachments`, { params }));
      if (this.activeCustomerId() === customerId) this.files.set(list);
      return list;
    } catch (e) {
      this.error.set(this.errText(e, 'Could not load files.'));
      return [];
    } finally {
      this.filesLoading.set(false);
    }
  }

  /** Fetches the file with the Bearer header; the blob carries the server's Content-Type. Throws Error(message). */
  async fetchFileBlob(id: string, download: boolean): Promise<{ blob: Blob; contentType: string }> {
    try {
      const res = await firstValueFrom(
        this.http.get(`${API}/attachments/${encodeURIComponent(id)}/content`, {
          params: { download: download ? 'true' : 'false' },
          responseType: 'blob',
          observe: 'response',
        }),
      );
      const contentType = (res.headers.get('Content-Type') ?? '').trim();
      const body = res.body ?? new Blob();
      return { blob: new Blob([body], { type: contentType }), contentType };
    } catch (e) {
      throw new Error(await this.errorText(e, 'Could not load the file.'));
    }
  }

  /** Returns an error message, or null on success. */
  async deleteFile(id: string): Promise<string | null> {
    try {
      await firstValueFrom(this.http.delete<void>(`${API}/attachments/${encodeURIComponent(id)}`));
      this.markAttachmentRemoved(id);
      return null;
    } catch (e) {
      return this.errText(e, 'Could not delete the file.');
    }
  }

  private markAttachmentRemoved(attachmentId: string): void {
    this.messages.update((list) =>
      list.map((m) => (m.attachment?.id === attachmentId ? { ...m, attachment: { ...m.attachment, removed: true } } : m)),
    );
    this.files.update((list) => list.filter((f) => f.id !== attachmentId));
  }

  /** Like errText but also understands JSON error bodies delivered as a Blob (responseType 'blob'). */
  private async errorText(e: unknown, fallback: string): Promise<string> {
    if (e instanceof HttpErrorResponse && e.error instanceof Blob) {
      try {
        const msg = (JSON.parse(await e.error.text()) as { error?: string }).error;
        if (msg) return msg;
      } catch {
        /* not JSON */
      }
      if (e.status === 0) return 'Cannot reach the server.';
      return fallback;
    }
    return this.errText(e, fallback);
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

/** Client-side pre-check; the server stays the authority. Returns an error message or null. */
export function validateAttachment(file: File): string | null {
  const dot = file.name.lastIndexOf('.');
  const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : '';
  if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext)) {
    return `File type not allowed. Allowed: ${ALLOWED_ATTACHMENT_EXTENSIONS.join(', ')}.`;
  }
  if (file.size === 0) return 'That file is empty.';
  if (file.size > MAX_ATTACHMENT_BYTES) return 'File is too large (maximum 10 MB).';
  return null;
}
