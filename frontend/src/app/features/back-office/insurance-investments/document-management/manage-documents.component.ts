import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentsService } from '../documents.service';
import { DOCUMENT_CATEGORIES, DocumentEntry } from '../insurance-investments-data.mock';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

@Component({
  selector: 'app-manage-documents',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './manage-documents.component.html',
})
export class ManageDocumentsComponent {
  readonly svc = inject(DocumentsService);
  readonly categories = DOCUMENT_CATEGORIES;

  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  readonly category = signal<DocumentEntry['category']>('KYC');
  readonly linkedCustomer = signal('');
  readonly pendingFile = signal<File | null>(null);
  readonly error = signal<string | null>(null);
  readonly uploaded = signal(false);
  readonly filterCategory = signal<DocumentEntry['category'] | 'All'>('All');

  readonly filteredDocuments = () => {
    const cat = this.filterCategory();
    return cat === 'All' ? this.svc.documents() : this.svc.documents().filter((d) => d.category === cat);
  };

  readonly exportHeaders = ['Name', 'Category', 'Linked Customer', 'File Type', 'Size (KB)', 'Uploaded On'];
  readonly exportRows = computed(() =>
    this.filteredDocuments().map((d) => [d.name, d.category, d.linkedCustomer, d.fileType, d.fileSizeKb, d.uploadedOn]),
  );

  readonly editingId = signal<string | null>(null);
  readonly editName = signal('');
  readonly editCategory = signal<DocumentEntry['category']>('KYC');
  readonly editCustomer = signal('');
  readonly editError = signal<string | null>(null);

  openFilePicker(): void {
    this.fileInput().nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.pendingFile.set(file);
    this.error.set(null);
    this.uploaded.set(false);
  }

  upload(): void {
    this.error.set(null);
    const file = this.pendingFile();
    if (!file) {
      this.error.set('Please choose a file to upload.');
      return;
    }
    if (!this.linkedCustomer().trim()) {
      this.error.set('Please specify the customer this document belongs to.');
      return;
    }
    this.svc.addDocument({
      name: file.name,
      category: this.category(),
      linkedCustomer: this.linkedCustomer().trim(),
      fileType: file.type || 'application/octet-stream',
      fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
    });
    this.uploaded.set(true);
    this.pendingFile.set(null);
    this.linkedCustomer.set('');
    this.fileInput().nativeElement.value = '';
  }

  edit(d: DocumentEntry): void {
    this.editingId.set(d.id);
    this.editName.set(d.name);
    this.editCategory.set(d.category);
    this.editCustomer.set(d.linkedCustomer);
    this.editError.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.editName().trim() || !this.editCustomer().trim()) {
      this.editError.set('Document name and linked customer are required.');
      return;
    }
    this.svc.updateDocument(id, {
      name: this.editName().trim(),
      category: this.editCategory(),
      linkedCustomer: this.editCustomer().trim(),
    });
    this.editingId.set(null);
  }

  remove(d: DocumentEntry): void {
    if (!confirmDelete(`the document ${d.name}`)) return;
    this.svc.deleteDocument(d.id);
    if (this.editingId() === d.id) this.editingId.set(null);
  }
}
