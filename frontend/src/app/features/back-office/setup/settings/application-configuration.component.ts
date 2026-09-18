import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConfig } from '../setup-data.mock';
import { SetupService } from '../setup.service';

@Component({
  selector: 'app-application-configuration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application-configuration.component.html',
})
export class ApplicationConfigurationComponent {
  readonly setup = inject(SetupService);

  readonly draft = signal<AppConfig>({ ...this.setup.appConfig() });
  readonly saved = signal(false);

  setField<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
    this.saved.set(false);
  }

  toggle(key: keyof AppConfig): void {
    this.draft.update((d) => ({ ...d, [key]: !(d[key] as boolean) }));
    this.saved.set(false);
  }

  save(): void {
    this.setup.saveAppConfig(this.draft());
    this.saved.set(true);
  }

  reset(): void {
    this.draft.set({ ...this.setup.appConfig() });
    this.saved.set(false);
  }
}
