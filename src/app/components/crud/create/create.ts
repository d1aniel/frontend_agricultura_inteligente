import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminEntity, findAdminEntity } from '../../../models/admin.models';
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
  protected readonly message = signal('');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: AdminApiService
  ) {
    this.route.data.subscribe((data) => {
      this.entity.set(findAdminEntity(data['entityKey']));
      this.resetPayload();
    });
  }

  protected submit(): void {
    const entity = this.entity();
    this.message.set('Guardando registro...');

    this.api.create(entity, this.payload).subscribe({
      next: () => this.router.navigate(['/', entity.route]),
      error: () => this.message.set(`Formulario listo. Endpoint esperado: POST /api/${entity.endpoint}/`)
    });
  }

  private resetPayload(): void {
    Object.keys(this.payload).forEach((key) => delete this.payload[key]);
    this.entity().fields.forEach((field) => {
      this.payload[field.key] = field.type === 'checkbox' ? false : '';
    });
  }
}
