import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvisoryServicesService } from './advisory-services.service';

@Component({
  selector: 'app-whatsapp-fintsoclick',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-fintsoclick.component.html',
})
export class WhatsappFintsoclickComponent {
  readonly svc = inject(AdvisoryServicesService);

  readonly testTemplate = signal(this.svc.whatsAppTemplates[0].name);
  readonly testPhone = signal('+91 90000 00000');
  readonly sentMessage = signal<string | null>(null);

  sendTest(): void {
    if (!this.testPhone().trim()) return;
    this.svc.sendTestWhatsAppMessage(this.testTemplate(), this.testPhone().trim());
    this.sentMessage.set(`Test message sent using "${this.testTemplate()}" to ${this.testPhone().trim()}.`);
  }
}
