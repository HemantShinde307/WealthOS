import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';
import { AdvisoryServicesService } from './advisory-services.service';
import { WhatsAppSendLogEntry } from './advisory-services-data.mock';

@Component({
  selector: 'app-whatsapp-fintsoclick',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './whatsapp-fintsoclick.component.html',
})
export class WhatsappFintsoclickComponent {
  readonly svc = inject(AdvisoryServicesService);

  readonly exportHeaders = ['Log ID', 'Customer', 'Phone', 'Template', 'Timestamp', 'Status'];
  readonly exportRows = computed(() => this.svc.whatsAppSendLog().map((w) => [w.id, w.customerName, w.phone, w.templateUsed, w.timestamp, w.sentStatus]));

  readonly testTemplate = signal(this.svc.whatsAppTemplates[0].name);
  readonly testPhone = signal('+91 90000 00000');
  readonly sentMessage = signal<string | null>(null);

  sendTest(): void {
    if (!this.testPhone().trim()) return;
    this.svc.sendTestWhatsAppMessage(this.testTemplate(), this.testPhone().trim());
    this.sentMessage.set(`Test message sent using "${this.testTemplate()}" to ${this.testPhone().trim()}.`);
  }

  remove(w: WhatsAppSendLogEntry): void {
    if (!confirmDelete(`send log entry ${w.id} (${w.customerName})`)) return;
    this.svc.deleteWhatsAppLogEntry(w.id);
  }
}
