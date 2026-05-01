import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser } from '../../../models/auth.models';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  protected get user(): AuthUser | null {
    return this.auth.currentUser;
  }

  protected get initials(): string {
    const user = this.user;
    const source = user?.nombre_completo || user?.username || 'Usuario';
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'US';
  }

  protected logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
