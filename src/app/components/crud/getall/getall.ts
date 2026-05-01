import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminEntity, findAdminEntity } from '../../../models/admin.models';
import { AdminApiService, AdminPayload } from '../../../services/admin-api.service';

@Component({
  selector: 'app-getall',
  imports: [FormsModule, RouterLink],
  templateUrl: './getall.html',
  styleUrl: './getall.css'
})
export class Getall {
  protected readonly entity = signal<AdminEntity>(findAdminEntity(undefined));
  protected readonly rows = signal<AdminPayload[]>([]);
  protected readonly search = signal('');
  protected readonly message = signal('Cargando datos desde el API...');
  protected readonly visibleFields = computed(() => this.entity().fields.slice(0, 5));
  protected readonly filteredRows = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) {
      return this.rows();
    }

    return this.rows().filter((row) =>
      Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(term))
    );
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: AdminApiService
  ) {
    this.route.data.subscribe((data) => {
      this.entity.set(findAdminEntity(data['entityKey']));
      this.loadRows();
    });
  }

  protected value(row: AdminPayload, key: string): string | number | boolean | null {
    return row[key] ?? '';
  }

  private loadRows(): void {
    const entity = this.entity();

    this.api.getAll(entity).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.message.set(`${rows.length} registros cargados desde /api/${entity.endpoint}/`);
      },
      error: () => {
        this.rows.set(entity.sampleRows);
        this.message.set(`Mostrando datos de ejemplo. Endpoint esperado: /api/${entity.endpoint}/`);
      }
    });
  }
}
