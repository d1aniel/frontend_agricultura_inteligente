import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterPayload } from '../../../models/auth.models';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  protected readonly form: RegisterPayload = {
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    telefono: ''
  };
  protected readonly loading = signal(false);
  protected readonly message = signal('');

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  protected submit(): void {
    this.loading.set(true);
    this.message.set('Creando cuenta y enviando codigo...');

    this.auth.register(this.form).subscribe({
      next: () => this.router.navigate(['/verificar-2fa']),
      error: () => {
        this.loading.set(false);
        this.message.set('No se pudo crear la cuenta. Revisa los datos ingresados.');
      }
    });
  }
}
