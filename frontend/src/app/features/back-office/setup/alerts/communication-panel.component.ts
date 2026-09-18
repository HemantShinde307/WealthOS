import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BroadcastMessage } from '../setup-data.mock';
import { SetupService } from '../setup.service';

const SEGMENTS = ['All Active Customers', 'All HNI Customers', 'Retail Customers', 'NRI Customers', 'Corporate Customers', 'SIP Customers — Overdue', 'KYC Pending Customers'];

@Component({
  selector: 'app-communication-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './communication-panel.component.html',
})
export class CommunicationPanelComponent {
  readonly setup = inject(SetupService);
  readonly segments = SEGMENTS;

  readonly segment = signal(SEGMENTS[0]);
  readonly channel = signal<BroadcastMessage['channel']>('Email');
  readonly subject = signal('');
  readonly message = signal('');
  readonly justSent = signal(false);

  readonly estimatedRecipients = () => {
    const seed = this.segment().length * 37 + (this.channel() === 'Email' ? 211 : this.channel() === 'SMS' ? 89 : 340);
    return 40 + (seed % 480);
  };

  send(): void {
    if (!this.message().trim()) return;
    if (this.channel() !== 'SMS' && !this.subject().trim()) return;
    this.setup.sendBroadcast({
      segment: this.segment(),
      channel: this.channel(),
      subject: this.channel() === 'SMS' ? '—' : this.subject().trim(),
      message: this.message().trim(),
      recipientCount: this.estimatedRecipients(),
    });
    this.subject.set('');
    this.message.set('');
    this.justSent.set(true);
    setTimeout(() => this.justSent.set(false), 3000);
  }
}
