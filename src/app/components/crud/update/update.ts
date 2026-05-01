import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminEntity, findAdminEntity } from '../../../models/admin.models';
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
  protected readonly message = signal('Cargando registro...');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: AdminApiService
  ) {
    this.route.data.subscribe((data) => {
      this.entity.set(findAdminEntity(data['entityKey']));
      this.id.set(this.route.snapshot.paramMap.get('id') ?? '');
      this.loadRow();
    });
  }

  protected submit(): void {
    const entity = this.entity();
    this.message.set('Actualizando registro...');

    this.api.update(entity, this.id(), this.payload).subscribe({
      next: () => this.router.navigate(['/', entity.route]),
      error: () => this.message.set(`Formulario listo. Endpoint esperado: PUT /api/${entity.endpoint}/${this.id()}/`)
    });
  }

  private loadRow(): void {
    const entity = this.entity();

    this.api.getById(entity, this.id()).subscribe({
      next: (row) => this.setPayload(row),
      error: () => {
        this.setPayload(entity.sampleRows[0] ?? {});
        this.message.set(`Mostrando dato de ejemplo. Endpoint esperado: /api/${entity.endpoint}/${this.id()}/`);
      }
    });
  }

  private setPayload(row: AdminPayload): void {
    Object.keys(this.payload).forEach((key) => delete this.payload[key]);
    this.entity().fields.forEach((field) => {
      this.payload[field.key] = row[field.key] ?? (field.type === 'checkbox' ? false : '');
    });
  }
}
