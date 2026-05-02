import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminEntity, AdminField, findAdminEntity } from '../../../models/admin.models';
import { AdminApiService, AdminPayload } from '../../../services/admin-api.service';

@Component({
  selector: 'app-create',
  imports: [FormsModule, RouterLink],
  templateUrl: './create.html',
  styleUrl: './create.css'
})
export class Create {
  protected readonly entity = signal<AdminEntity>(findAdminEntity(undefined));
  protected readonly payload: AdminPayload = {};
  protected readonly relationOptions = signal<Record<string, AdminPayload[]>>({});
  protected readonly message = signal('');
  protected readonly formFields = signal<AdminField[]>([]);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: AdminApiService
  ) {
    this.route.data.subscribe((data) => {
      this.entity.set(findAdminEntity(data['entityKey']));
      this.formFields.set(this.entity().fields.filter((field) => field.hideInForm !== true));
      this.resetPayload();
      this.loadRelationOptions();
    });
  }

  protected submit(): void {
    const entity = this.entity();
    this.message.set('Guardando registro...');

    this.api.create(entity, this.cleanPayload()).subscribe({
      next: () => this.router.navigate(['/', entity.route]),
      error: () => this.message.set(`Formulario listo. Endpoint esperado: POST /${entity.apiBasePath}/${entity.endpoint}/`)
    });
  }

  protected rowsFor(field: AdminField): AdminPayload[] {
    return field.relation ? this.relationOptions()[field.key] ?? [] : [];
  }

  protected optionValue(field: AdminField, row: AdminPayload): string | number | boolean | null {
    const valueField = field.relation?.valueField ?? findAdminEntity(field.relation?.entityKey).idField;
    return row[valueField] ?? row['id'] ?? '';
  }

  protected optionLabel(field: AdminField, row: AdminPayload): string {
    const labelFields = field.relation?.labelFields ?? ['nombre'];
    const label = labelFields
      .map((key) => row[key])
      .filter((value) => value !== undefined && value !== null && value !== '')
      .join(' - ');

    return label || `${field.label} #${this.optionValue(field, row)}`;
  }

  protected createRoute(field: AdminField): string[] {
    return ['/', field.relation?.createRoute ?? findAdminEntity(field.relation?.entityKey).route, 'create'];
  }

  protected canCreateRelated(field: AdminField): boolean {
    return field.relation?.allowCreate !== false;
  }

  private resetPayload(): void {
    Object.keys(this.payload).forEach((key) => delete this.payload[key]);
    this.formFields().forEach((field) => {
      this.payload[field.key] = field.type === 'checkbox' ? false : '';
    });
  }

  private loadRelationOptions(): void {
    this.relationOptions.set({});

    this.formFields()
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

  private cleanPayload(): AdminPayload {
    const cleaned: AdminPayload = {};

    this.formFields().forEach((field) => {
      const value = this.payload[field.key];
      cleaned[field.key] = value === '' && (field.relation || field.type === 'number' || field.type === 'date' || field.type === 'datetime-local')
        ? null
        : value;
    });

    return cleaned;
  }
}
