import { Component, computed, effect, ElementRef, HostListener, inject, input, OnDestroy, signal, viewChild } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  AttachmentDto,
  ChatMessageView,
  ChatRole,
  ChatService,
  FileItemDto,
  validateAttachment,
} from '../../../core/services/chat.service';
import { confirmDelete } from '../../utils/confirm';

/** Conversation pane (header, messages, composer) shared by the advisor and investor chat pages. */
@Component({
  selector: 'app-chat-thread',
  standalone: true,
  templateUrl: './chat-thread.component.html',
  // The host element must itself fill its flex parent and be height-constrained; otherwise a long
  // conversation grows past the panel and pushes the composer out of view.
  styles: [':host { display: flex; flex: 1 1 0%; flex-direction: column; min-width: 0; min-height: 0; }'],
})
export class ChatThreadComponent implements OnDestroy {
  readonly chat = inject(ChatService);
  private readonly auth = inject(AuthService);

  readonly peerName = input.required<string>();
  readonly online = input<boolean>(false);

  readonly draft = signal('');
  readonly acceptAttr = ALLOWED_ATTACHMENT_EXTENSIONS.map((e) => `.${e}`).join(',');
  readonly attachError = signal<string | null>(null);
  readonly dragging = signal(false);
  readonly filesOpen = signal(false);
  /** Id of the file currently being fetched (spinner). */
  readonly busyId = signal<string | null>(null);
  readonly modalUrl = signal<string | null>(null);
  readonly modalName = signal('');
  private dragDepth = 0;
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private lastKey = '';

  // A method rather than `track m.clientId ?? m.id` in the template: Angular 18 emits an undefined
  // temp variable for `??` inside @for track expressions, which throws once there are messages.
  trackMessage(_index: number, m: ChatMessageView): string | number {
    return m.clientId ?? m.id;
  }

  readonly myRole = computed(() => (this.auth.currentUser().role === 'advisor' ? 'ADVISOR' : 'INVESTOR'));

  constructor() {
    // Autoscroll only when a new message arrives at the bottom (not when older pages are prepended).
    effect(() => {
      const list = this.chat.messages();
      const last = list[list.length - 1];
      const key = last ? `${this.chat.activeCustomerId()}|${last.clientId ?? last.id}|${list.length > 0 ? last.id : ''}` : '';
      if (key !== this.lastKey) {
        this.lastKey = key;
        setTimeout(() => {
          const el = this.scroller()?.nativeElement;
          if (el) el.scrollTop = el.scrollHeight;
        });
      }
    });
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }

  isMine(m: ChatMessageView): boolean {
    return m.senderRole === this.myRole();
  }

  time(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const t = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toDateString() === new Date().toDateString() ? t : `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })}, ${t}`;
  }

  onInput(ev: Event): void {
    this.draft.set((ev.target as HTMLTextAreaElement).value);
  }

  onEnter(ev: Event): void {
    const k = ev as KeyboardEvent;
    if (k.shiftKey || k.isComposing) return; // Shift+Enter inserts a newline
    k.preventDefault();
    this.send();
  }

  send(): void {
    const text = this.draft().trim();
    if (!text || !this.chat.connected()) return;
    if (this.chat.send(text)) this.draft.set('');
  }

  // ---------------------------------------------------------------- attachments

