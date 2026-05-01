import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminEntity, findAdminEntity } from '../../../models/admin.models';
import { AdminApiService, AdminPayload } from '../../../services/admin-api.service';

@Component({
  selector: 'app-delete',
  imports: [RouterLink],
  templateUrl: './delete.html',
  styleUrl: './delete.css'
})
export class Delete {
  protected readonly entity = signal<AdminEntity>(findAdminEntity(undefined));
  protected readonly id = signal('');
  protected readonly row = signal<AdminPayload>({});
  protected readonly message = signal('Confirma la eliminacion del registro.');

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

  protected entries(): [string, string | number | boolean | null][] {
    return Object.entries(this.row());
  }

  protected confirmDelete(): void {
    const entity = this.entity();
    this.message.set('Eliminando registro...');

    this.api.delete(entity, this.id()).subscribe({
      next: () => this.router.navigate(['/', entity.route]),
      error: () => this.message.set(`Accion lista. Endpoint esperado: DELETE /api/${entity.endpoint}/${this.id()}/`)
    });
  }

  private loadRow(): void {
    const entity = this.entity();

    this.api.getById(entity, this.id()).subscribe({
      next: (row) => this.row.set(row),
      error: () => this.row.set(entity.sampleRows[0] ?? {})
    });
  }
}
