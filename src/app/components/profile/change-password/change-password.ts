import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {
  protected readonly form = {
    password_actual: '',
    nueva_password: '',
    confirmar_password: ''
  };
  protected readonly loading = signal(false);
  protected readonly message = signal('');

  constructor(private readonly auth: AuthService) {}

  protected submit(): void {
    if (this.form.nueva_password !== this.form.confirmar_password) {
      this.message.set('La confirmacion no coincide con la nueva contrasena.');
      return;
    }

    this.loading.set(true);
    this.message.set('Actualizando contrasena...');

    this.auth.changeTemporaryPassword({
      password_actual: this.form.password_actual,
      nueva_password: this.form.nueva_password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.message.set('Contrasena actualizada correctamente.');
        this.form.password_actual = '';
        this.form.nueva_password = '';
        this.form.confirmar_password = '';
      },
      error: () => {
        this.loading.set(false);
        this.message.set('No se pudo actualizar. Revisa la contrasena actual.');
      }
    });
  }
}
