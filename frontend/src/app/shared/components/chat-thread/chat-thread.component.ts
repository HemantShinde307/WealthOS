import { Component, computed, effect, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ChatMessageView, ChatService } from '../../../core/services/chat.service';

/** Conversation pane (header, messages, composer) shared by the advisor and investor chat pages. */
@Component({
  selector: 'app-chat-thread',
  standalone: true,
  templateUrl: './chat-thread.component.html',
  // The host element must itself fill its flex parent and be height-constrained; otherwise a long
  // conversation grows past the panel and pushes the composer out of view.
  styles: [':host { display: flex; flex: 1 1 0%; flex-direction: column; min-width: 0; min-height: 0; }'],
})
export class ChatThreadComponent {
  readonly chat = inject(ChatService);
  private readonly auth = inject(AuthService);

  readonly peerName = input.required<string>();
  readonly online = input<boolean>(false);

  readonly draft = signal('');
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
}
