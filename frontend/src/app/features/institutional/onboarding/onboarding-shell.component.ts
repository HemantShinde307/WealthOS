import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { OnboardingStateService } from './onboarding-state.service';

interface OnboardingTab {
  label: string;
  route: string;
  icon: string;
}

const TABS: OnboardingTab[] = [
  { label: 'Entity Search', route: 'entity-search', icon: 'domain_add' },
  { label: 'Structure & UBOs', route: 'structure-ubos', icon: 'account_tree' },
  { label: 'Document Vault', route: 'document-vault', icon: 'folder' },
  { label: 'Review Queue', route: 'review-queue', icon: 'fact_check' },
];

@Component({
  selector: 'app-onboarding-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './onboarding-shell.component.html',
})
export class OnboardingShellComponent {
  readonly tabs = TABS;
  readonly state = inject(OnboardingStateService);
}