  ngOnDestroy(): void {
    this.closeModal();
  }

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  private showAttachError(msg: string): void {
    this.attachError.set(msg);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.attachError.set(null), 8000);
  }

  onFilePicked(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allow choosing the same file again
    if (file) this.attach(file);
  }

  private attach(file: File): void {
    this.attachError.set(null);
    const invalid = validateAttachment(file) ?? this.chat.uploadAttachment(file, this.draft());
    if (invalid) {
      this.showAttachError(invalid);
      return;
    }
    this.draft.set('');
  }

  onDragEnter(ev: DragEvent): void {
    if (!ev.dataTransfer?.types.includes('Files')) return;
    ev.preventDefault();
    this.dragDepth++;
    this.dragging.set(true);
  }

  onDragOver(ev: DragEvent): void {
    if (!ev.dataTransfer?.types.includes('Files')) return;
    ev.preventDefault();
  }

  onDragLeave(): void {
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (this.dragDepth === 0) this.dragging.set(false);
  }

  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.dragDepth = 0;
    this.dragging.set(false);
    const files = ev.dataTransfer?.files;
    if (!files || files.length === 0) return;
    if (files.length > 1) this.showAttachError('Only one file can be sent at a time; sending the first.');
    this.attach(files[0]);
  }

  extOf(name: string): string {
    const i = name.lastIndexOf('.');
    return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
  }

  fileIcon(name: string): string {
    switch (this.extOf(name)) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
        return 'image';
      case 'pdf':
        return 'picture_as_pdf';
      case 'xls':
      case 'xlsx':
      case 'csv':
        return 'table_chart';
      case 'ppt':
      case 'pptx':
        return 'slideshow';
      default:
        return 'description';
    }
  }

  fileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /** Advisors may delete any file of the conversation; investors only their own uploads (server enforces too). */
  canDelete(uploadedBy: ChatRole): boolean {
    return this.myRole() === 'ADVISOR' || uploadedBy === this.myRole();
  }

  /** Whether a bubble's attachment is a real, stored file (not an optimistic upload still in flight). */
  isStored(m: ChatMessageView): boolean {
    return !!m.attachment && !m.pending && !m.failed && m.attachment.id !== '';
  }

  toggleFiles(): void {
    const open = !this.filesOpen();
    this.filesOpen.set(open);
    if (open) void this.chat.loadFiles();
  }

  who(role: ChatRole): string {
    if (role === this.myRole()) return 'You';
    return role === 'ADVISOR' ? 'Distributor' : this.peerName();
  }

  private safeName(name: string): string {
    // eslint-disable-next-line no-control-regex
    const cleaned = name.replace(/[\\/\u0000-\u001f\u007f]/g, '_').trim();
    return cleaned || 'file';
  }

  async view(a: Pick<AttachmentDto, 'id' | 'name' | 'previewable'>): Promise<void> {
    if (!a.previewable || this.busyId()) return;
    this.busyId.set(a.id);
    try {
      const { blob, contentType } = await this.chat.fetchFileBlob(a.id, false);
      const ct = contentType.toLowerCase();
      const isImage = ct.startsWith('image/') && !ct.startsWith('image/svg');
      const isPdf = ct.startsWith('application/pdf');
      if (!isImage && !isPdf) {
        this.showAttachError('This file cannot be previewed. Use Download instead.');
        return;
      }
      const url = URL.createObjectURL(blob);
      if (isImage) {
        this.closeModal();
        this.modalName.set(a.name);
        this.modalUrl.set(url);
      } else {
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
    } catch (e) {
      this.showAttachError((e as Error).message);
    } finally {
      this.busyId.set(null);
    }
  }

  async download(a: Pick<AttachmentDto, 'id' | 'name'>): Promise<void> {
    if (this.busyId()) return;
    this.busyId.set(a.id);
    try {
      const { blob } = await this.chat.fetchFileBlob(a.id, true);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.safeName(a.name);
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      this.showAttachError((e as Error).message);
    } finally {
      this.busyId.set(null);
    }
  }

  async remove(a: Pick<AttachmentDto, 'id' | 'name'>): Promise<void> {
    if (!confirmDelete(`the file "${a.name}"`)) return;
    const err = await this.chat.deleteFile(a.id);
    if (err) this.showAttachError(err);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalUrl()) this.closeModal();
  }

  closeModal(): void {
    const url = this.modalUrl();
    if (url) URL.revokeObjectURL(url);
    this.modalUrl.set(null);
  }

  fileItemKey(_i: number, f: FileItemDto): string {
    return f.id;
  }
}
