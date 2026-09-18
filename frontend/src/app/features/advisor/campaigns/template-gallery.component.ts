import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CAMPAIGN_TEMPLATES, CampaignTemplate } from '../advisor-mock-data';

type ChannelFilter = 'All' | CampaignTemplate['channel'];

@Component({
  selector: 'app-template-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './template-gallery.component.html',
})
export class TemplateGalleryComponent {
  readonly templates = CAMPAIGN_TEMPLATES;
  readonly channels: ChannelFilter[] = ['All', 'Email', 'WhatsApp', 'SMS', 'Push'];
  readonly channelFilter = signal<ChannelFilter>('All');

  readonly filtered = computed(() =>
    this.templates.filter((t) => (this.channelFilter() === 'All' ? true : t.channel === this.channelFilter())),
  );
}
