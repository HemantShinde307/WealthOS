import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Segment {
  id: string;
  label: string;
  description: string;
  icon: string;
  reach: number;
}

interface ChannelOption {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-campaign-builder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './campaign-builder.component.html',
})
export class CampaignBuilderComponent {
  readonly campaignName = signal('');
  readonly segments: Segment[] = [
    { id: 'hnw', label: 'High Net Worth', description: 'AUM > ₹1 Cr', icon: 'diamond', reach: 1850 },
    { id: 'sip', label: 'Existing SIP Clients', description: 'Active monthly plans', icon: 'account_balance', reach: 3200 },
    { id: 'cold', label: 'Cold Leads', description: 'Not contacted in 90 days', icon: 'person_add', reach: 4600 },
  ];
  readonly channels: ChannelOption[] = [
    { id: 'email', label: 'Email', icon: 'mail' },
    { id: 'sms', label: 'SMS', icon: 'sms' },
    { id: 'inapp', label: 'In-App Banner', icon: 'web' },
  ];

  readonly selectedSegments = signal<Set<string>>(new Set(['hnw']));
  readonly selectedChannels = signal<Set<string>>(new Set(['email', 'inapp']));
  readonly launched = signal(false);

  readonly estimatedReach = computed(() =>
    this.segments.filter((s) => this.selectedSegments().has(s.id)).reduce((sum, s) => sum + s.reach, 0),
  );

  toggleSegment(id: string): void {
    const next = new Set(this.selectedSegments());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedSegments.set(next);
  }

  toggleChannel(id: string): void {
    const next = new Set(this.selectedChannels());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedChannels.set(next);
  }

  launch(): void {
    this.launched.set(true);
  }
}
