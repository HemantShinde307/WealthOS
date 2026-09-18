import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CasImportStateService } from './cas-import-state.service';
import { CasParseError, CasParserService } from '../../../core/services/cas-parser.service';

@Component({
  selector: 'app-cas-upload-statement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-statement.component.html',
})
export class UploadStatementComponent {
  readonly state = inject(CasImportStateService);
  private readonly parser = inject(CasParserService);
  private readonly router = inject(Router);

  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  readonly password = signal('');
  readonly parsing = signal(false);
  readonly error = signal<string | null>(null);
  readonly needsPassword = signal(false);
  readonly selectedFile = signal<File | null>(null);

  openFilePicker(): void {
    this.fileInput().nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      this.error.set('Please select a PDF file.');
      return;
    }
    this.selectedFile.set(file);
    this.error.set(null);
    this.needsPassword.set(false);
    this.parseSelectedFile();
  }

  retryWithPassword(): void {
    this.error.set(null);
    this.parseSelectedFile();
  }

  private parseSelectedFile(): void {
    const file = this.selectedFile();
    if (!file) return;
    this.parsing.set(true);
    this.parser
      .parseFile(file, this.password() || undefined)
      .then((result) => {
        this.parsing.set(false);
        this.state.setParsedRows(file.name, result.rows);
        this.router.navigate(['/cas-import/mapping-verification']);
      })
      .catch((err: unknown) => {
        this.parsing.set(false);
        if (err instanceof CasParseError) {
          this.needsPassword.set(err.reason === 'password' || err.reason === 'wrong-password');
          this.error.set(err.message);
        } else {
          this.error.set('Something went wrong reading this PDF. Please try again.');
        }
      });
  }

  useSample(): void {
    this.state.loadSample();
    this.router.navigate(['/cas-import/mapping-verification']);
  }
}
