import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: '../login/login.css'
})
export class ForgotPassword {
  protected readonly form = {
    identificador: ''
  };
  protected readonly loading = signal(false);
  protected readonly message = signal('');

  constructor(private readonly auth: AuthService) {}

  protected submit(): void {
    this.loading.set(true);
    this.message.set('Validando solicitud...');

    this.auth.forgotPassword(this.form).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.message.set(response.detail);
      },
      error: () => {
        this.loading.set(false);
        this.message.set('No se pudo procesar la solicitud.');
      }
    });
  }
}
