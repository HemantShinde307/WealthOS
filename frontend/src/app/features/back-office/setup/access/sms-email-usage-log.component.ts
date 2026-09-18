import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmsEmailUsageLogEntry } from '../setup-data.mock';
import { SetupService } from '../setup.service';

type ChannelFilter = 'All' | SmsEmailUsageLogEntry['channel'];
type StatusFilter = 'All' | SmsEmailUsageLogEntry['status'];

@Component({
  selector: 'app-sms-email-usage-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sms-email-usage-log.component.html',
})
export class SmsEmailUsageLogComponent {
  readonly setup = inject(SetupService);

  readonly searchTerm = signal('');
  readonly channelFilter = signal<ChannelFilter>('All');
  readonly statusFilter = signal<StatusFilter>('All');

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const channel = this.channelFilter();
    const status = this.statusFilter();
    return this.setup.smsEmailLog().filter((e) => {
      const matchesTerm = !term || `${e.customerName} ${e.messageType}`.toLowerCase().includes(term);
      const matchesChannel = channel === 'All' || e.channel === channel;
      const matchesStatus = status === 'All' || e.status === status;
      return matchesTerm && matchesChannel && matchesStatus;
    });
  });

  readonly deliveredCount = computed(() => this.setup.smsEmailLog().filter((e) => e.status === 'Delivered').length);
  readonly failedCount = computed(() => this.setup.smsEmailLog().filter((e) => e.status === 'Failed').length);
}
