import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ADMIN_ENTITIES, AdminEntity, AdminField, findAdminEntity } from '../../../models/admin.models';
import { AdminApiService, AdminPayload } from '../../../services/admin-api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-getall',
  imports: [FormsModule, RouterLink],
  templateUrl: './getall.html',
  styleUrl: './getall.css'
})
export class Getall {
  protected readonly entity = signal<AdminEntity>(findAdminEntity(undefined));
  protected readonly rows = signal<AdminPayload[]>([]);
  protected readonly relationOptions = signal<Record<string, AdminPayload[]>>({});
  protected readonly search = signal('');
  protected readonly message = signal('Cargando datos desde el API...');
  protected readonly visibleFields = computed(() => this.entity().fields.filter((field) => field.hideInList !== true).slice(0, 5));
  protected readonly canManageRecords = computed(() => this.auth.hasAdministrativeRole);
  protected readonly appEntities = computed(() =>
    ADMIN_ENTITIES.filter((entity) => entity.app === this.entity().app && entity.hideFromNavigation !== true)
  );
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
    private readonly api: AdminApiService,
    private readonly auth: AuthService
  ) {
    this.route.data.subscribe((data) => {
      this.entity.set(findAdminEntity(data['entityKey']));
      this.loadRelationOptions();
      this.loadRows();
    });
  }

  protected value(row: AdminPayload, key: string): string | number | boolean | null {
    return row[key] ?? '';
  }

  protected displayValue(row: AdminPayload, field: AdminField): string | number | boolean | null {
    const value = row[field.key] ?? '';

    if (!field.relation || value === '') {
      return value;
    }

    const relatedRow = this.relationOptions()[field.key]?.find((option) => this.optionValue(field, option) == value);
    return relatedRow ? this.optionLabel(field, relatedRow) : value;
  }

  private loadRows(): void {
    const entity = this.entity();

    this.api.getAll(entity).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.message.set(`${rows.length} registros cargados desde /${entity.apiBasePath}/${entity.endpoint}/`);
      },
      error: () => {
        this.rows.set(entity.sampleRows);
        this.message.set(`Mostrando datos de ejemplo. Endpoint esperado: /${entity.apiBasePath}/${entity.endpoint}/`);
      }
    });
  }

  private loadRelationOptions(): void {
    this.relationOptions.set({});

    this.entity().fields
      .filter((field) => field.relation)
      .forEach((field) => {
        const relatedEntity = findAdminEntity(field.relation?.entityKey);

        this.api.getAll(relatedEntity).subscribe({
          next: (rows) => this.mergeRelationOptions(field.key, rows),
          error: () => this.mergeRelationOptions(field.key, relatedEntity.sampleRows)
        });
      });
  }

  private mergeRelationOptions(key: string, rows: AdminPayload[]): void {
    this.relationOptions.update((current) => ({ ...current, [key]: rows }));
  }

  private optionValue(field: AdminField, row: AdminPayload): string | number | boolean | null {
    const valueField = field.relation?.valueField ?? findAdminEntity(field.relation?.entityKey).idField;
    return row[valueField] ?? row['id'] ?? '';
  }

  private optionLabel(field: AdminField, row: AdminPayload): string {
    const labelFields = field.relation?.labelFields ?? ['nombre'];
    const label = labelFields
      .map((key) => row[key])
      .filter((value) => value !== undefined && value !== null && value !== '')
      .join(' - ');

    return label || `${field.label} #${this.optionValue(field, row)}`;
  }
}
