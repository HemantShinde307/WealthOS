import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LOCALES, TRANSLATION_ENTRIES, TRANSLATION_MODULES, TranslationEntry, TranslationStatus } from './translation-manager.mock';

type FilterMode = 'all' | 'missing' | 'review';

@Component({
  selector: 'app-translation-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './translation-manager.component.html',
})
export class TranslationManagerComponent {
  readonly locales = LOCALES;
  readonly modules = TRANSLATION_MODULES;
  readonly entries = signal<TranslationEntry[]>(TRANSLATION_ENTRIES);

  readonly targetLocale = signal(this.locales.find((l) => !l.isSource)?.code ?? this.locales[0].code);
  readonly rtlLayout = signal(true);
  readonly livePreview = signal(false);
  readonly filterMode = signal<FilterMode>('all');
  readonly moduleFilter = signal<string>('all');

  readonly targetLocaleInfo = computed(() => this.locales.find((l) => l.code === this.targetLocale())!);
  readonly isTargetRtl = computed(() => this.targetLocaleInfo().rtl);

  readonly missingCount = computed(
    () => this.entries().filter((e) => (e.status[this.targetLocale()] ?? 'missing') === 'missing').length,
  );
  readonly reviewCount = computed(
    () => this.entries().filter((e) => e.status[this.targetLocale()] === 'review').length,
  );

  readonly filteredEntries = computed(() => {
    const locale = this.targetLocale();
    const mode = this.filterMode();
    const mod = this.moduleFilter();
    return this.entries().filter((e) => {
      if (mod !== 'all' && e.module !== mod) return false;
      const status = e.status[locale] ?? 'missing';
      if (mode === 'missing') return status === 'missing';
      if (mode === 'review') return status === 'review';
      return true;
    });
  });

  selectLocale(code: string): void {
    if (this.locales.find((l) => l.code === code && !l.isSource)) {
      this.targetLocale.set(code);
    }
  }

  setFilter(mode: FilterMode): void {
    this.filterMode.set(mode);
  }

  setModuleFilter(mod: string): void {
    this.moduleFilter.set(mod);
  }

  updateTranslation(entry: TranslationEntry, value: string): void {
    const locale = this.targetLocale();
    this.entries.update((list) =>
      list.map((e) => {
        if (e.key !== entry.key) return e;
        const nextStatus: TranslationStatus = value.trim().length ? (e.status[locale] === 'approved' ? 'approved' : 'review') : 'missing';
        return {
          ...e,
          translations: { ...e.translations, [locale]: value },
          status: { ...e.status, [locale]: nextStatus },
        };
      }),
    );
  }

  approve(entry: TranslationEntry): void {
    const locale = this.targetLocale();
    this.entries.update((list) =>
      list.map((e) => (e.key === entry.key ? { ...e, status: { ...e.status, [locale]: 'approved' } } : e)),
    );
  }

  statusOf(entry: TranslationEntry): TranslationStatus {
    return entry.status[this.targetLocale()] ?? 'missing';
  }

  translationOf(entry: TranslationEntry): string {
    return entry.translations[this.targetLocale()] ?? '';
  }
}
