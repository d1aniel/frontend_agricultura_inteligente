import { Component, OnDestroy, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ADMIN_ENTITIES } from '../../../models/admin.models';
import { AuthUser } from '../../../models/auth.models';
import { AdminApiService, AdminPayload } from '../../../services/admin-api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnDestroy {
  protected readonly notifications = signal<AdminPayload[]>([]);
  protected readonly notificationsOpen = signal(false);
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly auth: AuthService,
    private readonly api: AdminApiService,
    private readonly router: Router
  ) {
    this.loadNotifications();
    this.refreshTimer = setInterval(() => this.loadNotifications(), 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

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

  protected get canSeeNotifications(): boolean {
    return this.auth.hasAdministrativeRole;
  }

  protected get notificationCount(): number {
    return this.notifications().length;
  }

  protected toggleNotifications(): void {
    this.notificationsOpen.update((open) => !open);
    if (!this.notificationsOpen()) {
      return;
    }
    this.loadNotifications();
  }

  protected logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  private loadNotifications(): void {
    if (!this.auth.hasAdministrativeRole) {
      this.notifications.set([]);
      return;
    }

    const alertEntity = ADMIN_ENTITIES.find((entity) => entity.key === 'alerta_sistema');
    if (!alertEntity) {
      return;
    }

    this.api.getAll(alertEntity).subscribe({
      next: (alerts) => {
        this.notifications.set(alerts
          .filter((alert) => String(alert['estado'] ?? '').toUpperCase() === 'ABIERTA')
          .filter((alert) => String(alert['tipo_alerta'] ?? '').toLowerCase().includes('restablecimiento'))
          .slice(0, 5));
      },
      error: () => this.notifications.set([])
    });
  }
}
