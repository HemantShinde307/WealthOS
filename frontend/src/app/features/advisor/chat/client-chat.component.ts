import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/domain.models';
import { CHAT_THREADS, ChatMessage, ChatThread } from '../advisor-mock-data';

interface ChatThreadWithClient extends ChatThread {
  client: Client;
}

@Component({
  selector: 'app-client-chat',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-chat.component.html',
})
export class ClientChatComponent {
  private readonly clientService = inject(ClientService);

  readonly threads: ChatThreadWithClient[] = CHAT_THREADS.map((t) => ({ ...t, client: this.clientService.getById(t.clientId)! })).filter(
    (t) => !!t.client,
  );

  readonly activeClientId = signal(this.threads[0]?.clientId ?? '');
  readonly draft = signal('');

  readonly activeThread = computed(() => this.threads.find((t) => t.clientId === this.activeClientId()));

  readonly localMessages = signal<Record<string, ChatMessage[]>>({});

  readonly messages = computed<ChatMessage[]>(() => {
    const thread = this.activeThread();
    if (!thread) return [];
    return [...thread.messages, ...(this.localMessages()[thread.clientId] ?? [])];
  });

  selectThread(clientId: string): void {
    this.activeClientId.set(clientId);
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

  send(): void {
    const text = this.draft().trim();
    const clientId = this.activeClientId();
    if (!text || !clientId) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.localMessages.update((map) => ({
      ...map,
      [clientId]: [...(map[clientId] ?? []), { from: 'advisor', text, time }],
    }));
    this.draft.set('');
  }
}
