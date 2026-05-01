import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginPayload } from '../../../models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  protected readonly credentials: LoginPayload = {
    username: '',
    password: '',
    nombre_dispositivo: 'Navegador web'
  };
  protected readonly loading = signal(false);
  protected readonly message = signal('');

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  protected submit(): void {
    this.loading.set(true);
    this.message.set('Validando credenciales...');

    this.auth.login(this.credentials).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.loading.set(false);
        this.message.set('No se pudo iniciar sesion. Revisa usuario y contrasena.');
      }
    });
  }
}
