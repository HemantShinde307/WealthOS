import { Component, inject, OnInit, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { ChatThreadComponent } from '../../../shared/components/chat-thread/chat-thread.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [ChatThreadComponent, NgTemplateOutlet],
  templateUrl: './messages.component.html',
})
export class MessagesComponent implements OnInit {
  readonly chat = inject(ChatService);
  readonly auth = inject(AuthService);

  readonly code = signal('');
  readonly linkError = signal<string | null>(null);
  readonly linking = signal(false);
  /** True while the user is entering a new distributor code even though they are already linked. */
  readonly changing = signal(false);

  ngOnInit(): void {
    this.chat.connect();
    void this.chat.loadConversations();
  }

  onCode(ev: Event): void {
    this.code.set((ev.target as HTMLInputElement).value);
  }

  async connectDistributor(): Promise<void> {
    if (this.linking()) return;
    this.linkError.set(null);
    this.linking.set(true);
    const err = await this.chat.linkDistributor(this.code());
    this.linking.set(false);
    if (err) {
      this.linkError.set(err);
      return;
    }
    this.code.set('');
    this.changing.set(false);
  }

  startChange(): void {
    this.linkError.set(null);
    this.code.set('');
    this.changing.set(true);
  }
}
