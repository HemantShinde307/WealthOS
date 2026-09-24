import { Injectable, signal } from '@angular/core';
import { DocumentEntry, MOCK_DOCUMENTS } from './insurance-investments-data.mock';

let nextDocSeq = 100;

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private readonly _documents = signal<DocumentEntry[]>(MOCK_DOCUMENTS.map((d) => ({ ...d })));

  readonly documents = this._documents.asReadonly();

  addDocument(entry: Omit<DocumentEntry, 'id' | 'uploadedOn'>): DocumentEntry {
    const doc: DocumentEntry = { ...entry, id: `DOC-${nextDocSeq++}`, uploadedOn: new Date().toISOString().slice(0, 10) };
    this._documents.update((list) => [doc, ...list]);
    return doc;
  }

  updateDocument(id: string, patch: Partial<DocumentEntry>): void {
    this._documents.update((list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  deleteDocument(id: string): void {
    this._documents.update((list) => list.filter((d) => d.id !== id));
  }
}
