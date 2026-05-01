import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PendingChallenge } from '../../../models/auth.models';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css'
})
export class VerifyOtp {
  protected readonly code = signal('');
  protected readonly loading = signal(false);
  protected readonly message = signal('');
  protected challenge: PendingChallenge | null = null;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    this.challenge = this.auth.currentChallenge;

    if (!this.challenge) {
      this.router.navigate(['/login']);
    }
  }

  protected submit(): void {
    if (!this.challenge) {
      return;
    }

    this.loading.set(true);
    this.message.set('Verificando codigo...');

    this.auth.verifyOtp({
      challenge_id: this.challenge.challengeId,
      codigo: this.code(),
      nombre_dispositivo: this.challenge.deviceName ?? 'Navegador web'
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.loading.set(false);
        this.message.set('Codigo incorrecto o expirado.');
      }
    });
  }
}
