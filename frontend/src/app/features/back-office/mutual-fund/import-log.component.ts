import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MutualFundService } from './mutual-fund.service';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';

@Component({
  selector: 'app-mf-import-log',
  standalone: true,
  imports: [CommonModule, RouterLink, ExportButtonComponent],
  templateUrl: './import-log.component.html',
})
export class ImportLogComponent {
  readonly mfService = inject(MutualFundService);

  readonly exportHeaders = ['File Name', 'Registrar', 'Rows Imported', 'Imported On'];
  readonly exportRows = computed(() =>
    this.mfService.registrarImportLog().map((e) => [e.fileName, e.registrar, e.rowCount, e.importedOn]),
  );

  remove(id: string, fileName: string): void {
    if (!confirmDelete(`the import log entry for ${fileName}`)) return;
    this.mfService.deleteRegistrarImportLogEntry(id);
  }
}
