import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: '../login/login.css'
})
export class ResetPassword {
  protected readonly form = {
    nueva_password: '',
    confirmar_password: ''
  };
  protected readonly loading = signal(false);
  protected readonly message = signal('');
  private readonly uid: string;
  private readonly token: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly auth: AuthService
  ) {
    this.uid = this.route.snapshot.queryParamMap.get('uid') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.uid || !this.token) {
      this.message.set('El enlace de restablecimiento no es valido.');
    }
  }

  protected submit(): void {
    if (!this.uid || !this.token) {
      this.message.set('El enlace de restablecimiento no es valido.');
      return;
    }
    if (this.form.nueva_password !== this.form.confirmar_password) {
      this.message.set('Las contrasenas no coinciden.');
      return;
    }

    this.loading.set(true);
    this.message.set('Actualizando contrasena...');

    this.auth.resetPassword({
      uid: this.uid,
      token: this.token,
      nueva_password: this.form.nueva_password
    }).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.message.set(response.detail);
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (error) => {
        this.loading.set(false);
        this.message.set(error?.error?.detail || 'No fue posible restablecer la contrasena.');
      }
    });
  }
}
