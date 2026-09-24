import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService, ConversationDto } from '../../../core/services/chat.service';
import { ChatThreadComponent } from '../../../shared/components/chat-thread/chat-thread.component';

@Component({
  selector: 'app-client-chat',
  standalone: true,
  imports: [ChatThreadComponent],
  templateUrl: './client-chat.component.html',
})
export class ClientChatComponent implements OnInit {
  readonly chat = inject(ChatService);
  readonly auth = inject(AuthService);

  ngOnInit(): void {
    this.chat.connect();
    void this.chat.loadConversations();
  }

  select(c: ConversationDto): void {
    if (this.chat.activeCustomerId() !== c.customerId) void this.chat.openConversation(c.customerId);
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

  time(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toDateString() === new Date().toDateString()
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  }
}
