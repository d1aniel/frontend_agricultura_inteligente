import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminEntity, AdminField, findAdminEntity } from '../../../models/admin.models';
import { AdminApiService, AdminPayload } from '../../../services/admin-api.service';

@Component({
  selector: 'app-update',
  imports: [FormsModule, RouterLink],
  templateUrl: './update.html',
  styleUrl: './update.css'
})
export class Update {
  protected readonly entity = signal<AdminEntity>(findAdminEntity(undefined));
  protected readonly id = signal('');
  protected readonly payload: AdminPayload = {};
  protected readonly recordTitle = signal('');
  protected readonly relationOptions = signal<Record<string, AdminPayload[]>>({});
  protected readonly message = signal('Cargando registro...');
  protected readonly formFields = signal<AdminField[]>([]);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: AdminApiService
  ) {
    this.route.data.subscribe((data) => {
      this.entity.set(findAdminEntity(data['entityKey']));
      this.formFields.set(this.entity().fields.filter((field) => field.hideInForm !== true && field.hideInUpdate !== true));
      this.id.set(this.route.snapshot.paramMap.get('id') ?? '');
      this.recordTitle.set(`${this.entity().label} ${this.id()}`);
      this.loadRelationOptions();
      this.loadRow();
    });
  }

  protected submit(): void {
    const entity = this.entity();
    this.message.set('Actualizando registro...');

    this.api.update(entity, this.id(), this.cleanPayload()).subscribe({
      next: () => this.router.navigate(['/', entity.route]),
      error: (error) => this.message.set(this.errorMessage(error, entity))
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

  private loadRow(): void {
    const entity = this.entity();

    this.api.getById(entity, this.id()).subscribe({
      next: (row) => this.setPayload(row),
      error: () => {
        this.setPayload(entity.sampleRows[0] ?? {});
        this.message.set(`Mostrando dato de ejemplo. Endpoint esperado: /${entity.apiBasePath}/${entity.endpoint}/${this.id()}/`);
      }
    });
  }

  private setPayload(row: AdminPayload): void {
    Object.keys(this.payload).forEach((key) => delete this.payload[key]);
    this.recordTitle.set(this.displayRecordTitle(row));
    this.formFields().forEach((field) => {
      this.payload[field.key] = this.formatFieldValue(field, row[field.key]);
    });
    this.message.set('Datos cargados para editar.');
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
      if (field.readonly) {
        return;
      }
      const value = this.payload[field.key];
      if ((field.omitWhenEmpty || (field.type === 'select' && field.required !== true)) && value === '') {
        return;
      }
      cleaned[field.key] = this.cleanValue(field, value);
    });

    return cleaned;
  }

  private cleanValue(field: AdminField, value: AdminPayload[string]): AdminPayload[string] {
    if (value === '' && (field.relation || field.type === 'number' || field.type === 'date' || field.type === 'datetime-local')) {
      return null;
    }
    if (field.type === 'number' && typeof value === 'string') {
      return value.replace(',', '.');
    }
    return value;
  }

  private errorMessage(error: { error?: unknown }, entity: AdminEntity): string {
    const details = this.flattenError(error.error);
    return details || `No fue posible actualizar. Revisa los campos del formulario o el endpoint PUT /${entity.apiBasePath}/${entity.endpoint}/${this.id()}/`;
  }

  private flattenError(error: unknown): string {
    if (!error) {
      return '';
    }
    if (typeof error === 'string') {
      return error;
    }
    if (Array.isArray(error)) {
      return error.map((item) => this.flattenError(item)).filter(Boolean).join(' ');
    }
    if (typeof error === 'object') {
      return Object.entries(error as Record<string, unknown>)
        .map(([key, value]) => `${key}: ${this.flattenError(value)}`)
        .filter((value) => value.trim() !== '')
        .join(' ');
    }
    return String(error);
  }

  private displayRecordTitle(row: AdminPayload): string {
    const preferredKeys = [
      'nombre_completo',
      'nombre',
      'username',
      'codigo_nodo',
      'tipo_alerta',
      'comando',
      'respuesta',
      'tabla_afectada'
    ];
    const label = preferredKeys
      .map((key) => row[key])
      .find((value) => value !== undefined && value !== null && value !== '');

    return label ? String(label) : `${this.entity().label} ${this.id()}`;
  }

  private formatFieldValue(field: AdminField, value: AdminPayload[string]): string | number | boolean | null {
    if (value === undefined || value === null || value === '') {
      return field.type === 'checkbox' ? false : '';
    }
    if (field.type === 'date') {
      return String(value).slice(0, 10);
    }
    if (field.type === 'datetime-local') {
      return String(value).slice(0, 16);
    }
    return value;
  }
}
