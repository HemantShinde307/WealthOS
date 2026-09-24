import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmsEmailUsageLogEntry } from '../setup-data.mock';
import { SetupService } from '../setup.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

type ChannelFilter = 'All' | SmsEmailUsageLogEntry['channel'];
type StatusFilter = 'All' | SmsEmailUsageLogEntry['status'];

@Component({
  selector: 'app-sms-email-usage-log',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './sms-email-usage-log.component.html',
})
export class SmsEmailUsageLogComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['Customer', 'Channel', 'Message Type', 'Sent On', 'Status'];
  readonly exportRows = computed(() =>
    this.filtered().map((e) => [e.customerName, e.channel, e.messageType, e.sentOn, e.status]),
  );

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

  remove(e: SmsEmailUsageLogEntry): void {
    if (!confirmDelete(`the ${e.channel} log entry for ${e.customerName}`)) return;
    this.setup.deleteSmsEmailLogEntry(e.id);
  }
}
